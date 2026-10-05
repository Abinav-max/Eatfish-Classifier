import React, { useRef } from 'react';
import { Sparkles, RefreshCw, Image as ImageIcon, ArrowLeft } from 'lucide-react';

export default function ImagePreview({
  imageData,
  onAnalyze,
  onRetake,
  onChangeImage,
  isAnalyzing,
}) {
  const fileInputRef = useRef(null);

  const handleNewFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      onChangeImage({
        dataUrl: event.target.result,
        blob: file,
        source: 'gallery',
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-4 animate-fadeIn">
      {/* Hidden file input for changing image */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        onChange={handleNewFile}
        className="hidden"
        id="preview-file-input"
      />

      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={onRetake}
              className="p-1.5 -ml-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Back to camera"
              aria-label="Back to camera"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-slate-900 text-base">Image Preview</h2>
          </div>

          <span className="px-2.5 py-1 text-xs font-semibold bg-teal-50 text-teal-700 rounded-full border border-teal-200/70">
            Ready to Analyze
          </span>
        </div>

        {/* Image Display Frame */}
        <div className="relative aspect-4/3 w-full bg-slate-950 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
          <img
            src={imageData.dataUrl}
            alt="Captured Fish"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Source and Model Spec Info */}
        <div className="flex items-center justify-between mt-3 text-xs text-slate-500 px-1">
          <span>Source: {imageData.source === 'camera' ? 'Camera Snapshot' : 'Gallery File'}</span>
          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60 font-semibold">
            Auto-Resize: 224×224 RGB
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 space-y-3">
          {/* Primary Action: Analyze Fish */}
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className={`w-full h-14 bg-teal-700 hover:bg-teal-800 active:scale-[0.99] text-white font-bold text-base rounded-xl flex items-center justify-center gap-3 shadow-md shadow-teal-700/20 transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-teal-200 ${
              isAnalyzing ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            id="btn-confirm-analyze"
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing Model Inference...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 stroke-[2.2]" />
                <span>Analyze Fish</span>
              </>
            )}
          </button>

          {/* Secondary Buttons Row: Retake and Change Image */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onRetake}
              disabled={isAnalyzing}
              className="h-12 bg-slate-50 hover:bg-slate-100 active:scale-[0.99] text-slate-700 font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 border border-slate-200 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-300"
              id="btn-preview-retake"
            >
              <RefreshCw className="w-4 h-4 text-teal-600" />
              <span>Retake Photo</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
              className="h-12 bg-slate-50 hover:bg-slate-100 active:scale-[0.99] text-slate-700 font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 border border-slate-200 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-300"
              id="btn-preview-change-image"
            >
              <ImageIcon className="w-4 h-4 text-teal-600" />
              <span>Change Image</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
