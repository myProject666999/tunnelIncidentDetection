import { useEffect, useState } from 'react';
import { BarChart3, Download, FileText, RefreshCw, Search } from 'lucide-react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { reportApi } from '@/api';
import type { ReportItem, Statistics } from '@/types';
import { severityConfig, typeConfig, sourceConfig, formatDateTime, formatDuration } from '@/utils';
import { useNavigate } from 'react-router-dom';
import StatCard from '@/components/StatCard';

export default function ReportList() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadData();
  }, [page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportsRes, statsRes] = await Promise.all([
        reportApi.getList({ page, pageSize: 20, startDate: startDate || undefined, endDate: endDate || undefined }),
        reportApi.getStats(),
      ]);
      setReports(reportsRes.items);
      setTotal(reportsRes.total);
      setStats(statsRes);
    } catch {}
    setLoading(false);
  };

  const handleSearch = () => {
    setPage(1);
    loadData();
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tunnel-text">复盘报告</h1>
          <p className="text-tunnel-text-dim text-sm mt-1">历史事件处置记录与统计分析</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> 刷新
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="总事件数" value={stats.totalIncidents} icon={<BarChart3 className="w-5 h-5" />} color="info" />
          <StatCard title="待处置" value={stats.pendingIncidents} icon={<FileText className="w-5 h-5" />} color="danger" />
          <StatCard title="已处置" value={stats.resolvedIncidents} icon={<FileText className="w-5 h-5" />} color="success" />
          <StatCard title="今日事件" value={stats.todayIncidents} icon={<FileText className="w-5 h-5" />} color="accent" />
          <StatCard title="平均响应" value={formatDuration(stats.avgResponseTime)} icon={<FileText className="w-5 h-5" />} color="info" />
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-tunnel-text-muted" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-tunnel-surface border border-tunnel-border rounded-lg px-3 py-1.5 text-sm text-tunnel-text focus:outline-none focus:border-tunnel-info"
          />
          <span className="text-tunnel-text-dim">至</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-tunnel-surface border border-tunnel-border rounded-lg px-3 py-1.5 text-sm text-tunnel-text focus:outline-none focus:border-tunnel-info"
          />
          <Button variant="outline" size="sm" onClick={handleSearch}>查询</Button>
        </div>
        <div className="text-sm text-tunnel-text-dim">共 {total} 条记录</div>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-tunnel-border">
                <th className="px-4 py-3 text-left text-xs font-medium text-tunnel-text-dim uppercase">编号</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-tunnel-text-dim uppercase">隧道</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-tunnel-text-dim uppercase">类型</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-tunnel-text-dim uppercase">严重程度</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-tunnel-text-dim uppercase">来源</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-tunnel-text-dim uppercase">处置时长</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-tunnel-text-dim uppercase">发生时间</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-tunnel-text-dim uppercase">操作</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr
                  key={report.id}
                  className="border-b border-tunnel-border/50 hover:bg-tunnel-bg/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/reports/${report.id}`)}
                >
                  <td className="px-4 py-3 text-sm text-tunnel-text font-mono">{report.incidentNo}</td>
                  <td className="px-4 py-3 text-sm text-tunnel-text-dim">{report.tunnelName}</td>
                  <td className="px-4 py-3 text-sm text-tunnel-text">{typeConfig[report.type]?.label}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${severityConfig[report.severity]?.bgColor} ${severityConfig[report.severity]?.color}`}>
                      {severityConfig[report.severity]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-tunnel-text-dim">{sourceConfig[report.source]?.label}</td>
                  <td className="px-4 py-3 text-sm text-tunnel-text-dim">{formatDuration(report.responseDuration)}</td>
                  <td className="px-4 py-3 text-sm text-tunnel-text-dim">{formatDateTime(report.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" onClick={(e: React.MouseEvent) => { e.stopPropagation(); navigate(`/reports/${report.id}`); }}>
                      详情
                    </Button>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-tunnel-text-muted">暂无复盘报告</td>
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
    </div>
  );
}
