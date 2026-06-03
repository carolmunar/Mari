interface AvatarProps {
  initials: string;
  colorClass: string;
  size?: 'sm' | 'md';
  border?: boolean;
  className?: string;
}

export function Avatar({
  initials,
  colorClass,
  size = 'md',
  border = false,
  className = '',
}: AvatarProps) {
  const sizeClass = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs';
  const borderClass = border ? 'border-2 border-atlassian-background' : '';
  return (
    <div
      className={`shrink-0 rounded-full avatar ${colorClass} ${sizeClass} ${borderClass} ${className}`}
    >
      {initials}
    </div>
  );
}
