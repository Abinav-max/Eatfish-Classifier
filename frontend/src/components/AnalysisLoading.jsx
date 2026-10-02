import React from 'react';
import FishLogo from './FishLogo';

export default function AnalysisLoading() {
  return (
    <div className="w-full max-w-lg mx-auto px-4 py-12 flex flex-col items-center justify-center animate-fadeIn text-center">
      <div className="relative mb-6">
        {/* Pulsing ring */}
        <div className="absolute inset-0 rounded-full bg-teal-400/20 animate-ping" />
        <div className="relative p-5 bg-white rounded-3xl border border-teal-100 shadow-md">
          <FishLogo className="w-14 h-14 animate-bounce" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-900 tracking-tight">
        Analyzing Fish Species...
      </h3>
      
      <p className="text-sm text-slate-500 max-w-xs mt-1.5 leading-relaxed">
        Running image tensor through MobileNetV3Small neural network weights.
      </p>

      {/* Progress track */}
      <div className="w-48 h-1.5 bg-slate-100 rounded-full mt-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-teal-500 to-teal-700 rounded-full w-2/3 animate-[pulse_1.2s_infinite]" />
      </div>
    </div>
  );
}
