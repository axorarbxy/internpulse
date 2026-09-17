// INTERNAL MODULE 4 FUNCTIONALITY
import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

export default function ChatWindow({ conversationId, currentUserId, messages, sendMessage, typingUser, setTyping }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        Select a conversation to start messaging
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((m) => (
          <MessageBubble key={m._id || m.id} message={m} isOwn={m.senderId === currentUserId} />
        ))}
        <div ref={bottomRef} />
      </div>
      <TypingIndicator userId={typingUser} />
      <MessageInput onSend={sendMessage} onTyping={setTyping} />
    </div>
  );
}
