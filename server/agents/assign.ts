import {
  assignmentPlanSchema,
  taskGraphSchema,
  teamMemberSchema,
  type AssignmentPlan,
  type TaskGraph,
  type TeamMember,
} from '../../shared/schemas';
import { runStructuredAgent } from '../lib/llm';
import { z } from 'zod';

const SYSTEM = `You are the Assignment Agent for an AI sprint planner.
Map each task to the best available team member based on role/skills.
Use assigneeId from the team input (sj, mr, al). NEVER assign to dk or anyone with available false.
Spread work across the team when multiple people fit — do not put every task on one person.
Provide matchPercent 0-100 and a short matchReason.
effortPoints should reflect task complexity (typically effort score or close).
assigneeName and assigneeInitials must match the chosen team member.`;

const assignInputSchema = z.object({
  tasks: taskGraphSchema,
  team: z.array(teamMemberSchema),
});

export async function runAssignAgent(
  tasks: TaskGraph,
  team: TeamMember[],
): Promise<AssignmentPlan> {
  const parsed = assignInputSchema.parse({ tasks, team });

  const result = await runStructuredAgent(
    SYSTEM,
    parsed,
    assignmentPlanSchema,
  );

  const availableIds = new Set(
    parsed.team.filter((m) => m.available).map((m) => m.id),
  );
  const memberById = new Map(parsed.team.map((m) => [m.id, m]));

  const memberByName = new Map(
    parsed.team.map((m) => [m.name.toLowerCase(), m]),
  );

  const rows = result.rows.map((row) => {
    let assigneeId = row.assigneeId;
    if (!availableIds.has(assigneeId)) {
      const byName = memberByName.get(row.assigneeName.toLowerCase());
      assigneeId =
        byName && byName.available
          ? byName.id
          : (parsed.team.find((m) => m.available)?.id ?? row.assigneeId);
    }
    const member =
      memberById.get(assigneeId) ??
      memberByName.get(row.assigneeName.toLowerCase());
    return {
      ...row,
      assigneeId: member?.id ?? assigneeId,
      assigneeName: member?.name ?? row.assigneeName,
      assigneeInitials: member?.initials ?? row.assigneeInitials,
      assigneeColor: member?.color ?? row.assigneeColor ?? 'bg-gray-500',
      matchPercent: Math.min(100, Math.max(0, Math.round(row.matchPercent))),
    };
  });

  return { rows };
}
