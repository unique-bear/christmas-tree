import React, { useRef, useMemo, Suspense, useState } from 'react';
import { useFrame, useLoader, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG, COLORS } from '../constants';

interface PhotoFramesProps {
  progressRef: React.MutableRefObject<number>;
}

// ============================================================================
// ⚠️ 图片加载说明 / IMAGE LOADING INSTRUCTIONS
// ============================================================================
// 
// 1. 在线预览 (Cloud Preview): 
//    使用网络图片，防止程序在云端预览时崩溃。
//    Use remote images to prevent crashes in cloud preview.
//
// 2. 本地运行 (Localhost):
//    如果您已设置本地服务器 (如 python http.server)，并且图片在 'public/Image' 文件夹下：
//    请注释掉 Option A，解开 Option B。
//    If running locally and images are in 'public/Image', comment Option A and uncomment Option B.
//
// ============================================================================

// --- 选项 A: 在线网络图片 (默认开启) ---
// --- Option A: Remote Images (Default) ---

// --- 选项 B: 本地图片 (由用户手动开启) ---
// --- Option B: Local Images (User manually enables) ---

const PHOTO_URLS = [
  "/Image/img1.jpeg",
  "/Image/img2.jpeg",
  "/Image/img3.jpeg",
  "/Image/img4.jpeg",
  "/Image/img5.jpeg",
  "/Image/img6.jpeg"
];

const FrameItem: React.FC<{
  url: string;
  scatterPos: THREE.Vector3;
  treePos: THREE.Vector3;
  progressRef: React.MutableRefObject<number>;
  delay: number;
}> = ({ url, scatterPos, treePos, progressRef, delay }) => {
  const groupRef = useRef<THREE.Group>(null);
  const currentPos = useRef(new THREE.Vector3());
  const [isZoomed, setIsZoomed] = useState(false);
  const [hovered, setHovered] = useState(false);
  
  // 使用 useLoader 加载纹理
  const texture = useLoader(THREE.TextureLoader, url);
  
  // 点击处理
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setIsZoomed(!isZoomed);
  };

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const p = progressRef.current; // 1 = Tree, 0 = Scattered

    // Interpolate Position
    if (!isZoomed) {
      currentPos.current.lerpVectors(scatterPos, treePos, p);
      
      // Add Float
      const floatY = Math.sin(t + delay) * 0.2;
      groupRef.current.position.copy(currentPos.current);
      groupRef.current.position.y += floatY;
    } else {
      // 放大时移动到相机前方中心位置
      const targetPos = new THREE.Vector3(0, 0, 5);
      groupRef.current.position.lerp(targetPos, 0.1);
    }

    // Always look at camera
    groupRef.current.lookAt(state.camera.position);

    // Scale Logic
    let targetScale;
    if (isZoomed) {
      // 放大到正常尺寸
      targetScale = 3.5;
    } else {
      // When Scattered (p=0): Large size (1.8) for viewing
      // When Tree (p=1): Small size (0.6) to fit on tree as decoration
      targetScale = THREE.MathUtils.lerp(1.8, 0.6, p);
    }
    
    // 平滑过渡
    const currentScale = groupRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.1);
    groupRef.current.scale.setScalar(newScale);
  });

  // 这里的 scale 控制相框的宽高比
  // [1, 1.33] 大约是 3:4 的比例，非常适合竖屏手机照片
  const frameWidth = 1;
  const frameHeight = 1.33; 

  return (
    <group ref={groupRef}>
      {/* The Frame Border - 放在后面 */}
      <mesh position={[0, 0, -0.03]}>
        <boxGeometry args={[frameWidth + 0.1, frameHeight + 0.1, 0.05]} />
        <meshStandardMaterial 
          color={hovered ? '#FFE55C' : COLORS.GOLD_METALLIC}
          roughness={0.2} 
          metalness={1.0} 
        />
      </mesh>
      
      {/* The Photo - 放在前面，可点击 */}
      <mesh 
        position={[0, 0, 0]}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <planeGeometry args={[frameWidth, frameHeight]} />
        <meshBasicMaterial 
          map={texture} 
          color={texture ? undefined : '#ff0000'}
          transparent 
          opacity={0.95}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* 放大时的遮罩背景 */}
      {isZoomed && (
        <mesh position={[0, 0, -0.5]} scale={[100, 100, 1]}>
          <planeGeometry />
          <meshBasicMaterial color="#000000" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
};

export const PhotoFrames: React.FC<PhotoFramesProps> = ({ progressRef }) => {
  const frames = useMemo(() => {
    return PHOTO_URLS.map((url, i) => {
      // Tree Position: Embedded in the tree
      const angle = (i / PHOTO_URLS.length) * Math.PI * 2;
      // 稍微收缩半径，让照片像是挂在树枝内部
      const r = CONFIG.TREE_RADIUS_BASE * 0.85; 
      const tx = Math.cos(angle) * r;
      // 在树的高度范围内均匀分布 (-5 到 +5)
      const ty = (i / (PHOTO_URLS.length - 1)) * 10 - 5; 
      const tz = Math.sin(angle) * r;
      
      // Scatter Position: Floating around the user in a circle
      const rS = 14; // 散开时的半径
      const angleS = (i / PHOTO_URLS.length) * Math.PI * 2 + 0.5;
      const sx = Math.cos(angleS) * rS;
      const sy = (Math.random() - 0.5) * 6; // 垂直方向随机高度
      const sz = Math.sin(angleS) * rS + 8; // 稍微偏向相机前方(+z)

      return {
        url,
        treePos: new THREE.Vector3(tx, ty, tz),
        scatterPos: new THREE.Vector3(sx, sy, sz),
        delay: i * 1.5
      };
    });
  }, []);

  return (
    <>
      {frames.map((frame, i) => (
        <Suspense key={i} fallback={null}>
          <FrameItem 
            url={frame.url}
            treePos={frame.treePos}
            scatterPos={frame.scatterPos}
            progressRef={progressRef}
            delay={frame.delay}
          />
        </Suspense>
      ))}
    </>
  );
};