import type { TeamMember } from '../../../shared/schemas/index';
import { resolveAvatarBgClass } from '../../utils/teamAvatar';
import { Avatar } from './Avatar';

type TeamMemberAvatarProps = {
  member?: Pick<TeamMember, 'id' | 'initials' | 'name'> & { color?: string };
  initials?: string;
  colorClass?: string;
  size?: 'sm' | 'md';
  border?: boolean;
  className?: string;
};

export function TeamMemberAvatar({
  member,
  initials,
  colorClass,
  size = 'md',
  border = false,
  className = '',
}: TeamMemberAvatarProps) {
  const displayInitials = member?.initials ?? initials ?? '??';
  const bg = member
    ? resolveAvatarBgClass(member)
    : resolveAvatarBgClass({ color: colorClass });

  return (
    <Avatar
      initials={displayInitials}
      colorClass={bg}
      size={size}
      border={border}
      className={className}
    />
  );
}
