import type { Quadrant, Task } from '../../shared/schemas/index';

const QUADRANT_POSITIONS: Record<
  Quadrant,
  { top?: string; bottom?: string; left?: string; right?: string }[]
> = {
  quick_wins: [
    { top: '2.5rem', left: '2.5rem' },
    { bottom: '3rem', right: '3rem' },
  ],
  major_projects: [{ top: '5rem', right: '2.5rem' }],
  fill_ins: [{ top: '50%', left: '25%' }],
  time_sinks: [{ top: '25%', right: '25%' }],
};

const BORDER_COLORS: Record<Quadrant, string> = {
  quick_wins: 'border-l-green-500',
  major_projects: 'border-l-blue-500',
  fill_ins: 'border-l-gray-400',
  time_sinks: 'border-l-orange-400',
};

export function getTaskCardStyle(task: Task, indexInQuadrant: number) {
  const positions = QUADRANT_POSITIONS[task.quadrant];
  const pos = positions[indexInQuadrant % positions.length] ?? positions[0];
  return {
    style: pos,
    borderClass: BORDER_COLORS[task.quadrant],
    opacity: task.quadrant === 'time_sinks' ? 'opacity-75' : '',
  };
}

export function getPriorityColor(label: string): string {
  if (label === 'Critical') return 'text-red-500';
  if (label === 'High Priority') return 'text-green-600';
  if (label === 'Medium Priority') return 'text-blue-500';
  return 'text-gray-500';
}

export function getTrendIcon(task: Task): {
  icon: 'arrow-up' | 'arrow-down';
  color: string;
} {
  if (task.quadrant === 'quick_wins' || task.quadrant === 'major_projects') {
    return {
      icon: 'arrow-up',
      color:
        task.quadrant === 'major_projects' ? 'text-red-500' : 'text-green-500',
    };
  }
  return {
    icon: 'arrow-down',
    color:
      task.quadrant === 'fill_ins' ? 'text-blue-500' : 'text-gray-500',
  };
}
