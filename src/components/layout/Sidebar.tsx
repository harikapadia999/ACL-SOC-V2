import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Activity, 
  MessageSquare, 
  Settings,
  Menu,
  X,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Alert triage', href: '/alert-triage', icon: Activity },
  { name: 'Chat & Investigate', href: '/investigate', icon: MessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen = true, 
  onClose,
  isCollapsed = false,
  onToggleCollapse
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Fixed positioning with exact pixel widths */}
      <div
        className={cn(
          'fixed left-0 top-16 bottom-0 z-50 flex flex-col border-r border-slate-200 bg-slate-50',
          'transition-all duration-300 ease-in-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          // Exact pixel widths for precise alignment
          isCollapsed ? 'w-16' : 'w-[232px]'
        )}
      >
        {/* Header with Collapse/Expand Button */}
        <div className="flex items-center justify-between p-4">
          {/* Desktop Collapse Button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <Menu className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="flex lg:hidden h-9 w-9 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-slate-200 text-slate-900 border-l-3 border-primary-500'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
                  isCollapsed && 'justify-center px-2'
                )
              }
              title={isCollapsed ? item.name : undefined}
            >
              {({ isActive }) => (
                <>
                  <item.icon 
                    className={cn(
                      'h-5 w-5 flex-shrink-0', 
                      isActive ? 'text-slate-900' : 'text-slate-500'
                    )} 
                  />
                  {!isCollapsed && (
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                      {item.name}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
      </div>
    </>
  );
};
