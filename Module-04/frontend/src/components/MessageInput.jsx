// INTERNAL MODULE 4 FUNCTIONALITY
import { useState } from 'react';

export default function MessageInput({ onSend, onTyping }) {
  const [value, setValue] = useState('');

  const handleChange = (e) => {
    setValue(e.target.value);
    onTyping?.(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSend(value.trim());
    setValue('');
    onTyping?.(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t border-gray-200 bg-white">
      <input
        value={value}
        onChange={handleChange}
        onBlur={() => onTyping?.(false)}
        placeholder="Type a message…"
        maxLength={2000}
        className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white rounded-full px-5 py-2 text-sm font-medium hover:bg-blue-700 transition"
      >
        Send
      </button>
    </form>
  );
}
