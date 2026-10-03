// INTERNAL MODULE 4 FUNCTIONALITY
export default function ConversationItem({ conversation, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`messages-conversation-item${active ? ' active' : ''}`}
    >
      <span className="messages-conversation-avatar" aria-hidden="true">C</span>
      <span className="messages-conversation-copy">
        <span className="messages-conversation-name">{conversation.participants?.map((participant) => participant.name).join(' + ') || `Conversation ${conversation._id.slice(-6)}`}</span>
        {conversation.internshipId && (
          <span className="messages-conversation-meta">Internship {conversation.internshipId}</span>
        )}
        {conversation.lastMessageAt && (
          <span className="messages-conversation-meta">{new Date(conversation.lastMessageAt).toLocaleString()}</span>
        )}
      </span>
    </button>
  );
}
