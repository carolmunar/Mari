import type {
  AssignmentPlan,
  ContextInput,
  ProjectContext,
  SprintBoard,
  TaskGraph,
  TeamMember,
} from '../../shared/schemas/index';

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? `Request failed: ${res.status}`);
  }
  return data as T;
}

export const planningClient = {
  context: (input: ContextInput) =>
    post<ProjectContext>('/api/agents/context', input),
  analyze: (context: ProjectContext) =>
    post<TaskGraph>('/api/agents/analyze', context),
  assign: (tasks: TaskGraph, team: TeamMember[]) =>
    post<AssignmentPlan>('/api/agents/assign', { tasks, team }),
  sprint: (plan: AssignmentPlan) =>
    post<SprintBoard>('/api/agents/sprint', plan),
};
