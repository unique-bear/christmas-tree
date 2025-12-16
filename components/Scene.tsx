import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Sparkles, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { AppMode } from '../types';
import { MagicParticles } from './MagicParticles';
import { Ornaments } from './Ornaments';
import { FloatingText } from './FloatingText';
import { PhotoFrames } from './PhotoFrames';
import { Star } from './Star';
import { COLORS } from '../constants';

interface SceneProps {
  mode: AppMode;
  toggleMode: () => void;
}

export const Scene: React.FC<SceneProps> = ({ mode, toggleMode }) => {
  const controlsRef = useRef<any>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  // Physics State
  const progressRef = useRef(0);
  
  useFrame((state, delta) => {
    // 1. Animate Progress (0 = Scattered, 1 = Tree)
    const target = mode === AppMode.TREE_SHAPE ? 1 : 0;
    progressRef.current = THREE.MathUtils.damp(progressRef.current, target, 2.0, delta);
    
    // 2. Continuous slow rotation
    if (groupRef.current) {
        groupRef.current.rotation.y += delta * 0.15;
    }

    // 3. Camera Interaction
    const p = progressRef.current;
    if (controlsRef.current) {
        // Auto rotate when tree is formed
        controlsRef.current.autoRotate = p > 0.8;
        controlsRef.current.autoRotateSpeed = 1.0;
        controlsRef.current.update();
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 35]} fov={35} />
      <OrbitControls 
        ref={controlsRef} 
        enablePan={false}
        enableZoom={true}
        maxDistance={60} 
        minDistance={10} 
        maxPolarAngle={Math.PI / 1.6}
        enableDamping
        target={[0, 1, 0]} // Look slightly up at the tree center
      />

      {/* --- Click Handler Area --- */}
      <mesh visible={false} onClick={toggleMode} position={[0,0,0]}>
         <sphereGeometry args={[60, 8, 8]} />
         <meshBasicMaterial side={THREE.BackSide} />
      </mesh>

      {/* --- Lighting --- */}
      <ambientLight intensity={0.2} color={COLORS.EMERALD_DEEP} />
      <spotLight
        position={[15, 20, 15]}
        angle={0.4}
        penumbra={1}
        intensity={300}
        color={COLORS.GOLD_METALLIC}
        castShadow
        shadow-bias={-0.0001}
      />
      <spotLight position={[-15, 10, -20]} intensity={200} color="#aaddff" />
      <pointLight position={[-10, 0, 10]} intensity={80} color={COLORS.GOLD_ROSE} />

      <Environment preset="city" blur={0.7} />

      {/* Main Content Group */}
      {/* Tree is height 14 (from -7 to +7). Moving y to -1 centers it better visually in the camera frame */}
      <group ref={groupRef} position={[0, -1, 0]}>
        <Star progressRef={progressRef} />
        <MagicParticles progressRef={progressRef} />
        <Ornaments progressRef={progressRef} />
        <FloatingText progressRef={progressRef} />
        <PhotoFrames progressRef={progressRef} />
      </group>

      <Sparkles 
        count={200} 
        scale={40} 
        size={2} 
        speed={0.4} 
        opacity={0.3} 
        color={COLORS.GOLD_METALLIC} 
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom 
            luminanceThreshold={0.85} 
            mipmapBlur 
            intensity={1.5} 
            radius={0.5}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
      
      <color attach="background" args={[COLORS.EMERALD_DEEP]} />
      <fog attach="fog" args={[COLORS.EMERALD_DEEP, 15, 60]} />
    </>
  );
};