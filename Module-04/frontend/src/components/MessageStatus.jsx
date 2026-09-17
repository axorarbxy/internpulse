// INTERNAL MODULE 4 FUNCTIONALITY
export default function MessageStatus({ delivered, read }) {
  return (
    <span className="text-[10px] text-gray-400">
      {read ? 'Read' : delivered ? 'Delivered' : 'Sent'}
    </span>
  );
}
