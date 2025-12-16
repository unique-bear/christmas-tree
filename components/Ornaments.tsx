import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG, COLORS } from '../constants';

interface OrnamentsProps {
  progressRef: React.MutableRefObject<number>;
}

const tempObject = new THREE.Object3D();
const tempPos = new THREE.Vector3();

export const Ornaments: React.FC<OrnamentsProps> = ({ progressRef }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const ornaments = useMemo(() => {
    const data = [];
    for (let i = 0; i < CONFIG.ORNAMENT_COUNT; i++) {
      // --- Tree Position ---
      const t = Math.random();
      const y = (t * CONFIG.TREE_HEIGHT) - (CONFIG.TREE_HEIGHT / 2);
      const radius = ((1 - t) * CONFIG.TREE_RADIUS_BASE) + 0.5; 
      const theta = t * 15 * Math.PI + (Math.random() * Math.PI * 2);

      const tx = radius * Math.cos(theta);
      const tz = radius * Math.sin(theta);
      const treePos = new THREE.Vector3(tx, y, tz);

      // --- Scatter Position ---
      const u = Math.random();
      const v = Math.random();
      const thetaS = 2 * Math.PI * u;
      const phiS = Math.acos(2 * v - 1);
      const rS = (CONFIG.SCATTER_RADIUS + 5) * Math.cbrt(Math.random()); 
      
      const sx = rS * Math.sin(phiS) * Math.cos(thetaS);
      const sy = rS * Math.sin(phiS) * Math.sin(thetaS);
      const sz = rS * Math.cos(phiS);
      const scatterPos = new THREE.Vector3(sx, sy, sz);

      // --- Appearance ---
      const type = Math.random();
      let color = COLORS.GOLD_METALLIC;
      let scale = 0.3;
      
      if (type > 0.7) {
        color = COLORS.GOLD_ROSE;
        scale = 0.35;
      } else if (type > 0.9) {
        color = COLORS.RED_VELVET;
        scale = 0.4;
      }

      data.push({
        treePos,
        scatterPos,
        scale,
        color,
        phase: Math.random() * Math.PI * 2
      });
    }
    return data;
  }, []);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    ornaments.forEach((o, i) => {
      tempObject.position.copy(o.scatterPos);
      tempObject.scale.setScalar(o.scale);
      tempObject.updateMatrix();
      meshRef.current?.setMatrixAt(i, tempObject.matrix);
      meshRef.current?.setColorAt(i, new THREE.Color(o.color));
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.instanceColor!.needsUpdate = true;
  }, [ornaments]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = progressRef.current;
    
    ornaments.forEach((o, i) => {
      // Interpolate
      tempPos.lerpVectors(o.scatterPos, o.treePos, t);
      tempObject.position.copy(tempPos);
      
      // Rotate ornament
      tempObject.rotation.y += 0.01;
      
      tempObject.scale.setScalar(o.scale);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, CONFIG.ORNAMENT_COUNT]}
      castShadow
      receiveShadow
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshPhysicalMaterial
        color="white"
        roughness={0.15}
        metalness={1.0}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </instancedMesh>
  );
};