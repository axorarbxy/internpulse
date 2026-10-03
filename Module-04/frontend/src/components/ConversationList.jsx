// INTERNAL MODULE 4 FUNCTIONALITY
import ConversationItem from './ConversationItem';

export default function ConversationList({ conversations, contacts, newContactId, onNewContactChange, onCreateConversation, search, onSearchChange, activeId, onSelect, loading, error, onRetry }) {
  const visibleConversations = conversations.filter((conversation) => {
    const label = conversation.participants?.map((participant) => participant.name).join(' ') || conversation._id;
    return label.toLowerCase().includes(search.toLowerCase());
  });
  return (
    <aside className="messages-conversations">
      <header className="messages-conversations-header">
        <div>
          <h2>Conversations</h2>
          <p>Private messages</p>
        </div>
        <span className="messages-conversation-count">{conversations.length}</span>
      </header>
      <div className="messages-new-conversation">
        <label htmlFor="message-recipient">New encrypted conversation</label>
        <div>
          <select id="message-recipient" value={newContactId} onChange={(event) => onNewContactChange(event.target.value)}>
            <option value="">Choose a portal user</option>
            {contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name} ({contact.role})</option>)}
          </select>
          <button type="button" onClick={onCreateConversation} disabled={!newContactId}>Start</button>
        </div>
      </div>
      <input
        className="messages-conversation-search"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search conversations"
        aria-label="Search conversations"
      />
      <nav className="messages-conversation-list" aria-label="Conversations">
        {loading && <p className="messages-list-state"><span className="messages-spinner" />Loading conversations</p>}
        {!loading && error && (
          <div className="messages-list-state messages-load-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={onRetry}>Try again</button>
          </div>
        )}
        {!loading && !error && conversations.length === 0 && (
          <p className="messages-list-state">No conversations yet</p>
        )}
        {!loading && !error && visibleConversations.map((conversation) => (
          <ConversationItem
            key={conversation._id}
            conversation={conversation}
            active={conversation._id === activeId}
            onClick={() => onSelect(conversation._id)}
          />
        ))}
      </nav>
    </aside>
  );
}
