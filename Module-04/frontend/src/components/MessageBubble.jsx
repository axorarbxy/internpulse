// INTERNAL MODULE 4 FUNCTIONALITY
export default function MessageBubble({ message, isOwn }) {
  return (
    <div className={`messages-bubble-row${isOwn ? ' own' : ''}`}>
      <div className={`messages-bubble${isOwn ? ' own' : ''}`}>
        <p>{message.plaintext}</p>
        <span>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
