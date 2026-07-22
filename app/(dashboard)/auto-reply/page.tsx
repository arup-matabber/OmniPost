"use client";

import { useState, useEffect, Suspense } from 'react';
import { Bot, Plus, Settings, Power, PowerOff, Trash2, Edit2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import RuleBuilderModal from './RuleBuilderModal';

function AutoReplyDashboard() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auto-reply/rules');
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/auto-reply/rules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive })
      });
      if (res.ok) {
        setRules(prev => prev.map(r => r.id === id ? { ...r, active: !currentActive } : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;
    try {
      const res = await fetch(`/api/auto-reply/rules/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRules(prev => prev.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openBuilder = (rule?: any) => {
    setEditingRule(rule || null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
            <Bot className="text-indigo-500" /> Auto-Reply Rules
          </h1>
          <p className="text-zinc-500 mt-2">Create intelligent rules to automatically reply to comments on your posts.</p>
        </div>
        <Button onClick={() => openBuilder()} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
          <Plus size={16} /> Create Rule
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
        </div>
      ) : rules.length === 0 ? (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center bg-zinc-50 dark:bg-zinc-900/50">
          <Bot className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">No rules yet</h3>
          <p className="text-zinc-500 mb-6">Create your first auto-reply rule to engage with your audience automatically.</p>
          <Button onClick={() => openBuilder()} variant="outline" className="border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10">
            Create First Rule
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {rules.map(rule => (
            <div key={rule.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex items-center justify-between transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="uppercase tracking-wider">{rule.platform}</Badge>
                  <Badge variant={rule.active ? "default" : "secondary"} className={rule.active ? "bg-green-500/10 text-green-600 dark:text-green-500 hover:bg-green-500/20 border-green-500/20" : ""}>
                    {rule.active ? "Active" : "Paused"}
                  </Badge>
                  {rule.useAi && (
                    <Badge variant="outline" className="border-purple-500/30 text-purple-600 dark:text-purple-400">
                      <Bot size={12} className="mr-1" /> AI Generated
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-col gap-1">
                  <div className="text-zinc-900 dark:text-white font-medium">
                    Trigger: <span className="text-zinc-500 font-normal">{rule.triggerType === 'keyword' ? `Keywords (${rule.keywords.join(', ')})` : 'All Comments'}</span>
                  </div>
                  <div className="text-zinc-500 text-sm line-clamp-1">
                    {rule.useAi ? `Tone: ${rule.aiTone}` : `Template: "${rule.replyTemplate}"`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleToggle(rule.id, rule.active)} title={rule.active ? "Pause rule" : "Activate rule"}>
                  {rule.active ? <PowerOff className="text-orange-500 dark:text-orange-400 w-4 h-4" /> : <Power className="text-green-600 dark:text-green-400 w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openBuilder(rule)} title="Edit rule">
                  <Edit2 className="text-zinc-400 w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)} title="Delete rule">
                  <Trash2 className="text-red-500 dark:text-red-400 w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <RuleBuilderModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          ruleToEdit={editingRule} 
          onSaved={fetchRules} 
        />
      )}
    </div>
  );
}

export default function AutoReplyPage() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>}>
      <AutoReplyDashboard />
    </Suspense>
  );
}
