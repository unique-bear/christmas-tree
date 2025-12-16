import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { AppMode } from '../types';

interface HandControlProps {
  setMode: (mode: AppMode) => void;
  setRotationTarget: (val: number) => void; // Updates external rotation ref
}

export const HandControl: React.FC<HandControlProps> = ({ setMode, setRotationTarget }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, active: false });
  const [gesture, setGesture] = useState<string>('NONE');

  useEffect(() => {
    let handLandmarker: HandLandmarker | null = null;
    let animationFrameId: number;

    const setup = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm"
        );
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        
        // Start Webcam
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener("loadeddata", predictWebcam);
        }
        setLoaded(true);
      } catch (err) {
        console.error("Webcam/MediaPipe error:", err);
      }
    };

    const predictWebcam = () => {
      if (!handLandmarker || !videoRef.current) return;
      
      let startTimeMs = performance.now();
      if (videoRef.current.currentTime > 0) {
        const results = handLandmarker.detectForVideo(videoRef.current, startTimeMs);
        
        if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];
          
          // 1. Calculate Cursor Position (Index Finger Tip) - Mirror X
          const indexTip = landmarks[8];
          // Mirroring: 1 - x
          const screenX = (1 - indexTip.x) * window.innerWidth;
          const screenY = indexTip.y * window.innerHeight;
          setCursorPos({ x: screenX, y: screenY, active: true });

          // 2. Gesture Logic
          // Thumb Tip (4) vs Index Tip (8) distance
          const thumbTip = landmarks[4];
          const distance = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
          
          const isPinch = distance < 0.05; // Threshold
          
          if (isPinch) {
            setGesture('GRAB');
            setMode(AppMode.TREE_SHAPE);
          } else {
            setGesture('OPEN');
            setMode(AppMode.SCATTERED);
            
            // 3. Rotation Logic (Only when hand is open and moving)
            // Map Hand X (0-1) to Rotation (-PI to PI)
            // Mirroring: (1 - x)
            const rotationY = ((1 - landmarks[9].x) - 0.5) * 4; // Use middle finger mcp for stability
            setRotationTarget(rotationY);
          }
        } else {
          setCursorPos(prev => ({ ...prev, active: false }));
        }
      }
      animationFrameId = requestAnimationFrame(predictWebcam);
    };

    setup();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
         const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
         tracks.forEach(track => track.stop());
      }
      cancelAnimationFrame(animationFrameId);
      handLandmarker?.close();
    };
  }, [setMode, setRotationTarget]);

  return (
    <>
      {/* Debug View / Webcam Preview */}
      <div className="absolute bottom-4 right-4 z-50 pointer-events-none opacity-80">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline
          muted
          className="w-32 h-24 rounded-lg border-2 border-emerald-500/50 object-cover webcam-mirror" 
        />
        {!loaded && <div className="text-white text-xs mt-1">Loading AI...</div>}
        {loaded && <div className="text-emerald-300 text-xs mt-1 font-mono tracking-wider text-right">{gesture}</div>}
      </div>

      {/* AI Cursor */}
      {cursorPos.active && (
        <div 
            className="absolute z-50 pointer-events-none transition-transform duration-75"
            style={{ 
                left: cursorPos.x, 
                top: cursorPos.y,
                transform: 'translate(-50%, -50%)'
            }}
        >
            <div className={`
                w-12 h-12 rounded-full border-2 
                flex items-center justify-center
                backdrop-blur-sm
                transition-colors duration-300
                ${gesture === 'GRAB' ? 'border-yellow-400 bg-yellow-400/20' : 'border-emerald-400 bg-emerald-400/10'}
            `}>
                <div className={`w-2 h-2 rounded-full ${gesture === 'GRAB' ? 'bg-yellow-400' : 'bg-emerald-400'}`} />
            </div>
        </div>
      )}
    </>
  );
};