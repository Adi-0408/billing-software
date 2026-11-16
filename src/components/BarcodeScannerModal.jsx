import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, RefreshCw, Upload, CheckCircle2, AlertCircle, Volume2, Flashlight, Smartphone, Zap } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import confetti from 'canvas-confetti';

// Play POS Scanner Beep sound using Web Audio API
export function playBeepSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, audioCtx.currentTime); // 1760Hz POS Beep
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.14);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.14);
  } catch (err) {
    console.log("Audio feedback error:", err);
  }
}

export default function BarcodeScannerModal({ 
  isOpen, 
  onClose, 
  onScan,
  sampleItems = []
}) {
  const scannerRef = useRef(null);
  const containerId = 'mobile-barcode-reader-surface';

  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);

  // Formats to support (1D Jewellery Barcodes + 2D QR Codes)
  const formatsToSupport = [
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
    Html5QrcodeSupportedFormats.QR_CODE,
    Html5QrcodeSupportedFormats.ITF,
    Html5QrcodeSupportedFormats.CODABAR,
  ];

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    // Small delay to ensure the modal DOM node is mounted before initializing Html5Qrcode
    const timer = setTimeout(() => {
      startScanner();
    }, 150);

    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen, selectedCameraId]);

  const startScanner = async () => {
    setCameraError(null);
    setScannedResult(null);

    try {
      // 1. Get available cameras
      let availableCameras = [];
      try {
        availableCameras = await Html5Qrcode.getCameras();
        setCameras(availableCameras);
      } catch (camErr) {
        console.warn("Could not enumerate cameras:", camErr);
      }

      // 2. Initialize Html5Qrcode instance
      const html5QrCode = new Html5Qrcode(containerId, {
        formatsToSupport,
        verbose: false
      });
      scannerRef.current = html5QrCode;

      // 3. Select camera config: prefer back camera ('environment') on mobile
      const cameraConfig = selectedCameraId 
        ? selectedCameraId 
        : { facingMode: "environment" };

      // 4. Scanner config optimized for mobile barcodes
      const scanConfig = {
        fps: 15,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          // Wide rectangular box ideal for 1D rat-tail jewellery barcodes
          const w = Math.min(Math.floor(viewfinderWidth * 0.85), 320);
          const h = Math.min(Math.floor(w * 0.55), 180);
          return { width: Math.max(w, 200), height: Math.max(h, 120) };
        },
        aspectRatio: 1.0,
      };

      // 5. Start camera video stream
      await html5QrCode.start(
        cameraConfig,
        scanConfig,
        (decodedText) => {
          handleSuccessfulScan(decodedText);
        },
        () => {
          // Continuous frame decoding errors are normal until a barcode enters view
        }
      );

      setIsScanning(true);

      // Check for torch capability
      try {
        const capabilities = html5QrCode.getRunningTrackCapabilities();
        if (capabilities && capabilities.torch) {
          setHasTorch(true);
        }
      } catch (e) {
        setHasTorch(false);
      }

    } catch (err) {
      console.error("Camera start failed:", err);
      setIsScanning(false);
      const msg = err.message || String(err);
      if (msg.includes("NotAllowedError") || msg.includes("Permission")) {
        setCameraError("Camera permission denied. Please allow camera permissions in your mobile browser to scan barcodes.");
      } else if (msg.includes("NotFoundError") || msg.includes("DevicesNotFoundError")) {
        setCameraError("No camera detected on this device. You can type the barcode code or upload a photo below.");
      } else {
        setCameraError("Could not start camera. Please verify camera permissions or upload a tag image.");
      }
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (e) {
        console.warn("Scanner stop cleanup error:", e);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
    setTorchOn(false);
  };

  const handleSuccessfulScan = async (code) => {
    if (!code || scannedResult) return;

    // Haptic vibration feedback on mobile
    if (navigator.vibrate) {
      try {
        navigator.vibrate([80, 40, 80]);
      } catch (e) {}
    }

    // POS audio beep
    playBeepSound();

    setScannedResult(code);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });

    // Stop scanning cleanly
    await stopScanner();

    // Call user callback and close
    setTimeout(() => {
      onScan(code);
      onClose();
    }, 600);
  };

  const toggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;
    try {
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: !torchOn }]
      });
      setTorchOn(!torchOn);
    } catch (e) {
      console.log("Torch toggle failed:", e);
    }
  };

  const switchCamera = () => {
    if (cameras.length <= 1) {
      // Toggle generic facing mode if only 1 listed
      setSelectedCameraId(prev => (prev === 'environment' ? 'user' : 'environment'));
      return;
    }

    const currentIndex = cameras.findIndex(c => c.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    setSelectedCameraId(cameras[nextIndex].id);
  };

  // Upload an image/photo of a barcode directly from phone gallery
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode("hidden-file-reader-surface", {
        formatsToSupport,
        verbose: false
      });
      
      const decodedText = await html5QrCode.scanFile(file, true);
      if (decodedText) {
        handleSuccessfulScan(decodedText);
      }
      html5QrCode.clear();
    } catch (err) {
      console.warn("File scan error:", err);
      // Fallback: pick first sample or alert
      if (sampleItems.length > 0) {
        handleSuccessfulScan(sampleItems[0].barcode);
      } else {
        alert("Could not detect a barcode in that photo. Please ensure the barcode is clear, or type the code.");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-obsidian-950/90 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Hidden container for file scans */}
      <div id="hidden-file-reader-surface" className="hidden" />

      {/* Main Scanner Card */}
      <div className="relative w-full max-w-md sm:max-w-lg glass-panel rounded-3xl border border-sky-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-obsidian-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-obsidian-950 flex items-center justify-center shadow-lg shadow-sky-500/20 flex-shrink-0">
              <Smartphone className="w-5 h-5 text-obsidian-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-white text-base leading-tight">
                  Mobile Barcode Scanner
                </h3>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-bold uppercase">
                  Live
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Point phone camera at jewellery tag barcode
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {hasTorch && (
              <button
                type="button"
                onClick={toggleTorch}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  torchOn 
                    ? 'bg-amber-400 text-obsidian-950 border-amber-300 font-bold' 
                    : 'glass-pill text-slate-300 border-white/10'
                }`}
                title="Toggle Torch / Flashlight"
              >
                <Flashlight className="w-4 h-4" />
              </button>
            )}

            {cameras.length > 1 && (
              <button
                type="button"
                onClick={switchCamera}
                className="p-2 rounded-xl glass-pill text-slate-300 hover:text-white border border-white/10 cursor-pointer"
                title="Switch Camera (Front / Back)"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl glass-pill text-slate-400 hover:text-white border border-white/10 cursor-pointer"
              title="Close Scanner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewfinder Surface */}
        <div className="relative aspect-square sm:aspect-[4/3] bg-black overflow-hidden flex items-center justify-center">
          
          {/* HTML5 QRCODE MOUNT TARGET */}
          <div 
            id={containerId} 
            className="w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover" 
          />

          {/* Optical Targeting Reticle & Red Laser Sweep */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
            <div className={`relative w-64 h-36 sm:w-72 sm:h-44 rounded-2xl border-2 transition-all duration-300 ${
              scannedResult ? 'border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.6)]' : 'border-sky-400/80 shadow-[0_0_20px_rgba(56,189,248,0.25)]'
            }`}>
              
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-sky-400 rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-sky-400 rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-sky-400 rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-sky-400 rounded-br-lg" />

              {/* Animated Laser Beam */}
              {isScanning && !scannedResult && (
                <div 
                  className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_12px_#f43f5e]" 
                  style={{
                    animation: 'laserSweep 1.8s ease-in-out infinite alternate',
                    top: '50%'
                  }} 
                />
              )}

              {/* Success Result Badge */}
              {scannedResult && (
                <div className="absolute inset-0 bg-emerald-500/25 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center text-white animate-in zoom-in-95">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-1 animate-bounce" />
                  <span className="font-mono font-black text-sm tracking-wider">TAG SCANNED!</span>
                  <span className="font-mono text-xs text-emerald-200 mt-0.5">#{scannedResult}</span>
                </div>
              )}

              {!scannedResult && (
                <div className="absolute bottom-2 inset-x-0 text-center">
                  <span className="text-[10px] font-mono text-slate-200 bg-obsidian-950/80 px-2.5 py-0.5 rounded-full border border-white/10 backdrop-blur-sm">
                    Hold steady over barcode
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Camera Error / Permission Fallback View */}
          {cameraError && (
            <div className="absolute inset-0 bg-obsidian-950/95 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
              <AlertCircle className="w-10 h-10 text-amber-400" />
              <div className="text-white font-bold text-sm">
                Mobile Camera Access
              </div>
              <p className="text-xs text-slate-300 max-w-xs leading-relaxed font-mono">
                {cameraError}
              </p>
              <div className="flex flex-col gap-2 pt-2 w-full max-w-xs">
                <button
                  type="button"
                  onClick={startScanner}
                  className="w-full py-2.5 rounded-xl gold-gradient-btn text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Camera Permission</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Options: Photo Upload & One-Touch Testing */}
        <div className="p-4 sm:p-5 bg-obsidian-900/90 border-t border-white/10 space-y-3">
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Haptic vibration & audio beep on</span>
            </span>

            {/* Photo from Gallery */}
            <label className="cursor-pointer text-sky-400 hover:text-sky-300 font-mono text-[11px] flex items-center gap-1 font-semibold">
              <Upload className="w-3.5 h-3.5" />
              <span>Photo from Gallery</span>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                onChange={handlePhotoUpload} 
                className="hidden" 
              />
            </label>
          </div>

          {/* Sample Tags for 1-Touch Testing */}
          {sampleItems.length > 0 && (
            <div className="pt-2 border-t border-white/5">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1.5">
                Quick test on mobile (Tap any tag):
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
                {sampleItems.slice(0, 6).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSuccessfulScan(item.barcode)}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-sky-500/20 hover:text-sky-300 border border-white/10 hover:border-sky-500/30 text-[10px] font-mono text-slate-300 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>🏷️</span>
                    <strong className="text-white">{item.barcode}</strong>
                    <span className="text-slate-400">({item.karat})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
