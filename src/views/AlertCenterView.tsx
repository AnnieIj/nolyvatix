import React, { useState, useEffect } from 'react';
import { AlertRule, AlertTarget, AlertChannel } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  Bell,
  Plus,
  Send,
  Trash2,
  CheckCircle2,
  XCircle,
  Globe,
  Mail,
  Slack,
  MessageSquare,
  Sparkles,
  Zap,
} from 'lucide-react';

export const AlertCenterView: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [testPayloadModalOpen, setTestPayloadModalOpen] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Form state
  const [name, setName] = useState('');
  const [target, setTarget] = useState<AlertTarget>('tps_drops');
  const [condition, setCondition] = useState<'above' | 'below' | 'equals'>('below');
  const [threshold, setThreshold] = useState<number>(30);
  const [channel, setChannel] = useState<AlertChannel>('browser');
  const [destination, setDestination] = useState('');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/alerts');
      if (res.ok) {
        const json = await res.json();
        setAlerts(json.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async () => {
    if (!name.trim()) return;
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          target,
          condition,
          threshold: Number(threshold),
          channel,
          destination,
          enabled: true,
        }),
      });

      if (res.ok) {
        setName('');
        setDestination('');
        setCreateModalOpen(false);
        fetchAlerts();
      }
    } catch (err) {
      console.error('Failed to create alert rule:', err);
    }
  };

  const handleToggleEnabled = async (alert: AlertRule) => {
    try {
      const res = await fetch(`/api/alerts/${alert.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !alert.enabled }),
      });
      if (res.ok) {
        fetchAlerts();
      }
    } catch (err) {
      console.error('Failed to toggle alert state:', err);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    if (!window.confirm('Delete this alert rule?')) return;
    try {
      const res = await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAlerts();
      }
    } catch (err) {
      console.error('Failed to delete alert:', err);
    }
  };

  const handleTestTrigger = async (id: string) => {
    try {
      const res = await fetch(`/api/alerts/${id}/test-trigger`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        setTestResult(json.data);
        setTestPayloadModalOpen(true);
        fetchAlerts();
      }
    } catch (err) {
      console.error('Failed to test trigger alert:', err);
    }
  };

  const getChannelIcon = (c: AlertChannel) => {
    switch (c) {
      case 'webhook':
        return <Globe className="w-4 h-4 text-sky-400" />;
      case 'email':
        return <Mail className="w-4 h-4 text-amber-400" />;
      case 'slack':
        return <Slack className="w-4 h-4 text-emerald-400" />;
      case 'discord':
        return <MessageSquare className="w-4 h-4 text-indigo-400" />;
      default:
        return <Bell className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400">
              <Bell className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Enterprise Alert Center</h1>
            <Badge variant="warning">Multi-Channel Webhooks</Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Automated monitoring for TPS spikes, whale movements, trustline explosions, and Soroban WASM failures.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setCreateModalOpen(true)}
        >
          Create Alert Rule
        </Button>
      </div>

      {/* Alert Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map((alert) => (
          <GlassCard key={alert.id} className="p-5 space-y-4 border-zinc-800/80 hover:border-zinc-700">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg">
                  {getChannelIcon(alert.channel)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">{alert.name}</h3>
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                    Target: {alert.target.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleEnabled(alert)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider transition-colors ${
                    alert.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {alert.enabled ? 'ENABLED' : 'PAUSED'}
                </button>
              </div>
            </div>

            {/* Threshold condition */}
            <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-lg font-mono text-xs flex items-center justify-between">
              <span className="text-zinc-400">Trigger Condition</span>
              <span className="text-sky-400 font-bold">
                {alert.target} {alert.condition} {alert.threshold.toLocaleString()}
              </span>
            </div>

            {/* Destination */}
            {alert.destination && (
              <div className="text-[11px] font-mono text-zinc-500 truncate">
                Destination: <span className="text-zinc-300">{alert.destination}</span>
              </div>
            )}

            {/* Footer action buttons */}
            <div className="flex items-center justify-between border-t border-zinc-800/60 pt-3 text-xs font-mono">
              <span className="text-[10px] text-zinc-500">
                {alert.lastTriggered
                  ? `Last triggered: ${new Date(alert.lastTriggered).toLocaleTimeString()}`
                  : 'Never triggered'}
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="glass"
                  size="sm"
                  leftIcon={<Zap className="w-3.5 h-3.5 text-amber-400" />}
                  onClick={() => handleTestTrigger(alert.id)}
                >
                  Test Trigger
                </Button>
                <button
                  onClick={() => handleDeleteAlert(alert.id)}
                  className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                  title="Delete Alert"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Create Alert Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Configure New Alert Rule"
        subtitle="Set real-time triggers and multi-channel dispatch targets"
        maxWidth="md"
      >
        <div className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-zinc-400 mb-1">Alert Rule Name</label>
            <input
              type="text"
              placeholder="e.g. XLM Whale Movement > 500,000 Transfer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 mb-1">Monitoring Target</label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-white focus:outline-none"
              >
                <option value="tps_drops">Network TPS Drop</option>
                <option value="whale_movement">Whale Wallet Transfer</option>
                <option value="trustline_spike">Trustline Growth Spike</option>
                <option value="dex_volume_spike">DEX Volume Spike</option>
                <option value="pool_tvl_change">Liquidity Pool TVL Drop</option>
                <option value="soroban_failure">Soroban Contract Failures</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Condition & Threshold</label>
              <div className="flex gap-2">
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as any)}
                  className="bg-zinc-950 border border-zinc-800 rounded p-2.5 text-white focus:outline-none"
                >
                  <option value="below">Below (&lt;)</option>
                  <option value="above">Above (&gt;)</option>
                  <option value="equals">Equals (=)</option>
                </select>
                <input
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 mb-1">Dispatch Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-white focus:outline-none"
              >
                <option value="browser">Browser Notification</option>
                <option value="webhook">Custom Webhook POST</option>
                <option value="slack">Slack Webhook</option>
                <option value="discord">Discord Webhook</option>
                <option value="email">Email Alert</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Destination Target</label>
              <input
                type="text"
                placeholder={
                  channel === 'email'
                    ? 'devops@company.io'
                    : 'https://hooks.slack.com/services/...'
                }
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="glass" size="md" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleCreateAlert}>
              Save Alert Rule
            </Button>
          </div>
        </div>
      </Modal>

      {/* Test Trigger Result Modal */}
      <Modal
        isOpen={testPayloadModalOpen}
        onClose={() => setTestPayloadModalOpen(false)}
        title="Test Trigger Payload Dispatched"
        subtitle="Simulated real-time alert dispatch JSON payload"
        maxWidth="md"
      >
        {testResult && (
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                Alert successfully dispatched to [{testResult.channel.toUpperCase()}]
              </span>
            </div>

            <pre className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg text-sky-400 overflow-x-auto text-[11px] leading-relaxed">
              {JSON.stringify(testResult.payload, null, 2)}
            </pre>
          </div>
        )}
      </Modal>
    </div>
  );
};
