// INTERNAL MODULE 4 FUNCTIONALITY
export default function MessageBubble({ message, isOwn }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
          isOwn ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'
        }`}
      >
        <p>{message.plaintext}</p>
        <span className={`text-[10px] block mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
