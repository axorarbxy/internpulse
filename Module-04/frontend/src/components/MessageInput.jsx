// INTERNAL MODULE 4 FUNCTIONALITY
import { useState } from 'react';

export default function MessageInput({ onSend, onTyping, disabled = false }) {
  const [value, setValue] = useState('');

  const handleChange = (e) => {
    setValue(e.target.value);
    onTyping?.(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    Promise.resolve(onSend(value.trim())).catch(() => {});
    setValue('');
    onTyping?.(false);
  };

  return (
    <form onSubmit={handleSubmit} className="messages-composer">
      <input
        value={value}
        onChange={handleChange}
        onBlur={() => onTyping?.(false)}
        placeholder="Type a message…"
        maxLength={2000}
        className="messages-composer-input"
        aria-label="Type a message"
        disabled={disabled}
      />
      <button
        type="submit"
        className="messages-send-button"
        disabled={disabled}
      >
        Send
      </button>
    </form>
  );
}
