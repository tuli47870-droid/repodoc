import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { DoctorChat } from '../chat/DoctorChat';
import { SearchCommand } from '../common/SearchCommand';
import { ToastContainer } from '../common/Toast';
import { useState } from 'react';

export function AppShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'warning' | 'info' }>>([]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />
      <div className="flex pt-16">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
      <DoctorChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <SearchCommand isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
