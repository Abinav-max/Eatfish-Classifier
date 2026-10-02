import React from 'react';
import FishLogo from './FishLogo';
import { Waves, Sparkles } from 'lucide-react';

export default function Navbar({ activeScreen, setActiveScreen, isBackendOnline }) {
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'identify', label: 'Identify' },
    { id: 'about', label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 safe-pt transition-all">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => setActiveScreen('home')}
          className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-lg p-1 text-left"
          aria-label="EatFish Home"
        >
          <FishLogo className="w-9 h-9 transition-transform group-hover:scale-105" />
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
              EatFish
            </span>
          </div>
        </button>

        {/* Desktop/Tablet Navigation Links */}
        <nav className="hidden sm:flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/60" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = activeScreen === item.id || (item.id === 'identify' && ['capture', 'preview', 'result'].includes(activeScreen));
            return (
              <button
                key={item.id}
                onClick={() => setActiveScreen(item.id === 'identify' ? 'capture' : item.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-teal-700 shadow-sm border border-slate-200/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Top Right: Status & Server Settings Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-teal-50 hover:bg-teal-100/80 active:scale-95 text-teal-800 border border-teal-200/70 transition-all cursor-pointer shadow-2xs"
            title="Click to view or edit backend server address"
            id="btn-server-status-pill"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendOnline ? 'bg-emerald-500 ring-2 ring-emerald-200 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="font-mono text-[11px]">
              {isBackendOnline ? 'AI Online' : 'Set Server'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
