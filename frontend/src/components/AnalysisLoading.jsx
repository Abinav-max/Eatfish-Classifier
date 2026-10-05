import React, { useState, useEffect } from 'react';
import FishLogo from './FishLogo';
import { Cpu, Scan, Layers, CheckCircle } from 'lucide-react';

export default function AnalysisLoading({ imageData }) {
  const [progress, setProgress] = useState(10);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  const stages = [
    {
      title: 'Resizing to 224×224 Tensor',
      desc: 'Applying LANCZOS antialiasing & aspect-preserving normalization',
      icon: Scan,
    },
    {
      title: 'Morphological Feature Extraction',
      desc: 'Scanning dorsal fin, gill curvature & scale texture patterns',
      icon: Layers,
    },
    {
      title: 'MobileNetV3 Neural Inference',
      desc: 'Evaluating multi-view feature maps through deep convolutional layers',
      icon: Cpu,
    },
    {
      title: 'Calibrating Species Probabilities',
      desc: 'Ensembling predictions across oriented views & confidence scoring',
      icon: CheckCircle,
    },
  ];

  useEffect(() => {
    // Smooth progress animation over ~2.2 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) {
          clearInterval(interval);
          return 98;
        }
        const increment = Math.max(1, Math.floor((100 - prev) / 6));
        return Math.min(prev + increment, 98);
      });
    }, 120);

    const t1 = setTimeout(() => setCurrentStageIndex(1), 550);
    const t2 = setTimeout(() => setCurrentStageIndex(2), 1150);
    const t3 = setTimeout(() => setCurrentStageIndex(3), 1750);

    return () => {
      clearInterval(interval);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const ActiveIcon = stages[currentStageIndex].icon;

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 flex flex-col items-center justify-center animate-fadeIn text-center">
      {/* Visual Scanning Frame over captured thumbnail if available */}
      {imageData?.dataUrl ? (
        <div className="relative w-44 h-44 rounded-2xl overflow-hidden shadow-lg border-2 border-teal-500/50 mb-6 bg-slate-950 flex items-center justify-center group">
          <img
            src={imageData.dataUrl}
            alt="Fish being analyzed"
            className="w-full h-full object-cover filter brightness-90 contrast-105"
          />

          {/* Active Matrix Scanning Grid Overlay */}
          <div className="absolute inset-0 bg-teal-900/20 backdrop-contrast-125" />
          
          {/* Sweeping Laser Scan Line */}
          <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-teal-300 to-transparent shadow-[0_0_15px_#2dd4bf] animate-[scan_1.6s_ease-in-out_infinite]" />

          {/* Reticle Corner Brackets */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-teal-400" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-teal-400" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-teal-400" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-teal-400" />

          {/* Target Model Dimension Tag */}
          <div className="absolute bottom-2 px-2 py-0.5 bg-black/75 rounded text-[10px] font-mono font-bold text-teal-300 border border-teal-500/30">
            224 × 224 × 3 RGB
          </div>
        </div>
      ) : (
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-teal-400/20 animate-ping" />
          <div className="relative p-5 bg-white rounded-3xl border border-teal-100 shadow-md">
            <FishLogo className="w-14 h-14 animate-bounce" />
          </div>
        </div>
      )}

      {/* Dynamic Status Title */}
      <div className="flex items-center justify-center gap-2 mb-1">
        <span className="p-1 bg-teal-50 text-teal-700 rounded-lg animate-pulse">
          <ActiveIcon className="w-4 h-4" />
        </span>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          {stages[currentStageIndex].title}
        </h3>
      </div>

      <p className="text-xs text-slate-500 max-w-sm mt-0.5 leading-relaxed min-h-[36px] flex items-center justify-center">
        {stages[currentStageIndex].desc}
      </p>

      {/* Progress Bar Container with Percentage */}
      <div className="w-full max-w-xs mt-5">
        <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-slate-500 mb-1.5 px-0.5">
          <span className="text-teal-700">Deep AI Analysis</span>
          <span>{progress}%</span>
        </div>

        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-600 rounded-full transition-all duration-300 ease-out shadow-xs"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Multi-stage checklist indicators */}
      <div className="grid grid-cols-4 gap-2 mt-6 w-full max-w-xs">
        {stages.map((stg, idx) => {
          const isDone = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          return (
            <div
              key={stg.title}
              className={`h-1.5 rounded-full transition-colors ${
                isDone
                  ? 'bg-teal-600'
                  : isCurrent
                  ? 'bg-teal-400 animate-pulse'
                  : 'bg-slate-200'
              }`}
              title={stg.title}
            />
          );
        })}
      </div>
    </div>
  );
}
