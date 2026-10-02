import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, AlertCircle, Image as ImageIcon, X, AlertTriangle } from 'lucide-react';

export default function CameraCapture({ onImageSelected, onCancel }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // States: 'idle', 'requesting', 'active', 'denied', 'unavailable'
  const [cameraState, setCameraState] = useState('idle');
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (rear) or 'user' (front)
  const [errorMessage, setErrorMessage] = useState('');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  // Helper to stop all active camera tracks
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping track:', e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Check available camera devices
  const checkCameraSupport = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return { supported: false, count: 0 };
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      return { supported: true, count: videoInputs.length };
    } catch {
      return { supported: true, count: 1 };
    }
  };

  // Start video stream
  const startCamera = async (mode = facingMode) => {
    stopCameraStream();
    setCameraState('requesting');
    setErrorMessage('');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState('unavailable');
      setErrorMessage('Camera access is not supported by this browser. Please upload an image instead.');
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch((err) => {
          console.warn('Autoplay failed:', err);
        });
      }

      setCameraState('active');

      // Check device count for flip button
      const { count } = await checkCameraSupport();
      setHasMultipleCameras(count > 1);
    } catch (err) {
      console.error('Camera error:', err);
      stopCameraStream();

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraState('denied');
        setErrorMessage('Camera permission was denied. Please allow camera access in your browser settings or select a photo from your gallery.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraState('unavailable');
        setErrorMessage('No camera device was detected on your hardware.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraState('unavailable');
        setErrorMessage('Camera is currently in use by another application or blocked.');
      } else {
        setCameraState('unavailable');
        setErrorMessage(err.message || 'Unable to open camera stream. Please try again or upload a photo.');
      }
    }
  };

  // Flip between front and rear cameras
  const toggleCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture current video frame to canvas & blob
  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || cameraState !== 'active') return;

    try {
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Flip horizontally if using front-facing user camera for natural mirror feel
      if (facingMode === 'user') {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0, width, height);

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
            // Stop hardware camera immediately after capture
            stopCameraStream();
            onImageSelected({
              dataUrl,
              blob,
              source: 'camera',
              name: `camera_capture_${Date.now()}.jpg`,
            });
          }
        },
        'image/jpeg',
        0.92
      );
    } catch (err) {
      console.error('Failed to capture frame:', err);
    }
  };

  // Handle gallery file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      stopCameraStream();
      onImageSelected({
        dataUrl: event.target.result,
        blob: file,
        source: 'gallery',
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-4 animate-fadeIn">
      {/* Hidden File Input for Gallery / Fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        onChange={handleFileChange}
        className="hidden"
        id="camera-gallery-input"
      />

      {/* Main Camera Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm">
        {/* Header / Tabs */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-teal-50 text-teal-700 rounded-lg">
              <Camera className="w-4 h-4" />
            </span>
            <span className="font-bold text-slate-800 text-sm">
              Live Camera
            </span>
          </div>

          <button
            onClick={() => {
              stopCameraStream();
              onCancel();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            aria-label="Close Camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div className="relative aspect-4/3 sm:aspect-4/3 w-full bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
          {/* Active Live Video Element */}
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              cameraState === 'active' ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Viewfinder Target Reticle Overlay (Only when camera active) */}
          {cameraState === 'active' && (
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
              {/* Top Corners */}
              <div className="flex justify-between">
                <div className="w-8 h-8 border-t-2 border-l-2 border-white/80 rounded-tl-lg" />
                <div className="w-8 h-8 border-t-2 border-r-2 border-white/80 rounded-tr-lg" />
              </div>

              {/* Center Guidance Prompt */}
              <div className="self-center bg-black/40 backdrop-blur-xs text-white/90 text-[11px] font-medium px-3 py-1 rounded-full border border-white/20">
                Align fish inside frame
              </div>

              {/* Bottom Corners */}
              <div className="flex justify-between">
                <div className="w-8 h-8 border-b-2 border-l-2 border-white/80 rounded-bl-lg" />
                <div className="w-8 h-8 border-b-2 border-r-2 border-white/80 rounded-br-lg" />
              </div>
            </div>
          )}

          {/* Switch Camera Overlay Button (Top Right inside viewfinder) */}
          {cameraState === 'active' && (
            <button
              onClick={toggleCamera}
              className="absolute top-3 right-3 z-20 p-2.5 bg-black/50 hover:bg-black/70 active:scale-95 text-white rounded-full backdrop-blur-md border border-white/20 transition-all cursor-pointer"
              title="Switch camera lens"
              aria-label="Switch between front and back camera"
              id="btn-switch-camera"
            >
              <RefreshCw className="w-4 h-4 stroke-[2.2]" />
            </button>
          )}

          {/* IDLE STATE: User hasn't opened camera yet */}
          {cameraState === 'idle' && (
            <div className="p-6 text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-teal-800/60 text-teal-300 flex items-center justify-center mb-3">
                <Camera className="w-7 h-7" />
              </div>
              <p className="text-white font-semibold text-sm">
                Ready to take a fish photo
              </p>
              <p className="text-slate-400 text-xs mt-1 mb-4 max-w-xs">
                Tap below to grant camera access and frame your fish in real time.
              </p>
              <button
                onClick={() => startCamera('environment')}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 active:scale-98 text-white text-xs font-bold rounded-xl shadow-lg shadow-teal-900/40 transition-all cursor-pointer"
                id="btn-launch-camera"
              >
                Open Device Camera
              </button>
            </div>
          )}

          {/* REQUESTING / INITIALIZING STATE */}
          {cameraState === 'requesting' && (
            <div className="flex flex-col items-center gap-3 text-white">
              <div className="w-9 h-9 border-3 border-teal-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium text-slate-300">
                Starting camera stream...
              </p>
            </div>
          )}

          {/* PERMISSION DENIED STATE */}
          {cameraState === 'denied' && (
            <div className="p-6 text-center flex flex-col items-center text-white">
              <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-2">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-red-200">Camera Access Denied</h3>
              <p className="text-xs text-slate-300 mt-1 mb-4 max-w-xs leading-relaxed">
                Permission to use the camera was blocked in your browser. You can still upload photos from your device gallery.
              </p>
              <div className="flex flex-col gap-2 w-full max-w-xs">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Choose from Gallery</span>
                </button>
                <button
                  onClick={() => startCamera()}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-all cursor-pointer"
                >
                  Try Camera Again
                </button>
              </div>
            </div>
          )}

          {/* CAMERA UNAVAILABLE STATE */}
          {cameraState === 'unavailable' && (
            <div className="p-6 text-center flex flex-col items-center text-white">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-amber-200">Camera Unavailable</h3>
              <p className="text-xs text-slate-300 mt-1 mb-4 max-w-xs leading-relaxed">
                {errorMessage || 'Your browser cannot connect to an active camera. Use gallery upload instead.'}
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Upload from Gallery</span>
              </button>
            </div>
          )}
        </div>

        {/* Camera Controls Bar (Matching reference design) */}
        <div className="mt-4 flex items-center justify-between px-2">
          {/* Gallery Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            id="btn-camera-view-gallery"
          >
            <ImageIcon className="w-4 h-4 text-teal-600" />
            <span>Gallery</span>
          </button>

          {/* Large Shutter Button */}
          <div className="flex items-center justify-center">
            {cameraState === 'active' ? (
              <button
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full bg-white border-4 border-teal-600 shadow-md flex items-center justify-center active:scale-90 transition-transform cursor-pointer group"
                aria-label="Capture Fish Photo"
                id="btn-shutter-capture"
              >
                <div className="w-12 h-12 rounded-full bg-teal-600 group-hover:bg-teal-700 transition-colors" />
              </button>
            ) : (
              <button
                onClick={() => startCamera('environment')}
                className="w-16 h-16 rounded-full bg-teal-50 border-2 border-teal-200 text-teal-700 flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
                aria-label="Start Camera"
                id="btn-shutter-idle"
              >
                <Camera className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Switch Camera Button */}
          <button
            onClick={cameraState === 'active' ? toggleCamera : () => startCamera()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Switch front/rear lens"
            aria-label="Switch Camera"
            id="btn-switch-camera-bar"
          >
            <RefreshCw className="w-4 h-4 text-teal-600" />
            <span>Switch</span>
          </button>
        </div>

        {/* Quick Sample Selector for environments without webcam */}
        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 mb-2">Or test with a sample fish:</p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={async () => {
                const res = await fetch('/sample_sangara.jpg');
                const blob = await res.blob();
                stopCameraStream();
                onImageSelected({
                  dataUrl: '/sample_sangara.jpg',
                  blob: new File([blob], 'sample_sangara.jpg', { type: 'image/jpeg' }),
                  source: 'gallery',
                  name: 'sample_sangara.jpg',
                });
              }}
              className="px-2.5 py-1 text-[11px] font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200/70 rounded-lg transition-colors cursor-pointer"
              id="btn-sample-sangara"
            >
              🐟 Sample Sangara
            </button>
            <button
              onClick={async () => {
                const res = await fetch('/sample_anchovy.jpg');
                const blob = await res.blob();
                stopCameraStream();
                onImageSelected({
                  dataUrl: '/sample_anchovy.jpg',
                  blob: new File([blob], 'sample_anchovy.jpg', { type: 'image/jpeg' }),
                  source: 'gallery',
                  name: 'sample_anchovy.jpg',
                });
              }}
              className="px-2.5 py-1 text-[11px] font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200/70 rounded-lg transition-colors cursor-pointer"
              id="btn-sample-anchovy"
            >
              🐟 Sample Anchovy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
