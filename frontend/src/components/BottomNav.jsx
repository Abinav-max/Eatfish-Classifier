import React from 'react';
import { Home, Camera, Info } from 'lucide-react';

export default function BottomNav({ activeScreen, setActiveScreen }) {
  const isIdentifyActive = ['capture', 'preview', 'result'].includes(activeScreen);

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 safe-pb shadow-lg"
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-3 items-center h-16 px-4">
        {/* Home */}
        <button
          onClick={() => setActiveScreen('home')}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 transition-colors ${
            activeScreen === 'home' ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="Navigate to Home"
        >
          <Home className={`w-5 h-5 ${activeScreen === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[11px]">Home</span>
        </button>

        {/* Identify (Elevated center button) */}
        <div className="flex justify-center">
          <button
            onClick={() => setActiveScreen('capture')}
            className={`flex flex-col items-center justify-center gap-0.5 px-4 py-1.5 rounded-full transition-all ${
              isIdentifyActive
                ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20'
                : 'bg-teal-50 text-teal-800 border border-teal-200/80 hover:bg-teal-100'
            }`}
            aria-label="Open Fish Identification Camera"
          >
            <Camera className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] font-bold">Identify</span>
          </button>
        </div>

        {/* About */}
        <button
          onClick={() => setActiveScreen('about')}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 transition-colors ${
            activeScreen === 'about' ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="Navigate to About"
        >
          <Info className={`w-5 h-5 ${activeScreen === 'about' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[11px]">About</span>
        </button>
      </div>
    </nav>
  );
}
