import React, { useState, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { Overlay } from './components/Overlay';
import { Scene } from './components/Scene';
import { MusicControl } from './components/MusicControl';
import { AppMode } from './types';
import * as THREE from 'three';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.SCATTERED);
  
  const toggleMode = useCallback(() => {
    setMode(prev => prev === AppMode.TREE_SHAPE ? AppMode.SCATTERED : AppMode.TREE_SHAPE);
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* React Three Fiber Canvas */}
      <Canvas
        dpr={[1, 2]} 
        shadows
        camera={{ position: [0, 0, 32], fov: 40 }}
        gl={{ 
          antialias: false, 
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
      >
        <Suspense fallback={null}>
          <Scene 
            mode={mode} 
            toggleMode={toggleMode}
          />
        </Suspense>
      </Canvas>

      {/* 2D UI Overlay */}
      <Overlay mode={mode} />
      
      {/* Music Control */}
      <MusicControl audioSrc="/music/christmas-bgm.mp3" />
      
      {/* Loading Indicator */}
      <Loader 
        containerStyles={{ background: '#001a10' }}
        innerStyles={{ width: '200px', height: '2px', background: '#333' }}
        barStyles={{ background: '#FFD700', height: '2px' }}
        dataStyles={{ color: '#FFD700', fontFamily: 'serif' }}
      />
    </div>
  );
};

export default App;