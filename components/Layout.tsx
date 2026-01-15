
import React from 'react';
import { UserMode, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  activeMode: UserMode;
  onModeSwitch: (mode: UserMode) => void;
  onLogout: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onAuthClick: () => void;
  currentScreen: string;
  setScreen: (screen: any) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, user, activeMode, onModeSwitch, onLogout, darkMode, toggleDarkMode, onAuthClick, currentScreen, setScreen
}) => {
  const isCreateJob = currentScreen === 'create-job';

  return (
    <div className="min-h-screen flex flex-col pb-24 md:pb-0">
      {!isCreateJob && (
        <header className="sticky top-0 z-50 glass border-b border-warm-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 bg-magenta flex items-center justify-center rounded-xl shadow-lg shadow-magenta/20 cursor-pointer" 
              onClick={() => {
                if (!user || user.mode === UserMode.STUDENT) setScreen('feed');
                else setScreen('dashboard');
              }}
            >
              <span className="material-symbols-outlined text-white text-xl font-bold">work_history</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none bg-gradient-to-r from-magenta to-magenta-300 bg-clip-text text-transparent">
                PartTimeJobs<span className="text-magenta-500">.ie</span>
              </h1>
              {user && (
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  {user.mode} Access
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-warm-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              <span className="material-symbols-outlined text-zinc-500 text-lg">
                {darkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <div className="h-5 w-px bg-warm-200 dark:bg-zinc-800 mx-1"></div>
            {user ? (
              <div className="flex items-center gap-3">
                 <button 
                  onClick={onLogout}
                  className="text-xs font-bold text-magenta hover:underline transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={onAuthClick}
                className="bg-magenta hover:bg-magenta-600 text-white px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 shadow-md shadow-magenta/10"
              >
                Sign Up
              </button>
            )}
          </div>
        </header>
      )}

      <main className={`flex-1 ${!isCreateJob ? 'max-w-4xl mx-auto w-full p-4' : ''}`}>
        {children}
      </main>

      {!isCreateJob && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-warm-200 dark:border-zinc-800 flex items-center justify-around px-2 py-4">
          {/* Navigation logic based on logged in state and mode */}
          {!user ? (
            // Guest Navigation: Can switch between finding a job and hiring
            <>
              <NavItem icon="search" label="Find Job" active={activeMode === UserMode.STUDENT} onClick={() => onModeSwitch(UserMode.STUDENT)} />
              <NavItem icon="business" label="Hire Talent" active={activeMode === UserMode.EMPLOYER} onClick={() => onModeSwitch(UserMode.EMPLOYER)} />
              <NavItem icon="login" label="Login" active={false} onClick={onAuthClick} />
            </>
          ) : user.mode === UserMode.STUDENT ? (
            // Student Specific Navigation: No employer access
            <>
              <NavItem icon="search" label="Explore" active={currentScreen === 'feed'} onClick={() => setScreen('feed')} />
              <NavItem icon="assignment" label="My Apps" active={currentScreen === 'tracker'} onClick={() => setScreen('tracker')} />
              <NavItem icon="person" label="Profile" active={currentScreen === 'profile'} onClick={() => setScreen('profile')} />
            </>
          ) : (
            // Employer Specific Navigation: No student access
            <>
              <NavItem icon="dashboard" label="Console" active={currentScreen === 'dashboard'} onClick={() => setScreen('dashboard')} />
              <NavItem icon="mail" label="Inbox" active={currentScreen === 'inbox'} onClick={() => setScreen('inbox')} />
              <NavItem icon="add_box" label="Post" active={currentScreen === 'create-job'} onClick={() => setScreen('create-job')} />
            </>
          )}
        </nav>
      )}
    </div>
  );
};

interface NavItemProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-magenta scale-105' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600'}`}
  >
    <span className={`material-symbols-outlined text-2xl ${active ? 'material-symbols-fill' : ''}`}>
      {icon}
    </span>
    <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default Layout;
