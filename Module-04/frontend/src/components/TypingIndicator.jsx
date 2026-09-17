// INTERNAL MODULE 4 FUNCTIONALITY
export default function TypingIndicator({ userId }) {
  if (!userId) return null;
  return <p className="text-xs text-gray-400 px-4 py-1 italic">Someone is typing…</p>;
}
