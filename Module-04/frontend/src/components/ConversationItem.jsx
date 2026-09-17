// INTERNAL MODULE 4 FUNCTIONALITY
export default function ConversationItem({ conversation, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition ${
        active ? 'bg-blue-50' : ''
      }`}
    >
      <p className="text-sm font-medium text-gray-900">
        Conversation {conversation._id.slice(-6)}
      </p>
      {conversation.internshipId && (
        <p className="text-xs text-gray-400">Internship: {conversation.internshipId}</p>
      )}
      {conversation.lastMessageAt && (
        <p className="text-xs text-gray-400">{new Date(conversation.lastMessageAt).toLocaleString()}</p>
      )}
    </button>
  );
}
