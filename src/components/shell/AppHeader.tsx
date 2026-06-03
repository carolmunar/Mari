import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faSearch } from '@fortawesome/free-solid-svg-icons';
import { HEADER_TITLES } from '../../data/headerTitles';

function getTitleKey(pathname: string): string {
  if (pathname.includes('analysis')) return 'analysis';
  if (pathname.includes('assignments')) return 'assignments';
  if (pathname.includes('board')) return 'board';
  return 'context';
}

export function AppHeader() {
  const { pathname } = useLocation();
  const titleKey = getTitleKey(pathname);
  const title = HEADER_TITLES[titleKey] ?? HEADER_TITLES.context;

  return (
    <header className="h-14 border-b border-atlassian-border flex items-center justify-between px-6 bg-white shrink-0">
      <div className="flex items-center text-sm text-atlassian-subtext">
        <a href="#" className="hover:underline" onClick={(e) => e.preventDefault()}>
          Projects
        </a>
        <span className="mx-2">/</span>
        <a href="#" className="hover:underline" onClick={(e) => e.preventDefault()}>
          Mobile App Redesign
        </a>
        <span className="mx-2">/</span>
        <span className="text-atlassian-text font-medium">{title}</span>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-atlassian-subtext"
          />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-1.5 border border-atlassian-border rounded-jira-btn text-sm focus:outline-none focus:border-atlassian-blue w-64"
          />
        </div>
        <button
          type="button"
          className="w-8 h-8 rounded-full hover:bg-atlassian-hover flex items-center justify-center text-atlassian-subtext"
        >
          <FontAwesomeIcon icon={faBell} />
        </button>
      </div>
    </header>
  );
}
