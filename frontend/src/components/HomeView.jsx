import React from 'react';
import FishLogo from './FishLogo';
import { Camera, Image as ImageIcon, ShieldCheck, Zap, Cpu, ChevronRight, HelpCircle } from 'lucide-react';

export default function HomeView({ onStartIdentify, onOpenGallery, supportedClasses = [] }) {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto px-4 py-6 sm:py-10 animate-fadeIn">
      {/* Top Tagline Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/70 text-teal-800 text-xs font-semibold mb-6 shadow-xs">
        <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-ping" />
        <span>MobileNetV3 AI Fish Identification</span>
      </div>

      {/* Main Hero Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-teal-600/10 rounded-2xl ring-8 ring-teal-50">
            <FishLogo className="w-16 h-16 sm:w-20 sm:h-20" />
          </div>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Identify Fish with <span className="text-teal-700 underline decoration-teal-300 decoration-wavy decoration-2">AI</span>
        </h1>
        
        <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-md mx-auto leading-relaxed">
          Upload a photo or use your camera to classify fish species instantly with precision deep learning.
        </p>

        {/* Small metric chips */}
        <div className="flex items-center justify-center gap-3 mt-4 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md">
            Fast
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md">
            Accurate
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md">
            Easy to Use
          </span>
        </div>
      </div>

      {/* Primary Actions Card */}
      <div className="w-full bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm mb-8 space-y-3.5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-1">
          Quick Start
        </h2>

        {/* Prominent Start Identification (Camera) */}
        <button
          onClick={onStartIdentify}
          className="w-full h-14 bg-teal-700 hover:bg-teal-800 active:scale-[0.99] text-white font-bold text-base rounded-xl flex items-center justify-center gap-3 shadow-md shadow-teal-700/20 transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-teal-200"
          id="btn-start-identification"
        >
          <Camera className="w-6 h-6 stroke-[2.2]" />
          <span>Start Identification</span>
        </button>

        {/* Secondary Upload from Gallery */}
        <button
          onClick={onOpenGallery}
          className="w-full h-13 bg-slate-50 hover:bg-slate-100 active:scale-[0.99] text-slate-700 font-semibold text-sm rounded-xl flex items-center justify-center gap-2.5 border border-slate-200 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-300"
          id="btn-home-upload-gallery"
        >
          <ImageIcon className="w-5 h-5 text-teal-600 stroke-2" />
          <span>Upload from Gallery</span>
        </button>
      </div>

      {/* Supported Species Chips */}
      {supportedClasses.length > 0 && (
        <div className="w-full bg-teal-50/50 rounded-xl p-4 border border-teal-100 mb-8 text-center">
          <p className="text-xs font-bold text-teal-900 mb-2 uppercase tracking-wide">
            Model Trained For 3 Core Species:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {supportedClasses.map((cls) => (
              <span
                key={cls}
                className="capitalize px-3 py-1 bg-white rounded-full text-xs font-semibold text-teal-800 border border-teal-200/70 shadow-2xs"
              >
                🐟 {cls}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 3 Core Value Pillars (Matching design reference) */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left">
        {/* Privacy */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-700 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-900">Privacy Focused</h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-snug">
              Images are processed securely and never stored permanently.
            </p>
          </div>
        </div>

        {/* Instant Results */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-700 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-900">Instant Results</h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-snug">
              High-speed neural inference delivers species predictions in seconds.
            </p>
          </div>
        </div>

        {/* Trained with AI */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-700 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-900">Trained with AI</h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-snug">
              Powered by an optimized MobileNetV3Small network.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
