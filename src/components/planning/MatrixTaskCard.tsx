import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowDown,
  faArrowUp,
} from '@fortawesome/free-solid-svg-icons';
import type { Task } from '../../../shared/schemas/index';
import { getTaskCardStyle, getTrendIcon } from '../../utils/matrixPositions';

interface MatrixTaskCardProps {
  task: Task;
  indexInQuadrant: number;
}

export function MatrixTaskCard({ task, indexInQuadrant }: MatrixTaskCardProps) {
  const { style, borderClass, opacity } = getTaskCardStyle(
    task,
    indexInQuadrant,
  );
  const trend = getTrendIcon(task);

  return (
    <div
      className={`absolute w-48 bg-white ${borderClass} border-l-4 rounded-jira-card shadow p-3 cursor-move hover:shadow-md transition-shadow ${opacity}`}
      style={style}
    >
      <div className="text-xs font-semibold mb-1 truncate">{task.title}</div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-atlassian-subtext">
          E: {task.effort} / I: {task.impact}
        </span>
        <FontAwesomeIcon
          icon={trend.icon === 'arrow-up' ? faArrowUp : faArrowDown}
          className={`text-xs ${trend.color}`}
        />
      </div>
    </div>
  );
}
