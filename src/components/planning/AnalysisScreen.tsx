import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { usePlanningStore } from '../../store/planningStore';
import { planningClient } from '../../api/planningClient';
import { MatrixTaskCard } from './MatrixTaskCard';
import { TeamContextList } from './TeamContextList';
import { AgentWorkflowOverlay } from './AgentWorkflowOverlay';
import {
  getAnalysisToAssignmentsSteps,
  minStepDelay,
} from './workflowSteps';
import { getPriorityColor } from '../../utils/matrixPositions';
import type { Quadrant, Task } from '../../../shared/schemas/index';

const QUADRANT_CONFIG: {
  quadrant: Quadrant;
  label: string;
  labelClass: string;
  bgClass: string;
  borderClass: string;
}[] = [
  {
    quadrant: 'quick_wins',
    label: 'Quick Wins',
    labelClass: 'text-green-600',
    bgClass: 'bg-green-50/30',
    borderClass: 'border-r-2 border-b-2',
  },
  {
    quadrant: 'major_projects',
    label: 'Major Projects',
    labelClass: 'text-blue-600',
    bgClass: 'bg-blue-50/30',
    borderClass: 'border-b-2',
  },
  {
    quadrant: 'fill_ins',
    label: 'Fill-ins',
    labelClass: 'text-gray-500',
    bgClass: 'bg-gray-50/30',
    borderClass: 'border-r-2',
  },
  {
    quadrant: 'time_sinks',
    label: 'Time Sinks',
    labelClass: 'text-orange-500',
    bgClass: 'bg-orange-50/30',
    borderClass: '',
  },
];

function groupByQuadrant(tasks: Task[]): Record<Quadrant, Task[]> {
  return tasks.reduce(
    (acc, task) => {
      acc[task.quadrant].push(task);
      return acc;
    },
    {
      quick_wins: [] as Task[],
      major_projects: [] as Task[],
      fill_ins: [] as Task[],
      time_sinks: [] as Task[],
    },
  );
}

export function AnalysisScreen() {
  const navigate = useNavigate();
  const [workflowActive, setWorkflowActive] = useState(false);
  const [workflowStep, setWorkflowStep] = useState(0);
  const workflowSteps = getAnalysisToAssignmentsSteps();

  const {
    projectContext,
    taskGraph,
    loading,
    team,
    setTaskGraph,
    setAssignmentPlan,
    setLoading,
    setError,
  } = usePlanningStore();

  useEffect(() => {
    if (taskGraph || !projectContext) return;
    const load = async () => {
      setError(null);
      setLoading('analyze');
      try {
        const graph = await planningClient.analyze(projectContext);
        setTaskGraph(graph);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Analysis failed');
      } finally {
        setLoading(null);
      }
    };
    void load();
  }, [projectContext, taskGraph, setTaskGraph, setLoading, setError]);

  const handleAssignments = async () => {
    if (!taskGraph) return;
    setError(null);
    setWorkflowActive(true);
    setWorkflowStep(0);
    setLoading('assign');

    try {
      await minStepDelay(800);
      setWorkflowStep(1);

      const planPromise = planningClient.assign(taskGraph, team);
      await minStepDelay(1200);

      const plan = await planPromise;
      setAssignmentPlan(plan);

      setWorkflowStep(2);
      await minStepDelay(800);

      setWorkflowActive(false);
      navigate('/planning/assignments');
    } catch (err) {
      setWorkflowActive(false);
      setError(err instanceof Error ? err.message : 'Assignment failed');
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
        {loading === 'analyze' ? 'Running AI analysis...' : 'No analysis data yet. Start from Context Input.'}
      </div>
    );
  }

  const grouped = groupByQuadrant(taskGraph.tasks);
  const { summary } = taskGraph;
  const fetchNote = projectContext?.docFetchMessage;
  const fetchOk = projectContext?.docFetchStatus === 'ok';

  return (
    <div className="max-w-6xl mx-auto">
      {fetchNote && (
        <div
          className={`mb-4 px-4 py-3 text-sm rounded-jira-btn border ${
            fetchOk
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          {fetchNote}
        </div>
      )}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">AI Task Prioritization</h1>
          <p className="text-atlassian-subtext text-sm">
            Tasks generated from PRD plotted on Effort vs Impact matrix.
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => navigate('/planning/context')}
            className="bg-white border border-atlassian-border hover:bg-gray-50 text-atlassian-text px-4 py-2.5 rounded-jira-btn text-sm font-medium shadow-sm transition-colors"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleAssignments}
            className="bg-atlassian-blue hover:bg-atlassian-darkblue text-white px-5 py-2.5 rounded-jira-btn text-sm font-medium shadow-sm transition-colors flex items-center"
          >
            Review Assignments
            <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
          </button>
        </div>
      </div>

      <div className="flex gap-6 h-[600px]">
        <div className="flex-1 bg-white rounded-jira-card shadow-jira border border-atlassian-border p-8 relative flex flex-col">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 origin-center text-xs font-bold text-atlassian-subtext uppercase tracking-widest w-[600px] text-center">
            Impact
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-bold text-atlassian-subtext uppercase tracking-widest">
            Effort
          </div>

          <div className="flex-1 ml-6 mb-6 matrix-bg relative rounded-lg border-2 border-atlassian-border">
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
              {QUADRANT_CONFIG.map((q) => {
                const tasks = grouped[q.quadrant];
                const labelPos =
                  q.quadrant === 'quick_wins'
                    ? 'top-2 left-2'
                    : q.quadrant === 'major_projects'
                      ? 'top-2 right-2'
                      : q.quadrant === 'fill_ins'
                        ? 'bottom-2 left-2'
                        : 'bottom-2 right-2';

                return (
                  <div
                    key={q.quadrant}
                    className={`${q.borderClass} border-atlassian-border border-dashed p-4 relative ${q.bgClass}`}
                  >
                    <span
                      className={`absolute ${labelPos} text-xs font-bold ${q.labelClass} uppercase opacity-50`}
                    >
                      {q.label}
                    </span>
                    {tasks.map((task, i) => (
                      <MatrixTaskCard
                        key={task.id}
                        task={task}
                        indexInQuadrant={i}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-80 flex flex-col space-y-4">
          <div className="bg-white rounded-jira-card shadow-jira border border-atlassian-border p-5">
            <h3 className="text-sm font-bold text-atlassian-text mb-2">
              AI Summary
            </h3>
            <p className="text-sm text-atlassian-subtext mb-4">
              Analyzed PRD and extracted{' '}
              <strong>{summary.taskCount} tasks</strong>. {summary.quickWinCount}{' '}
              tasks are flagged as Quick Wins and should be prioritized.
            </p>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-atlassian-subtext">Total Estimated Effort</span>
              <span className="font-semibold">{summary.totalEffortPoints} pts</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-atlassian-blue h-2 rounded-full"
                style={{ width: `${summary.capacityUsedPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-atlassian-subtext">Team Capacity</span>
              <span className="font-semibold">{summary.capacityPoints} pts</span>
            </div>
          </div>

          <div className="bg-white rounded-jira-card shadow-jira border border-atlassian-border p-5">
            <h3 className="text-sm font-bold text-atlassian-subtext uppercase mb-4">
              Team Context
            </h3>
            <TeamContextList team={team} />
          </div>

          <div className="bg-white rounded-jira-card shadow-jira border border-atlassian-border p-0 flex-1 flex flex-col overflow-hidden min-h-0">
            <div className="p-4 border-b border-atlassian-border bg-gray-50">
              <h3 className="text-sm font-bold text-atlassian-text">
                Generated Backlog
              </h3>
            </div>
            <div className="p-2 overflow-y-auto flex-1">
              {taskGraph.tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-2 hover:bg-gray-50 rounded cursor-pointer border border-transparent hover:border-atlassian-border mb-1"
                >
                  <div className="text-sm font-medium truncate">{task.title}</div>
                  <div
                    className={`text-xs mt-1 ${getPriorityColor(task.priorityLabel)}`}
                  >
                    {task.priorityLabel}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
