import React from 'react';
import { Leaf, Menu, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  userRole?: string;
  userName?: string;
  onLogout: () => void;
  title: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, userRole, userName, onLogout, title }) => {
  return (
    <div className="min-h-screen flex flex-col bg-green-50">
      {/* Header */}
      <header className="bg-emerald-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-white p-1.5 rounded-full">
               <Leaf className="text-emerald-600 h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Georgios</h1>
              <p className="text-xs text-emerald-200 uppercase tracking-widest">{title}</p>
            </div>
          </div>
          
          {userRole && (
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold">{userName}</p>
                <p className="text-xs text-emerald-300">{userRole}</p>
              </div>
              <button 
                onClick={onLogout}
                className="p-2 hover:bg-emerald-600 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-6 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-emerald-900 text-emerald-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} Georgios. Connecting Farm to Table.</p>
          <p className="text-xs mt-1">Privacy Policy | Terms of Service | Zero Data Leakage</p>
        </div>
      </footer>
    </div>
  );
};