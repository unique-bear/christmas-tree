import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Sparkles } from '@react-three/drei';
import { COLORS, CONFIG } from '../constants';

interface StarProps {
  progressRef: React.MutableRefObject<number>;
}

export const Star: React.FC<StarProps> = ({ progressRef }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  // Calculate Tree Top Position
  // Tree Height is 14, centered at local 0 is -7 to +7.
  // We want the star slightly above +7.
  const treeTopY = (CONFIG.TREE_HEIGHT / 2) + 1.5; 
  const treePos = new THREE.Vector3(0, treeTopY, 0);
  
  // Scatter Position (somewhere high up)
  const scatterPos = new THREE.Vector3(0, 35, -5);

  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const outerRadius = 1.2;
    const innerRadius = 0.5;
    const spikes = 5;
    
    for (let i = 0; i < spikes * 2; i++) {
        const l = i % 2 === 0 ? outerRadius : innerRadius;
        const a = (i / spikes) * Math.PI;
        const x = Math.cos(a + Math.PI / 2) * l; // Rotate to point up
        const y = Math.sin(a + Math.PI / 2) * l;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
  }, []);

  const extrudeSettings = useMemo(() => ({
    steps: 1,
    depth: 0.2,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 2
  }), []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Position Animation
    const p = progressRef.current;
    meshRef.current.position.lerpVectors(scatterPos, treePos, p);
    
    // Scale Animation (Grow when tree forms)
    const scale = THREE.MathUtils.lerp(0.01, 1, p);
    meshRef.current.scale.setScalar(scale);

    // Rotation
    meshRef.current.rotation.y += delta * 2.0;
    // Add a slight bob
    meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2.5) * 0.1;
  });

  return (
    <group ref={meshRef}>
      {/* The Physical Star */}
      <mesh castShadow receiveShadow>
        <extrudeGeometry args={[starShape, extrudeSettings]} />
        <meshStandardMaterial 
          color={COLORS.GOLD_METALLIC}
          emissive={COLORS.GOLD_METALLIC}
          emissiveIntensity={4.0} // High intensity for bloom
          roughness={0.1}
          metalness={1.0}
        />
      </mesh>
      
      {/* Light coming from the star */}
      <pointLight color={COLORS.GOLD_METALLIC} intensity={40} distance={15} decay={2} />

      {/* Sparkles trailing/surrounding the star */}
      <Sparkles 
        count={60}
        scale={5}
        size={5}
        speed={1.2}
        opacity={1}
        color={COLORS.WHITE_WARM}
      />
    </group>
  );
};