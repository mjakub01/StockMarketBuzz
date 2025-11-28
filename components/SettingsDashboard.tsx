
import React, { useState } from 'react';
import ThemeSettings from './ThemeSettings';
import ApiConnectionSettings from './ApiConnectionSettings';
import AdminPanel from './AdminPanel';
import { useAuth } from '../contexts/AuthContext';

const SettingsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'api' | 'admin'>('appearance');
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Menu */}
        <div className="w-full md:w-64 flex-shrink-0">
           <div className="sticky top-24 space-y-1">
              <h2 className="px-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Settings</h2>
              
              <button
                onClick={() => setActiveTab('appearance')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-[var(--border-radius)] text-sm font-medium transition-all
                  ${activeTab === 'appearance' 
                    ? 'bg-[var(--accent-glow)] text-[var(--accent-color)] border border-[var(--accent-glow)]' 
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]'}
                `}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                Appearance
              </button>

              <button
                onClick={() => setActiveTab('api')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-[var(--border-radius)] text-sm font-medium transition-all
                  ${activeTab === 'api' 
                    ? 'bg-[var(--accent-glow)] text-[var(--accent-color)] border border-[var(--accent-glow)]' 
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]'}
                `}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                API Connections
              </button>

              {user?.role === 'admin' && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-[var(--border-radius)] text-sm font-medium transition-all
                    ${activeTab === 'admin' 
                      ? 'bg-[var(--accent-glow)] text-[var(--accent-color)] border border-[var(--accent-glow)]' 
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]'}
                  `}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Admin Controls
                </button>
              )}
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-[600px]">
           {activeTab === 'appearance' && <ThemeSettings />}
           {activeTab === 'api' && <ApiConnectionSettings />}
           {activeTab === 'admin' && <AdminPanel />}
        </div>

      </div>
    </div>
  );
};

export default SettingsDashboard;
