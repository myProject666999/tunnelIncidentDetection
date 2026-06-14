import { useEffect, useState } from 'react';
import { FileText, Plus, RefreshCw, ToggleLeft, ToggleRight, Trash2, Edit3, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import { planApi } from '@/api';
import type { EmergencyPlan, IncidentType, IncidentSeverity, ActionType } from '@/types';
import { severityConfig, typeConfig } from '@/utils';

const actionTypeLabels: Record<ActionType, string> = {
  led_display: 'LED屏显示',
  light_full: '全亮照明',
  light_enhance: '增强照明',
  tunnel_close: '封闭隧道',
  tunnel_open: '开放隧道',
  notify_fire: '通知消防',
  notify_medical: '通知医疗',
  speed_limit: '限速提示',
};

export default function PlanList() {
  const [plans, setPlans] = useState<EmergencyPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    incidentType: 'breakdown' as IncidentType,
    severity: 'minor' as IncidentSeverity,
    actions: [{ step: 1, actionType: 'led_display' as ActionType, parameters: { text: '前方事故，慢行' }, description: 'LED屏显示警示信息' }],
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await planApi.getList();
      setPlans(res);
    } catch {}
    setLoading(false);
  };

  const handleToggle = async (plan: EmergencyPlan) => {
    try {
      await planApi.update(plan.id, { enabled: !plan.enabled });
      loadPlans();
    } catch {}
  };

  const handleDelete = async (id: number) => {
    try {
      await planApi.delete(id);
      loadPlans();
    } catch {}
  };

  const handleCreate = async () => {
    if (!createForm.name) return;
    setCreating(true);
    try {
      await planApi.create(createForm);
      setShowCreate(false);
      setCreateForm({
        name: '',
        incidentType: 'breakdown',
        severity: 'minor',
        actions: [{ step: 1, actionType: 'led_display', parameters: { text: '前方事故，慢行' }, description: 'LED屏显示警示信息' }],
      });
      loadPlans();
    } catch {}
    setCreating(false);
  };

  const addAction = () => {
    setCreateForm({
      ...createForm,
      actions: [...createForm.actions, {
        step: createForm.actions.length + 1,
        actionType: 'led_display' as ActionType,
        parameters: { text: '' },
        description: '',
      }],
    });
  };

  const removeAction = (index: number) => {
    const newActions = createForm.actions.filter((_, i) => i !== index).map((a, i) => ({ ...a, step: i + 1 }));
    setCreateForm({ ...createForm, actions: newActions });
  };

  const updateAction = (index: number, field: string, value: any) => {
    const newActions = [...createForm.actions];
    newActions[index] = { ...newActions[index], [field]: value };
    setCreateForm({ ...createForm, actions: newActions });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tunnel-text">应急预案</h1>
          <p className="text-tunnel-text-dim text-sm mt-1">管理模板化应急预案，按事件类型自动触发处置动作</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={loadPlans}>
            <RefreshCw className="w-4 h-4 mr-1.5" /> 刷新
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> 新建预案
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {plans.map((plan) => (
          <Card key={plan.id} padding="none">
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-tunnel-bg/30 transition-colors"
              onClick={() => setExpandedId(expandedId === plan.id ? null : plan.id)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  plan.enabled ? 'bg-tunnel-info/20 text-tunnel-info' : 'bg-tunnel-border/30 text-tunnel-text-muted'
                }`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-tunnel-text">{plan.name}</div>
                  <div className="text-xs text-tunnel-text-dim mt-0.5">
                    {typeConfig[plan.incidentType]?.label} · {severityConfig[plan.severity]?.label} · {plan.actions.length} 个步骤
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggle(plan); }}
                  className="text-tunnel-text-dim hover:text-tunnel-text transition-colors"
                >
                  {plan.enabled ? <ToggleRight className="w-6 h-6 text-tunnel-success" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(plan.id); }}
                  className="text-tunnel-text-dim hover:text-tunnel-danger transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {expandedId === plan.id ? <ChevronUp className="w-4 h-4 text-tunnel-text-muted" /> : <ChevronDown className="w-4 h-4 text-tunnel-text-muted" />}
              </div>
            </div>
            {expandedId === plan.id && (
              <div className="border-t border-tunnel-border/50 p-4">
                <div className="space-y-2">
                  {plan.actions.sort((a, b) => a.step - b.step).map((action) => (
                    <div key={action.id} className="flex items-center gap-3 p-2 bg-tunnel-bg/50 rounded-lg">
                      <span className="w-6 h-6 rounded-full bg-tunnel-info/20 text-tunnel-info flex items-center justify-center text-xs font-bold">
                        {action.step}
                      </span>
                      <span className="text-sm text-tunnel-text flex-1">{action.description}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-tunnel-surface border border-tunnel-border text-tunnel-text-dim">
                        {actionTypeLabels[action.actionType] || action.actionType}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
        {plans.length === 0 && (
          <div className="text-center py-12 text-tunnel-text-muted">暂无预案，点击"新建预案"创建</div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-tunnel-surface border border-tunnel-border rounded-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-tunnel-text mb-4">新建预案</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-tunnel-text-dim mb-1 block">预案名称</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full bg-tunnel-bg border border-tunnel-border rounded-lg px-3 py-2 text-sm text-tunnel-text focus:outline-none focus:border-tunnel-info"
                  placeholder="例: 车辆抛锚-一般事故处置预案"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-tunnel-text-dim mb-1 block">事件类型</label>
                  <select
                    value={createForm.incidentType}
                    onChange={(e) => setCreateForm({ ...createForm, incidentType: e.target.value as IncidentType })}
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
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-tunnel-text-dim">处置步骤</label>
                  <Button variant="ghost" size="sm" onClick={addAction}>
                    <Plus className="w-3 h-3 mr-1" /> 添加步骤
                  </Button>
                </div>
                <div className="space-y-2">
                  {createForm.actions.map((action, index) => (
                    <div key={index} className="p-3 bg-tunnel-bg/50 rounded-lg border border-tunnel-border/50 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-tunnel-text-muted">步骤 {index + 1}</span>
                        <div className="flex-1" />
                        {createForm.actions.length > 1 && (
                          <button onClick={() => removeAction(index)} className="text-tunnel-text-muted hover:text-tunnel-danger">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={action.actionType}
                          onChange={(e) => updateAction(index, 'actionType', e.target.value)}
                          className="bg-tunnel-bg border border-tunnel-border rounded-lg px-2 py-1.5 text-xs text-tunnel-text focus:outline-none focus:border-tunnel-info"
                        >
                          {Object.entries(actionTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                        <input
                          type="text"
                          value={action.description}
                          onChange={(e) => updateAction(index, 'description', e.target.value)}
                          className="bg-tunnel-bg border border-tunnel-border rounded-lg px-2 py-1.5 text-xs text-tunnel-text focus:outline-none focus:border-tunnel-info"
                          placeholder="步骤描述"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowCreate(false)}>取消</Button>
                <Button onClick={handleCreate} loading={creating} disabled={!createForm.name}>创建预案</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
