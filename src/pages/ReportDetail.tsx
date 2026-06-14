import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, FileText, Printer } from 'lucide-react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { reportApi } from '@/api';
import type { ReportDetail } from '@/types';
import { severityConfig, typeConfig, sourceConfig, formatDateTime, formatDuration } from '@/utils';

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await reportApi.getDetail(+id!);
      setReport(res);
    } catch {}
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-tunnel-info border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-tunnel-text-muted">报告不存在</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/reports')}>返回列表</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> 返回
          </Button>
          <div>
            <h1 className="text-xl font-bold text-tunnel-text">复盘报告: {report.incidentNo}</h1>
            <p className="text-tunnel-text-dim text-sm mt-1">事件处置全过程记录</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-1.5" /> 打印
        </Button>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-tunnel-text mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-tunnel-info" />
          事件概要
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-tunnel-text-muted mb-1">事件编号</div>
            <div className="text-sm text-tunnel-text font-mono">{report.incidentNo}</div>
          </div>
          <div>
            <div className="text-xs text-tunnel-text-muted mb-1">事件类型</div>
            <div className="text-sm text-tunnel-text">{typeConfig[report.type]?.label}</div>
          </div>
          <div>
            <div className="text-xs text-tunnel-text-muted mb-1">严重程度</div>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${severityConfig[report.severity]?.bgColor} ${severityConfig[report.severity]?.color}`}>
              {severityConfig[report.severity]?.label}
            </span>
          </div>
          <div>
            <div className="text-xs text-tunnel-text-muted mb-1">上报来源</div>
            <div className="text-sm text-tunnel-text">{sourceConfig[report.source]?.label}</div>
          </div>
          <div>
            <div className="text-xs text-tunnel-text-muted mb-1">隧道</div>
            <div className="text-sm text-tunnel-text">{report.tunnelName} ({report.tunnelCode})</div>
          </div>
          <div>
            <div className="text-xs text-tunnel-text-muted mb-1">里程桩</div>
            <div className="text-sm text-tunnel-text">K{Math.floor(report.mileage / 1000)}+{report.mileage % 1000}</div>
          </div>
          <div>
            <div className="text-xs text-tunnel-text-muted mb-1">上报人</div>
            <div className="text-sm text-tunnel-text">{report.reporterName || report.creatorName}</div>
          </div>
          <div>
            <div className="text-xs text-tunnel-text-muted mb-1">处置时长</div>
            <div className="text-sm text-tunnel-text font-medium">{formatDuration(report.responseDuration)}</div>
          </div>
          <div>
            <div className="text-xs text-tunnel-text-muted mb-1">发生时间</div>
            <div className="text-sm text-tunnel-text">{formatDateTime(report.createdAt)}</div>
          </div>
          <div>
            <div className="text-xs text-tunnel-text-muted mb-1">关闭时间</div>
            <div className="text-sm text-tunnel-text">{report.closedAt ? formatDateTime(report.closedAt) : '-'}</div>
          </div>
          <div className="col-span-2">
            <div className="text-xs text-tunnel-text-muted mb-1">事件描述</div>
            <div className="text-sm text-tunnel-text">{report.description}</div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-tunnel-text mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-tunnel-accent" />
          处置时间线 (精确到秒)
        </h2>
        <div className="space-y-0">
          {report.timeline.map((entry, i) => (
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
                {i < report.timeline.length - 1 && <div className="w-0.5 flex-1 bg-tunnel-border/50 mt-1" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-tunnel-text font-medium">{entry.event}</span>
                  {entry.operatorName && (
                    <span className="text-xs text-tunnel-text-muted">操作人: {entry.operatorName}</span>
                  )}
                </div>
                <div className="text-xs text-tunnel-text-dim mt-0.5">{entry.detail}</div>
                <div className="text-xs text-tunnel-info mt-1 font-mono">{formatDateTime(entry.timestamp)}</div>
              </div>
            </div>
          ))}
          {report.timeline.length === 0 && (
            <div className="text-center py-4 text-tunnel-text-muted text-sm">暂无时间线记录</div>
          )}
        </div>
      </Card>
    </div>
  );
}
