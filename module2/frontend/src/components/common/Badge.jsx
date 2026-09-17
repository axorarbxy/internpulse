export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = ''
}) {
  const variantClass = `badge-${variant}`;
  const sizeClass = `badge-${size}`;

  return (
    <span className={`badge ${variantClass} ${sizeClass} ${className}`.trim()}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  );
}
