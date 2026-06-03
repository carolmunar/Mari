import type { TeamMember } from '../../../shared/schemas/index';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { TeamMemberAvatar } from '../ui/TeamMemberAvatar';
import { resolveAvatarBgClass } from '../../utils/teamAvatar';
import type { WorkflowStep } from './workflowSteps';

type AgentWorkflowOverlayProps = {
  steps: WorkflowStep[];
  activeStepIndex: number;
  team: TeamMember[];
  maxWidthClass?: string;
};

export function AgentWorkflowOverlay({
  steps,
  activeStepIndex,
  team,
  maxWidthClass = 'max-w-5xl',
}: AgentWorkflowOverlayProps) {
  const step = steps[activeStepIndex] ?? steps[steps.length - 1];
  const activeSpeakerId = step.speakerId;
  const displayTeam = team.filter((m) => m.available);

  return (
    <div className={`${maxWidthClass} mx-auto w-full animate-[fadeIn_0.35s_ease-out]`}>
      <div className="bg-white rounded-jira-card shadow-jira-lg border border-atlassian-border p-8 md:p-12 min-h-[520px] flex flex-col items-center justify-center">
        <p className="text-xs font-bold text-atlassian-subtext uppercase tracking-wider mb-2">
          AI Planning Flow · Step {activeStepIndex + 1} of {steps.length}
        </p>
        <h2 className="text-xl font-semibold text-atlassian-text mb-8 text-center">
          {step.title}
        </h2>

        <div className="flex items-end justify-center gap-4 md:gap-6 mb-10 flex-wrap">
          {displayTeam.map((member) => {
            const isSpeaking = activeSpeakerId === member.id;
            return (
              <div
                key={member.id}
                className={`flex flex-col items-center transition-all duration-300 ${
                  isSpeaking ? 'scale-110' : 'opacity-45 scale-95'
                }`}
              >
                <div
                  className={`relative ${isSpeaking ? 'avatar-talking' : ''}`}
                >
                  <TeamMemberAvatar
                    member={member}
                    className={isSpeaking ? 'ring-4 ring-atlassian-blue/30' : ''}
                  />
                  {isSpeaking && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                  )}
                </div>
                <span className="text-[10px] text-atlassian-subtext mt-2 font-medium">
                  {member.name.split(' ')[0]}
                </span>
              </div>
            );
          })}

          {activeSpeakerId === 'ai' && (
            <div className="flex flex-col items-center scale-110 avatar-talking">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm ring-4 ring-atlassian-blue/30 ${resolveAvatarBgClass({ id: 'pm', color: 'bg-atlassian-blue' })} bg-atlassian-blue`}
              >
                <FontAwesomeIcon icon={faLayerGroup} className="text-sm" />
              </div>
              <span className="text-[10px] text-atlassian-subtext mt-2 font-medium">
                ProjectAI
              </span>
            </div>
          )}
        </div>

        <div className="workflow-bubble w-full max-w-lg bg-atlassian-background border border-atlassian-border rounded-jira-card p-5 relative">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-atlassian-background border-l border-t border-atlassian-border rotate-45" />
          <p className="text-xs font-bold text-atlassian-blue uppercase mb-1">
            {step.agentLabel}
          </p>
          <p className="text-sm text-atlassian-text leading-relaxed">
            {step.description}
          </p>
          <div className="flex items-center gap-1 mt-4">
            <span className="typing-dot" />
            <span className="typing-dot animation-delay-150" />
            <span className="typing-dot animation-delay-300" />
          </div>
        </div>

        <div className="flex gap-2 mt-10">
          {steps.map((s, i) => (
            <div
              key={s.id}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i <= activeStepIndex
                  ? 'w-8 bg-atlassian-blue'
                  : 'w-4 bg-atlassian-border'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
