
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, X, CameraOff } from 'lucide-react';

interface CameraPanelProps {
  onCapture: (imageSrc: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const CameraPanel: React.FC<CameraPanelProps> = ({ onCapture, isOpen, onToggle }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Enumerate devices
  useEffect(() => {
    if (!isOpen) return;

    const getDevices = async () => {
      try {
        const dev = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = dev.filter(d => d.kind === 'videoinput');
        setDevices(videoDevices);
        if (videoDevices.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error("Device enumeration failed", err);
      }
    };
    getDevices();
  }, [isOpen]);

  // Start Stream
  const startCamera = useCallback(async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setError('');
    
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setError('Camera access denied or unavailable. Ensure HTTPS or localhost.');
    }
  }, [selectedDeviceId]);

  // Watch for open/device change
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      // Cleanup on close
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [isOpen, selectedDeviceId]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(imageBase64);
        onToggle(); // Close panel after capture
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-800 rounded-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 flex justify-between items-center bg-slate-700">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Camera size={20} /> Camera Input
          </h3>
          <button onClick={onToggle} className="text-slate-300 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Viewport */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="text-red-400 text-center p-4 flex flex-col items-center gap-2">
              <CameraOff size={48} />
              <p>{error}</p>
            </div>
          ) : (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls */}
        <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900">
            {devices.length > 1 && (
              <div className="flex items-center gap-2">
                 <RefreshCw size={16} className="text-slate-400" />
                 <select 
                   value={selectedDeviceId}
                   onChange={(e) => setSelectedDeviceId(e.target.value)}
                   className="bg-slate-800 text-white text-sm p-2 rounded border border-slate-700 focus:outline-none"
                 >
                   {devices.map(d => (
                     <option key={d.deviceId} value={d.deviceId}>
                       {d.label || `Camera ${d.deviceId.slice(0, 5)}...`}
                     </option>
                   ))}
                 </select>
              </div>
            )}
            
            <button 
              onClick={handleCapture}
              disabled={!!error}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Capture Frame
            </button>
        </div>
      </div>
    </div>
  );
};

export default CameraPanel;
