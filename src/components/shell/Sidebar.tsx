import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faChartDiagram,
  faClipboardList,
  faCog,
  faColumns,
  faFileUpload,
  faLayerGroup,
  faUsersCog,
} from '@fortawesome/free-solid-svg-icons';
import { Avatar } from '../ui/Avatar';
import { resolveAvatarBgClass } from '../../utils/teamAvatar';

const flowNav = [
  { to: '/planning/context', label: '1. Context Input', icon: faFileUpload },
  { to: '/planning/analysis', label: '2. AI Analysis', icon: faChartDiagram },
  {
    to: '/planning/assignments',
    label: '3. Assignments',
    icon: faUsersCog,
  },
  { to: '/planning/board', label: '4. Kanban Board', icon: faColumns },
];

const projectNav = [
  { label: 'Backlog', icon: faClipboardList },
  { label: 'Reports', icon: faChartLine },
  { label: 'Settings', icon: faCog },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-atlassian-background border-r border-atlassian-border flex flex-col">
      <div className="h-14 flex items-center px-4 border-b border-atlassian-border">
        <div className="w-8 h-8 bg-atlassian-blue rounded flex items-center justify-center text-white mr-3 shadow-sm">
          <FontAwesomeIcon icon={faLayerGroup} />
        </div>
        <span className="font-semibold text-lg">ProjectAI</span>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="text-xs font-bold text-atlassian-subtext uppercase tracking-wider mb-3">
          AI Planning Flow
        </div>
        <nav className="space-y-1">
          {flowNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `w-full flex items-center px-3 py-2 text-sm font-medium rounded-jira-btn ${
                  isActive
                    ? 'bg-atlassian-hover text-atlassian-blue'
                    : 'text-atlassian-text hover:bg-atlassian-hover'
                }`
              }
            >
              <FontAwesomeIcon icon={item.icon} className="w-6" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="text-xs font-bold text-atlassian-subtext uppercase tracking-wider mt-8 mb-3">
          Project
        </div>
        <nav className="space-y-1">
          {projectNav.map((item) => (
            <a
              key={item.label}
              href="#"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-jira-btn text-atlassian-text hover:bg-atlassian-hover"
              onClick={(e) => e.preventDefault()}
            >
              <FontAwesomeIcon
                icon={item.icon}
                className="w-6 text-atlassian-subtext"
              />
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-atlassian-border flex items-center">
        <Avatar initials="PM" colorClass={resolveAvatarBgClass({ id: 'pm', color: 'bg-purple-600' })} />
        <div className="ml-3">
          <div className="text-sm font-medium">Project Manager</div>
          <div className="text-xs text-atlassian-subtext">Workspace Admin</div>
        </div>
      </div>
    </aside>
  );
}
