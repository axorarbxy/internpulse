// INTERNAL MODULE 4 FUNCTIONALITY
import { useCallback, useEffect, useRef, useState } from 'react';
import { conversationsApi } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { encryptMessage, decryptMessage } from '../utils/crypto';

export function useConversation(conversationId) {
  const { socket } = useSocket() || {};
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    if (!conversationId) return;
    conversationsApi.messages(conversationId).then(async (res) => {
      const decrypted = await Promise.all(
        res.data.data.items.map(async (m) => ({
          ...m,
          plaintext: await safeDecrypt(conversationId, m.ciphertext, m.iv),
        }))
      );
      setMessages(decrypted);
    });
  }, [conversationId]);

  useEffect(() => {
    if (!socket || !conversationId) return undefined;

    socket.emit('join_conversation', { conversationId });

    const onMessage = async (message) => {
      if (message.conversationId !== conversationId) return;
      const plaintext = await safeDecrypt(conversationId, message.ciphertext, message.iv);
      setMessages((prev) => [...prev, { ...message, plaintext }]);
    };

    const onTyping = ({ userId, typing }) => {
      setTypingUser(typing ? userId : null);
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      if (typing) typingTimeout.current = setTimeout(() => setTypingUser(null), 3000);
    };

    socket.on('message:new', onMessage);
    socket.on('user:typing', onTyping);

    return () => {
      socket.emit('leave_conversation', { conversationId });
      socket.off('message:new', onMessage);
      socket.off('user:typing', onTyping);
    };
  }, [socket, conversationId]);

  const sendMessage = useCallback(
    async (plaintext) => {
      const { ciphertext, iv } = await encryptMessage(conversationId, plaintext);
      if (socket?.connected) {
        socket.emit('send_message', { conversationId, ciphertext, iv });
      } else {
        // Reconnection fallback: persist over REST so nothing is lost while offline
        await conversationsApi.sendMessage(conversationId, ciphertext, iv);
      }
    },
    [socket, conversationId]
  );

  const setTyping = useCallback(
    (isTyping) => {
      socket?.emit(isTyping ? 'typing_start' : 'typing_stop', { conversationId });
    },
    [socket, conversationId]
  );

  return { messages, sendMessage, typingUser, setTyping };
}

async function safeDecrypt(conversationId, ciphertext, iv) {
  try {
    return await decryptMessage(conversationId, ciphertext, iv);
  } catch {
    return '[unable to decrypt — key not established]';
  }
}
