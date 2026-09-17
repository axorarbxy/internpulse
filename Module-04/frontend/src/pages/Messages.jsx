// INTERNAL MODULE 4 FUNCTIONALITY — route: /messages and /messages/:conversationId
import ChatLayout from '../components/ChatLayout';

export default function MessagesPage({ currentUserId }) {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <ChatLayout currentUserId={currentUserId} />
    </div>
  );
}
