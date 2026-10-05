import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import HomeView from './components/HomeView';
import CameraCapture from './components/CameraCapture';
import ImagePreview from './components/ImagePreview';
import AnalysisLoading from './components/AnalysisLoading';
import PredictionResult from './components/PredictionResult';
import AboutView from './components/AboutView';
import { checkBackendHealth, predictFishImage } from './api/client';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  // Navigation state: 'home' | 'capture' | 'preview' | 'result' | 'about'
  const [activeScreen, setActiveScreen] = useState('home');

  // Image data state: { dataUrl: string, blob: Blob, source: 'camera' | 'gallery', name: string } | null
  const [selectedImage, setSelectedImage] = useState(null);

  // Prediction response state: { predicted_class: string, confidence: number, probabilities: Record<string, number> } | null
  const [predictionResult, setPredictionResult] = useState(null);

  // Processing & connection states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [supportedClasses, setSupportedClasses] = useState([]);

  // Hidden file input for home screen gallery launch
  const homeFileInputRef = useRef(null);

  // Health check on startup and periodically
  useEffect(() => {
    let isMounted = true;
    const verifyHealth = async () => {
      const health = await checkBackendHealth();
      if (isMounted) {
        setIsBackendOnline(health.ok);
        if (health.ok && health.data?.classes) {
          setSupportedClasses(health.data.classes);
        }
      }
    };

    verifyHealth();
    const interval = setInterval(verifyHealth, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Handler when photo is selected (from camera or gallery)
  const handleImageSelected = (imageData) => {
    setSelectedImage(imageData);
    setPredictionResult(null);
    setErrorMessage('');
    setActiveScreen('preview');
  };

  // Gallery file handler from home screen
  const handleHomeGallerySelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      handleImageSelected({
        dataUrl: event.target.result,
        blob: file,
        source: 'gallery',
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
    // Reset file input so selecting same image triggers change
    e.target.value = '';
  };

  // Handler to analyze the selected fish image with deliberate multi-stage analysis
  const handleAnalyzeFish = async () => {
    if (!selectedImage || !selectedImage.blob || isAnalyzing) return;

    setIsAnalyzing(true);
    setErrorMessage('');

    try {
      // Deliberately allow at least 2.2 seconds for deep multi-view analysis & tensor feature extraction
      const minAnalysisDelay = new Promise((resolve) => setTimeout(resolve, 2200));
      const predictPromise = predictFishImage(selectedImage.blob);

      const [res] = await Promise.all([predictPromise, minAnalysisDelay]);
      setIsAnalyzing(false);

      if (res.success) {
        setPredictionResult(res.data);
        setActiveScreen('result');
      } else {
        setErrorMessage(res.error || 'Failed to analyze fish image.');
      }
    } catch (err) {
      setIsAnalyzing(false);
      setErrorMessage(err.message || 'Error occurred during classification.');
    }
  };

  // Handler to start new identification
  const handleIdentifyAnother = () => {
    setSelectedImage(null);
    setPredictionResult(null);
    setErrorMessage('');
    setActiveScreen('capture');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-teal-100 selection:text-teal-900 pb-20 sm:pb-8">
      {/* Hidden file input for direct gallery trigger */}
      <input
        ref={homeFileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        onChange={handleHomeGallerySelect}
        className="hidden"
        id="home-direct-gallery-input"
      />

      {/* Main Top Navigation Header */}
      <Navbar
        activeScreen={activeScreen}
        setActiveScreen={(screen) => {
          setErrorMessage('');
          setActiveScreen(screen);
        }}
        isBackendOnline={isBackendOnline}
      />

      {/* Primary Content Container */}
      <main className="flex-1 flex flex-col items-center justify-start w-full px-2 sm:px-4 py-2">
        {/* Error Notification Banner if any */}
        {errorMessage && (
          <div className="w-full max-w-lg mx-auto mb-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 shadow-xs animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <p className="font-bold">Classification Error</p>
              <p className="mt-0.5 text-red-700 leading-relaxed">{errorMessage}</p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={handleAnalyzeFish}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold rounded-lg text-[11px] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry Analysis</span>
                </button>
                <button
                  onClick={() => setActiveScreen('capture')}
                  className="px-3 py-1.5 bg-white border border-red-200 hover:bg-red-100/50 text-red-700 font-semibold rounded-lg text-[11px] transition-all cursor-pointer"
                >
                  Try Different Image
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading overlay during analysis with visual image scan & telemetry */}
        {isAnalyzing && <AnalysisLoading imageData={selectedImage} />}

        {/* SCREEN 1: HOME */}
        {!isAnalyzing && activeScreen === 'home' && (
          <HomeView
            onStartIdentify={() => {
              setErrorMessage('');
              setActiveScreen('capture');
            }}
            onOpenGallery={() => homeFileInputRef.current?.click()}
            supportedClasses={supportedClasses}
          />
        )}

        {/* SCREEN 2: CAMERA AND GALLERY */}
        {!isAnalyzing && activeScreen === 'capture' && (
          <CameraCapture
            onImageSelected={handleImageSelected}
            onCancel={() => setActiveScreen('home')}
          />
        )}

        {/* SCREEN 3: IMAGE PREVIEW */}
        {!isAnalyzing && activeScreen === 'preview' && selectedImage && (
          <ImagePreview
            imageData={selectedImage}
            onAnalyze={handleAnalyzeFish}
            onRetake={() => {
              setErrorMessage('');
              setActiveScreen('capture');
            }}
            onChangeImage={handleImageSelected}
            isAnalyzing={isAnalyzing}
          />
        )}

        {/* SCREEN 4: PREDICTION RESULT */}
        {!isAnalyzing && activeScreen === 'result' && predictionResult && selectedImage && (
          <PredictionResult
            result={predictionResult}
            imageData={selectedImage}
            onIdentifyAnother={handleIdentifyAnother}
          />
        )}

        {/* SCREEN 5: ABOUT */}
        {!isAnalyzing && activeScreen === 'about' && (
          <AboutView
            onStartIdentify={() => {
              setErrorMessage('');
              setActiveScreen('capture');
            }}
          />
        )}
      </main>

      {/* Bottom Navigation for Mobile Screens */}
      <BottomNav
        activeScreen={activeScreen}
        setActiveScreen={(screen) => {
          setErrorMessage('');
          setActiveScreen(screen);
        }}
      />
    </div>
  );
}
