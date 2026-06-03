export type WorkflowStep = {
  id: string;
  agentLabel: string;
  title: string;
  description: string;
  /** Team member id who "speaks" this step, or 'ai' for ProjectAI */
  speakerId: string;
};

export function getContextToAnalysisSteps(hasDocUrl: boolean): WorkflowStep[] {
  return [
    {
      id: 'start',
      agentLabel: 'Orchestrator',
      title: 'Starting your planning session',
      description:
        'Reviewing what you shared — links, files, notes, and who is available on the team.',
      speakerId: 'ai',
    },
    {
      id: 'fetch',
      agentLabel: 'Document Reader',
      title: 'Fetching your documentation',
      description: hasDocUrl
        ? 'Opening your doc link and pulling the text so we analyze real requirements — not guesses.'
        : 'No link provided — using your uploaded file and notes instead.',
      speakerId: 'sj',
    },
    {
      id: 'context',
      agentLabel: 'Context Agent',
      title: 'Understanding project context',
      description:
        'Extracting goals, constraints, and scope. Keeping only what is supported by your input.',
      speakerId: 'mr',
    },
    {
      id: 'analyze',
      agentLabel: 'Analysis Agent',
      title: 'Building the priority matrix',
      description:
        'Breaking work into tasks and scoring effort vs impact for the sprint matrix.',
      speakerId: 'al',
    },
    {
      id: 'done',
      agentLabel: 'Orchestrator',
      title: 'Analysis ready',
      description:
        'Context and task list are ready. Opening the AI Insights Matrix…',
      speakerId: 'ai',
    },
  ];
}

export function getAnalysisToAssignmentsSteps(): WorkflowStep[] {
  return [
    {
      id: 'start',
      agentLabel: 'Orchestrator',
      title: 'Reviewing prioritized tasks',
      description: 'Loading the matrix results and checking team capacity.',
      speakerId: 'ai',
    },
    {
      id: 'assign',
      agentLabel: 'Assignment Agent',
      title: 'Matching tasks to your team',
      description:
        'Mapping each task to the best person by role, skills, and availability.',
      speakerId: 'mr',
    },
    {
      id: 'done',
      agentLabel: 'Orchestrator',
      title: 'Assignments ready',
      description: 'Opening the assignment review table…',
      speakerId: 'ai',
    },
  ];
}

export function getAssignmentsToBoardSteps(): WorkflowStep[] {
  return [
    {
      id: 'start',
      agentLabel: 'Orchestrator',
      title: 'Creating your sprint',
      description: 'Confirming approved assignments and preparing the board.',
      speakerId: 'ai',
    },
    {
      id: 'board',
      agentLabel: 'Sprint Agent',
      title: 'Building the kanban board',
      description:
        'Placing every ticket in To Do — your project is just starting.',
      speakerId: 'sj',
    },
    {
      id: 'done',
      agentLabel: 'Orchestrator',
      title: 'Board ready',
      description: 'Opening your Kanban Board…',
      speakerId: 'ai',
    },
  ];
}

export function minStepDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
