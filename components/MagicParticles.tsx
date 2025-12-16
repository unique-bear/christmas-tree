import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG, COLORS } from '../constants';

interface MagicParticlesProps {
  progressRef: React.MutableRefObject<number>;
}

const tempObject = new THREE.Object3D();
const tempPos = new THREE.Vector3();

export const MagicParticles: React.FC<MagicParticlesProps> = ({ progressRef }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Pre-calculate dual positions
  const particles = useMemo(() => {
    const data = [];
    for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
      // --- Tree Position (Cone Spiral) ---
      const t = Math.random(); 
      const y = (t * CONFIG.TREE_HEIGHT) - (CONFIG.TREE_HEIGHT / 2);
      const radius = (1 - t) * CONFIG.TREE_RADIUS_BASE;
      const theta = t * 30 * Math.PI + (Math.random() * Math.PI * 2);
      
      const tx = radius * Math.cos(theta);
      const tz = radius * Math.sin(theta);
      const noise = 0.4;
      const treePos = new THREE.Vector3(
        tx + (Math.random() - 0.5) * noise, 
        y + (Math.random() - 0.5) * noise, 
        tz + (Math.random() - 0.5) * noise
      );

      // --- Scatter Position (Random Sphere) ---
      const u = Math.random();
      const v = Math.random();
      const thetaS = 2 * Math.PI * u;
      const phiS = Math.acos(2 * v - 1);
      const rS = CONFIG.SCATTER_RADIUS * Math.cbrt(Math.random()); 
      
      const sx = rS * Math.sin(phiS) * Math.cos(thetaS);
      const sy = rS * Math.sin(phiS) * Math.sin(thetaS);
      const sz = rS * Math.cos(phiS);
      const scatterPos = new THREE.Vector3(sx, sy, sz);

      const isGold = Math.random() > 0.85; 
      const scale = Math.random() * 0.12 + 0.03;
      
      data.push({
        treePos,
        scatterPos,
        scale,
        color: isGold ? COLORS.GOLD_METALLIC : COLORS.EMERALD_LIGHT,
        speed: Math.random() * 0.5 + 0.2,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return data;
  }, []);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    particles.forEach((p, i) => {
      tempObject.position.copy(p.scatterPos);
      tempObject.scale.setScalar(p.scale);
      tempObject.updateMatrix();
      meshRef.current?.setMatrixAt(i, tempObject.matrix);
      meshRef.current?.setColorAt(i, new THREE.Color(p.color));
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.instanceColor!.needsUpdate = true;
  }, [particles]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    const globalProgress = progressRef.current; // 0 to 1

    particles.forEach((p, i) => {
      // Interpolate Position
      tempPos.lerpVectors(p.scatterPos, p.treePos, globalProgress);
      
      // Add Organic Float (Noise)
      const floatY = Math.sin(time * p.speed + p.phase) * 0.05;
      tempPos.y += floatY;

      tempObject.position.copy(tempPos);

      // Rotation for Sparkle
      tempObject.rotation.x = time * p.speed * 0.5;
      tempObject.rotation.y = time * p.speed * 0.3;
      
      // Dynamic Scale: Pop slightly when forming
      tempObject.scale.setScalar(p.scale * (1 + (Math.sin(time * 2 + p.phase) * 0.1)));

      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, CONFIG.PARTICLE_COUNT]}
      castShadow
      receiveShadow
    >
      <tetrahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        toneMapped={false}
        color="#ffffff"
        emissive={COLORS.EMERALD_DEEP}
        emissiveIntensity={0.5}
        roughness={0.1}
        metalness={0.9}
      />
    </instancedMesh>
  );
};