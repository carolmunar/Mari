import { create } from 'zustand';
import type {
  AssignmentPlan,
  ContextInput,
  ProjectContext,
  SprintBoard,
  TaskGraph,
  TeamMember,
} from '../../shared/schemas/index';
import { DEFAULT_TEAM } from '../../shared/schemas/index';

type LoadingKey = 'context' | 'analyze' | 'assign' | 'sprint' | null;

interface PlanningState {
  team: TeamMember[];
  docUrl: string;
  fileText: string;
  additionalNotes: string;
  projectContext: ProjectContext | null;
  taskGraph: TaskGraph | null;
  assignmentPlan: AssignmentPlan | null;
  sprintBoard: SprintBoard | null;
  loading: LoadingKey;
  error: string | null;
  setDocUrl: (v: string) => void;
  setFileText: (v: string) => void;
  setAdditionalNotes: (v: string) => void;
  toggleTeamMember: (id: string) => void;
  setProjectContext: (ctx: ProjectContext | null) => void;
  setTaskGraph: (graph: TaskGraph | null) => void;
  setAssignmentPlan: (plan: AssignmentPlan | null) => void;
  setSprintBoard: (board: SprintBoard | null) => void;
  setLoading: (key: LoadingKey) => void;
  setError: (msg: string | null) => void;
  getContextInput: () => ContextInput;
}

export const usePlanningStore = create<PlanningState>((set, get) => ({
  team: DEFAULT_TEAM,
  docUrl: '',
  fileText: '',
  additionalNotes: '',
  projectContext: null,
  taskGraph: null,
  assignmentPlan: null,
  sprintBoard: null,
  loading: null,
  error: null,
  setDocUrl: (docUrl) => set({ docUrl }),
  setFileText: (fileText) => set({ fileText }),
  setAdditionalNotes: (additionalNotes) => set({ additionalNotes }),
  toggleTeamMember: (id) =>
    set((state) => ({
      team: state.team.map((m) =>
        m.id === id ? { ...m, available: !m.available } : m,
      ),
    })),
  setProjectContext: (projectContext) => set({ projectContext }),
  setTaskGraph: (taskGraph) => set({ taskGraph }),
  setAssignmentPlan: (assignmentPlan) => set({ assignmentPlan }),
  setSprintBoard: (sprintBoard) => set({ sprintBoard }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  getContextInput: () => {
    const { docUrl, fileText, additionalNotes, team } = get();
    return { docUrl, fileText, additionalNotes, team };
  },
}));
