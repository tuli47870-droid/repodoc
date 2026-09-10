import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  Shield,
  Network,
  Package,
  Hammer,
  TestTube,
  Activity,
  History,
  Settings,
  Clock,
  GitBranch,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockRepository } from '@/data/mockRepository';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Findings', href: '/findings', icon: AlertTriangle },
  { name: 'Security', href: '/security', icon: Shield },
  { name: 'Architecture', href: '/architecture', icon: Network },
  { name: 'Dependencies', href: '/dependencies', icon: Package },
  { name: 'Build', href: '/build', icon: Hammer },
  { name: 'Tests', href: '/tests', icon: TestTube },
  { name: 'Runtime', href: '/runtime', icon: Activity },
];

const secondaryNavigation = [
  { name: 'Scan History', href: '/history', icon: History },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 bottom-0 z-40 w-64 border-r bg-background transition-transform duration-300 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </NavLink>
              );
            })}

            <div className="my-4 border-t" />

            {secondaryNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom Info */}
          <div className="px-3 py-4 border-t space-y-2 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <GitBranch className="w-3 h-3" />
              <span className="font-mono">{mockRepository.name}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Last scan: {mockRepository.lastScan}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
