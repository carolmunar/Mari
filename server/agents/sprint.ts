import {
  assignmentPlanSchema,
  type AssignmentPlan,
  type SprintBoard,
  type SprintCard,
} from '../../shared/schemas/index.js';

/** New projects start with every ticket in To Do — nothing in progress yet. */
export async function runSprintAgent(
  plan: AssignmentPlan,
): Promise<SprintBoard> {
  const parsed = assignmentPlanSchema.parse(plan);
  const totalPoints = parsed.rows.reduce((sum, r) => sum + r.effortPoints, 0);

  const cards: SprintCard[] = parsed.rows.map((row, index) => ({
    title: row.title,
    ticketId: `PROJ-${101 + index}`,
    points: row.effortPoints,
    assigneeInitials: row.assigneeInitials || '??',
    assigneeColor: row.assigneeColor || 'bg-gray-500',
    icons: index % 2 === 0 ? ['bookmark'] : ['check-square'],
  }));

  return {
    sprintName: 'Sprint 42 Board',
    daysRemaining: 10,
    totalPoints,
    columns: [
      {
        id: 'todo',
        title: 'To Do',
        count: cards.length,
        cards,
      },
      {
        id: 'in_progress',
        title: 'In Progress',
        count: 0,
        cards: [],
      },
      {
        id: 'review',
        title: 'Review',
        count: 0,
        cards: [],
      },
      {
        id: 'done',
        title: 'Done',
        count: 0,
        cards: [],
      },
    ],
  };
}
