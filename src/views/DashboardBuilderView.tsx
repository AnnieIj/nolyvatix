import React, { useState, useEffect } from 'react';
import { CustomDashboard, WidgetConfig, WidgetType } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { authFetch } from '../lib/apiClient';
import {
  Grid3X3,
  Plus,
  Pin,
  Copy,
  Trash2,
  Edit2,
  Save,
  Sparkles,
  TrendingUp,
  Activity,
  Layers,
  BarChart2,
  PieChart as PieIcon,
  Table as TableIcon,
  Cpu,
  Wallet,
  ArrowRightLeft,
  ChevronUp,
  ChevronDown,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const DashboardBuilderView: React.FC = () => {
  const [dashboards, setDashboards] = useState<CustomDashboard[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<CustomDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [addWidgetModalOpen, setAddWidgetModalOpen] = useState(false);
  const [createDashboardModalOpen, setCreateDashboardModalOpen] = useState(false);
  const [newDashTitle, setNewDashTitle] = useState('');
  const [newDashDesc, setNewDashDesc] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  // Sample timeseries data for charts
  const sampleChartData = [
    { time: '00:00', tps: 42, volume: 120, gas: 12.4 },
    { time: '04:00', tps: 48, volume: 180, gas: 14.1 },
    { time: '08:00', tps: 62, volume: 240, gas: 18.5 },
    { time: '12:00', tps: 58, volume: 210, gas: 16.2 },
    { time: '16:00', tps: 71, volume: 310, gas: 21.0 },
    { time: '20:00', tps: 54, volume: 195, gas: 15.3 },
  ];

  const pieColors = ['#0284c7', '#6366f1', '#10b981', '#f59e0b', '#ec4899'];

  useEffect(() => {
    fetchDashboards();
  }, []);

  const fetchDashboards = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/api/dashboards');
      if (res.ok) {
        const json = await res.json();
        setDashboards(json.data || []);
        if (json.data && json.data.length > 0) {
          setSelectedDashboard(json.data[0]);
          setEditedTitle(json.data[0].title);
        }
      }
    } catch (err) {
      console.error('Failed to fetch dashboards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDashboard = (dash: CustomDashboard) => {
    setSelectedDashboard(dash);
    setEditedTitle(dash.title);
    setIsEditingTitle(false);
  };

  const handleTogglePin = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await authFetch(`/api/dashboards/${id}/pin`, { method: 'POST' });
      if (res.ok) {
        fetchDashboards();
      }
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await authFetch(`/api/dashboards/${id}/duplicate`, { method: 'POST' });
      if (res.ok) {
        fetchDashboards();
      }
    } catch (err) {
      console.error('Failed to duplicate dashboard:', err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this dashboard?')) return;
    try {
      const res = await authFetch(`/api/dashboards/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchDashboards();
      }
    } catch (err) {
      console.error('Failed to delete dashboard:', err);
    }
  };

  const handleCreateDashboard = async () => {
    if (!newDashTitle.trim()) return;
    try {
      const res = await authFetch('/api/dashboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newDashTitle,
          description: newDashDesc || 'Custom Stellar BI View',
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setNewDashTitle('');
        setNewDashDesc('');
        setCreateDashboardModalOpen(false);
        await fetchDashboards();
        if (json.data) {
          setSelectedDashboard(json.data);
          setEditedTitle(json.data.title);
        }
      }
    } catch (err) {
      console.error('Failed to create dashboard:', err);
    }
  };

  const handleSaveTitle = async () => {
    if (!selectedDashboard) return;
    try {
      const res = await authFetch(`/api/dashboards/${selectedDashboard.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editedTitle }),
      });
      if (res.ok) {
        setIsEditingTitle(false);
        fetchDashboards();
      }
    } catch (err) {
      console.error('Failed to update dashboard title:', err);
    }
  };

  const handleAddWidget = async (type: WidgetType, title: string, span: 1 | 2 | 3 | 4 | 6 | 12) => {
    if (!selectedDashboard) return;
    const newWidget: WidgetConfig = {
      id: `w-${Date.now()}`,
      title,
      type,
      widgetType: type,
      gridSpan: span,
    };

    const updatedWidgets = [...selectedDashboard.widgets, newWidget];
    const updatedDash = { ...selectedDashboard, widgets: updatedWidgets };
    setSelectedDashboard(updatedDash);
    setAddWidgetModalOpen(false);

    try {
      await authFetch(`/api/dashboards/${selectedDashboard.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgets: updatedWidgets }),
      });
      fetchDashboards();
    } catch (err) {
      console.error('Failed to save widget addition:', err);
    }
  };

  const handleRemoveWidget = async (widgetId: string) => {
    if (!selectedDashboard) return;
    const updatedWidgets = selectedDashboard.widgets.filter((w) => w.id !== widgetId);
    setSelectedDashboard({ ...selectedDashboard, widgets: updatedWidgets });

    try {
      await authFetch(`/api/dashboards/${selectedDashboard.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgets: updatedWidgets }),
      });
      fetchDashboards();
    } catch (err) {
      console.error('Failed to remove widget:', err);
    }
  };

  const handleChangeWidgetSpan = async (widgetId: string, newSpan: 1 | 2 | 3 | 4 | 6 | 12) => {
    if (!selectedDashboard) return;
    const updatedWidgets = selectedDashboard.widgets.map((w) => (w.id === widgetId ? { ...w, gridSpan: newSpan } : w));
    setSelectedDashboard({ ...selectedDashboard, widgets: updatedWidgets });

    try {
      await authFetch(`/api/dashboards/${selectedDashboard.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgets: updatedWidgets }),
      });
    } catch (err) {
      console.error('Failed to update widget span:', err);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-lg text-sky-400">
              <Grid3X3 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Enterprise Dashboard Builder</h1>
            <Badge variant="info">Sprint 7 BI</Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Drag, resize, rearrange, and customize unlimited analytics dashboards for the Stellar Ecosystem.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setCreateDashboardModalOpen(true)}
          >
            New Dashboard
          </Button>
        </div>
      </div>

      {/* Dashboard Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {dashboards.map((dash) => {
          const isSelected = selectedDashboard?.id === dash.id;
          return (
            <div
              key={dash.id}
              onClick={() => handleSelectDashboard(dash)}
              className={`px-3.5 py-2 rounded-lg border text-xs font-mono flex items-center gap-2.5 cursor-pointer whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-sky-500/10 border-sky-500/50 text-white font-semibold shadow-md shadow-sky-950/30'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
              }`}
            >
              {dash.isPinned && <Pin className="w-3 h-3 text-sky-400 fill-sky-400/20" />}
              <span>{dash.title}</span>
              <span className="text-[10px] text-zinc-500">({dash.widgets.length} widgets)</span>

              <div className="flex items-center gap-1 opacity-60 hover:opacity-100 ml-1">
                <button
                  onClick={(e) => handleTogglePin(dash.id, e)}
                  title={dash.isPinned ? 'Unpin' : 'Pin'}
                  className="hover:text-sky-400 p-0.5"
                >
                  <Pin className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => handleDuplicate(dash.id, e)}
                  title="Duplicate"
                  className="hover:text-emerald-400 p-0.5"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => handleDelete(dash.id, e)}
                  title="Delete"
                  className="hover:text-rose-400 p-0.5"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Dashboard Controls Bar */}
      {selectedDashboard && (
        <GlassCard className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-sky-500/20">
          <div className="flex items-center gap-3 flex-1">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="bg-zinc-950 border border-sky-500 rounded px-2.5 py-1 text-sm text-white font-semibold font-mono focus:outline-none"
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-1.5 bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono">{selectedDashboard.title}</h2>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="p-1 text-zinc-400 hover:text-white transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-xs text-zinc-400 hidden lg:block border-l border-zinc-800 pl-3">
              {selectedDashboard.description}
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-end md:self-auto">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setAddWidgetModalOpen(true)}
            >
              Add Widget
            </Button>
          </div>
        </GlassCard>
      )}

      {/* Responsive Grid Layout for Widgets */}
      {selectedDashboard && (
        <div className="grid grid-cols-12 gap-4">
          {selectedDashboard.widgets.map((widget) => {
            const spanClassMap: Record<number, string> = {
              1: 'col-span-12 sm:col-span-1',
              2: 'col-span-12 sm:col-span-2',
              3: 'col-span-12 sm:col-span-6 md:col-span-3',
              4: 'col-span-12 md:col-span-4',
              6: 'col-span-12 md:col-span-6',
              12: 'col-span-12',
            };

            const gridClass = spanClassMap[widget.gridSpan] || 'col-span-12 md:col-span-6';

            return (
              <div key={widget.id} className={`${gridClass} transition-all duration-200`}>
                <GlassCard className="p-4 h-full flex flex-col justify-between group relative border-zinc-800/80 hover:border-zinc-700">
                  {/* Widget Top Action Header */}
                  <div className="flex items-center justify-between gap-2 border-b border-zinc-800/60 pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      <span className="text-xs font-bold text-zinc-200 font-mono tracking-tight">
                        {widget.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100">
                      {/* Grid Span Controls */}
                      <select
                        value={widget.gridSpan}
                        onChange={(e) =>
                          handleChangeWidgetSpan(widget.id, Number(e.target.value) as any)
                        }
                        className="bg-zinc-900 border border-zinc-800 rounded text-[10px] text-zinc-300 font-mono px-1 py-0.5 focus:outline-none"
                      >
                        <option value={3}>1/4 Width (3 cols)</option>
                        <option value={4}>1/3 Width (4 cols)</option>
                        <option value={6}>1/2 Width (6 cols)</option>
                        <option value={12}>Full Width (12 cols)</option>
                      </select>

                      <button
                        onClick={() => handleRemoveWidget(widget.id)}
                        className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                        title="Remove Widget"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Widget Content Renderer */}
                  <div className="flex-1 min-h-[160px]">
                    {/* 1. Network Status Pulse */}
                    {widget.type === 'network_status' && (
                      <div className="space-y-3 font-mono text-xs">
                        <div className="p-3 bg-zinc-950/80 border border-emerald-500/20 rounded-lg flex items-center justify-between">
                          <span className="text-zinc-400">Horizon Health</span>
                          <Badge variant="success">HEALTHY 100%</Badge>
                        </div>
                        <div className="p-3 bg-zinc-950/80 border border-sky-500/20 rounded-lg flex items-center justify-between">
                          <span className="text-zinc-400">Soroban RPC</span>
                          <Badge variant="info">ONLINE</Badge>
                        </div>
                        <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-lg flex items-center justify-between">
                          <span className="text-zinc-400">Current Ledger</span>
                          <span className="text-white font-bold">#52,148,900</span>
                        </div>
                      </div>
                    )}

                    {/* 2. Line Chart */}
                    {widget.type === 'line_chart' && (
                      <div className="h-44 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={sampleChartData}>
                            <XAxis dataKey="time" stroke="#71717a" fontSize={10} />
                            <YAxis stroke="#71717a" fontSize={10} />
                            <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }} />
                            <Line type="monotone" dataKey="tps" stroke="#0284c7" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* 3. Bar Chart */}
                    {widget.type === 'bar_chart' && (
                      <div className="h-44 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={sampleChartData}>
                            <XAxis dataKey="time" stroke="#71717a" fontSize={10} />
                            <YAxis stroke="#71717a" fontSize={10} />
                            <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }} />
                            <Bar dataKey="volume" fill="#6366f1" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* 4. Donut Chart */}
                    {widget.type === 'donut_chart' && (
                      <div className="h-44 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'USDC/XLM', value: 45 },
                                { name: 'EURC/USDC', value: 25 },
                                { name: 'XLM/AQUA', value: 18 },
                                { name: 'Soroban LP', value: 12 },
                              ]}
                              innerRadius={40}
                              outerRadius={65}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {pieColors.map((color, idx) => (
                                <Cell key={idx} fill={color} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* 5. KPI Card */}
                    {widget.type === 'kpi_card' && (
                      <div className="flex flex-col justify-center h-full p-2 font-mono">
                        <div className="text-2xl font-extrabold text-white tracking-tight">
                          {widget.metricKey === 'volume24h' ? '$284.5M' : widget.metricKey === 'activeWallets' ? '148,200' : '54.2 TPS'}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mt-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>+12.4% vs 24h avg</span>
                        </div>
                      </div>
                    )}

                    {/* 6. AI Summary */}
                    {widget.type === 'ai_summary' && (
                      <div className="p-3 bg-zinc-950/80 border border-sky-500/20 rounded-lg space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-sky-400 font-mono font-semibold">
                          <Sparkles className="w-4 h-4" />
                          <span>Gemini Automated Synthesis</span>
                        </div>
                        <p className="text-zinc-300 leading-relaxed font-sans">
                          Stellar Mainnet ledger validation throughput is operating cleanly with 99.99% ledger header consistency. Circle USDC corridor settlement is up 14.2% driven by latency reduction on cross-border anchor paths.
                        </p>
                      </div>
                    )}

                    {/* 7. Soroban APM */}
                    {widget.type === 'soroban_apm' && (
                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex justify-between items-center p-2 bg-zinc-950/60 rounded">
                          <span className="text-zinc-400">Blend Protocol WASM</span>
                          <span className="text-emerald-400 font-bold">99.8% Success</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-zinc-950/60 rounded">
                          <span className="text-zinc-400">Soroswap Router</span>
                          <span className="text-emerald-400 font-bold">99.4% Success</span>
                        </div>
                      </div>
                    )}

                    {/* 8. Table */}
                    {widget.type === 'table' && (
                      <div className="overflow-x-auto text-xs font-mono">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-zinc-800 text-zinc-500">
                              <th className="pb-1.5">Contract / Asset</th>
                              <th className="pb-1.5">Type</th>
                              <th className="pb-1.5">24h Vol</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                            <tr>
                              <td className="py-1.5">Circle USDC</td>
                              <td>Anchor Asset</td>
                              <td className="text-emerald-400">$184.5M</td>
                            </tr>
                            <tr>
                              <td className="py-1.5">Blend Pool WASM</td>
                              <td>Soroban Smart Contract</td>
                              <td className="text-sky-400">842K Invocations</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Widget Modal */}
      <Modal
        isOpen={addWidgetModalOpen}
        onClose={() => setAddWidgetModalOpen(false)}
        title="Widget Library Catalog"
        subtitle="Select a pre-built widget module to insert into your dashboard"
        maxWidth="md"
      >
        <div className="grid grid-cols-2 gap-3 font-mono text-xs">
          {[
            { type: 'network_status', title: 'Network Live Pulse', icon: <Activity className="w-4 h-4 text-emerald-400" /> },
            { type: 'line_chart', title: 'TPS Throughput Line Chart', icon: <TrendingUp className="w-4 h-4 text-sky-400" /> },
            { type: 'bar_chart', title: 'Settlement Volume Bar Chart', icon: <BarChart2 className="w-4 h-4 text-indigo-400" /> },
            { type: 'donut_chart', title: 'Liquidity Share Donut', icon: <PieIcon className="w-4 h-4 text-amber-400" /> },
            { type: 'kpi_card', title: 'Single Metric KPI Card', icon: <Layers className="w-4 h-4 text-rose-400" /> },
            { type: 'ai_summary', title: 'Gemini Executive Summary', icon: <Sparkles className="w-4 h-4 text-sky-400" /> },
            { type: 'soroban_apm', title: 'Soroban WASM APM', icon: <Cpu className="w-4 h-4 text-emerald-400" /> },
            { type: 'table', title: 'Entity Data Table', icon: <TableIcon className="w-4 h-4 text-zinc-400" /> },
          ].map((item) => (
            <button
              key={item.type}
              onClick={() => handleAddWidget(item.type as WidgetType, item.title, 6)}
              className="p-3 bg-zinc-900 border border-zinc-800 hover:border-sky-500/50 rounded-lg flex items-center gap-3 text-left hover:bg-zinc-850 transition-all text-white"
            >
              <div className="p-2 bg-zinc-950 rounded">{item.icon}</div>
              <div>
                <div className="font-bold">{item.title}</div>
                <div className="text-[10px] text-zinc-500">Insert 6-column widget</div>
              </div>
            </button>
          ))}
        </div>
      </Modal>

      {/* Create Dashboard Modal */}
      <Modal
        isOpen={createDashboardModalOpen}
        onClose={() => setCreateDashboardModalOpen(false)}
        title="Create New BI Dashboard"
        subtitle="Specify a title and target description for your custom Stellar analytics layout"
        maxWidth="sm"
      >
        <div className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-zinc-400 mb-1">Dashboard Title</label>
            <input
              type="text"
              placeholder="e.g. Soroban DeFi Liquidity Tracker"
              value={newDashTitle}
              onChange={(e) => setNewDashTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2.5 text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Description (Optional)</label>
            <textarea
              rows={3}
              placeholder="Brief description of what this dashboard measures..."
              value={newDashDesc}
              onChange={(e) => setNewDashDesc(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2.5 text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="glass" size="md" onClick={() => setCreateDashboardModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleCreateDashboard}>
              Create Dashboard
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
