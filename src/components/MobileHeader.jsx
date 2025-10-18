import { Menu, X } from 'lucide-react';

const MobileHeader = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <header className="md:hidden fixed top-0 right-0 left-0 bg-gradient-to-r from-slate-800 via-slate-900 to-indigo-950 text-white p-4 shadow-lg shadow-slate-900/50 z-50">
      <div className="flex items-center justify-between">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hover:bg-slate-700 p-2 rounded-lg transition-colors">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <h1 className="text-xl font-bold">پنل مدیریت</h1>
      </div>
    </header>
  );
};

export default MobileHeader;