import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Plus,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Scale,
  Sparkles,
  Save
} from 'lucide-react';

import {
  fetchPricingRules,
  createPricingRule,
  updatePricingRule,
  deletePricingRule,
  fetchPricingConfig,
  updatePricingConfig,
  PriceRule,
  PricingConfig
} from '@/services/pricing';
import { PriceBreakdownView } from '@/components/pricing/PriceBreakdownView';

export const AdminPricingManager: React.FC = () => {
  const [rules, setRules] = useState<PriceRule[]>([]);
  const [, setConfig] = useState<PricingConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editMultiplier, setEditMultiplier] = useState<number>(1.15);
  const [editCap, setEditCap] = useState<number>(1.75);
  const [editWorkerShare, setEditWorkerShare] = useState<number>(85);
  const [editCoopShare, setEditCoopShare] = useState<number>(10);
  const [editWelfareShare, setEditWelfareShare] = useState<number>(5);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isAddingRule, setIsAddingRule] = useState(false);

  // New Rule State
  const [newFactorType, setNewFactorType] = useState('weather');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newMultiplier, setNewMultiplier] = useState(1.15);
  const [newCondition, setNewCondition] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [r, c] = await Promise.all([
        fetchPricingRules(),
        fetchPricingConfig()
      ]);
      setRules(r);
      setConfig(c);
      setEditCap(c.max_multiplier_cap);
      setEditWorkerShare(c.worker_payout_percent);
      setEditCoopShare(c.cooperative_fee_percent);
      setEditWelfareShare(c.welfare_contribution_percent);
    } catch (err) {
      console.error('Error fetching pricing configuration:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleActive = async (rule: PriceRule) => {
    try {
      const updated = await updatePricingRule(rule.id, { is_active: !rule.is_active });
      setRules((prev) => prev.map((r) => (r.id === rule.id ? updated : r)));
      showToast(`Rule "${rule.name}" ${updated.is_active ? 'activated' : 'deactivated'}.`);
    } catch (err) {
      console.error('Error toggling rule:', err);
    }
  };

  const handleSaveMultiplier = async (ruleId: string) => {
    try {
      const updated = await updatePricingRule(ruleId, { multiplier: editMultiplier });
      setRules((prev) => prev.map((r) => (r.id === ruleId ? updated : r)));
      setEditingRuleId(null);
      showToast('Multiplier saved successfully.');
    } catch (err) {
      console.error('Error updating multiplier:', err);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      await deletePricingRule(ruleId);
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
      showToast('Rule removed from pricing matrix.');
    } catch (err) {
      console.error('Error deleting rule:', err);
    }
  };

  const handleSaveGlobalConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await updatePricingConfig({
        max_multiplier_cap: editCap,
        worker_payout_percent: editWorkerShare,
        cooperative_fee_percent: editCoopShare,
        welfare_contribution_percent: editWelfareShare
      });
      setConfig(updated);
      showToast('Global pricing caps and dividend shares updated across platform.');
    } catch (err) {
      console.error('Error updating global config:', err);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await createPricingRule({
        factor_type: newFactorType,
        name: newName,
        description: newDesc,
        multiplier: newMultiplier,
        is_active: true,
        condition_value: newCondition || undefined
      });
      setRules((prev) => [...prev, created]);
      setIsAddingRule(false);
      setNewName('');
      setNewDesc('');
      setNewCondition('');
      showToast('New pricing rule added to cooperative engine.');
    } catch (err) {
      console.error('Error creating rule:', err);
    }
  };

  const showToast = (msg: string) => {
    setSaveSuccess(msg);
    setTimeout(() => setSaveSuccess(null), 3500);
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-[#6F6A63] space-y-2">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#9A5B3A]" />
        <p className="text-xs">Loading Rule-Based Pricing Engine configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {saveSuccess && (
        <div className="p-3 bg-[#527A62]/10 border border-[#527A62]/30 rounded-2xl text-[#527A62] text-xs font-semibold text-center flex items-center justify-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-[#527A62]" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#FFFFFF] rounded-3xl p-6 border border-[#E0D5C8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#EFE2D2] text-[#9A5B3A]">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-[#171717] font-display">Rule-Based Pricing Engine</h2>
              <span className="badge-success text-[10px]">
                100% Deterministic • Non-AI
              </span>
            </div>
            <p className="text-xs text-[#6F6A63] mt-0.5">
              Cooperative approved multipliers with strict anti-surge ceilings and guaranteed wage floors.
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="btn-secondary px-3 py-2 text-xs font-semibold flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Engine</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. GLOBAL MULTIPLIER CAP & VALUE ALLOCATION CONFIGURATION */}
      {/* ========================================================================= */}
      <form onSubmit={handleSaveGlobalConfig} className="bg-[#FFFFFF] rounded-3xl p-6 border border-[#E0D5C8] space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#E0D5C8]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#9A5B3A]" />
            <h3 className="text-sm font-bold text-[#171717] uppercase tracking-wider font-display">
              Cooperative Surge Ceilings & Wage Allocation
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#6F6A63]">Governance Level: Active</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Max Multiplier Cap */}
          <div className="space-y-1.5 bg-[#F7F3EC] p-3.5 rounded-2xl border border-[#E0D5C8]">
            <label className="block text-[11px] font-bold text-[#171717] uppercase tracking-wider">
              Max Surge Multiplier Cap
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.05"
                min="1.0"
                max="2.5"
                value={editCap}
                onChange={(e) => setEditCap(parseFloat(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E0D5C8] text-[#171717] font-mono font-bold text-sm focus:outline-none focus:border-[#9A5B3A]"
              />
              <span className="text-xs font-bold text-[#9A5B3A]">x max</span>
            </div>
            <p className="text-[10px] text-[#6F6A63]">Prevents predatory surge spikes.</p>
          </div>

          {/* Worker Payout % */}
          <div className="space-y-1.5 bg-[#F7F3EC] p-3.5 rounded-2xl border border-[#E0D5C8]">
            <label className="block text-[11px] font-bold text-[#527A62] uppercase tracking-wider">
              Worker Direct Wage %
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="1"
                min="70"
                max="95"
                value={editWorkerShare}
                onChange={(e) => setEditWorkerShare(parseFloat(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E0D5C8] text-[#171717] font-mono font-bold text-sm focus:outline-none focus:border-[#527A62]"
              />
              <span className="text-xs font-bold text-[#527A62]">%</span>
            </div>
            <p className="text-[10px] text-[#6F6A63]">Direct instant wage floor.</p>
          </div>

          {/* Cooperative Fee % */}
          <div className="space-y-1.5 bg-[#F7F3EC] p-3.5 rounded-2xl border border-[#E0D5C8]">
            <label className="block text-[11px] font-bold text-[#9A5B3A] uppercase tracking-wider">
              Cooperative Reserve %
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="1"
                min="0"
                max="25"
                value={editCoopShare}
                onChange={(e) => setEditCoopShare(parseFloat(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E0D5C8] text-[#171717] font-mono font-bold text-sm focus:outline-none focus:border-[#9A5B3A]"
              />
              <span className="text-xs font-bold text-[#9A5B3A]">%</span>
            </div>
            <p className="text-[10px] text-[#6F6A63]">Platform operations & tech.</p>
          </div>

          {/* Welfare Fund % */}
          <div className="space-y-1.5 bg-[#F7F3EC] p-3.5 rounded-2xl border border-[#E0D5C8]">
            <label className="block text-[11px] font-bold text-[#527A62] uppercase tracking-wider">
              Worker Welfare Pool %
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="1"
                min="0"
                max="20"
                value={editWelfareShare}
                onChange={(e) => setEditWelfareShare(parseFloat(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E0D5C8] text-[#171717] font-mono font-bold text-sm focus:outline-none focus:border-[#527A62]"
              />
              <span className="text-xs font-bold text-[#527A62]">%</span>
            </div>
            <p className="text-[10px] text-[#6F6A63]">Accident, medical & insurance.</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-[#6F6A63] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#9A5B3A]" />
            <span>Sum of splits: {editWorkerShare + editCoopShare + editWelfareShare}% (must equal 100%)</span>
          </div>
          <button
            type="submit"
            className="btn-primary py-2.5 px-5 text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Governance Caps</span>
          </button>
        </div>
      </form>

      {/* ========================================================================= */}
      {/* 2. PRICING RULES MATRIX */}
      {/* ========================================================================= */}
      <div className="bg-[#FFFFFF] rounded-3xl p-6 border border-[#E0D5C8] space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E0D5C8]">
          <div>
            <h3 className="text-sm font-bold text-[#171717] uppercase tracking-wider font-display">
              Active Cooperative Pricing Multipliers ({rules.length})
            </h3>
            <p className="text-xs text-[#6F6A63]">Deterministic rule adjustments triggered by weather, time, demand, or urgency</p>
          </div>

          <button
            onClick={() => setIsAddingRule(!isAddingRule)}
            className="btn-secondary py-2 px-4 text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingRule ? 'Cancel' : 'Add Multiplier Rule'}</span>
          </button>
        </div>

        {/* Add New Rule Form */}
        {isAddingRule && (
          <form onSubmit={handleCreateRule} className="p-4 bg-[#F7F3EC] rounded-2xl border border-[#E0D5C8] space-y-3">
            <h4 className="text-xs font-bold text-[#171717] uppercase tracking-wider">Create Cooperative Pricing Rule</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-[#6F6A63] font-semibold block mb-1">Factor Category</label>
                <select
                  value={newFactorType}
                  onChange={(e) => setNewFactorType(e.target.value)}
                  className="coop-input text-xs"
                >
                  <option value="weather">Weather (Rain, Monsoon)</option>
                  <option value="time">Time of Day (Night, Peak)</option>
                  <option value="day">Day of Week (Weekend)</option>
                  <option value="demand">Demand Level (High Demand)</option>
                  <option value="urgency">Urgency / Immediate</option>
                  <option value="locality">Locality / Zone</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-[#6F6A63] font-semibold block mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monsoon Heavy Rain"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="coop-input text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#6F6A63] font-semibold block mb-1">Multiplier Weight</label>
                <input
                  type="number"
                  step="0.05"
                  min="1.0"
                  max="1.75"
                  required
                  value={newMultiplier}
                  onChange={(e) => setNewMultiplier(parseFloat(e.target.value))}
                  className="coop-input text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-[#6F6A63] font-semibold block mb-1">Description</label>
              <input
                type="text"
                required
                placeholder="Reasoning approved by cooperative member vote"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="coop-input text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingRule(false)}
                className="btn-secondary py-1.5 px-3 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary py-1.5 px-4 text-xs font-bold shadow-sm"
              >
                Create Rule
              </button>
            </div>
          </form>
        )}

        {/* Rules Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F3EC] text-[#6F6A63] uppercase font-semibold border-b border-[#E0D5C8]">
              <tr>
                <th className="p-3">Category</th>
                <th className="p-3">Rule Name & Details</th>
                <th className="p-3">Multiplier Weight</th>
                <th className="p-3">State</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D5C8] text-[#171717]">
              {rules.map((rule) => {
                const isEditing = editingRuleId === rule.id;
                return (
                  <tr key={rule.id} className="hover:bg-[#F7F3EC]/50 transition-colors">
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full bg-[#EFE2D2] text-[#9A5B3A] text-[10px] font-extrabold uppercase font-mono">
                        {rule.factor_type}
                      </span>
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-[#171717]">{rule.name}</p>
                      <p className="text-[#6F6A63] text-[11px] mt-0.5">{rule.description}</p>
                    </td>
                    <td className="p-3">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="0.05"
                            min="1.0"
                            max="1.75"
                            value={editMultiplier}
                            onChange={(e) => setEditMultiplier(parseFloat(e.target.value))}
                            className="w-16 px-2 py-1 bg-white border border-[#9A5B3A] rounded text-xs font-mono font-bold text-[#171717]"
                          />
                          <button
                            onClick={() => handleSaveMultiplier(rule.id)}
                            className="px-2 py-1 rounded bg-[#527A62] text-white text-[10px] font-bold"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingRuleId(rule.id);
                            setEditMultiplier(rule.multiplier);
                          }}
                          className="font-mono font-black text-sm text-[#9A5B3A] hover:underline"
                        >
                          +{Math.round((rule.multiplier - 1) * 100)}% ({rule.multiplier}x)
                        </button>
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleActive(rule)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase transition-all ${
                          rule.is_active
                            ? 'badge-success'
                            : 'badge-neutral opacity-60'
                        }`}
                      >
                        {rule.is_active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1.5 rounded-lg text-[#A94A43] hover:bg-[#A94A43]/10 transition-colors"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Interactive Pricing Simulator */}
      <PriceBreakdownView serviceId="cat-electrician" />
    </div>
  );
};
export default AdminPricingManager;
