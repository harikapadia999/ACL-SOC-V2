import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const SIDEBAR_COLLAPSED_KEY = 'sidebar-collapsed';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Load collapsed state from localStorage
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return saved === 'true';
  });

  // Save collapsed state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Header - Fixed top, full width */}
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      {/* Sidebar - Fixed left, below header */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content wrapper - Adjusts based on sidebar state */}
      <div 
        className="flex flex-col flex-1 w-full transition-all duration-300 ease-in-out pt-16 overflow-hidden"
      >
        {/* Desktop padding adjustment */}
        <style>{`
          @media (min-width: 1024px) {
            .content-wrapper {
              padding-left: ${sidebarCollapsed ? '64px' : '232px'};
            }
          }
        `}</style>
        
        <main className="flex-1 overflow-y-auto content-wrapper w-full">
          <div className="p-4 sm:p-6 lg:p-8 max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
