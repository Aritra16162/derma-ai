import { Search, Menu, UserCircle, LogOut } from 'lucide-react';
import { useStore } from '@/store/useStore';

export function DashboardHeader() {
  const { user, toggleSidebar, setCurrentView, logoutUser, setShowAuthModal, setShowLogoutConfirm } = useStore();

  return (
    <header className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-800/50 sticky top-0 z-50 transition-colors duration-300">
      <div className="flex items-center gap-6">
        <button 
          onClick={toggleSidebar} 
          className="text-gray-600 dark:text-slate-300 font-medium text-sm flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="p-1.5 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
            <Menu size={16} />
          </span>
        </button>
      </div>

      {/* Central Title Area */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-max">
        <h1 className="text-base md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-trust-blue to-blue-400 tracking-tight drop-shadow-sm">
          Derma-Guide AI
        </h1>
      </div>
      {/* User Actions */}
      <div className="flex items-center gap-4 relative group">
        <div 
          className="flex items-center gap-3 cursor-pointer py-1"
          onClick={() => {
            if (!user) setShowAuthModal(true);
          }}
        >
          <span className="text-sm font-medium text-gray-700 dark:text-slate-200 hidden md:block">
            {user ? `Welcome back, ${user.name.split(' ')[0]}!` : "Welcome! Please sign in."}
          </span>
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300 dark:border-slate-600">
             {user ? (
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.name}`} alt="User Avatar" />
             ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
             )}
          </div>
        </div>

        {/* Hover Dropdown Menu */}
        <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
           <div className="w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 py-2 flex flex-col overflow-hidden">
              {user ? (
                 <>
                   <button 
                     onClick={() => setCurrentView('profile')}
                     className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                   >
                     <UserCircle size={16} /> View Profile
                   </button>
                   <button 
                     onClick={() => { setShowLogoutConfirm(true); }}
                     className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors border-t border-gray-100 dark:border-slate-700 mt-1 pt-3"
                   >
                     <LogOut size={16} /> Sign Out
                   </button>
                 </>
              ) : (
                 <button 
                   onClick={() => setShowAuthModal(true)}
                   className="w-full text-left px-4 py-2.5 text-sm text-trust-blue dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 font-semibold flex items-center gap-2 transition-colors"
                 >
                   <UserCircle size={16} /> Sign In
                 </button>
              )}
           </div>
        </div>
      </div>
    </header>
  );
}
