import React, { useState } from 'react';
import { getApiBaseUrl, setApiBaseUrl } from '../api/client';
import { Globe, CheckCircle2, AlertCircle, RefreshCw, X, Server } from 'lucide-react';

export default function ServerSettingsModal({ isOpen, onClose, onServerUpdated }) {
  const [urlInput, setUrlInput] = useState(getApiBaseUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { ok: boolean, message: string }

  if (!isOpen) return null;

  const handleTest = async () => {
    const trimmed = urlInput.trim().replace(/\/+$/, '');
    if (!trimmed) {
      setTestResult({ ok: false, message: 'Please enter a valid URL.' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch(`${trimmed}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setTestResult({
          ok: true,
          message: `Connected! Service: ${data.service || 'EatFish AI'} (${data.classes_count || 3} classes active)`,
        });
      } else {
        setTestResult({
          ok: false,
          message: `Server returned HTTP ${res.status}: ${res.statusText}`,
        });
      }
    } catch (err) {
      setTestResult({
        ok: false,
        message: err.message === 'Failed to fetch'
          ? 'Cannot reach this URL. Verify the server is running and accessible over the internet.'
          : err.message,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    const trimmed = urlInput.trim().replace(/\/+$/, '');
    setApiBaseUrl(trimmed);
    if (onServerUpdated) onServerUpdated(trimmed);
    onClose();
  };

  const handleReset = () => {
    setApiBaseUrl('');
    const defaultUrl = getApiBaseUrl();
    setUrlInput(defaultUrl);
    setTestResult(null);
    if (onServerUpdated) onServerUpdated(defaultUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Backend Connection</h3>
              <p className="text-[11px] text-slate-500">Configure server address for remote / client devices</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Box */}
        <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100/80 mb-4 text-xs text-teal-900 leading-relaxed">
          <span className="font-bold">Client Delivery Notice:</span> For clients not on your Wi-Fi, enter your public backend URL (e.g., from <strong className="font-mono">ngrok</strong> or cloud host like <strong className="font-mono">Render</strong>).
        </div>

        {/* Input */}
        <div className="space-y-1.5 mb-4">
          <label className="text-xs font-bold text-slate-700 block">
            Backend API URL
          </label>
          <div className="relative">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://your-public-api.ngrok-free.app"
              className="w-full h-11 pl-3 pr-10 text-xs sm:text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-slate-800"
            />
            <Globe className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`p-3 rounded-xl mb-4 text-xs flex items-start gap-2 border ${
              testResult.ok
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {testResult.ok ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <p className="leading-snug">{testResult.message}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleTest}
            disabled={testing}
            className="w-full h-10 bg-slate-100 hover:bg-slate-200 active:scale-99 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Testing Endpoint...' : 'Test Connection'}</span>
          </button>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleReset}
              className="h-11 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl border border-slate-200 transition-all cursor-pointer"
            >
              Reset Default
            </button>
            <button
              onClick={handleSave}
              className="h-11 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-700/20 transition-all cursor-pointer"
            >
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
