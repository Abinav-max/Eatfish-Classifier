import React from 'react';
import { CheckCircle2, RotateCcw, Download, Info, ShieldAlert, Sparkles } from 'lucide-react';

export default function PredictionResult({
  result,
  imageData,
  onIdentifyAnother,
}) {
  if (!result) return null;

  const { predicted_class, confidence, probabilities = {} } = result;

  // Format confidence as percentage
  const formattedConfidence = (confidence * 100).toFixed(1);

  // Sort classes with predicted / highest on top
  const sortedClasses = Object.entries(probabilities).sort((a, b) => b[1] - a[1]);

  // Common species information dictionary for helpful contextual guidance
  const speciesMeta = {
    anchovy: {
      common: 'Nethili / Anchovy',
      scientific: 'Engraulidae',
      desc: 'Small, slender silver forage fish common in coastal saltwater waters.',
    },
    emperor: {
      common: 'Emperor Bream / Vilai',
      scientific: 'Lethrinidae',
      desc: 'Deep-bodied marine reef fish known for prominent snout and thick lips.',
    },
    sangara: {
      common: 'Red Snapper / Sankara',
      scientific: 'Lutjanus campechanus',
      desc: 'Prized marine fish characterized by rose-red coloration and pointed anal fin.',
    },
  };

  const currentMeta = speciesMeta[predicted_class?.toLowerCase()] || {
    common: predicted_class,
    scientific: 'Teleostei',
    desc: 'Marine fish identified by MobileNetV3 visual features.',
  };

  // Download simple text/image summary
  const handleDownload = () => {
    const textContent = `EatFish AI Classification Report
======================================
Predicted Species: ${predicted_class.toUpperCase()} (${currentMeta.common})
Confidence: ${formattedConfidence}%
Scientific Family: ${currentMeta.scientific}

Class Probabilities Breakdown:
${sortedClasses.map(([cls, prob]) => ` - ${cls}: ${(prob * 100).toFixed(2)}%`).join('\n')}

Model: MobileNetV3Small
Disclaimer: Model confidence is a statistical probability and not a guaranteed taxonomic identification.
Generated: ${new Date().toLocaleString()}
`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eatfish_prediction_${predicted_class}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 animate-fadeIn">
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
        {/* Header & Status Badge */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Prediction Result
          </h2>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200/70 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Analysis Complete</span>
          </div>
        </div>

        {/* Top Split: Image + Highlighted Species Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Fish Image Thumbnail */}
          <div className="relative aspect-4/3 sm:aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 shadow-inner flex items-center justify-center">
            <img
              src={imageData.dataUrl}
              alt={predicted_class}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/60 backdrop-blur-xs rounded-md text-[10px] text-white/90 font-medium">
              Source Image
            </div>
          </div>

          {/* Top Prediction Details */}
          <div className="flex flex-col justify-between p-4 bg-teal-50/50 rounded-2xl border border-teal-100/90">
            <div>
              <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                Predicted Fish
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 capitalize mt-1 leading-tight">
                {predicted_class}
              </h3>
              <p className="text-xs font-semibold text-teal-700 mt-0.5">
                {currentMeta.common}
              </p>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                {currentMeta.desc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-teal-200/60">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Model Confidence
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl sm:text-4xl font-extrabold text-teal-700 tracking-tight font-mono">
                  {formattedConfidence}%
                </span>
                <span className="text-xs text-slate-500 font-medium">match</span>
              </div>
            </div>
          </div>
        </div>

        {/* Full Class Probabilities Breakdown */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Class Probabilities
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              {sortedClasses.length} Total Classes
            </span>
          </div>

          <div className="space-y-3">
            {sortedClasses.map(([cls, prob]) => {
              const isTop = cls.toLowerCase() === predicted_class.toLowerCase();
              const pct = (prob * 100).toFixed(1);
              const barWidth = Math.max(Number(pct), 2); // min 2% visible width

              return (
                <div key={cls} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className={`capitalize ${isTop ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>
                      {cls} {isTop && <span className="text-teal-700 text-[10px] ml-1 font-normal">• Top Match</span>}
                    </span>
                    <span className={`font-mono text-xs ${isTop ? 'text-teal-700 font-bold' : 'text-slate-500'}`}>
                      {pct}%
                    </span>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        isTop
                          ? 'bg-teal-600 shadow-xs'
                          : 'bg-slate-300'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Disclaimer Note (Required by prompt) */}
        <div className="mt-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-700">Disclaimer: </span>
            Model confidence indicates mathematical correlation with training samples and is not a guaranteed biological identification. Lighting, angle, or water reflections can influence predictions.
          </p>
        </div>

        {/* Bottom Actions Row */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={onIdentifyAnother}
            className="h-13 bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-slate-800 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            id="btn-identify-another"
          >
            <RotateCcw className="w-4 h-4 text-teal-700" />
            <span>Identify Another Fish</span>
          </button>

          <button
            onClick={handleDownload}
            className="h-13 bg-teal-700 hover:bg-teal-800 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-teal-700/20 transition-all cursor-pointer"
            id="btn-download-result"
          >
            <Download className="w-4 h-4" />
            <span>Download Result</span>
          </button>
        </div>
      </div>
    </div>
  );
}
