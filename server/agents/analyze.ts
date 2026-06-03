import {
  computeQuadrant,
  projectContextSchema,
  taskGraphSchema,
  type ProjectContext,
  type TaskGraph,
} from '../../shared/schemas/index.js';
import { runStructuredAgent } from '../lib/llm.js';

const SYSTEM = `You are the Analysis Agent for an AI sprint planner.
From the project context, extract actionable development tasks.
Score each task:
- effort: 1-10 (1=trivial, 10=very large)
- impact: 1-10 (1=minimal user value, 10=critical business impact)
Assign priorityLabel: High Priority, Critical, Medium Priority, or Low Priority.
Generate 8-15 tasks when enough context exists; fewer if context is sparse.
Estimate totalEffortPoints as sum of effort scores.
Set capacityPoints to 40 and capacityUsedPercent based on total vs capacity.`;

export async function runAnalyzeAgent(
  context: ProjectContext,
): Promise<TaskGraph> {
  const parsed = projectContextSchema.parse(context);

  const result = await runStructuredAgent(
    SYSTEM,
    parsed,
    taskGraphSchema,
  );

  const tasks = result.tasks.map((task, index) => {
    const effort = Math.min(10, Math.max(1, Math.round(task.effort)));
    const impact = Math.min(10, Math.max(1, Math.round(task.impact)));
    return {
      ...task,
      id: task.id || `task-${index + 1}`,
      effort,
      impact,
      quadrant: computeQuadrant(effort, impact),
    };
  });

  const totalEffortPoints = tasks.reduce((sum, t) => sum + t.effort, 0);
  const quickWinCount = tasks.filter((t) => t.quadrant === 'quick_wins').length;
  const capacityPoints = 40;
  const capacityUsedPercent = Math.min(
    100,
    Math.round((totalEffortPoints / capacityPoints) * 100),
  );

  return {
    tasks,
    summary: {
      taskCount: tasks.length,
      quickWinCount,
      totalEffortPoints,
      capacityPoints,
      capacityUsedPercent,
    },
  };
}
