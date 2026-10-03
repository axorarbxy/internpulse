// INTERNAL MODULE 4 FUNCTIONALITY
export default function TypingIndicator({ userId }) {
  if (!userId) return null;
  return <p className="messages-typing-indicator">Someone is typing…</p>;
}
