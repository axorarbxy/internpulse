// INTERNAL MODULE 4 FUNCTIONALITY — small indicator for socket/encryption health
export default function SecurityStatus({ connected, encrypted = true }) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-300'}`} />
      {connected ? 'Live' : 'Reconnecting…'}
      {encrypted && <span className="text-gray-300">•</span>}
      {encrypted && <span>End-to-end encrypted</span>}
    </div>
  );
}
