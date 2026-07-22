"use client";

import { useState, useEffect } from 'react';
import { X, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RuleBuilderModal({ isOpen, onClose, ruleToEdit, onSaved }: any) {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [platform, setPlatform] = useState(ruleToEdit?.platform || '');
  const [accountId, setAccountId] = useState(ruleToEdit?.accountId || '');
  const [triggerType, setTriggerType] = useState(ruleToEdit?.triggerType || 'all');
  const [keywords, setKeywords] = useState<string[]>(ruleToEdit?.keywords || []);
  const [keywordInput, setKeywordInput] = useState('');
  const [useAi, setUseAi] = useState(ruleToEdit ? ruleToEdit.useAi : false);
  const [aiTone, setAiTone] = useState(ruleToEdit?.aiTone || 'friendly');
  const [replyTemplate, setReplyTemplate] = useState(ruleToEdit?.replyTemplate || '');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/social/accounts');
        if (res.ok) {
          const data = await res.json();
          setAccounts(data.accounts || []);
          if (!ruleToEdit && data.accounts?.length > 0) {
            setPlatform(data.accounts[0].platform);
            setAccountId(data.accounts[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, [ruleToEdit]);

  const handleAddKeyword = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault();
      if (!keywords.includes(keywordInput.trim())) {
        setKeywords([...keywords, keywordInput.trim()]);
      }
      setKeywordInput('');
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter(k => k !== kw));
  };

  const handleSave = async () => {
    setErrorMsg('');
    if (!platform || !accountId) {
      setErrorMsg('Please select an account');
      return;
    }
    if (triggerType === 'keyword' && keywords.length === 0) {
      setErrorMsg('Please add at least one keyword for keyword trigger');
      return;
    }
    if (!useAi && !replyTemplate.trim()) {
      setErrorMsg('Please provide a reply template');
      return;
    }

    setSaving(true);
    try {
      const url = ruleToEdit ? `/api/auto-reply/rules/${ruleToEdit.id}` : `/api/auto-reply/rules`;
      const method = ruleToEdit ? 'PUT' : 'POST';

      const payload = {
        platform,
        accountId,
        triggerType,
        keywords,
        useAi,
        aiTone,
        replyTemplate,
        active: ruleToEdit ? ruleToEdit.active : true
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        onSaved();
        onClose();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to save rule');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#0f0f1a] border border-zinc-200 dark:border-[#1e1e2e] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-zinc-100 dark:border-[#1e1e2e] sticky top-0 bg-white dark:bg-[#0f0f1a] z-10">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            {ruleToEdit ? 'Edit Rule' : 'Create Auto-Reply Rule'}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-800 dark:hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {errorMsg && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-200 dark:border-red-900/30">
              {errorMsg}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Account</label>
              <select 
                className="w-full bg-white dark:bg-[#0a0a0f] border border-zinc-300 dark:border-[#1e1e2e] rounded-lg p-2.5 text-zinc-900 dark:text-white outline-none focus:border-indigo-500"
                value={`${platform}:${accountId}`}
                onChange={(e) => {
                  const [p, a] = e.target.value.split(':');
                  setPlatform(p);
                  setAccountId(a);
                }}
                disabled={loading}
              >
                {accounts.length === 0 ? <option value="">No accounts connected</option> : null}
                {accounts.map(acc => (
                  <option key={acc.id} value={`${acc.platform}:${acc.id}`}>
                    {acc.platformAccountName} ({acc.platform})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Trigger Condition</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <input 
                    type="radio" 
                    name="triggerType" 
                    value="all" 
                    checked={triggerType === 'all'} 
                    onChange={() => setTriggerType('all')}
                    className="accent-indigo-500"
                  />
                  Any comment
                </label>
                <label className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <input 
                    type="radio" 
                    name="triggerType" 
                    value="keyword" 
                    checked={triggerType === 'keyword'} 
                    onChange={() => setTriggerType('keyword')}
                    className="accent-indigo-500"
                  />
                  Specific keywords
                </label>
              </div>
            </div>

            {triggerType === 'keyword' && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Keywords</label>
                <div className="bg-white dark:bg-[#0a0a0f] border border-zinc-300 dark:border-[#1e1e2e] rounded-lg p-2 focus-within:border-indigo-500 flex flex-wrap gap-2">
                  {keywords.map(kw => (
                    <span key={kw} className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-sm px-2 py-1 rounded-md flex items-center gap-1">
                      {kw}
                      <X size={12} className="cursor-pointer hover:text-indigo-900 dark:hover:text-white" onClick={() => removeKeyword(kw)} />
                    </span>
                  ))}
                  <input 
                    type="text" 
                    placeholder="Type keyword and press Enter" 
                    className="flex-1 bg-transparent border-none outline-none text-zinc-900 dark:text-white min-w-[150px] text-sm py-1"
                    value={keywordInput}
                    onChange={e => setKeywordInput(e.target.value)}
                    onKeyDown={handleAddKeyword}
                  />
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-zinc-100 dark:border-[#1e1e2e]">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Reply Mode</label>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <input 
                    type="radio" 
                    name="useAi" 
                    checked={!useAi} 
                    onChange={() => setUseAi(false)}
                    className="accent-indigo-500"
                  />
                  Fixed Template
                </label>
                <label className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <input 
                    type="radio" 
                    name="useAi" 
                    checked={useAi} 
                    onChange={() => setUseAi(true)}
                    className="accent-purple-500"
                  />
                  AI Generated (Pro)
                </label>
              </div>

              {!useAi ? (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Reply Template</label>
                  <textarea 
                    className="w-full bg-white dark:bg-[#0a0a0f] border border-zinc-300 dark:border-[#1e1e2e] rounded-lg p-3 text-zinc-900 dark:text-white outline-none focus:border-indigo-500 min-h-[100px]"
                    placeholder="E.g., Thanks for commenting! Please check your DMs."
                    value={replyTemplate}
                    onChange={e => setReplyTemplate(e.target.value)}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-500/20 p-4 rounded-lg flex gap-3 text-sm text-purple-800 dark:text-purple-300">
                    <Info className="shrink-0 mt-0.5" size={16} />
                    <p>OmniPost will read the user's comment and generate a personalized, context-aware reply based on your selected tone.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">AI Tone</label>
                    <select 
                      className="w-full bg-white dark:bg-[#0a0a0f] border border-zinc-300 dark:border-[#1e1e2e] rounded-lg p-2.5 text-zinc-900 dark:text-white outline-none focus:border-purple-500"
                      value={aiTone}
                      onChange={e => setAiTone(e.target.value)}
                    >
                      <option value="friendly">Friendly & Warm</option>
                      <option value="professional">Professional & Polite</option>
                      <option value="humorous">Humorous & Witty</option>
                      <option value="sarcastic">Sarcastic (Careful!)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-zinc-100 dark:border-[#1e1e2e] bg-zinc-50 dark:bg-[#0a0a0f] sticky bottom-0 rounded-b-2xl">
          <Button variant="ghost" onClick={onClose} disabled={saving} className="text-zinc-600 dark:text-zinc-400">Cancel</Button>
          <Button onClick={handleSave} disabled={saving || accounts.length === 0} className={useAi ? "bg-purple-600 hover:bg-purple-700" : "bg-indigo-600 hover:bg-indigo-700"}>
            {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
            {ruleToEdit ? 'Save Changes' : 'Create Rule'}
          </Button>
        </div>
      </div>
    </div>
  );
}
