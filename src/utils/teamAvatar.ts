import type { TeamMember } from '../../shared/schemas/index';

/** Literal Tailwind classes so JIT includes them (dynamic strings get purged). */
export function resolveAvatarBgClass(
  member: Pick<TeamMember, 'id' | 'color'> | { id?: string; color?: string },
): string {
  switch (member.id) {
    case 'sj':
      return 'bg-blue-500';
    case 'mr':
      return 'bg-red-500';
    case 'al':
      return 'bg-yellow-500';
    case 'dk':
      return 'bg-gray-500';
    case 'pm':
      return 'bg-purple-600';
    default:
      break;
  }

  switch (member.color) {
    case 'bg-blue-500':
      return 'bg-blue-500';
    case 'bg-red-500':
      return 'bg-red-500';
    case 'bg-yellow-500':
      return 'bg-yellow-500';
    case 'bg-purple-600':
      return 'bg-purple-600';
    case 'bg-gray-500':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
}

export function findTeamMember(
  team: TeamMember[],
  opts: { id?: string; initials?: string; name?: string },
): TeamMember | undefined {
  if (opts.id) {
    const byId = team.find((m) => m.id === opts.id);
    if (byId) return byId;
  }
  if (opts.initials) {
    const byInitials = team.find((m) => m.initials === opts.initials);
    if (byInitials) return byInitials;
  }
  if (opts.name) {
    return team.find((m) => m.name.toLowerCase() === opts.name!.toLowerCase());
  }
  return undefined;
}
