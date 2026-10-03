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
  const [loadError, setLoadError] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [contacts, setContacts] = useState([]);
  const [newContactId, setNewContactId] = useState('');
  const [conversationSearch, setConversationSearch] = useState('');
  const { messages, sendMessage, typingUser, setTyping, encryptionReady, encryptionError, retryEncryption, queuedCount } = useConversation(activeId);

  useEffect(() => {
    let isActive = true;
    setLoading(true);
    setLoadError('');

    Promise.all([conversationsApi.list(), conversationsApi.contacts()])
      .then(([conversationRes, contactRes]) => {
        const records = conversationRes.data.data;
        if (!Array.isArray(records)) throw new Error('Unexpected conversations response');
        if (isActive) {
          setConversations(records);
          setContacts(Array.isArray(contactRes.data.data) ? contactRes.data.data : []);
        }
      })
      .catch(() => {
        if (isActive) {
          setConversations([]);
          setLoadError('Conversations could not be loaded. Check your connection and try again.');
        }
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [loadAttempt]);

  const createConversation = async () => {
    if (!newContactId) return;
    const response = await conversationsApi.create([String(currentUserId), newContactId]);
    const conversation = response.data.data;
    setConversations((previous) => [conversation, ...previous.filter((item) => item._id !== conversation._id)]);
    setActiveId(conversation._id);
    setNewContactId('');
  };

  return (
    <div className={`messages-chat-layout${activeId ? ' has-active-conversation' : ''}`}>
      <ConversationList
        conversations={conversations}
        search={conversationSearch}
        onSearchChange={setConversationSearch}
        contacts={contacts}
        newContactId={newContactId}
        onNewContactChange={setNewContactId}
        onCreateConversation={createConversation}
        activeId={activeId}
        onSelect={setActiveId}
        loading={loading}
        error={loadError}
        onRetry={() => setLoadAttempt((attempt) => attempt + 1)}
      />
      <ChatWindow
        conversationId={activeId}
        currentUserId={currentUserId}
        messages={messages}
        sendMessage={sendMessage}
        typingUser={typingUser}
        setTyping={setTyping}
        encryptionReady={encryptionReady}
        encryptionError={encryptionError}
        retryEncryption={retryEncryption}
        queuedCount={queuedCount}
      />
    </div>
  );
}
