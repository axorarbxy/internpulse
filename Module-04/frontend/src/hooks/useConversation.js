// INTERNAL MODULE 4 FUNCTIONALITY
import { useCallback, useEffect, useRef, useState } from 'react';
import { conversationsApi, keysApi } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { encryptMessage, decryptMessage, ensureConversationKey } from '../utils/crypto';

export function useConversation(conversationId) {
  const { socket } = useSocket() || {};
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [encryptionReady, setEncryptionReady] = useState(false);
  const [encryptionError, setEncryptionError] = useState('');
  const [encryptionAttempt, setEncryptionAttempt] = useState(0);
  const [queuedCount, setQueuedCount] = useState(0);
  const typingTimeout = useRef(null);
  const encryptionReadyRef = useRef(false);

  useEffect(() => {
    if (!conversationId) return;
    setEncryptionReady(false);
    encryptionReadyRef.current = false;
    setEncryptionError('');
    const currentUserId = JSON.parse(window.localStorage.getItem('internpulse_user') || '{}').id;
    let isActive = true;
    const establish = async () => {
      const [keysRes, messagesRes] = await Promise.all([conversationsApi.keys(conversationId), conversationsApi.messages(conversationId)]);
      try {
        await ensureConversationKey(conversationId, keysRes.data.data.keys || [], currentUserId, keysApi.register);
        if (isActive) {
          encryptionReadyRef.current = true;
          setEncryptionReady(true);
          const queueKey = `internpulse_pending_messages_${conversationId}`;
          const pending = JSON.parse(window.localStorage.getItem(queueKey) || '[]');
          if (pending.length) {
            for (const plaintext of pending) {
              const encrypted = await encryptMessage(conversationId, plaintext);
              if (socket?.connected) socket.emit('send_message', { conversationId, ...encrypted });
              else await conversationsApi.sendMessage(conversationId, encrypted.ciphertext, encrypted.iv);
            }
            window.localStorage.removeItem(queueKey);
            setQueuedCount(0);
            setEncryptionError('');
          }
        }
      } catch (error) {
        if (isActive) setEncryptionError(error.message);
      }
      const decrypted = await Promise.all(
        messagesRes.data.data.items.map(async (m) => ({
          ...m,
          plaintext: await safeDecrypt(conversationId, m.ciphertext, m.iv),
        }))
      );
      if (isActive) setMessages(decrypted);
    };
    establish().catch((error) => { if (isActive) setEncryptionError(error.message); });
    const retry = window.setInterval(() => {
      if (!isActive || encryptionReadyRef.current) return;
      establish().catch(() => {});
    }, 10000);
    return () => { isActive = false; window.clearInterval(retry); };
  }, [conversationId, encryptionAttempt]);

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
      if (!encryptionReady) {
        const queueKey = `internpulse_pending_messages_${conversationId}`;
        const pending = JSON.parse(window.localStorage.getItem(queueKey) || '[]');
        pending.push(plaintext);
        window.localStorage.setItem(queueKey, JSON.stringify(pending.slice(-50)));
        setQueuedCount(pending.length);
        setEncryptionError('Queued securely on this device. It will send when the recipient comes online.');
        return;
      }
      const { ciphertext, iv } = await encryptMessage(conversationId, plaintext);
      if (socket?.connected) {
        socket.emit('send_message', { conversationId, ciphertext, iv });
      } else {
        // Reconnection fallback: persist over REST so nothing is lost while offline
        await conversationsApi.sendMessage(conversationId, ciphertext, iv);
      }
    },
    [socket, conversationId, encryptionReady, encryptionError]
  );

  const setTyping = useCallback(
    (isTyping) => {
      socket?.emit(isTyping ? 'typing_start' : 'typing_stop', { conversationId });
    },
    [socket, conversationId]
  );

  return {
    messages,
    sendMessage,
    typingUser,
    setTyping,
    encryptionReady,
    encryptionError,
    queuedCount,
    retryEncryption: () => setEncryptionAttempt((attempt) => attempt + 1),
  };
}

async function safeDecrypt(conversationId, ciphertext, iv) {
  try {
    return await decryptMessage(conversationId, ciphertext, iv);
  } catch {
    return '[unable to decrypt — key not established]';
  }
}
