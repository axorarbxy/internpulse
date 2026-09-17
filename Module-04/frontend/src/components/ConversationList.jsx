// INTERNAL MODULE 4 FUNCTIONALITY
import ConversationItem from './ConversationItem';

export default function ConversationList({ conversations, activeId, onSelect, loading }) {
  return (
    <div className="w-72 border-r border-gray-200 h-full overflow-y-auto bg-white">
      <h2 className="px-4 py-3 font-semibold text-gray-900 border-b border-gray-100">Messages</h2>
      {loading && <p className="text-sm text-gray-400 p-4">Loading…</p>}
      {!loading && conversations.length === 0 && (
        <p className="text-sm text-gray-400 p-4 text-center">No conversations yet</p>
      )}
      {conversations.map((c) => (
        <ConversationItem
          key={c._id}
          conversation={c}
          active={c._id === activeId}
          onClick={() => onSelect(c._id)}
        />
      ))}
    </div>
  );
}
