import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowDown,
  faArrowUp,
  faBookmark,
  faCalendarAlt,
  faChartPie,
  faCheckSquare,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { usePlanningStore } from '../../store/planningStore';
import { TeamMemberAvatar } from '../ui/TeamMemberAvatar';
import { findTeamMember } from '../../utils/teamAvatar';

const ICON_MAP: Record<string, IconDefinition> = {
  bookmark: faBookmark,
  'check-square': faCheckSquare,
  'arrow-up': faArrowUp,
  'arrow-down': faArrowDown,
};

export function SprintBoardScreen() {
  const navigate = useNavigate();
  const { sprintBoard, assignmentPlan, team } = usePlanningStore();

  if (!sprintBoard) {
    return (
      <div className="max-w-6xl mx-auto text-atlassian-subtext">
        {assignmentPlan
          ? 'Loading kanban board...'
          : 'Approve assignments to open the kanban board.'}
      </div>
    );
  }

  const activeTeam = team.filter((m) => m.available);

  return (
    <div className="max-w-6xl mx-auto w-full flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold mb-1">{sprintBoard.sprintName}</h1>
          <div className="flex items-center text-sm text-atlassian-subtext space-x-4">
            <span className="flex items-center">
              <FontAwesomeIcon icon={faCalendarAlt} className="mr-1.5" />
              {sprintBoard.daysRemaining} Days remaining
            </span>
            <span className="flex items-center">
              <FontAwesomeIcon icon={faChartPie} className="mr-1.5" />
              {sprintBoard.totalPoints} Points Total
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex -space-x-2 mr-4">
            {activeTeam.map((m) => (
              <TeamMemberAvatar key={m.id} member={m} border className="mr-0" />
            ))}
          </div>
          <button
            type="button"
            className="bg-gray-100 hover:bg-gray-200 text-atlassian-text px-3 py-1.5 rounded-jira-btn text-sm font-medium transition-colors"
          >
            Complete Sprint
          </button>
        </div>
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-4 hide-scrollbar min-h-[400px]">
        {sprintBoard.columns.map((column) => (
          <div key={column.id} className="w-72 shrink-0 flex flex-col">
            <div className="text-xs font-bold text-atlassian-subtext uppercase mb-2 flex justify-between items-center px-1">
              <span>
                {column.title}{' '}
                <span className="bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 ml-1 text-[10px]">
                  {column.count}
                </span>
              </span>
            </div>
            <div className="bg-gray-100/50 rounded-lg p-2 flex-1 space-y-2">
              {column.cards.length === 0 ? (
                <div className="flex items-center justify-center h-20 border-2 border-dashed border-gray-300 rounded-lg text-xs text-atlassian-subtext">
                  Drop cards here
                </div>
              ) : (
                column.cards.map((card) => {
                  const assignee = findTeamMember(team, {
                    initials: card.assigneeInitials,
                  });
                  return (
                  <div
                    key={card.ticketId}
                    className={`bg-white p-3 rounded-jira-card shadow-sm border border-atlassian-border hover:shadow-md transition-shadow cursor-pointer group ${
                      card.borderAccent
                        ? `border-l-4 ${card.borderAccent}`
                        : ''
                    }`}
                  >
                    <div className="text-sm text-atlassian-text mb-3 leading-snug">
                      {card.title}
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="flex items-center space-x-2">
                        {card.icons.map((iconName) => {
                          const icon = ICON_MAP[iconName];
                          if (!icon) return null;
                          const colorClass =
                            iconName === 'bookmark'
                              ? 'text-green-500'
                              : iconName === 'check-square'
                                ? 'text-blue-400'
                                : iconName === 'arrow-up'
                                  ? 'text-red-500'
                                  : 'text-blue-500';
                          return (
                            <FontAwesomeIcon
                              key={iconName}
                              icon={icon}
                              className={`text-xs ${colorClass}`}
                            />
                          );
                        })}
                        <span className="text-xs text-atlassian-subtext">
                          {card.ticketId}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-[10px] font-semibold text-atlassian-text">
                          {card.points}
                        </span>
                        <TeamMemberAvatar
                          member={assignee}
                          initials={card.assigneeInitials}
                          colorClass={card.assigneeColor}
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => navigate('/planning/context')}
        className="mt-4 text-sm text-atlassian-blue hover:underline self-start"
      >
        Start new planning flow
      </button>
    </div>
  );
}
