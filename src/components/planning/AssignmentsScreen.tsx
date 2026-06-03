import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faEdit } from '@fortawesome/free-solid-svg-icons';
import { usePlanningStore } from '../../store/planningStore';
import { planningClient } from '../../api/planningClient';
import { TeamMemberAvatar } from '../ui/TeamMemberAvatar';
import { findTeamMember } from '../../utils/teamAvatar';
import { AgentWorkflowOverlay } from './AgentWorkflowOverlay';
import {
  getAssignmentsToBoardSteps,
  minStepDelay,
} from './workflowSteps';

export function AssignmentsScreen() {
  const navigate = useNavigate();
  const [workflowActive, setWorkflowActive] = useState(false);
  const [workflowStep, setWorkflowStep] = useState(0);
  const workflowSteps = getAssignmentsToBoardSteps();
  const {
    taskGraph,
    team,
    assignmentPlan,
    loading,
    setAssignmentPlan,
    setSprintBoard,
    setLoading,
    setError,
  } = usePlanningStore();

  useEffect(() => {
    if (assignmentPlan || !taskGraph) return;
    const load = async () => {
      setError(null);
      setLoading('assign');
      try {
        const plan = await planningClient.assign(taskGraph, team);
        setAssignmentPlan(plan);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Assignment failed');
      } finally {
        setLoading(null);
      }
    };
    void load();
  }, [taskGraph, team, assignmentPlan, setAssignmentPlan, setLoading, setError]);

  const handleCreateSprint = async () => {
    if (!assignmentPlan) return;
    setError(null);
    setWorkflowActive(true);
    setWorkflowStep(0);
    setLoading('sprint');

    try {
      await minStepDelay(800);
      setWorkflowStep(1);

      const boardPromise = planningClient.sprint(assignmentPlan);
      await minStepDelay(1100);

      const board = await boardPromise;
      setSprintBoard(board);

      setWorkflowStep(2);
      await minStepDelay(800);

      setWorkflowActive(false);
      navigate('/planning/board');
    } catch (err) {
      setWorkflowActive(false);
      setError(err instanceof Error ? err.message : 'Sprint creation failed');
    } finally {
      setLoading(null);
    }
  };

  if (workflowActive) {
    return (
      <AgentWorkflowOverlay
        steps={workflowSteps}
        activeStepIndex={workflowStep}
        team={team}
        maxWidthClass="max-w-6xl"
      />
    );
  }

  if (!taskGraph) {
    return (
      <div className="max-w-6xl mx-auto text-atlassian-subtext">
        Complete analysis first.
      </div>
    );
  }

  if (!assignmentPlan) {
    return (
      <div className="max-w-6xl mx-auto text-atlassian-subtext">
        {loading === 'assign' ? 'Running assignment agent...' : 'Loading...'}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Review AI Assignments</h1>
          <p className="text-atlassian-subtext text-sm">
            AI has mapped tasks to team members based on capabilities and
            workload.
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => navigate('/planning/analysis')}
            className="bg-white border border-atlassian-border hover:bg-gray-50 text-atlassian-text px-4 py-2.5 rounded-jira-btn text-sm font-medium shadow-sm transition-colors"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleCreateSprint}
            disabled={loading === 'sprint'}
            className="bg-atlassian-blue hover:bg-atlassian-darkblue disabled:opacity-60 text-white px-5 py-2.5 rounded-jira-btn text-sm font-medium shadow-sm transition-colors"
          >
            {loading === 'sprint' ? 'Creating...' : 'Approve & Open Kanban Board'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-jira-card shadow-jira border border-atlassian-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-atlassian-border">
              <th className="p-4 text-xs font-bold text-atlassian-subtext uppercase tracking-wider w-1/3">
                Task
              </th>
              <th className="p-4 text-xs font-bold text-atlassian-subtext uppercase tracking-wider">
                Recommended Assignee
              </th>
              <th className="p-4 text-xs font-bold text-atlassian-subtext uppercase tracking-wider">
                Capability Match
              </th>
              <th className="p-4 text-xs font-bold text-atlassian-subtext uppercase tracking-wider">
                Est. Effort
              </th>
              <th className="p-4 text-xs font-bold text-atlassian-subtext uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-atlassian-border">
            {assignmentPlan.rows.map((row) => {
              const assignee = findTeamMember(team, {
                id: row.assigneeId,
                initials: row.assigneeInitials,
                name: row.assigneeName,
              });
              return (
              <tr key={row.taskId} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-sm text-atlassian-text">
                    {row.title}
                  </div>
                  <div className="text-xs text-atlassian-subtext mt-0.5">
                    {row.module}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center">
                    <TeamMemberAvatar
                      member={assignee}
                      initials={row.assigneeInitials}
                      colorClass={row.assigneeColor}
                      size="sm"
                      className="mr-2"
                    />
                    <span className="text-sm">{row.assigneeName}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-1.5 mr-2">
                      <div
                        className={`h-1.5 rounded-full ${
                          row.matchPercent >= 90
                            ? 'bg-green-500'
                            : row.matchPercent >= 80
                              ? 'bg-green-400'
                              : 'bg-yellow-500'
                        }`}
                        style={{ width: `${row.matchPercent}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        row.matchPercent >= 90
                          ? 'text-green-600'
                          : 'text-green-500'
                      }`}
                    >
                      {row.matchPercent}%
                    </span>
                  </div>
                  <div className="text-[10px] text-atlassian-subtext mt-1">
                    {row.matchReason}
                  </div>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-gray-100 text-xs font-semibold text-atlassian-text">
                    {row.effortPoints} pts
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    type="button"
                    className="w-8 h-8 rounded hover:bg-green-100 text-green-600 transition-colors"
                  >
                    <FontAwesomeIcon icon={faCheck} />
                  </button>
                  <button
                    type="button"
                    className="w-8 h-8 rounded hover:bg-gray-200 text-gray-500 transition-colors ml-1"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
