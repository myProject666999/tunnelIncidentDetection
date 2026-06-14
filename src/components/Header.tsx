import { Bell, Clock, Maximize2, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAlertStore } from '@/store/useAlertStore';
import { cn } from '@/utils';

export default function Header() {
  const { unreadCount } = useAlertStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <header className="h-16 bg-tunnel-surface/80 backdrop-blur-sm border-b border-tunnel-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-tunnel-text">隧道事件检测与处置系统</h1>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-tunnel-bg/50 rounded-lg border border-tunnel-border">
          <Search className="w-4 h-4 text-tunnel-text-muted" />
          <input
            type="text"
            placeholder="搜索事件、设备、隧道..."
            className="bg-transparent text-sm text-tunnel-text placeholder-tunnel-text-muted focus:outline-none w-48"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-tunnel-info font-mono text-sm">
          <Clock className="w-4 h-4" />
          <span>{formatTime(currentTime)}</span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-tunnel-border-light transition-colors"
          >
            <Bell className="w-5 h-5 text-tunnel-text-dim" />
            {unreadCount > 0 && (
              <span
                className={cn(
                  'absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-tunnel-accent text-white text-xs flex items-center justify-center',
                  unreadCount > 9 ? 'text-[10px]' : ''
                )}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-tunnel-surface border border-tunnel-border rounded-lg shadow-xl z-50">
              <div className="p-3 border-b border-tunnel-border flex items-center justify-between">
                <span className="font-medium text-tunnel-text">通知中心</span>
                <span className="text-xs text-tunnel-info cursor-pointer hover:underline">全部已读</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <div className="p-3 border-b border-tunnel-border hover:bg-tunnel-border-light/30 cursor-pointer">
                  <p className="text-sm text-tunnel-text">隧道A发生火灾告警</p>
                  <p className="text-xs text-tunnel-text-muted mt-1">2 分钟前</p>
                </div>
                <div className="p-3 border-b border-tunnel-border hover:bg-tunnel-border-light/30 cursor-pointer">
                  <p className="text-sm text-tunnel-text">设备 CAM-001 离线</p>
                  <p className="text-xs text-tunnel-text-muted mt-1">15 分钟前</p>
                </div>
                <div className="p-3 hover:bg-tunnel-border-light/30 cursor-pointer">
                  <p className="text-sm text-tunnel-text">新的处置预案已更新</p>
                  <p className="text-xs text-tunnel-text-muted mt-1">1 小时前</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <button className="p-2 rounded-lg hover:bg-tunnel-border-light transition-colors">
          <Maximize2 className="w-5 h-5 text-tunnel-text-dim" />
        </button>
      </div>
    </header>
  );
}
