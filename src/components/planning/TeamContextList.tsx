import type { TeamMember } from '../../../shared/schemas/index';
import { TeamMemberAvatar } from '../ui/TeamMemberAvatar';
import { Toggle } from '../ui/Toggle';

type TeamContextListProps = {
  team: TeamMember[];
  onToggle?: (id: string) => void;
};

export function TeamContextList({ team, onToggle }: TeamContextListProps) {
  return (
    <div className="space-y-3">
      {team.map((member) => (
        <div
          key={member.id}
          className={`flex items-center justify-between p-2 rounded hover:bg-atlassian-background border border-transparent hover:border-atlassian-border transition-all ${
            !member.available ? 'opacity-50' : ''
          }`}
        >
          <div className="flex items-center min-w-0">
            <TeamMemberAvatar member={member} className="mr-3" />
            <div className="min-w-0">
              <div className="text-sm font-medium">{member.name}</div>
              <div className="text-xs text-atlassian-subtext">{member.role}</div>
            </div>
          </div>
          {onToggle ? (
            <Toggle
              enabled={member.available}
              onClick={() => onToggle(member.id)}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}
