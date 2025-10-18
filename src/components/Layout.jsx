import { useState } from 'react';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';

const Layout = ({ children, activeTab, setActiveTab }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      {/* Desktop Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        className="hidden md:block"
      />

      {/* Mobile Header */}
      <MobileHeader 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" 
            onClick={() => setSidebarOpen(false)}
          />
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            onItemClick={() => setSidebarOpen(false)}
            className="md:hidden"
            isMobile
          />
        </>
      )}

      {/* Main Content */}
      <main className="md:mr-64 pt-16 md:pt-0 p-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;