import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AlertTriangle, ArrowLeft, CheckCircle, Clock, Eye, Flame, Monitor, PlayCircle,
  Radio, Shield, SkipForward, XCircle, Edit3, ChevronDown, ChevronUp
} from 'lucide-react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import { incidentApi, timelineApi, executionApi, planApi } from '@/api';
import type { Incident, TimelineEntry, PlanExecution, EmergencyPlan } from '@/types';
import { severityConfig, statusConfig, typeConfig, sourceConfig, formatDateTime, formatDuration } from '@/utils';

export default function IncidentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [execution, setExecution] = useState<PlanExecution | null>(null);
  const [availablePlans, setAvailablePlans] = useState<EmergencyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [adjusting, setAdjusting] = useState<number | null>(null);
  const [adjustRemark, setAdjustRemark] = useState('');

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [inc, tl, exec] = await Promise.all([
        incidentApi.getDetail(+id!),
        timelineApi.getByIncident(+id!),
        executionApi.getByIncident(+id!),
      ]);
      setIncident(inc);
      setTimeline(tl);
      setExecution(exec);

      if (inc && inc.status === 'pending') {
        const plans = await planApi.getList({ incidentType: inc.type, severity: inc.severity });
        setAvailablePlans(plans);
      }
    } catch {}
    setLoading(false);
  };

  const handleExecutePlan = async (planId?: number) => {
    if (!incident) return;
    setExecuting(true);
    try {
      const result = await executionApi.execute({
        incidentId: incident.id,
        planId,
      });
      setExecution(result);
      loadData();
    } catch {}
    setExecuting(false);
  };

  const handleAdjustAction = async (actionId: number, status: string) => {
    if (!execution) return;
    setAdjusting(actionId);
    try {
      const result = await executionApi.adjustAction(execution.id, actionId, {
        status,
        remark: adjustRemark || undefined,
      });
      setExecution(result);
      setAdjustRemark('');
      loadData();
    } catch {}
    setAdjusting(null);
  };

  const handleStatusChange = async (status: string) => {
    if (!incident) return;
    try {
      await incidentApi.updateStatus(incident.id, status as any);
      loadData();
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-tunnel-info border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="text-center py-12">
        <p className="text-tunnel-text-muted">事件不存在</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/incidents')}>返回列表</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/incidents')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> 返回
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-tunnel-text">{incident.incidentNo}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${statusConfig[incident.status]?.bgColor} ${statusConfig[incident.status]?.color}`}>
              {statusConfig[incident.status]?.label}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${severityConfig[incident.severity]?.bgColor} ${severityConfig[incident.severity]?.color}`}>
              {severityConfig[incident.severity]?.label}
            </span>
          </div>
          <p className="text-tunnel-text-dim text-sm mt-1">
            {typeConfig[incident.type]?.label} · {incident.tunnelName} K{Math.floor(incident.mileage / 1000)}+{incident.mileage % 1000}
          </p>
        </div>
        <div className="flex gap-2">
          {incident.status === 'pending' && (
            <>
              <Button onClick={() => handleExecutePlan()} loading={executing}>
                <PlayCircle className="w-4 h-4 mr-1.5" />
                触发预案
              </Button>
              {availablePlans.length > 1 && (
                <Button variant="outline" onClick={() => handleExecutePlan(availablePlans[0]?.id)}>
                  匹配预案: {availablePlans[0]?.name}
                </Button>
              )}
            </>
          )}
          {incident.status === 'responding' && (
            <Button onClick={() => handleStatusChange('resolved')}>
              <CheckCircle className="w-4 h-4 mr-1.5" />
              标记已解决
            </Button>
          )}
          {incident.status === 'resolved' && (
            <Button variant="outline" onClick={() => handleStatusChange('closed')}>
              <XCircle className="w-4 h-4 mr-1.5" />
              关闭事件
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-tunnel-text mb-4">事件信息</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-tunnel-text-muted mb-1">事件类型</div>
                <div className="text-sm text-tunnel-text">{typeConfig[incident.type]?.label}</div>
              </div>
              <div>
                <div className="text-xs text-tunnel-text-muted mb-1">严重程度</div>
                <div className="text-sm text-tunnel-text">{severityConfig[incident.severity]?.label}</div>
              </div>
              <div>
                <div className="text-xs text-tunnel-text-muted mb-1">上报来源</div>
                <div className="text-sm text-tunnel-text">{sourceConfig[incident.source]?.label}</div>
              </div>
              <div>
                <div className="text-xs text-tunnel-text-muted mb-1">隧道</div>
                <div className="text-sm text-tunnel-text">{incident.tunnelName}</div>
              </div>
              <div>
                <div className="text-xs text-tunnel-text-muted mb-1">里程桩</div>
                <div className="text-sm text-tunnel-text">K{Math.floor(incident.mileage / 1000)}+{incident.mileage % 1000}</div>
              </div>
              <div>
                <div className="text-xs text-tunnel-text-muted mb-1">上报人</div>
                <div className="text-sm text-tunnel-text">{incident.reporterName || incident.creatorName}</div>
              </div>
              <div className="col-span-2 md:col-span-3">
                <div className="text-xs text-tunnel-text-muted mb-1">描述</div>
                <div className="text-sm text-tunnel-text">{incident.description}</div>
              </div>
              <div>
                <div className="text-xs text-tunnel-text-muted mb-1">创建时间</div>
                <div className="text-sm text-tunnel-text">{formatDateTime(incident.createdAt)}</div>
              </div>
              {incident.closedAt && (
                <div>
                  <div className="text-xs text-tunnel-text-muted mb-1">关闭时间</div>
                  <div className="text-sm text-tunnel-text">{formatDateTime(incident.closedAt)}</div>
                </div>
              )}
            </div>
          </Card>

          {execution && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-tunnel-text flex items-center gap-2">
                  <Shield className="w-5 h-5 text-tunnel-info" />
                  预案执行: {execution.planName}
                </h2>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${
                  execution.status === 'executing'
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-tunnel-info'
                    : execution.status === 'completed'
                    ? 'bg-green-500/10 border-green-500/30 text-tunnel-success'
                    : 'bg-gray-500/10 border-gray-500/30 text-tunnel-text-dim'
                }`}>
                  {execution.status === 'executing' ? '执行中' : execution.status === 'completed' ? '已完成' : '已中断'}
                </span>
              </div>
              <div className="space-y-3">
                {execution.actions.map((action) => (
                  <div key={action.id} className="p-3 bg-tunnel-bg/50 rounded-lg border border-tunnel-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          action.status === 'completed' ? 'bg-tunnel-success/20 text-tunnel-success' :
                          action.status === 'executing' ? 'bg-tunnel-info/20 text-tunnel-info animate-pulse' :
                          action.status === 'failed' ? 'bg-tunnel-danger/20 text-tunnel-danger' :
                          action.status === 'skipped' ? 'bg-gray-500/20 text-tunnel-text-dim' :
                          'bg-tunnel-border/50 text-tunnel-text-muted'
                        }`}>
                          {action.step}
                        </div>
                        <div>
                          <div className="text-sm text-tunnel-text">{action.description}</div>
                          <div className="text-xs text-tunnel-text-muted mt-0.5">
                            {action.startedAt ? `开始: ${formatDateTime(action.startedAt)}` : '未开始'}
                            {action.completedAt ? ` · 完成: ${formatDateTime(action.completedAt)}` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          action.status === 'completed' ? 'bg-green-500/10 text-tunnel-success' :
                          action.status === 'executing' ? 'bg-cyan-500/10 text-tunnel-info' :
                          action.status === 'failed' ? 'bg-red-500/10 text-tunnel-danger' :
                          action.status === 'skipped' ? 'bg-gray-500/10 text-tunnel-text-dim' :
                          'bg-tunnel-border/30 text-tunnel-text-muted'
                        }`}>
                          {action.status === 'completed' ? '已完成' :
                           action.status === 'executing' ? '执行中' :
                           action.status === 'failed' ? '失败' :
                           action.status === 'skipped' ? '已跳过' :
                           action.status === 'adjusted' ? '已调整' : '待执行'}
                        </span>
                        {(execution.status === 'executing' && (action.status === 'pending' || action.status === 'executing')) && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleAdjustAction(action.id, 'completed')}
                              className="p-1 rounded hover:bg-green-500/20 text-tunnel-success"
                              title="确认完成"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAdjustAction(action.id, 'skipped')}
                              className="p-1 rounded hover:bg-gray-500/20 text-tunnel-text-dim"
                              title="跳过"
                            >
                              <SkipForward className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {action.remark && (
                      <div className="mt-2 text-xs text-tunnel-text-dim pl-9">备注: {action.remark}</div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-tunnel-text flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-tunnel-accent" />
              处置时间线
            </h2>
            <div className="space-y-0">
              {timeline.map((entry, i) => (
                <div key={entry.id} className="flex gap-3 pb-4 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${
                      entry.event === '事件创建' ? 'bg-tunnel-info' :
                      entry.event === '预案触发' ? 'bg-tunnel-accent' :
                      entry.event === '动作执行' ? 'bg-tunnel-success' :
                      entry.event === '视频检测告警' ? 'bg-tunnel-warning' :
                      entry.event === '手动干预' ? 'bg-purple-400' :
                      'bg-tunnel-text-muted'
                    }`} />
                    {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-tunnel-border/50 mt-1" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-tunnel-text font-medium">{entry.event}</div>
                    <div className="text-xs text-tunnel-text-dim mt-0.5">{entry.detail}</div>
                    <div className="text-xs text-tunnel-text-muted mt-1">
                      {formatDateTime(entry.timestamp)}
                      {entry.operatorName && ` · ${entry.operatorName}`}
                    </div>
                  </div>
                </div>
              ))}
              {timeline.length === 0 && (
                <div className="text-center py-4 text-tunnel-text-muted text-sm">暂无时间线记录</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
