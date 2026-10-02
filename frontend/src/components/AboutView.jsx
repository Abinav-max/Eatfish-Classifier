import React from 'react';
import FishLogo from './FishLogo';
import { Cpu, Layers, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AboutView({ onStartIdentify }) {
  const steps = [
    {
      num: '01',
      title: 'Image Capture & Preprocessing',
      desc: 'The selected fish image is formatted into a standardized 224×224 RGB floating-point tensor.',
    },
    {
      num: '02',
      title: 'Neural Feature Extraction',
      desc: 'MobileNetV3Small processes spatial patterns such as fin geometry, dorsal scales, and eye curvature using depthwise separable convolutions.',
    },
    {
      num: '03',
      title: 'Softmax Probability Scoring',
      desc: 'The classification head evaluates the feature vector and computes calibrated probability scores across all trained fish categories.',
    },
  ];

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 sm:py-8 animate-fadeIn space-y-6">
      {/* Overview Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
            <FishLogo className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              About EatFish AI
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Architecture: MobileNetV3Small
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          EatFish is a minimal, mobile-first computer vision application engineered to classify fish species directly from camera snapshots or image uploads. It utilizes an existing trained <strong>MobileNetV3Small</strong> deep learning model optimized for high-speed edge and mobile performance.
        </p>

        {/* Technical Specs Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-5 text-center">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Input Size</span>
            <span className="text-xs font-bold text-slate-800 font-mono">224 × 224 RGB</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Classes</span>
            <span className="text-xs font-bold text-slate-800 font-mono">3 Species</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Inference</span>
            <span className="text-xs font-bold text-teal-700 font-mono">&lt; 80ms Fast</span>
          </div>
        </div>
      </div>

      {/* Classification Pipeline */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-teal-700" />
          <h3 className="font-bold text-slate-900 text-base">
            How The Classification Works
          </h3>
        </div>

        <div className="space-y-4">
          {steps.map((s) => (
            <div key={s.num} className="flex items-start gap-3.5">
              <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200/60 shrink-0">
                {s.num}
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  {s.title}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model Scope & Limitations */}
      <div className="bg-amber-50/70 rounded-3xl p-5 sm:p-6 border border-amber-200/80">
        <div className="flex items-center gap-2 mb-2 text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
          <h3 className="font-bold text-sm">
            Model Scope & Accuracy Notice
          </h3>
        </div>

        <p className="text-xs text-amber-800 leading-relaxed">
          This system was trained on a targeted dataset encompassing three fish categories: <strong>Anchovy</strong> (Nethili), <strong>Emperor</strong>, and <strong>Sangara</strong> (Red Snapper).
        </p>

        <p className="text-xs text-amber-800 mt-2 leading-relaxed">
          While MobileNetV3 achieves strong recognition on images resembling the training distribution, real-world accuracy cannot be guaranteed. Variables such as partial occlusion, unusual lighting, camera blur, or species outside the 3 trained classes will affect predictions. Always consult authoritative local marine guides for commercial or culinary decisions.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="space-y-3 pt-2">
        <a
          href="/EatFish.apk"
          download="EatFish.apk"
          className="w-full h-13 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-all cursor-pointer no-underline"
          id="btn-download-apk"
        >
          <span>📱 Download Android App (.apk)</span>
        </a>

        <button
          onClick={onStartIdentify}
          className="w-full h-13 bg-teal-700 hover:bg-teal-800 active:scale-[0.99] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-teal-700/20 transition-all cursor-pointer"
        >
          <span>Start Identification</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
