// INTERNAL MODULE 4 FUNCTIONALITY — top-level messaging layout,
// easy to drop into Module 2's /messages route
import { useEffect, useState } from 'react';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import { conversationsApi } from '../services/api';
import { useConversation } from '../hooks/useConversation';

export default function ChatLayout({ currentUserId }) {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { messages, sendMessage, typingUser, setTyping } = useConversation(activeId);

  useEffect(() => {
    conversationsApi.list().then((res) => {
      setConversations(res.data.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex h-[600px] rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <ConversationList
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        loading={loading}
      />
      <ChatWindow
        conversationId={activeId}
        currentUserId={currentUserId}
        messages={messages}
        sendMessage={sendMessage}
        typingUser={typingUser}
        setTyping={setTyping}
      />
    </div>
  );
}
