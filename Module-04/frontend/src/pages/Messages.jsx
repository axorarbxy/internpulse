// INTERNAL MODULE 4 FUNCTIONALITY — route: /messages and /messages/:conversationId
import ChatLayout from '../components/ChatLayout';

export default function MessagesPage({ currentUserId }) {
  return (
    <div className="messages-page">
      <ChatLayout currentUserId={currentUserId} />
    </div>
  );
}
