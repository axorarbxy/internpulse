// INTERNAL MODULE 4 FUNCTIONALITY
export default function UnreadBadge({ count }) {
  if (!count) return null;
  return (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
      {count > 99 ? '99+' : count}
    </span>
  );
}
