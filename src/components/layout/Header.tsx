import React from 'react';
import { Bell, User, Menu, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuthStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between bg-slate-800 px-4">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="lg:hidden h-9 w-9 rounded-md p-0 text-slate-300 hover:bg-slate-700"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600">
            <div className="h-4 w-4 rounded-full border-2 border-slate-50"></div>
          </div>
          <span className="text-lg font-bold tracking-wide text-slate-50">AI SOC</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="relative h-9 w-9 rounded-md p-0 text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border border-slate-800"></span>
        </Button>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium text-slate-200">{user?.full_name || 'User'}</span>
            <span className="text-xs text-slate-400 capitalize">{user?.role?.replace('_', ' ') || ''}</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
            <User className="h-4 w-4 text-slate-300" />
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="h-9 w-9 rounded-md p-0 text-red-400 hover:bg-slate-700 hover:text-red-300 ml-1"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};
