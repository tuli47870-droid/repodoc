import { 
  Menu, 
  Search, 
  Bell, 
  GitBranch, 
  Play,
  MessageSquare,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockRepository } from '@/data/mockRepository';
import { useEffect } from 'react';

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleChat: () => void;
  onOpenSearch: () => void;
}

export function Header({ onToggleSidebar, onToggleChat, onOpenSearch }: HeaderProps) {
  const navigate = useNavigate();

  const handleNewScan = () => {
    navigate('/scan');
  };

  // Global keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center h-16 px-4 gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-muted rounded-md transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-md">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-5 h-5 text-primary-foreground"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 12h6M12 9v6" />
                <path d="M7 3l-4 4 4 4M17 3l4 4-4 4" />
              </svg>
            </div>
            <span className="font-semibold text-lg hidden sm:inline">Repo Doctor</span>
          </div>

          {/* Repository Info */}
          <div className="hidden md:flex items-center gap-3 ml-4 pl-4 border-l">
            <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted rounded-md transition-colors">
              <span className="font-mono text-sm font-medium">{mockRepository.name}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted rounded-md transition-colors">
              <GitBranch className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{mockRepository.branch}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-4">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center gap-2 px-3 py-2 bg-muted/50 border border-transparent rounded-md text-sm hover:border-primary transition-colors"
          >
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Search repository...</span>
            <kbd className="ml-auto px-2 py-0.5 text-xs bg-background border rounded">
              {navigator.platform.includes('Mac') ? '⌘K' : 'Ctrl K'}
            </kbd>
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleNewScan}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Play className="w-4 h-4" />
            <span className="hidden sm:inline">New Scan</span>
          </button>

          <button 
            onClick={onToggleChat}
            className="p-2 hover:bg-muted rounded-md transition-colors relative"
            title="Ask Repo Doctor"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          <button className="p-2 hover:bg-muted rounded-md transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <button className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
            U
          </button>
        </div>
      </div>

      {/* Mobile Repository Info */}
      <div className="flex md:hidden items-center gap-2 px-4 pb-3 border-t">
        <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted rounded-md transition-colors text-sm">
          <span className="font-mono font-medium">{mockRepository.name}</span>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted rounded-md transition-colors text-sm">
          <GitBranch className="w-3 h-3 text-muted-foreground" />
          <span>{mockRepository.branch}</span>
        </button>
      </div>
    </header>
  );
}
