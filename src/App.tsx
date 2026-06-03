import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { PlanningLayout } from './layouts/PlanningLayout';
import { ContextInputScreen } from './components/planning/ContextInputScreen';
import { AnalysisScreen } from './components/planning/AnalysisScreen';
import { AssignmentsScreen } from './components/planning/AssignmentsScreen';
import { SprintBoardScreen } from './components/planning/SprintBoardScreen';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/planning/context" replace />} />
        <Route element={<PlanningLayout />}>
          <Route path="/planning/context" element={<ContextInputScreen />} />
          <Route path="/planning/analysis" element={<AnalysisScreen />} />
          <Route path="/planning/assignments" element={<AssignmentsScreen />} />
          <Route path="/planning/board" element={<SprintBoardScreen />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
