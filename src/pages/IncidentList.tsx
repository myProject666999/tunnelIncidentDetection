import { useEffect, useState } from 'react';
import { AlertTriangle, Camera, Filter, Plus, Radio, RefreshCw, Search, User, Phone } from 'lucide-react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import { incidentApi, tunnelApi } from '@/api';
import type { Incident, IncidentStatus, IncidentSeverity, IncidentType, Tunnel } from '@/types';
import { severityConfig, statusConfig, typeConfig, sourceConfig, formatDateTime, getTimeAgo } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { useAlertStore } from '@/store/useAlertStore';

const statusOptions: { value: IncidentStatus | ''; label: string }[] = [
  { value: '', label: '全部状态' },
  { value: 'pending', label: '待处置' },
  { value: 'responding', label: '处置中' },
  { value: 'resolved', label: '已解决' },
  { value: 'closed', label: '已关闭' },
];

const severityOptions: { value: IncidentSeverity | ''; label: string }[] = [
  { value: '', label: '全部等级' },
  { value: 'minor', label: '一般' },
  { value: 'moderate', label: '较大' },
  { value: 'major', label: '重大' },
  { value: 'critical', label: '特别重大' },
];

export default function IncidentList() {
  const navigate = useNavigate();
  const addAlert = useAlertStore((s) => s.addAlert);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tunnels, setTunnels] = useState<Tunnel[]>([]);
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | ''>('');
  const [severityFilter, setSeverityFilter] = useState<IncidentSeverity | ''>('');

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    tunnelId: 0,
    mileage: 0,
    type: 'breakdown' as IncidentType,
    severity: 'minor' as IncidentSeverity,
    source: 'manual' as 'manual' | 'public_report',
    reporterName: '',
    description: '',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    tunnelApi.getList().then(setTunnels).catch(() => {});
  }, []);

  useEffect(() => {
    loadIncidents();
  }, [page, statusFilter, severityFilter]);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const res = await incidentApi.getList({
        page,
        pageSize: 20,
        status: statusFilter || undefined,
        severity: severityFilter || undefined,
      });
      setIncidents(res.items);
      setTotal(res.total);
    } catch {}
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!createForm.tunnelId || !createForm.description) return;
    setCreating(true);
    try {
      await incidentApi.create({
        ...createForm,
        reporterName: createForm.source === 'public_report' ? createForm.reporterName : undefined,
      });
      addAlert({
        title: '事件上报成功',
        message: '事件已成功上报，应急预案已自动启动',
      });
      setShowCreate(false);
      setCreateForm({
        tunnelId: 0,
        mileage: 0,
        type: 'breakdown',
        severity: 'minor',
        source: 'manual',
        reporterName: '',
        description: '',
      });
      loadIncidents();
    } catch (error: any) {
      addAlert({
        title: '事件上报失败',
        message: error?.response?.data?.message || '请检查数据后重试',
      });
    }
    setCreating(false);
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tunnel-text">事件列表</h1>
          <p className="text-tunnel-text-dim text-sm mt-1">管理与监控所有隧道交通事件</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={loadIncidents}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            刷新
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            上报事件
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-tunnel-text-muted" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
            className="bg-tunnel-surface border border-tunnel-border rounded-lg px-3 py-1.5 text-sm text-tunnel-text focus:outline-none focus:border-tunnel-info"
          >
            {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={severityFilter}
            onChange={(e) => { setSeverityFilter(e.target.value as any); setPage(1); }}
            className="bg-tunnel-surface border border-tunnel-border rounded-lg px-3 py-1.5 text-sm text-tunnel-text focus:outline-none focus:border-tunnel-info"
          >
            {severityOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="text-sm text-tunnel-text-dim">共 {total} 条记录</div>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-tunnel-border">
                <th className="px-4 py-3 text-left text-xs font-medium text-tunnel-text-dim uppercase">编号</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-tunnel-text-dim uppercase">类型</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-tunnel-text-dim uppercase">位置</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-tunnel-text-dim uppercase">严重程度</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-tunnel-text-dim uppercase">来源</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-tunnel-text-dim uppercase">状态</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-tunnel-text-dim uppercase">时间</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-tunnel-text-dim uppercase">操作</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => (
                <tr
                  key={incident.id}
                  className="border-b border-tunnel-border/50 hover:bg-tunnel-bg/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/incidents/${incident.id}`)}
                >
                  <td className="px-4 py-3 text-sm text-tunnel-text font-mono">{incident.incidentNo}</td>
                  <td className="px-4 py-3 text-sm text-tunnel-text">{typeConfig[incident.type]?.label}</td>
                  <td className="px-4 py-3 text-sm text-tunnel-text-dim">
                    {incident.tunnelName} K{Math.floor(incident.mileage / 1000)}+{incident.mileage % 1000}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${severityConfig[incident.severity]?.bgColor} ${severityConfig[incident.severity]?.color}`}>
                      {severityConfig[incident.severity]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-tunnel-text-dim">{sourceConfig[incident.source]?.label}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusConfig[incident.status]?.bgColor} ${statusConfig[incident.status]?.color}`}>
                      {statusConfig[incident.status]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-tunnel-text-dim">{getTimeAgo(incident.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" onClick={(e: React.MouseEvent) => { e.stopPropagation(); navigate(`/incidents/${incident.id}`); }}>
                      详情
                    </Button>
                  </td>
                </tr>
              ))}
              {incidents.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-tunnel-text-muted">
                    暂无事件记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-tunnel-border">
            <span className="text-sm text-tunnel-text-dim">第 {page}/{totalPages} 页</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>下一页</Button>
            </div>
          </div>
        )}
      </Card>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-tunnel-surface border border-tunnel-border rounded-xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-tunnel-text mb-4">上报事件</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-tunnel-text-dim mb-1 block">隧道</label>
                  <select
                    value={createForm.tunnelId}
                    onChange={(e) => setCreateForm({ ...createForm, tunnelId: +e.target.value })}
                    className="w-full bg-tunnel-bg border border-tunnel-border rounded-lg px-3 py-2 text-sm text-tunnel-text focus:outline-none focus:border-tunnel-info"
                  >
                    <option value={0}>请选择</option>
                    {tunnels.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-tunnel-text-dim mb-1 block">里程桩位置(米)</label>
                  <input
                    type="number"
                    value={createForm.mileage}
                    onChange={(e) => setCreateForm({ ...createForm, mileage: +e.target.value })}
                    className="w-full bg-tunnel-bg border border-tunnel-border rounded-lg px-3 py-2 text-sm text-tunnel-text focus:outline-none focus:border-tunnel-info"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-tunnel-text-dim mb-1 block">类型</label>
                  <select
                    value={createForm.type}
                    onChange={(e) => setCreateForm({ ...createForm, type: e.target.value as IncidentType })}
                    className="w-full bg-tunnel-bg border border-tunnel-border rounded-lg px-3 py-2 text-sm text-tunnel-text focus:outline-none focus:border-tunnel-info"
                  >
                    {Object.entries(typeConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-tunnel-text-dim mb-1 block">严重程度</label>
                  <select
                    value={createForm.severity}
                    onChange={(e) => setCreateForm({ ...createForm, severity: e.target.value as IncidentSeverity })}
                    className="w-full bg-tunnel-bg border border-tunnel-border rounded-lg px-3 py-2 text-sm text-tunnel-text focus:outline-none focus:border-tunnel-info"
                  >
                    {Object.entries(severityConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-tunnel-text-dim mb-1 block">来源</label>
                  <select
                    value={createForm.source}
                    onChange={(e) => setCreateForm({ ...createForm, source: e.target.value as any })}
                    className="w-full bg-tunnel-bg border border-tunnel-border rounded-lg px-3 py-2 text-sm text-tunnel-text focus:outline-none focus:border-tunnel-info"
                  >
                    <option value="manual">手工上报</option>
                    <option value="public_report">公众报警</option>
                  </select>
                </div>
              </div>
              {createForm.source === 'public_report' && (
                <div>
                  <label className="text-sm text-tunnel-text-dim mb-1 block">报警人姓名</label>
                  <input
                    type="text"
                    value={createForm.reporterName}
                    onChange={(e) => setCreateForm({ ...createForm, reporterName: e.target.value })}
                    className="w-full bg-tunnel-bg border border-tunnel-border rounded-lg px-3 py-2 text-sm text-tunnel-text focus:outline-none focus:border-tunnel-info"
                  />
                </div>
              )}
              <div>
                <label className="text-sm text-tunnel-text-dim mb-1 block">描述</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  rows={3}
                  className="w-full bg-tunnel-bg border border-tunnel-border rounded-lg px-3 py-2 text-sm text-tunnel-text focus:outline-none focus:border-tunnel-info resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowCreate(false)}>取消</Button>
                <Button onClick={handleCreate} loading={creating} disabled={!createForm.tunnelId || !createForm.description}>
                  确认上报
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
