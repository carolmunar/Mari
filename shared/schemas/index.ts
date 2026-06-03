import { z } from 'zod';

export const teamMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  initials: z.string(),
  role: z.string(),
  available: z.boolean(),
  color: z.string().optional(),
});

export const contextInputSchema = z.object({
  docUrl: z.string().optional(),
  fileText: z.string().optional(),
  additionalNotes: z.string().optional(),
  team: z.array(teamMemberSchema),
});

export const docFetchStatusSchema = z.enum([
  'ok',
  'partial',
  'failed',
  'skipped',
]);

export const projectContextSchema = z.object({
  projectName: z.string(),
  summary: z.string(),
  goals: z.array(z.string()),
  constraints: z.array(z.string()),
  teamSnapshot: z.array(teamMemberSchema),
  rawSources: z.array(z.string()),
  docFetchStatus: docFetchStatusSchema.optional(),
  docFetchMessage: z.string().optional(),
});

export const quadrantSchema = z.enum([
  'quick_wins',
  'major_projects',
  'fill_ins',
  'time_sinks',
]);

export const priorityLabelSchema = z.enum([
  'High Priority',
  'Critical',
  'Medium Priority',
  'Low Priority',
]);

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  module: z.string().optional(),
  effort: z.number().min(1).max(10),
  impact: z.number().min(1).max(10),
  quadrant: quadrantSchema,
  priorityLabel: priorityLabelSchema,
});

export const taskGraphSchema = z.object({
  tasks: z.array(taskSchema),
  summary: z.object({
    taskCount: z.number(),
    quickWinCount: z.number(),
    totalEffortPoints: z.number(),
    capacityPoints: z.number(),
    capacityUsedPercent: z.number(),
  }),
});

export const assignmentRowSchema = z.object({
  taskId: z.string(),
  title: z.string(),
  module: z.string(),
  assigneeId: z.string(),
  assigneeName: z.string(),
  assigneeInitials: z.string(),
  assigneeColor: z.string(),
  matchPercent: z.number().min(0).max(100),
  matchReason: z.string(),
  effortPoints: z.number(),
});

export const assignmentPlanSchema = z.object({
  rows: z.array(assignmentRowSchema),
});

export const sprintCardSchema = z.object({
  title: z.string(),
  ticketId: z.string(),
  points: z.number(),
  assigneeInitials: z.string(),
  assigneeColor: z.string(),
  borderAccent: z.string().optional(),
  icons: z.array(z.string()),
});

export const sprintColumnSchema = z.object({
  id: z.string(),
  title: z.string(),
  count: z.number(),
  cards: z.array(sprintCardSchema),
});

export const sprintBoardSchema = z.object({
  sprintName: z.string(),
  daysRemaining: z.number(),
  totalPoints: z.number(),
  columns: z.array(sprintColumnSchema),
});

export type TeamMember = z.infer<typeof teamMemberSchema>;
export type ContextInput = z.infer<typeof contextInputSchema>;
export type ProjectContext = z.infer<typeof projectContextSchema>;
export type Task = z.infer<typeof taskSchema>;
export type TaskGraph = z.infer<typeof taskGraphSchema>;
export type AssignmentRow = z.infer<typeof assignmentRowSchema>;
export type AssignmentPlan = z.infer<typeof assignmentPlanSchema>;
export type SprintBoard = z.infer<typeof sprintBoardSchema>;
export type SprintCard = z.infer<typeof sprintCardSchema>;
export type Quadrant = z.infer<typeof quadrantSchema>;

export function computeQuadrant(effort: number, impact: number): Quadrant {
  const lowEffort = effort <= 5;
  const highImpact = impact >= 6;
  if (lowEffort && highImpact) return 'quick_wins';
  if (!lowEffort && highImpact) return 'major_projects';
  if (lowEffort && !highImpact) return 'fill_ins';
  return 'time_sinks';
}

export const DEFAULT_TEAM: TeamMember[] = [
  {
    id: 'sj',
    name: 'Sarah Jenkins',
    initials: 'SJ',
    role: 'Frontend',
    available: true,
    color: 'bg-blue-500',
  },
  {
    id: 'mr',
    name: 'Mike Ross',
    initials: 'MR',
    role: 'Backend',
    available: true,
    color: 'bg-red-500',
  },
  {
    id: 'al',
    name: 'Anna Lee',
    initials: 'AL',
    role: 'Design',
    available: true,
    color: 'bg-yellow-500',
  },
  {
    id: 'dk',
    name: 'David Kim',
    initials: 'DK',
    role: 'DevOps (PTO)',
    available: false,
    color: 'bg-gray-500',
  },
];
