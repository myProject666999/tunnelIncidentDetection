import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  FileCheck,
  FileBarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/utils';

const menuItems = [
  { path: '/dashboard', label: '监控大屏', icon: LayoutDashboard },
  { path: '/incidents', label: '事件管理', icon: ClipboardList },
  { path: '/plans', label: '预案管理', icon: FileCheck },
  { path: '/reports', label: '复盘报告', icon: FileBarChart },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <aside
      className={cn(
        'h-screen bg-tunnel-surface border-r border-tunnel-border flex flex-col transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-tunnel-border">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-tunnel-info/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-tunnel-info" />
            </div>
            <span className="font-bold text-tunnel-text text-lg">隧道监控</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="w-8 h-8 rounded hover:bg-tunnel-border-light flex items-center justify-center text-tunnel-text-dim hover:text-tunnel-text transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                'hover:bg-tunnel-border-light/50 text-tunnel-text-dim hover:text-tunnel-text',
                isActive && 'bg-tunnel-info/10 text-tunnel-info border-l-2 border-tunnel-info'
              )
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-2 border-t border-tunnel-border">
        {!sidebarCollapsed ? (
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-tunnel-info/20 flex items-center justify-center">
                <span className="text-tunnel-info font-medium text-sm">
                  {user?.displayName?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-tunnel-text truncate">
                  {user?.displayName || '用户'}
                </p>
                <p className="text-xs text-tunnel-text-muted truncate">{user?.role || 'viewer'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-tunnel-border-light text-tunnel-text-dim hover:text-tunnel-danger transition-colors"
              title="退出登录"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            className="w-full flex items-center justify-center py-2 rounded-lg hover:bg-tunnel-border-light text-tunnel-text-dim hover:text-tunnel-danger transition-colors"
            title="退出登录"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  );
}
