
import React, { useState, useEffect } from 'react';
import GlobalRefreshControl from './GlobalRefreshControl';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeView: string;
  onNavigate: (view: string) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeView, onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['scanners']);

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const navItems = [
    { 
      id: 'overview', 
      label: 'Market Overview', 
      type: 'link',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    { 
      id: 'scanners', 
      label: 'Scanners', 
      type: 'group',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      children: [
        { 
          id: 'scanner', 
          label: 'Momentum Scanner', 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ) 
        },
        { 
          id: 'earnings', 
          label: 'Earnings Movers', 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) 
        },
        { 
          id: 'movers', 
          label: 'Market Movers', 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
            </svg>
          ) 
        },
        { 
          id: 'oversold', 
          label: 'Oversold Rebounds', 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          ) 
        },
        {
          id: 'insider',
          label: 'Insider Tracker',
          icon: (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
             </svg>
          )
        }
      ]
    },
    { 
      id: 'heatmaps', 
      label: 'Market Heatmaps', 
      type: 'link',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      )
    },
    { 
      id: 'watchlist', 
      label: 'My Watchlist', 
      type: 'link',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    },
    { 
      id: 'news', 
      label: 'News Feed', 
      type: 'link',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      )
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      type: 'link',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  useEffect(() => {
    navItems.forEach(item => {
      if (item.type === 'group' && item.children) {
        const hasActiveChild = item.children.some((c: any) => c.id === activeView);
        if (hasActiveChild) {
           setExpandedMenus(prev => prev.includes(item.id) ? prev : [...prev, item.id]);
        }
      }
    });
  }, [activeView]);

  const renderNavItem = (item: any) => {
    if (item.type === 'group') {
      const isExpanded = expandedMenus.includes(item.id);
      const hasActiveChild = item.children.some((c: any) => c.id === activeView);
      
      return (
        <div key={item.id} className="space-y-1">
          <button
            onClick={() => toggleMenu(item.id)}
            className={`w-full flex items-center justify-between px-[var(--padding-unit)] py-3 rounded-[var(--border-radius)] text-sm font-medium transition-all duration-[var(--transition-speed)]
              ${hasActiveChild ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]'}
            `}
          >
            <div className="flex items-center gap-[var(--gap-unit)]">
              <span className={`${hasActiveChild ? 'text-[var(--accent-color)]' : 'text-gray-500'}`}>
                {item.icon}
              </span>
              {item.label}
            </div>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 transition-transform duration-[var(--transition-speed)] ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div className={`space-y-1 pl-4 overflow-hidden transition-all duration-[var(--transition-speed)] ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              {item.children.map((child: any) => (
                <button
                  key={child.id}
                  onClick={() => {
                    onNavigate(child.id);
                    if(window.innerWidth < 768) setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-[var(--padding-unit)] py-2 rounded-[var(--border-radius)] text-sm font-medium transition-all duration-[var(--transition-speed)]
                    ${activeView === child.id 
                      ? 'bg-[var(--accent-glow)] text-[var(--accent-color)] border border-[var(--accent-glow)]' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                    }`}
                >
                  <span className={`${activeView === child.id ? 'text-[var(--accent-color)]' : 'text-gray-600'} opacity-80`}>
                    {child.icon}
                  </span>
                  {child.label}
                  {activeView === child.id && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] animate-pulse"></span>
                  )}
                </button>
              ))}
          </div>
        </div>
      );
    }
    
    // Standard link
    return (
        <button
            key={item.id}
            onClick={() => {
                onNavigate(item.id);
                if(window.innerWidth < 768) setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-[var(--padding-unit)] py-3 rounded-[var(--border-radius)] text-sm font-medium transition-all duration-[var(--transition-speed)] group
            ${activeView === item.id 
                ? 'bg-[var(--accent-glow)] text-[var(--accent-color)] shadow-sm border border-[var(--accent-glow)]' 
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]'
            }`}
        >
            <span className={`transition-colors ${activeView === item.id ? 'text-[var(--accent-color)]' : 'text-gray-500 group-hover:text-[var(--text-primary)]'}`}>
            {item.icon}
            </span>
            {item.label}
            {activeView === item.id && (
            <span className="ml-auto w-2 h-2 rounded-full bg-[var(--accent-color)] shadow-[0_0_8px_var(--accent-glow)] animate-pulse"></span>
            )}
        </button>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex font-sans text-[var(--text-primary)] transition-colors duration-[var(--transition-speed)]" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--base-font-size)' }}>
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[var(--border-color)] bg-[var(--bg-card)]/50 backdrop-blur-sm fixed inset-y-0 left-0 z-10 transition-colors duration-[var(--transition-speed)]">
        <div className="p-6 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-[var(--border-radius)] bg-gradient-to-br from-[var(--accent-color)] to-blue-500 flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
             </div>
             <span className="font-bold text-lg text-[var(--text-primary)] tracking-tight leading-none">StockMarket<br/>Buzz</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map(item => renderNavItem(item))}
        </nav>

        <div className="p-4 border-t border-[var(--border-color)]">
           <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
                JD
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-sm font-medium text-[var(--text-primary)] truncate">John Doe</p>
                 <p className="text-xs text-[var(--text-secondary)] truncate">Pro Plan</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[var(--bg-card)] border-b border-[var(--border-color)] z-20 flex items-center justify-between px-4 transition-colors duration-[var(--transition-speed)]">
        <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-[var(--border-radius)] bg-gradient-to-br from-[var(--accent-color)] to-blue-500 flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
             </div>
             <span className="font-bold text-lg text-[var(--text-primary)]">StockMarketBuzz</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-30">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
           <nav className="absolute top-16 left-0 right-0 bg-[var(--bg-card)] border-b border-[var(--border-color)] p-4 space-y-2 shadow-2xl animate-fade-in-down overflow-y-auto max-h-[80vh]">
              {navItems.map(item => renderNavItem(item))}
           </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-6 md:p-10 pt-24 md:pt-10 overflow-x-hidden transition-colors duration-[var(--transition-speed)]">
        {children}
      </main>

      {/* Global Refresh Floating Button */}
      <GlobalRefreshControl />
    </div>
  );
};

export default DashboardLayout;
