import React, { useRef, useMemo } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Vector3, Color } from 'three';
import { CONFIG, COLORS } from '../constants';

interface FloatingTextProps {
  progressRef: React.MutableRefObject<number>;
}

// Sub-component for individual text elements to manage their own frame loop
const TextItem: React.FC<{
  text: string;
  scatterPos: Vector3;
  treePos: Vector3;
  progressRef: React.MutableRefObject<number>;
  delayOffset: number;
  color: string;
  fontSize: number;
}> = ({ text, scatterPos, treePos, progressRef, delayOffset, color, fontSize }) => {
  const meshRef = useRef<any>(null);
  const currentPos = useRef(new Vector3());

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const p = progressRef.current; // 0 to 1

    // Interpolate position
    currentPos.current.lerpVectors(scatterPos, treePos, p);
    
    // Add floating motion
    // Different frequency based on delayOffset to desynchronize
    const floatY = Math.sin(t * 1.5 + delayOffset) * 0.3;
    
    meshRef.current.position.copy(currentPos.current);
    meshRef.current.position.y += floatY;

    // Face camera for readability
    meshRef.current.lookAt(state.camera.position);

    // Opacity/Scale logic
    const scale = 0.8 + (0.4 * p);
    meshRef.current.scale.setScalar(scale);
    
    meshRef.current.material.opacity = 0.6 + (0.4 * p);
  });

  return (
    <Text
      ref={meshRef}
      fontSize={fontSize}
      color={color}
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.02}
      outlineColor={COLORS.EMERALD_DEEP}
    >
      {text}
    </Text>
  );
};

export const FloatingText: React.FC<FloatingTextProps> = ({ progressRef }) => {
  
  const textItems = useMemo(() => {
    const items = [
      { text: "Merry Christmas", color: COLORS.GOLD_METALLIC, size: 1.5 },
      { text: "I Love You", color: COLORS.GOLD_ROSE, size: 1.2 },
      { text: "Bear & Hannah", color: "#ffffff", size: 1.1 },
      { text: "2025", color: COLORS.GOLD_METALLIC, size: 1.2 },
      { text: "2018", color: COLORS.EMERALD_LIGHT, size: 1.0 }
    ];

    return items.map((item, i) => {
      // Spiral positions around the tree
      const angle = (i / items.length) * Math.PI * 2;
      const heightStep = CONFIG.TREE_HEIGHT / (items.length + 1);
      
      // Tree Position: Orbiting close to the tree
      // Increased radius from 1.2 to 1.6 to prevent text clipping into the tree
      const r = CONFIG.TREE_RADIUS_BASE * 1.6; 
      const tx = Math.cos(angle) * r;
      const ty = (i * heightStep) - (CONFIG.TREE_HEIGHT / 2) + 2; // Spread vertically
      const tz = Math.sin(angle) * r;
      
      // Scatter Position: Far out
      const rS = 25;
      const sx = Math.cos(angle + 1) * rS;
      const sy = (Math.random() - 0.5) * 20;
      const sz = Math.sin(angle + 1) * rS;

      return {
        ...item,
        treePos: new Vector3(tx, ty, tz + 4), // Shift z slightly forward
        scatterPos: new Vector3(sx, sy, sz),
        delayOffset: i * 2
      };
    });
  }, []);

  return (
    <>
      {textItems.map((item, idx) => (
        <TextItem
          key={idx}
          text={item.text}
          scatterPos={item.scatterPos}
          treePos={item.treePos}
          progressRef={progressRef}
          delayOffset={item.delayOffset}
          color={item.color}
          fontSize={item.size}
        />
      ))}
    </>
  );
};