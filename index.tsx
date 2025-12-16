import React, { useState, Suspense, useCallback, useMemo, useRef, useLayoutEffect, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Loader, Image, Text, PerspectiveCamera, Environment, Sparkles, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

// ============================================================================
// ⚠️ CONSOLIDATED FILE / 合并文件说明
// 
// In a "No-Build" environment (running directly in browser via server.py),
// importing separate .tsx files is unstable because the browser cannot compile
// imported modules (Babel only compiles the entry point).
// 
// Therefore, all components are consolidated here to ensure the app runs reliably.
// 
// 在无构建环境（直接运行）下，浏览器无法处理被 import 的 .tsx 文件。
// 为确保运行，所有组件代码已合并至此。
// ============================================================================

// --- TYPES ---
enum AppMode {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

// --- CONSTANTS ---
const COLORS = {
  EMERALD_DEEP: "#001a10",
  EMERALD_LIGHT: "#004d2e",
  GOLD_METALLIC: "#FFD700",
  GOLD_ROSE: "#E0BFB8",
  WHITE_WARM: "#FFFDD0",
  RED_VELVET: "#8a0000"
};

const CONFIG = {
  PARTICLE_COUNT: 2800,
  ORNAMENT_COUNT: 180,
  TREE_HEIGHT: 14,
  TREE_RADIUS_BASE: 5.5,
  SCATTER_RADIUS: 35,
  ANIMATION_SPEED: 2.0,
};

// --- COMPONENTS ---

// 1. STAR
const Star = ({ progressRef }) => {
  const meshRef = useRef(null);
  
  const treeTopY = (CONFIG.TREE_HEIGHT / 2) + 1.5; 
  const treePos = new THREE.Vector3(0, treeTopY, 0);
  const scatterPos = new THREE.Vector3(0, 35, -5);

  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const outerRadius = 1.2;
    const innerRadius = 0.5;
    const spikes = 5;
    for (let i = 0; i < spikes * 2; i++) {
        const l = i % 2 === 0 ? outerRadius : innerRadius;
        const a = (i / spikes) * Math.PI;
        const x = Math.cos(a + Math.PI / 2) * l;
        const y = Math.sin(a + Math.PI / 2) * l;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
  }, []);

  const extrudeSettings = useMemo(() => ({
    steps: 1, depth: 0.2, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 2
  }), []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const p = progressRef.current;
    meshRef.current.position.lerpVectors(scatterPos, treePos, p);
    const scale = THREE.MathUtils.lerp(0.01, 1, p);
    meshRef.current.scale.setScalar(scale);
    meshRef.current.rotation.y += delta * 2.0;
    meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2.5) * 0.1;
  });

  return (
    <group ref={meshRef}>
      <mesh castShadow receiveShadow>
        <extrudeGeometry args={[starShape, extrudeSettings]} />
        <meshStandardMaterial color={COLORS.GOLD_METALLIC} emissive={COLORS.GOLD_METALLIC} emissiveIntensity={4.0} roughness={0.1} metalness={1.0} />
      </mesh>
      <pointLight color={COLORS.GOLD_METALLIC} intensity={40} distance={15} decay={2} />
      <Sparkles count={60} scale={5} size={5} speed={1.2} opacity={1} color={COLORS.WHITE_WARM} />
    </group>
  );
};

// 2. ORNAMENTS
const tempObj = new THREE.Object3D();
const tempVec = new THREE.Vector3();

const Ornaments = ({ progressRef }) => {
  const meshRef = useRef(null);
  const ornaments = useMemo(() => {
    const data = [];
    for (let i = 0; i < CONFIG.ORNAMENT_COUNT; i++) {
      const t = Math.random();
      const y = (t * CONFIG.TREE_HEIGHT) - (CONFIG.TREE_HEIGHT / 2);
      const radius = ((1 - t) * CONFIG.TREE_RADIUS_BASE) + 0.5; 
      const theta = t * 15 * Math.PI + (Math.random() * Math.PI * 2);
      const treePos = new THREE.Vector3(radius * Math.cos(theta), y, radius * Math.sin(theta));

      const u = Math.random();
      const v = Math.random();
      const thetaS = 2 * Math.PI * u;
      const phiS = Math.acos(2 * v - 1);
      const rS = (CONFIG.SCATTER_RADIUS + 5) * Math.cbrt(Math.random()); 
      const scatterPos = new THREE.Vector3(rS * Math.sin(phiS) * Math.cos(thetaS), rS * Math.sin(phiS) * Math.sin(thetaS), rS * Math.cos(phiS));

      let color = COLORS.GOLD_METALLIC;
      let scale = 0.3;
      const type = Math.random();
      if (type > 0.7) { color = COLORS.GOLD_ROSE; scale = 0.35; } 
      else if (type > 0.9) { color = COLORS.RED_VELVET; scale = 0.4; }

      data.push({ treePos, scatterPos, scale, color });
    }
    return data;
  }, []);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    ornaments.forEach((o, i) => {
      tempObj.position.copy(o.scatterPos);
      tempObj.scale.setScalar(o.scale);
      tempObj.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObj.matrix);
      meshRef.current.setColorAt(i, new THREE.Color(o.color));
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.instanceColor.needsUpdate = true;
  }, [ornaments]);

  useFrame(() => {
    if (!meshRef.current) return;
    const t = progressRef.current;
    ornaments.forEach((o, i) => {
      tempVec.lerpVectors(o.scatterPos, o.treePos, t);
      tempObj.position.copy(tempVec);
      tempObj.rotation.y += 0.01;
      tempObj.scale.setScalar(o.scale);
      tempObj.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObj.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, CONFIG.ORNAMENT_COUNT]} castShadow receiveShadow>
      <sphereGeometry args={[1, 32, 32]} />
      <meshPhysicalMaterial color="white" roughness={0.15} metalness={1.0} clearcoat={1} clearcoatRoughness={0.1} />
    </instancedMesh>
  );
};

// 3. MAGIC PARTICLES
const MagicParticles = ({ progressRef }) => {
  const meshRef = useRef(null);
  const particles = useMemo(() => {
    const data = [];
    for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
      const t = Math.random(); 
      const y = (t * CONFIG.TREE_HEIGHT) - (CONFIG.TREE_HEIGHT / 2);
      const radius = (1 - t) * CONFIG.TREE_RADIUS_BASE;
      const theta = t * 30 * Math.PI + (Math.random() * Math.PI * 2);
      const noise = 0.4;
      const treePos = new THREE.Vector3(
        radius * Math.cos(theta) + (Math.random() - 0.5) * noise, 
        y + (Math.random() - 0.5) * noise, 
        radius * Math.sin(theta) + (Math.random() - 0.5) * noise
      );

      const u = Math.random();
      const v = Math.random();
      const thetaS = 2 * Math.PI * u;
      const phiS = Math.acos(2 * v - 1);
      const rS = CONFIG.SCATTER_RADIUS * Math.cbrt(Math.random()); 
      const scatterPos = new THREE.Vector3(rS * Math.sin(phiS) * Math.cos(thetaS), rS * Math.sin(phiS) * Math.sin(thetaS), rS * Math.cos(phiS));

      const isGold = Math.random() > 0.85; 
      data.push({
        treePos, scatterPos,
        scale: Math.random() * 0.12 + 0.03,
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
      tempObj.position.copy(p.scatterPos);
      tempObj.scale.setScalar(p.scale);
      tempObj.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObj.matrix);
      meshRef.current.setColorAt(i, new THREE.Color(p.color));
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.instanceColor.needsUpdate = true;
  }, [particles]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    const globalProgress = progressRef.current;
    particles.forEach((p, i) => {
      tempVec.lerpVectors(p.scatterPos, p.treePos, globalProgress);
      tempVec.y += Math.sin(time * p.speed + p.phase) * 0.05;
      tempObj.position.copy(tempVec);
      tempObj.rotation.x = time * p.speed * 0.5;
      tempObj.rotation.y = time * p.speed * 0.3;
      tempObj.scale.setScalar(p.scale * (1 + (Math.sin(time * 2 + p.phase) * 0.1)));
      tempObj.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObj.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, CONFIG.PARTICLE_COUNT]} castShadow receiveShadow>
      <tetrahedronGeometry args={[1, 0]} />
      <meshStandardMaterial toneMapped={false} color="#ffffff" emissive={COLORS.EMERALD_DEEP} emissiveIntensity={0.5} roughness={0.1} metalness={0.9} />
    </instancedMesh>
  );
};

// 4. FLOATING TEXT
const TextItem = ({ text, scatterPos, treePos, progressRef, delayOffset, color, fontSize }) => {
  const meshRef = useRef(null);
  const currentPos = useRef(new THREE.Vector3());

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const p = progressRef.current;
    currentPos.current.lerpVectors(scatterPos, treePos, p);
    const floatY = Math.sin(t * 1.5 + delayOffset) * 0.3;
    meshRef.current.position.copy(currentPos.current);
    meshRef.current.position.y += floatY;
    meshRef.current.lookAt(state.camera.position);
    const scale = 0.8 + (0.4 * p);
    meshRef.current.scale.setScalar(scale);
    meshRef.current.material.opacity = 0.6 + (0.4 * p);
  });

  return (
    <Text ref={meshRef} fontSize={fontSize} color={color} anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor={COLORS.EMERALD_DEEP}>
      {text}
    </Text>
  );
};

const FloatingText = ({ progressRef }) => {
  const textItems = useMemo(() => {
    const items = [
      { text: "Merry Christmas", color: COLORS.GOLD_METALLIC, size: 1.5 },
      { text: "I Love You", color: COLORS.GOLD_ROSE, size: 1.2 },
      { text: "Bear & Hannah", color: "#ffffff", size: 1.1 },
      { text: "2025", color: COLORS.GOLD_METALLIC, size: 1.2 },
      { text: "2018", color: COLORS.EMERALD_LIGHT, size: 1.0 }
    ];
    return items.map((item, i) => {
      const angle = (i / items.length) * Math.PI * 2;
      const heightStep = CONFIG.TREE_HEIGHT / (items.length + 1);
      const r = CONFIG.TREE_RADIUS_BASE * 1.6; 
      const tx = Math.cos(angle) * r;
      const ty = (i * heightStep) - (CONFIG.TREE_HEIGHT / 2) + 2; 
      const tz = Math.sin(angle) * r;
      
      const rS = 25;
      const sx = Math.cos(angle + 1) * rS;
      const sy = (Math.random() - 0.5) * 20;
      const sz = Math.sin(angle + 1) * rS;

      return {
        ...item,
        treePos: new THREE.Vector3(tx, ty, tz + 4), 
        scatterPos: new THREE.Vector3(sx, sy, sz),
        delayOffset: i * 2
      };
    });
  }, []);

  return (
    <>
      {textItems.map((item, idx) => (
        <TextItem key={idx} {...item} progressRef={progressRef} delayOffset={item.delayOffset} fontSize={item.size} />
      ))}
    </>
  );
};

// 5. PHOTO FRAMES
// Updated stable URLs to prevent "undefined" texture load errors
const PHOTO_URLS = [
  "https://images.unsplash.com/photo-1544427920-24e832256f72?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1482517967863-00e15c9b80fb?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1511268011861-691ed6e0992b?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1605646199346-6019a32c258d?auto=format&fit=crop&q=80&w=600"
];

const FrameItem = ({ url, scatterPos, treePos, progressRef, delay }) => {
  const groupRef = useRef(null);
  const currentPos = useRef(new THREE.Vector3());

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const p = progressRef.current;
    currentPos.current.lerpVectors(scatterPos, treePos, p);
    const floatY = Math.sin(t + delay) * 0.2;
    groupRef.current.position.copy(currentPos.current);
    groupRef.current.position.y += floatY;
    groupRef.current.lookAt(state.camera.position);
    const targetScale = THREE.MathUtils.lerp(1.8, 0.6, p);
    groupRef.current.scale.setScalar(targetScale);
  });

  const frameWidth = 1;
  const frameHeight = 1.33; 

  return (
    <group ref={groupRef}>
      <Image url={url} transparent opacity={0.95} scale={[frameWidth, frameHeight]} side={THREE.DoubleSide} toneMapped={false} />
      <mesh position={[0, 0, -0.01]}>
        <boxGeometry args={[frameWidth + 0.1, frameHeight + 0.1, 0.05]} />
        <meshStandardMaterial color={COLORS.GOLD_METALLIC} roughness={0.2} metalness={1.0} />
      </mesh>
    </group>
  );
};

const PhotoFrames = ({ progressRef }) => {
  const frames = useMemo(() => {
    return PHOTO_URLS.map((url, i) => {
      const angle = (i / PHOTO_URLS.length) * Math.PI * 2;
      const r = CONFIG.TREE_RADIUS_BASE * 0.85; 
      const tx = Math.cos(angle) * r;
      const ty = (i / (PHOTO_URLS.length - 1)) * 10 - 5; 
      const tz = Math.sin(angle) * r;
      
      const rS = 14; 
      const angleS = (i / PHOTO_URLS.length) * Math.PI * 2 + 0.5;
      const sx = Math.cos(angleS) * rS;
      const sy = (Math.random() - 0.5) * 6; 
      const sz = Math.sin(angleS) * rS + 8; 

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
        <FrameItem key={i} {...frame} progressRef={progressRef} />
      ))}
    </>
  );
};

// 6. SCENE
const Scene = ({ mode, toggleMode }) => {
  const controlsRef = useRef(null);
  const groupRef = useRef(null);
  const progressRef = useRef(0);
  
  useFrame((state, delta) => {
    const target = mode === AppMode.TREE_SHAPE ? 1 : 0;
    progressRef.current = THREE.MathUtils.damp(progressRef.current, target, 2.0, delta);
    
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.15;

    const p = progressRef.current;
    if (controlsRef.current) {
        controlsRef.current.autoRotate = p > 0.8;
        controlsRef.current.autoRotateSpeed = 1.0;
        controlsRef.current.update();
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 35]} fov={35} />
      <OrbitControls ref={controlsRef} enablePan={false} enableZoom={true} maxDistance={60} minDistance={10} maxPolarAngle={Math.PI / 1.6} enableDamping target={[0, 1, 0]} />

      <mesh visible={false} onClick={toggleMode} position={[0,0,0]}>
         <sphereGeometry args={[60, 8, 8]} />
         <meshBasicMaterial side={THREE.BackSide} />
      </mesh>

      <ambientLight intensity={0.2} color={COLORS.EMERALD_DEEP} />
      <spotLight position={[15, 20, 15]} angle={0.4} penumbra={1} intensity={300} color={COLORS.GOLD_METALLIC} castShadow shadow-bias={-0.0001} />
      <spotLight position={[-15, 10, -20]} intensity={200} color="#aaddff" />
      <pointLight position={[-10, 0, 10]} intensity={80} color={COLORS.GOLD_ROSE} />

      <Environment preset="city" blur={0.7} />

      <group ref={groupRef} position={[0, -1, 0]}>
        <Star progressRef={progressRef} />
        <MagicParticles progressRef={progressRef} />
        <Ornaments progressRef={progressRef} />
        <FloatingText progressRef={progressRef} />
        <PhotoFrames progressRef={progressRef} />
      </group>

      <Sparkles count={200} scale={40} size={2} speed={0.4} opacity={0.3} color={COLORS.GOLD_METALLIC} />

      <EffectComposer enableNormalPass={false}>
        <Bloom luminanceThreshold={0.85} mipmapBlur intensity={1.5} radius={0.5} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
      
      <color attach="background" args={[COLORS.EMERALD_DEEP]} />
      <fog attach="fog" args={[COLORS.EMERALD_DEEP, 15, 60]} />
    </>
  );
};

// 7. OVERLAY
const Overlay = ({ mode }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-40">
      <header className="flex justify-between items-start">
        <div className="bg-black/20 backdrop-blur-md border border-yellow-600/30 p-6 rounded-lg min-w-[240px]">
          <h1 className="text-yellow-500 font-serif text-3xl tracking-wider drop-shadow-lg">
            Stardust for You
          </h1>
          <div className="flex justify-end mt-2">
            <p className="text-emerald-100/90 text-sm tracking-widest font-serif italic">
              -- Hannah
            </p>
          </div>
        </div>
      </header>
      <footer className="flex flex-col items-center pb-8 opacity-70">
        <div className="text-yellow-100/80 font-serif text-sm tracking-widest text-center space-y-2">
            <p>CLICK TO TRANSFORM</p>
            <div className="text-xs text-emerald-300/60 font-mono">
                DRAG TO ROTATE • SCROLL TO ZOOM
            </div>
        </div>
      </footer>
    </div>
  );
};

// 8. HAND CONTROL (Optional - Keeping logic but disabling display for clean load if webcam fails)
const HandControl = ({ setMode, setRotationTarget }) => {
  const videoRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, active: false });
  const [gesture, setGesture] = useState('NONE');

  useEffect(() => {
    let handLandmarker = null;
    let animationFrameId;

    const setup = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm");
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener("loadeddata", predictWebcam);
        }
        setLoaded(true);
      } catch (err) {
        console.log("Webcam/MediaPipe disabled or error:", err);
      }
    };

    const predictWebcam = () => {
      if (!handLandmarker || !videoRef.current) return;
      let startTimeMs = performance.now();
      if (videoRef.current.currentTime > 0) {
        const results = handLandmarker.detectForVideo(videoRef.current, startTimeMs);
        if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];
          const indexTip = landmarks[8];
          const screenX = (1 - indexTip.x) * window.innerWidth;
          const screenY = indexTip.y * window.innerHeight;
          setCursorPos({ x: screenX, y: screenY, active: true });
          const thumbTip = landmarks[4];
          const distance = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
          if (distance < 0.05) {
            setGesture('GRAB');
            setMode(AppMode.TREE_SHAPE);
          } else {
            setGesture('OPEN');
            setMode(AppMode.SCATTERED);
            const rotationY = ((1 - landmarks[9].x) - 0.5) * 4; 
            if (setRotationTarget) setRotationTarget(rotationY);
          }
        } else {
          setCursorPos(prev => ({ ...prev, active: false }));
        }
      }
      animationFrameId = requestAnimationFrame(predictWebcam);
    };

    setup();
    return () => {
      cancelAnimationFrame(animationFrameId);
      handLandmarker?.close();
    };
  }, []);

  return (
    <>
      <div className="absolute bottom-4 right-4 z-50 pointer-events-none opacity-80 hidden">
        <video ref={videoRef} autoPlay playsInline muted className="w-32 h-24 rounded-lg border-2 border-emerald-500/50 object-cover webcam-mirror" />
      </div>
      {cursorPos.active && (
        <div className="absolute z-50 pointer-events-none transition-transform duration-75" style={{ left: cursorPos.x, top: cursorPos.y, transform: 'translate(-50%, -50%)' }}>
            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center backdrop-blur-sm transition-colors duration-300 ${gesture === 'GRAB' ? 'border-yellow-400 bg-yellow-400/20' : 'border-emerald-400 bg-emerald-400/10'}`}>
                <div className={`w-2 h-2 rounded-full ${gesture === 'GRAB' ? 'bg-yellow-400' : 'bg-emerald-400'}`} />
            </div>
        </div>
      )}
    </>
  );
};

// 9. MAIN APP
const App = () => {
  const [mode, setMode] = useState(AppMode.SCATTERED);
  
  const toggleMode = useCallback(() => {
    setMode(prev => prev === AppMode.TREE_SHAPE ? AppMode.SCATTERED : AppMode.TREE_SHAPE);
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <Canvas
        dpr={[1, 2]} 
        shadows
        camera={{ position: [0, 0, 32], fov: 40 }}
        gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      >
        <Suspense fallback={null}>
          <Scene mode={mode} toggleMode={toggleMode} />
        </Suspense>
      </Canvas>

      <Overlay mode={mode} />
      
      {/* Uncomment below to enable Hand Control if desired */}
      {/* <HandControl setMode={setMode} setRotationTarget={() => {}} /> */}
      
      <Loader 
        containerStyles={{ background: '#001a10' }}
        innerStyles={{ width: '200px', height: '2px', background: '#333' }}
        barStyles={{ background: '#FFD700', height: '2px' }}
        dataStyles={{ color: '#FFD700', fontFamily: 'serif' }}
      />
    </div>
  );
};

// ENTRY POINT
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element to mount to");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);