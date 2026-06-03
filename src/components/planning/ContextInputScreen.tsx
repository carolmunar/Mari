import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBold,
  faCloudUploadAlt,
  faItalic,
  faLink,
  faListUl,
  faMagic,
} from '@fortawesome/free-solid-svg-icons';
import { usePlanningStore } from '../../store/planningStore';
import { planningClient } from '../../api/planningClient';
import { TeamContextList } from './TeamContextList';
import { AgentWorkflowOverlay } from './AgentWorkflowOverlay';
import {
  getContextToAnalysisSteps,
  minStepDelay,
} from './workflowSteps';

export function ContextInputScreen() {
  const navigate = useNavigate();
  const [workflowActive, setWorkflowActive] = useState(false);
  const [workflowStep, setWorkflowStep] = useState(0);

  const {
    team,
    docUrl,
    fileText,
    additionalNotes,
    loading,
    setDocUrl,
    setFileText,
    setAdditionalNotes,
    toggleTeamMember,
    getContextInput,
    setProjectContext,
    setTaskGraph,
    setAssignmentPlan,
    setSprintBoard,
    setLoading,
    setError,
  } = usePlanningStore();

  const workflowSteps = getContextToAnalysisSteps(Boolean(docUrl.trim()));

  const handleAnalyze = async () => {
    setError(null);
    setWorkflowActive(true);
    setWorkflowStep(0);
    setLoading('context');

    try {
      await minStepDelay(900);
      setWorkflowStep(1);

      const input = getContextInput();
      const contextPromise = planningClient.context(input);

      await minStepDelay(1100);
      setWorkflowStep(2);

      const context = await contextPromise;
      setProjectContext(context);
      setAssignmentPlan(null);
      setSprintBoard(null);
      setTaskGraph(null);

      await minStepDelay(1000);
      setWorkflowStep(3);
      setLoading('analyze');

      const graphPromise = planningClient.analyze(context);
      await minStepDelay(1200);

      const graph = await graphPromise;
      setTaskGraph(graph);

      setWorkflowStep(4);
      await minStepDelay(900);

      setWorkflowActive(false);
      navigate('/planning/analysis');
    } catch (err) {
      setWorkflowActive(false);
      setError(err instanceof Error ? err.message : 'Failed to analyze');
    } finally {
      setLoading(null);
    }
  };

  const isLoading = loading !== null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFileText(String(reader.result ?? ''));
    };
    reader.readAsText(file);
  };

  if (workflowActive) {
    return (
      <AgentWorkflowOverlay
        steps={workflowSteps}
        activeStepIndex={workflowStep}
        team={team}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Provide Project Context</h1>
          <p className="text-atlassian-subtext text-sm">
            Upload PRDs or link documentation to let AI analyze and generate
            tasks.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isLoading}
          className="bg-atlassian-blue hover:bg-atlassian-darkblue disabled:opacity-60 text-white px-5 py-2.5 rounded-jira-btn text-sm font-medium shadow-sm transition-colors flex items-center"
        >
          <FontAwesomeIcon icon={faMagic} className="mr-2" />
          Analyze with AI
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-jira-card shadow-jira p-6 border border-atlassian-border">
            <h2 className="text-sm font-bold text-atlassian-subtext uppercase mb-4">
              Link Documentation
            </h2>
            <p className="text-xs text-atlassian-subtext mb-3">
              Paste a Notion link — we fetch the page text before AI analysis. For
              private pages: Share → Publish to web, or add{' '}
              <code className="text-[11px] bg-atlassian-background px-1 rounded">
                NOTION_API_KEY
              </code>{' '}
              in .env (Notion integration with page access).
            </p>
            <div className="flex border border-atlassian-border rounded-jira-btn overflow-hidden focus-within:border-atlassian-blue focus-within:ring-1 focus-within:ring-atlassian-blue transition-all">
              <div className="bg-atlassian-background px-4 py-2 border-r border-atlassian-border flex items-center">
                <FontAwesomeIcon icon={faLink} className="text-atlassian-subtext" />
              </div>
              <input
                type="text"
                value={docUrl}
                onChange={(e) => setDocUrl(e.target.value)}
                placeholder="Paste Notion, Confluence, or Google Docs URL"
                className="flex-1 px-4 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-jira-card shadow-jira p-6 border border-atlassian-border">
            <h2 className="text-sm font-bold text-atlassian-subtext uppercase mb-4">
              Upload Files
            </h2>
            <label className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept=".txt,.md,.pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              <div className="w-12 h-12 bg-blue-100 text-atlassian-blue rounded-full flex items-center justify-center mb-4 text-xl">
                <FontAwesomeIcon icon={faCloudUploadAlt} />
              </div>
              <p className="text-sm font-medium mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-atlassian-subtext">
                PDF, DOCX, or TXT (max. 10MB)
              </p>
              {fileText && (
                <p className="text-xs text-green-600 mt-2">File loaded</p>
              )}
            </label>
          </div>

          <div className="bg-white rounded-jira-card shadow-jira border border-atlassian-border overflow-hidden">
            <div className="p-4 border-b border-atlassian-border flex items-center space-x-4 bg-atlassian-background text-atlassian-subtext">
              <FontAwesomeIcon
                icon={faBold}
                className="cursor-pointer hover:text-atlassian-text"
              />
              <FontAwesomeIcon
                icon={faItalic}
                className="cursor-pointer hover:text-atlassian-text"
              />
              <FontAwesomeIcon
                icon={faListUl}
                className="cursor-pointer hover:text-atlassian-text"
              />
              <FontAwesomeIcon
                icon={faLink}
                className="cursor-pointer hover:text-atlassian-text"
              />
              <div className="w-px h-4 bg-atlassian-border" />
              <span className="text-xs font-semibold uppercase">
                Additional Context
              </span>
            </div>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="w-full h-40 p-4 text-sm outline-none resize-none"
              placeholder="Type any specific goals, constraints, or notes for this sprint..."
            />
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-jira-card shadow-jira p-6 border border-atlassian-border">
            <h2 className="text-sm font-bold text-atlassian-subtext uppercase mb-4">
              Team Context
            </h2>
            <p className="text-xs text-atlassian-subtext mb-4">
              AI will map tasks to these available team members based on their
              historical skills.
            </p>
            <div className="space-y-3">
              <TeamContextList team={team} onToggle={toggleTeamMember} />
            </div>
            <button
              type="button"
              className="w-full mt-4 py-2 border border-atlassian-border text-sm font-medium rounded-jira-btn hover:bg-atlassian-background text-atlassian-text transition-colors"
            >
              Manage Team
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
