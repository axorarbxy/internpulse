// INTERNAL MODULE 4 FUNCTIONALITY
import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

export default function ChatWindow({ conversationId, currentUserId, messages, sendMessage, typingUser, setTyping, encryptionReady, encryptionError, retryEncryption, queuedCount }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!conversationId) {
    return (
      <section className="messages-chat-window">
        <div className="messages-empty-state">
          <div className="messages-empty-mark" aria-hidden="true"><span /><span /><span /></div>
          <h2>Your messages</h2>
          <p>Select a conversation to read and reply.</p>
          <span className="messages-privacy-note">End-to-end encrypted conversations</span>
        </div>
      </section>
    );
  }

  return (
    <section className="messages-chat-window">
      <header className="messages-chat-header">
        <span className="messages-conversation-avatar" aria-hidden="true">C</span>
        <div>
          <h2>Conversation {conversationId.slice(-6)}</h2>
          <p>End-to-end encrypted</p>
        </div>
      </header>
      <div className="messages-thread" aria-live="polite">
        {messages.map((m) => (
          <MessageBubble key={m._id || m.id} message={m} isOwn={m.senderId === currentUserId} />
        ))}
        <div ref={bottomRef} />
      </div>
      <TypingIndicator userId={typingUser} />
      {!encryptionReady && (
        <div className="messages-encryption-status" role="status">
          <span>
            {queuedCount > 0
              ? 'Message queued securely. It will send automatically when the recipient opens the app.'
              : encryptionError || 'Establishing end-to-end encryption...'}
          </span>
          <button type="button" onClick={retryEncryption}>{queuedCount > 0 ? 'Check again' : 'Retry key setup'}</button>
        </div>
      )}
      {queuedCount > 0 && <p className="messages-queued-status">{queuedCount} message{queuedCount === 1 ? '' : 's'} waiting to send securely</p>}
      <MessageInput onSend={sendMessage} onTyping={setTyping} />
    </section>
  );
}
