import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { simulationStore, SimulationState } from '../stores/useSimulationStore';
import { Camera, Compass, Eye, AlertTriangle, ShieldCheck, Crosshair } from 'lucide-react';

interface DynamicCameraFPVProps {
  className?: string;
  isExpanded?: boolean;
}

export const DynamicCameraFPV: React.FC<DynamicCameraFPVProps> = ({
  className = '',
  isExpanded = false
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [simState, setSimState] = useState<SimulationState>(simulationStore.getState());
  const [webglError, setWebglError] = useState<boolean>(false);
  const [showAiOverlay, setShowAiOverlay] = useState<boolean>(true);

  // Subscribe to central simulation store
  useEffect(() => {
    const unsub = simulationStore.subscribe(() => {
      setSimState(simulationStore.getState());
    });
    return unsub;
  }, []);

  // Three.js Scene Setup for First-Person Robot Camera
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const obstaclesMeshMap = useRef<Map<string, THREE.Mesh>>(new Map());

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;

    try {
      const width = container.clientWidth || 320;
      const height = container.clientHeight || 220;

      // 1. Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0f172a); // Slate-900 sky / room ambient
      scene.fog = new THREE.FogExp2(0x0f172a, 0.25);
      sceneRef.current = scene;

      // 2. Camera: Mounted on JetBot front chassis (tilt down 18 deg)
      // JetBot FOV horizontal is ~160 deg fisheye, standard perspective FOV 85 deg
      const camera = new THREE.PerspectiveCamera(82, width / height, 0.02, 12);
      cameraRef.current = camera;

      // 3. Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'default' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      rendererRef.current = renderer;

      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      // 4. Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
      dirLight.position.set(2, 4, 3);
      scene.add(dirLight);

      // 5. Arena Floor & Track Lines
      const floorGeo = new THREE.PlaneGeometry(3.2, 2.2);
      const floorMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.8,
        metalness: 0.1
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      scene.add(floor);

      // Yellow Center Dash Line Track
      const trackPoints = [
        new THREE.Vector3(-0.9, 0.002, -0.4),
        new THREE.Vector3(-0.3, 0.002, -0.6),
        new THREE.Vector3(0.5, 0.002, -0.5),
        new THREE.Vector3(0.8, 0.002, 0.1),
        new THREE.Vector3(0.4, 0.002, 0.5),
        new THREE.Vector3(-0.4, 0.002, 0.4),
        new THREE.Vector3(-0.9, 0.002, -0.4)
      ];
      const curve = new THREE.CatmullRomCurve3(trackPoints, true);
      const trackGeo = new THREE.TubeGeometry(curve, 64, 0.022, 8, true);
      const trackMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 }); // Yellow road
      const trackMesh = new THREE.Mesh(trackGeo, trackMat);
      scene.add(trackMesh);

      // White Boundary Tape Lines
      const boundaryGeo = new THREE.TubeGeometry(curve, 64, 0.045, 8, true);
      const boundaryMat = new THREE.MeshBasicMaterial({ color: 0x334155, wireframe: true });
      const boundaryMesh = new THREE.Mesh(boundaryGeo, boundaryMat);
      boundaryMesh.position.y = 0.001;
      scene.add(boundaryMesh);

      // 6. Arena Boundary Walls
      const wallMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.3, roughness: 0.7 });
      const wallThickness = 0.04;
      const wallHeight = 0.18;

      // North & South walls
      const wallHGeo = new THREE.BoxGeometry(3.2, wallHeight, wallThickness);
      const wallN = new THREE.Mesh(wallHGeo, wallMat);
      wallN.position.set(0, wallHeight / 2, 1.1);
      scene.add(wallN);

      const wallS = new THREE.Mesh(wallHGeo, wallMat);
      wallS.position.set(0, wallHeight / 2, -1.1);
      scene.add(wallS);

      // East & West walls
      const wallVGeo = new THREE.BoxGeometry(wallThickness, wallHeight, 2.2);
      const wallE = new THREE.Mesh(wallVGeo, wallMat);
      wallE.position.set(1.6, wallHeight / 2, 0);
      scene.add(wallE);

      const wallW = new THREE.Mesh(wallVGeo, wallMat);
      wallW.position.set(-1.6, wallHeight / 2, 0);
      scene.add(wallW);

      // 7. Dynamic Arena Obstacles (Sync with store)
      obstaclesMeshMap.current.clear();
      const currentObs = simulationStore.getState().obstacles;
      for (const obs of currentObs) {
        let obsGeo: THREE.BufferGeometry;
        if (obs.type === 'cylinder') {
          obsGeo = new THREE.CylinderGeometry(obs.radius, obs.radius, obs.height, 16);
        } else {
          obsGeo = new THREE.BoxGeometry(obs.radius * 2, obs.height, obs.radius * 2);
        }
        const obsMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(obs.color),
          roughness: 0.3,
          metalness: 0.2
        });
        const obsMesh = new THREE.Mesh(obsGeo, obsMat);
        obsMesh.position.set(obs.x, obs.height / 2, obs.z);
        scene.add(obsMesh);
        obstaclesMeshMap.current.set(obs.id, obsMesh);
      }

      // 8. Animation & FPV Camera Pose Sync Loop
      const animate = () => {
        const s = simulationStore.getState();

        if (cameraRef.current) {
          // Camera position in 3D:
          // JetBot origin (x, 0, z), camera offset forward +0.065m, height 0.088m
          const camForwardOffset = 0.065;
          const camHeight = 0.088;
          const camX = s.x + camForwardOffset * Math.cos(s.yaw);
          const camZ = s.z + camForwardOffset * Math.sin(s.yaw);
          const camY = camHeight;

          cameraRef.current.position.set(camX, camY, camZ);

          // Camera Look Direction:
          // Look forward along yaw, with pitch down ~18 deg (0.31 rad) to see road
          const lookDist = 0.6;
          const pitchDown = 0.16;
          const targetX = camX + lookDist * Math.cos(s.yaw);
          const targetZ = camZ + lookDist * Math.sin(s.yaw);
          const targetY = camHeight - Math.sin(pitchDown) * lookDist;

          cameraRef.current.lookAt(targetX, targetY, targetZ);
        }

        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          try {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
          } catch {
            // protected
          }
        }

        animFrameRef.current = requestAnimationFrame(animate);
      };

      animFrameRef.current = requestAnimationFrame(animate);

      // Resize observer
      const handleResize = () => {
        if (!container || !rendererRef.current || !cameraRef.current) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(w, h);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

        // Deep dispose Three.js resources
        try {
          scene.traverse((obj) => {
            if ((obj as THREE.Mesh).isMesh) {
              const m = obj as THREE.Mesh;
              if (m.geometry) m.geometry.dispose();
              if (m.material) {
                if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
                else m.material.dispose();
              }
            }
          });
        } catch {
          // ignore
        }

        if (renderer) {
          try {
            renderer.dispose();
            if (container && renderer.domElement && container.contains(renderer.domElement)) {
              container.removeChild(renderer.domElement);
            }
          } catch {
            // ignore
          }
        }
      };
    } catch (err) {
      console.warn('FPV Camera WebGL initialization error:', err);
      setWebglError(true);
    }
  }, []);

  return (
    <div className={`relative flex flex-col bg-[#070D1B] rounded-2xl overflow-hidden border border-cyan-500/25 shadow-xl ${className}`}>
      {/* Camera Header Bar */}
      <div className="px-3 py-2 bg-gradient-to-r from-[#0C152B] via-[#0E1A36] to-[#122347] border-b border-cyan-500/20 flex items-center justify-between gap-2 text-xs select-none">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
            <Camera className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-white text-xs">
            Khung C: Camera FPV Thực (Góc Nhìn Thứ Nhất)
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            LIVE 30FPS
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowAiOverlay(!showAiOverlay)}
            className={`px-2 py-0.5 rounded text-[11px] font-bold border transition ${
              showAiOverlay
                ? 'bg-teal-500/20 border-teal-400/50 text-teal-200'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Bật/Tắt Lớp Phủ AI & Điểm Ngắm"
          >
            {showAiOverlay ? 'AI Overlay: BẬT' : 'AI Overlay: TẮT'}
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Viewport */}
      <div className="relative w-full flex-1 min-h-[200px] bg-[#050812] flex items-center justify-center overflow-hidden">
        {webglError ? (
          <div className="p-4 text-center text-slate-400 space-y-2">
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
            <p className="text-xs">Không thể khởi tạo WebGL FPV Camera trên thiết bị hiện tại.</p>
          </div>
        ) : (
          <div ref={mountRef} className="w-full h-full relative" />
        )}

        {/* AI Perception & Road Following Overlay */}
        {showAiOverlay && !webglError && (
          <div className="absolute inset-0 pointer-events-none select-none">
            {/* Crosshair Center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
              </div>
            </div>

            {/* AI Road Target Aiming Point (Calculated from real road waypoint) */}
            <div
              className="absolute w-7 h-7 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-75"
              style={{
                left: `${((simState.sensors.cameraAimX + 1) / 2) * 100}%`,
                top: `${((simState.sensors.cameraAimY + 1) / 2) * 100}%`
              }}
            >
              <div className="w-6 h-6 rounded-full border-2 border-emerald-400 bg-emerald-500/25 animate-ping absolute"></div>
              <div className="w-5 h-5 rounded-full border-2 border-emerald-400 flex items-center justify-center">
                <Crosshair className="w-3.5 h-3.5 text-emerald-300" />
              </div>
              <span className="absolute -bottom-4 bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-[9px] font-mono px-1 rounded whitespace-nowrap">
                Aim ({simState.sensors.cameraAimPixelX}, {simState.sensors.cameraAimPixelY})
              </span>
            </div>

            {/* Obstacle Warning Box if detected in front */}
            {simState.sensors.isObstacleDetected && (
              <div className="absolute top-3 left-3 bg-red-950/85 border border-red-500/70 text-red-200 px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-2 shadow-lg backdrop-blur-xs animate-pulse">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <div>
                  <div className="font-black text-[11px] leading-tight">VẬT CẢN PHÍA TRƯỚC!</div>
                  <div className="text-[10px] font-mono text-red-300">
                    Khoảng cách: {simState.sensors.ultrasonicDistCm}cm | P(blocked): {(simState.sensors.probBlocked * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            )}

            {/* Bottom HUD Telemetry Strip */}
            <div className="absolute bottom-2 inset-x-2 bg-black/60 backdrop-blur-xs border border-white/10 rounded-xl px-2.5 py-1 text-[10px] font-mono text-slate-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold">POS:</span>
                <span>X: {simState.x.toFixed(2)}m</span>
                <span>Z: {simState.z.toFixed(2)}m</span>
                <span>Yaw: {((simState.yaw * 180) / Math.PI).toFixed(0)}°</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <span>IMX219 CSI 8MP (224×224)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
