import { useEffect, useState } from 'react';
import { AlertTriangle, BarChart3, Bell, Clock, Eye, Flame, Monitor, Radio, Shield, TrendingUp, Zap } from 'lucide-react';
import Card from '@/components/Card';
import StatCard from '@/components/StatCard';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import { incidentApi, reportApi, tunnelApi, deviceApi } from '@/api';
import type { Incident, Statistics, Tunnel, Device } from '@/types';
import { severityConfig, statusConfig, typeConfig, sourceConfig, formatDateTime, getTimeAgo, formatDuration } from '@/utils';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [recentIncidents, setRecentIncidents] = useState<Incident[]>([]);
  const [tunnels, setTunnels] = useState<Tunnel[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, incidentsRes, tunnelsRes, devicesRes] = await Promise.all([
        reportApi.getStats().catch(() => null),
        incidentApi.getList({ pageSize: 10 }).catch(() => ({ items: [], total: 0 })),
        tunnelApi.getList().catch(() => []),
        deviceApi.getList().catch(() => []),
      ]);
      if (statsRes) setStats(statsRes);
      setRecentIncidents(incidentsRes.items || []);
      setTunnels(tunnelsRes);
      setDevices(devicesRes);
    } catch {}
  };

  const handleSimulate = async () => {
    if (tunnels.length === 0) return;
    setSimulating(true);
    try {
      const types = ['breakdown', 'rear_end', 'intrusion', 'fire', 'wrong_way', 'debris'] as const;
      const severities = ['minor', 'moderate', 'major', 'critical'] as const;
      const randomTunnel = tunnels[Math.floor(Math.random() * tunnels.length)];
      await incidentApi.simulate({
        tunnelId: randomTunnel.id,
        mileage: Math.floor(Math.random() * randomTunnel.length),
        type: types[Math.floor(Math.random() * types.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        description: '视频检测算法自动识别异常事件',
      });
      loadData();
    } catch {}
    setSimulating(false);
  };

  const onlineDevices = devices.filter((d) => d.status === 'online').length;
  const offlineDevices = devices.length - onlineDevices;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tunnel-text">监控大屏</h1>
          <p className="text-tunnel-text-dim text-sm mt-1">实时监控隧道运行状态与事件告警</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={handleSimulate} loading={simulating}>
            <Radio className="w-4 h-4 mr-1.5" />
            模拟视频检测
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="今日事件"
          value={stats?.todayIncidents ?? 0}
          icon={<Zap className="w-5 h-5" />}
          color="accent"
        />
        <StatCard
          title="待处置"
          value={stats?.pendingIncidents ?? 0}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="danger"
        />
        <StatCard
          title="已处置"
          value={stats?.resolvedIncidents ?? 0}
          icon={<Shield className="w-5 h-5" />}
          color="success"
        />
        <StatCard
          title="平均响应"
          value={stats?.avgResponseTime ? formatDuration(stats.avgResponseTime) : '0 秒'}
          icon={<Clock className="w-5 h-5" />}
          color="info"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-tunnel-text flex items-center gap-2">
                <Bell className="w-5 h-5 text-tunnel-accent" />
                最近事件
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/incidents')}>
                查看全部
              </Button>
            </div>
            <div className="space-y-3">
              {recentIncidents.length === 0 && (
                <div className="text-center py-8 text-tunnel-text-muted">暂无事件记录</div>
              )}
              {recentIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className="flex items-center justify-between p-3 bg-tunnel-bg/50 rounded-lg border border-tunnel-border/50 hover:border-tunnel-info/30 cursor-pointer transition-colors"
                  onClick={() => navigate(`/incidents/${incident.id}`)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      incident.status === 'pending' ? 'bg-tunnel-accent animate-pulse' :
                      incident.status === 'responding' ? 'bg-tunnel-info' :
                      incident.status === 'resolved' ? 'bg-tunnel-success' : 'bg-tunnel-text-muted'
                    }`} />
                    <div className="min-w-0">
                      <div className="text-sm text-tunnel-text truncate">
                        <span className="font-medium">{typeConfig[incident.type]?.label}</span>
                        <span className="text-tunnel-text-muted mx-2">·</span>
                        <span className="text-tunnel-text-dim">{incident.tunnelName}</span>
                        <span className="text-tunnel-text-muted mx-2">·</span>
                        <span className="text-tunnel-text-dim">K{Math.floor(incident.mileage / 1000)}+{incident.mileage % 1000}</span>
                      </div>
                      <div className="text-xs text-tunnel-text-muted mt-0.5">
                        {incident.incidentNo} · {getTimeAgo(incident.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${severityConfig[incident.severity]?.bgColor} ${severityConfig[incident.severity]?.color}`}>
                      {severityConfig[incident.severity]?.label}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusConfig[incident.status]?.bgColor} ${statusConfig[incident.status]?.color}`}>
                      {statusConfig[incident.status]?.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-tunnel-text flex items-center gap-2 mb-4">
              <Monitor className="w-5 h-5 text-tunnel-info" />
              隧道状态
            </h2>
            <div className="space-y-3">
              {tunnels.map((tunnel) => {
                const tunnelDevices = devices.filter((d) => d.tunnelId === tunnel.id);
                const online = tunnelDevices.filter((d) => d.status === 'online').length;
                return (
                  <div key={tunnel.id} className="p-3 bg-tunnel-bg/50 rounded-lg border border-tunnel-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-tunnel-text">{tunnel.name}</span>
                      <span className="text-xs text-tunnel-success">运行中</span>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-tunnel-text-dim">设备 {online}/{tunnelDevices.length} 在线</span>
                      <span className="text-xs text-tunnel-text-muted">{tunnel.length}m</span>
                    </div>
                    <div className="mt-2 h-1.5 bg-tunnel-border/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-tunnel-success rounded-full transition-all"
                        style={{ width: `${tunnelDevices.length ? (online / tunnelDevices.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {tunnels.length === 0 && (
                <div className="text-center py-4 text-tunnel-text-muted text-sm">暂无隧道数据</div>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-tunnel-text flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-tunnel-success" />
              设备概览
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-tunnel-bg/50 rounded-lg text-center">
                <div className="text-2xl font-bold text-tunnel-success">{onlineDevices}</div>
                <div className="text-xs text-tunnel-text-dim mt-1">在线设备</div>
              </div>
              <div className="p-3 bg-tunnel-bg/50 rounded-lg text-center">
                <div className="text-2xl font-bold text-tunnel-danger">{offlineDevices}</div>
                <div className="text-xs text-tunnel-text-dim mt-1">离线/故障</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
