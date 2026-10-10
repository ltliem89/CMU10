import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  ROBOT_GEOMETRY_CONFIG,
  InspectionMode,
  ComponentSpec
} from '../types/robotGeometry';
import {
  RotateCcw,
  Eye,
  Maximize2,
  Box,
  Compass,
  Radio,
  Layers,
  Ruler,
  Info,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface Robot3DCanvasProps {
  leftSpeed?: number;
  rightSpeed?: number;
  selectedComponentId?: string | null;
  onSelectComponent?: (comp: ComponentSpec | null) => void;
  inspectionMode?: InspectionMode;
  onInspectionModeChange?: (mode: InspectionMode) => void;
}

export const Robot3DCanvas: React.FC<Robot3DCanvasProps> = ({
  leftSpeed = 0.0,
  rightSpeed = 0.0,
  selectedComponentId = null,
  onSelectComponent,
  inspectionMode = 'realistic',
  onInspectionModeChange
}) => {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const [webglError, setWebglError] = useState<boolean>(false);
  const [internalMode, setInternalMode] = useState<InspectionMode>(inspectionMode);
  const [activeComp, setActiveComp] = useState<ComponentSpec | null>(null);

  // References to dynamic objects in Three.js scene
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const leftWheelGroupRef = useRef<THREE.Group | null>(null);
  const rightWheelGroupRef = useRef<THREE.Group | null>(null);
  const componentsMapRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const inspectionHelpersRef = useRef<{
    wireframeObjects: THREE.Object3D[];
    collisionHull: THREE.Object3D | null;
    axesHelper: THREE.Object3D | null;
    sensorCones: THREE.Object3D | null;
    dimensionRulers: THREE.Object3D | null;
  }>({
    wireframeObjects: [],
    collisionHull: null,
    axesHelper: null,
    sensorCones: null,
    dimensionRulers: null
  });

  const animFrameRef = useRef<number | null>(null);
  const speedsRef = useRef({ left: leftSpeed, right: rightSpeed });

  useEffect(() => {
    speedsRef.current = { left: leftSpeed, right: rightSpeed };
  }, [leftSpeed, rightSpeed]);

  useEffect(() => {
    setInternalMode(inspectionMode);
  }, [inspectionMode]);

  // Orbit camera control state
  const isDraggingRef = useRef(false);
  const isRightDraggingRef = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const cameraDistanceRef = useRef(0.38); // Distance in meters
  const cameraPolarAngleRef = useRef(Math.PI / 4); // Elevation
  const cameraAzimuthAngleRef = useRef(Math.PI / 4 + 0.3); // Rotation around Y
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0.065, 0)); // Center of robot

  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const r = cameraDistanceRef.current;
    const phi = cameraPolarAngleRef.current;
    const theta = cameraAzimuthAngleRef.current;
    const target = cameraTargetRef.current;

    cameraRef.current.position.x = target.x + r * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = target.y + r * Math.cos(phi);
    cameraRef.current.position.z = target.z + r * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(target);
  };

  const setViewPreset = (preset: 'isometric' | 'top' | 'front' | 'side' | 'reset') => {
    switch (preset) {
      case 'isometric':
        cameraPolarAngleRef.current = Math.PI / 4;
        cameraAzimuthAngleRef.current = Math.PI / 4 + 0.3;
        cameraDistanceRef.current = 0.36;
        cameraTargetRef.current.set(0, 0.065, 0);
        break;
      case 'top':
        cameraPolarAngleRef.current = 0.05;
        cameraAzimuthAngleRef.current = 0;
        cameraDistanceRef.current = 0.38;
        cameraTargetRef.current.set(0, 0.065, 0);
        break;
      case 'front':
        cameraPolarAngleRef.current = Math.PI / 2.3;
        cameraAzimuthAngleRef.current = 0;
        cameraDistanceRef.current = 0.35;
        cameraTargetRef.current.set(0, 0.07, 0);
        break;
      case 'side':
        cameraPolarAngleRef.current = Math.PI / 2.3;
        cameraAzimuthAngleRef.current = Math.PI / 2;
        cameraDistanceRef.current = 0.35;
        cameraTargetRef.current.set(0, 0.07, 0);
        break;
      case 'reset':
        cameraPolarAngleRef.current = Math.PI / 3.8;
        cameraAzimuthAngleRef.current = 0.85;
        cameraDistanceRef.current = 0.36;
        cameraTargetRef.current.set(0, 0.065, 0);
        break;
    }
    updateCameraPosition();
  };

  // Build the complete 3D mechanical model
  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animId: number | null = null;

    try {
      const width = container.clientWidth || 580;
      const height = container.clientHeight || 420;

      // 1. Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a101f);
      sceneRef.current = scene;

      // 2. Camera
      const camera = new THREE.PerspectiveCamera(42, width / height, 0.02, 10);
      cameraRef.current = camera;
      updateCameraPosition();

      // 3. Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'default' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;

      // Ensure empty and safely append canvas DOM element
      container.innerHTML = '';
      container.appendChild(renderer.domElement);

    // 4. Lighting (Studio PBR Rig)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    mainKeyLight.position.set(0.6, 0.8, 0.5);
    mainKeyLight.castShadow = true;
    mainKeyLight.shadow.mapSize.width = 1024;
    mainKeyLight.shadow.mapSize.height = 1024;
    mainKeyLight.shadow.camera.near = 0.1;
    mainKeyLight.shadow.camera.far = 2;
    mainKeyLight.shadow.camera.left = -0.25;
    mainKeyLight.shadow.camera.right = 0.25;
    mainKeyLight.shadow.camera.top = 0.25;
    mainKeyLight.shadow.camera.bottom = -0.25;
    scene.add(mainKeyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    fillLight.position.set(-0.6, 0.4, -0.4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xf59e0b, 0.5);
    rimLight.position.set(0, 0.5, -0.6);
    scene.add(rimLight);

    // 5. Ground Studio Floor with Grid
    const groundGeo = new THREE.PlaneGeometry(1.6, 1.6);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x070c18,
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(1.2, 24, 0x0284c7, 0x1e293b);
    gridHelper.position.y = 0.0005; // Slightly above ground to prevent z-fighting
    scene.add(gridHelper);

    // 6. ROBOT ROOT GROUP (Origin is at wheel contact on ground: (0, 0, 0))
    const robotRoot = new THREE.Group();
    robotRoot.name = 'robotRoot';
    scene.add(robotRoot);

    const componentsMap = new Map<string, THREE.Object3D>();
    componentsMapRef.current = componentsMap;

    // Common Materials
    const aluminumMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // JetBot signature cyan/blue
      metalness: 0.7,
      roughness: 0.35
    });
    const acrylicMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      roughness: 0.25,
      metalness: 0.1,
      transparent: true,
      opacity: 0.88
    });
    const brassStandoffMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Brass/Gold
      metalness: 0.85,
      roughness: 0.25
    });
    const motorYellowMat = new THREE.MeshStandardMaterial({
      color: 0xeab308, // TT Motor yellow
      roughness: 0.45,
      metalness: 0.1
    });
    const tireRubberMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.85,
      metalness: 0.05
    });
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xf97316, // Orange rim
      metalness: 0.5,
      roughness: 0.3
    });
    const jetsonPcbMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b, // Dark green FR4 PCB
      roughness: 0.6,
      metalness: 0.1
    });
    const heatsinkBlackMat = new THREE.MeshStandardMaterial({
      color: 0x09090b, // Matte black aluminum
      metalness: 0.8,
      roughness: 0.3
    });
    const chromeBallMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.1
    });
    const batteryBlueMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      roughness: 0.4,
      metalness: 0.2
    });
    const glassLensMat = new THREE.MeshPhysicalMaterial({
      color: 0x10b981,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.8,
      thickness: 0.02
    });

    const R = ROBOT_GEOMETRY_CONFIG.wheelRadius; // 0.0325m
    const W_BASE = ROBOT_GEOMETRY_CONFIG.wheelBase; // 0.102m
    const GROUND_CLEAR = ROBOT_GEOMETRY_CONFIG.groundClearance; // 0.012m

    // -------------------------------------------------------------
    // PART 1: CHASSIS BASE PLATE (Bottom Plate)
    // -------------------------------------------------------------
    const chassisBaseGroup = new THREE.Group();
    chassisBaseGroup.name = 'chassis-base';

    const basePlateShape = new THREE.Shape();
    // Rounded rectangular contour for JetBot
    const bW = 0.088; // 88mm width
    const bL = 0.136; // 136mm length
    basePlateShape.moveTo(-bW / 2 + 0.015, -bL / 2);
    basePlateShape.lineTo(bW / 2 - 0.015, -bL / 2);
    basePlateShape.quadraticCurveTo(bW / 2, -bL / 2, bW / 2, -bL / 2 + 0.015);
    basePlateShape.lineTo(bW / 2, bL / 2 - 0.02);
    basePlateShape.quadraticCurveTo(bW / 2, bL / 2, bW / 2 - 0.02, bL / 2);
    basePlateShape.lineTo(-bW / 2 + 0.02, bL / 2);
    basePlateShape.quadraticCurveTo(-bW / 2, bL / 2, -bW / 2, bL / 2 - 0.02);
    basePlateShape.lineTo(-bW / 2, -bL / 2 + 0.015);
    basePlateShape.quadraticCurveTo(-bW / 2, -bL / 2, -bW / 2 + 0.015, -bL / 2);

    const extrudeSettings = { depth: 0.003, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.001, bevelThickness: 0.001 };
    const basePlateGeo = new THREE.ExtrudeGeometry(basePlateShape, extrudeSettings);
    const basePlateMesh = new THREE.Mesh(basePlateGeo, aluminumMat);
    basePlateMesh.rotation.x = Math.PI / 2;
    basePlateMesh.position.set(0, GROUND_CLEAR + 0.003, 0);
    basePlateMesh.castShadow = true;
    basePlateMesh.receiveShadow = true;
    chassisBaseGroup.add(basePlateMesh);
    robotRoot.add(chassisBaseGroup);
    componentsMap.set('chassis-base', chassisBaseGroup);

    // -------------------------------------------------------------
    // PART 2: STANDOFFS (4 Cọc đồng lục giác M3)
    // -------------------------------------------------------------
    const standoffHeight = ROBOT_GEOMETRY_CONFIG.tierSpacing; // 0.035m
    const standoffGeo = new THREE.CylinderGeometry(0.0025, 0.0025, standoffHeight, 6);
    const standoffOffsets = [
      [-0.036, 0.045],
      [0.036, 0.045],
      [-0.036, -0.045],
      [0.036, -0.045]
    ];
    standoffOffsets.forEach(([soX, soZ]) => {
      const standoffMesh = new THREE.Mesh(standoffGeo, brassStandoffMat);
      standoffMesh.position.set(soX, GROUND_CLEAR + 0.003 + standoffHeight / 2, soZ);
      standoffMesh.castShadow = true;
      robotRoot.add(standoffMesh);
    });

    // -------------------------------------------------------------
    // PART 3: UPPER DECK (Sàn Tầng 2)
    // -------------------------------------------------------------
    const upperDeckGroup = new THREE.Group();
    upperDeckGroup.name = 'upper-deck';

    const upperPlateShape = new THREE.Shape();
    const uW = 0.086;
    const uL = 0.124;
    upperPlateShape.moveTo(-uW / 2 + 0.012, -uL / 2);
    upperPlateShape.lineTo(uW / 2 - 0.012, -uL / 2);
    upperPlateShape.quadraticCurveTo(uW / 2, -uL / 2, uW / 2, -uL / 2 + 0.012);
    upperPlateShape.lineTo(uW / 2, uL / 2 - 0.018);
    upperPlateShape.quadraticCurveTo(uW / 2, uL / 2, uW / 2 - 0.018, uL / 2);
    upperPlateShape.lineTo(-uW / 2 + 0.018, uL / 2);
    upperPlateShape.quadraticCurveTo(-uW / 2, uL / 2, -uW / 2, uL / 2 - 0.018);
    upperPlateShape.lineTo(-uW / 2, -uL / 2 + 0.012);
    upperPlateShape.quadraticCurveTo(-uW / 2, -uL / 2, -uW / 2 + 0.012, -uL / 2);

    const upperPlateGeo = new THREE.ExtrudeGeometry(upperPlateShape, extrudeSettings);
    const upperPlateMesh = new THREE.Mesh(upperPlateGeo, acrylicMat);
    upperPlateMesh.rotation.x = Math.PI / 2;
    const upperDeckY = GROUND_CLEAR + 0.003 + standoffHeight;
    upperPlateMesh.position.set(0, upperDeckY + 0.003, -0.004);
    upperPlateMesh.castShadow = true;
    upperPlateMesh.receiveShadow = true;
    upperDeckGroup.add(upperPlateMesh);
    robotRoot.add(upperDeckGroup);
    componentsMap.set('upper-deck', upperDeckGroup);

    // -------------------------------------------------------------
    // PART 4: TT MOTORS (Cặp động cơ giảm tốc DC màu vàng)
    // -------------------------------------------------------------
    const motorsGroup = new THREE.Group();
    motorsGroup.name = 'dc-motors';

    const motorBoxGeo = new THREE.BoxGeometry(0.022, 0.018, 0.065);
    const shaftGeo = new THREE.CylinderGeometry(0.0026, 0.0026, 0.014, 12);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.2 });

    // Left Motor
    const leftMotorBody = new THREE.Mesh(motorBoxGeo, motorYellowMat);
    leftMotorBody.position.set(-0.034, R, 0);
    leftMotorBody.castShadow = true;
    motorsGroup.add(leftMotorBody);
    const leftShaft = new THREE.Mesh(shaftGeo, shaftMat);
    leftShaft.rotation.z = Math.PI / 2;
    leftShaft.position.set(-0.048, R, 0);
    motorsGroup.add(leftShaft);

    // Right Motor
    const rightMotorBody = new THREE.Mesh(motorBoxGeo, motorYellowMat);
    rightMotorBody.position.set(0.034, R, 0);
    rightMotorBody.castShadow = true;
    motorsGroup.add(rightMotorBody);
    const rightShaft = new THREE.Mesh(shaftGeo, shaftMat);
    rightShaft.rotation.z = Math.PI / 2;
    rightShaft.position.set(0.048, R, 0);
    motorsGroup.add(rightShaft);

    robotRoot.add(motorsGroup);
    componentsMap.set('dc-motors', motorsGroup);

    // -------------------------------------------------------------
    // PART 5: DRIVE WHEELS (Left & Right Wheels with treads)
    // -------------------------------------------------------------
    const createWheel = (isLeft: boolean) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.name = isLeft ? 'drive-wheels-left' : 'drive-wheels-right';

      const wRadius = ROBOT_GEOMETRY_CONFIG.wheelRadius; // 32.5mm
      const wWidth = ROBOT_GEOMETRY_CONFIG.wheelWidth; // 26mm

      // Rubber Tire
      const tireGeo = new THREE.CylinderGeometry(wRadius, wRadius, wWidth, 24);
      const tireMesh = new THREE.Mesh(tireGeo, tireRubberMat);
      tireMesh.rotation.z = Math.PI / 2;
      tireMesh.castShadow = true;
      wheelGroup.add(tireMesh);

      // Tire Treads (Gai cao su)
      const treadCount = 14;
      const treadGeo = new THREE.BoxGeometry(0.003, wWidth * 0.9, 0.002);
      for (let i = 0; i < treadCount; i++) {
        const angle = (i / treadCount) * Math.PI * 2;
        const tread = new THREE.Mesh(treadGeo, tireRubberMat);
        tread.position.set(0, Math.cos(angle) * (wRadius + 0.0006), Math.sin(angle) * (wRadius + 0.0006));
        tread.rotation.x = angle;
        wheelGroup.add(tread);
      }

      // Wheel Rim (Mâm xe nan hoa)
      const rimRadius = wRadius * 0.72;
      const rimGeo = new THREE.CylinderGeometry(rimRadius, rimRadius, wWidth + 0.001, 16);
      const rimMesh = new THREE.Mesh(rimGeo, rimMat);
      rimMesh.rotation.z = Math.PI / 2;
      wheelGroup.add(rimMesh);

      // Wheel Hub Nut (Trục tâm D-shaft)
      const nutGeo = new THREE.CylinderGeometry(0.005, 0.005, wWidth + 0.004, 6);
      const nutMesh = new THREE.Mesh(nutGeo, shaftMat);
      nutMesh.rotation.z = Math.PI / 2;
      wheelGroup.add(nutMesh);

      const posX = isLeft ? -W_BASE / 2 : W_BASE / 2;
      wheelGroup.position.set(posX, R, 0);
      return wheelGroup;
    };

    const leftWheelGroup = createWheel(true);
    const rightWheelGroup = createWheel(false);
    leftWheelGroupRef.current = leftWheelGroup;
    rightWheelGroupRef.current = rightWheelGroup;
    robotRoot.add(leftWheelGroup);
    robotRoot.add(rightWheelGroup);

    // Virtual combine for component selector
    const wheelsCombined = new THREE.Group();
    wheelsCombined.add(leftWheelGroup.clone());
    wheelsCombined.add(rightWheelGroup.clone());
    componentsMap.set('drive-wheels', leftWheelGroup);

    // -------------------------------------------------------------
    // PART 6: REAR BALL CASTER (Bánh bi đa hướng sau)
    // -------------------------------------------------------------
    const casterGroup = new THREE.Group();
    casterGroup.name = 'caster-wheel';

    const casterRadius = ROBOT_GEOMETRY_CONFIG.casterRadius; // 7.5mm
    const casterZ = ROBOT_GEOMETRY_CONFIG.casterOffsetZ; // -55mm

    // Ball Caster Mount (Chén đỡ)
    const mountGeo = new THREE.CylinderGeometry(0.012, 0.014, 0.012, 16);
    const mountMesh = new THREE.Mesh(mountGeo, shaftMat);
    mountMesh.position.set(0, casterRadius + 0.006, casterZ);
    casterGroup.add(mountMesh);

    // Steel Chrome Ball (Bi thép xoay tự do)
    const ballGeo = new THREE.SphereGeometry(casterRadius, 20, 20);
    const ballMesh = new THREE.Mesh(ballGeo, chromeBallMat);
    ballMesh.position.set(0, casterRadius, casterZ);
    ballMesh.castShadow = true;
    casterGroup.add(ballMesh);

    robotRoot.add(casterGroup);
    componentsMap.set('caster-wheel', casterGroup);

    // -------------------------------------------------------------
    // PART 7: BATTERY PACK (Khối pin 3S 18650 đặt ở khoang đáy)
    // -------------------------------------------------------------
    const batteryGroup = new THREE.Group();
    batteryGroup.name = 'battery-pack';

    const batteryGeo = new THREE.BoxGeometry(0.068, 0.019, 0.056);
    const batteryMesh = new THREE.Mesh(batteryGeo, batteryBlueMat);
    batteryMesh.position.set(0, GROUND_CLEAR + 0.003 + 0.012, -0.012);
    batteryMesh.castShadow = true;
    batteryGroup.add(batteryMesh);

    // Battery connector wire
    const wireGeo = new THREE.CylinderGeometry(0.0015, 0.0015, 0.024, 8);
    const wireMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    wireMesh.position.set(0.022, GROUND_CLEAR + 0.022, 0.018);
    wireMesh.rotation.z = Math.PI / 4;
    batteryGroup.add(wireMesh);

    robotRoot.add(batteryGroup);
    componentsMap.set('battery-pack', batteryGroup);

    // -------------------------------------------------------------
    // PART 8: NVIDIA JETSON NANO BOARD (Module AI + Fin Heatsink)
    // -------------------------------------------------------------
    const jetsonGroup = new THREE.Group();
    jetsonGroup.name = 'jetson-nano';

    const jetsonBaseY = upperDeckY + 0.004;

    // Carrier Board PCB
    const pcbGeo = new THREE.BoxGeometry(0.082, 0.002, 0.075);
    const pcbMesh = new THREE.Mesh(pcbGeo, jetsonPcbMat);
    pcbMesh.position.set(0, jetsonBaseY + 0.004, -0.006);
    pcbMesh.castShadow = true;
    jetsonGroup.add(pcbMesh);

    // Jetson Nano Heatsink (Khối tản nhiệt nhôm đen)
    const heatsinkGeo = new THREE.BoxGeometry(0.052, 0.016, 0.048);
    const heatsinkMesh = new THREE.Mesh(heatsinkGeo, heatsinkBlackMat);
    heatsinkMesh.position.set(0, jetsonBaseY + 0.014, -0.006);
    heatsinkMesh.castShadow = true;
    jetsonGroup.add(heatsinkMesh);

    // Heatsink cooling fins (Rãnh tản nhiệt)
    const finGeo = new THREE.BoxGeometry(0.052, 0.0015, 0.048);
    for (let f = 0; f < 5; f++) {
      const fin = new THREE.Mesh(finGeo, heatsinkBlackMat);
      fin.position.set(0, jetsonBaseY + 0.012 + f * 0.0025, -0.006);
      jetsonGroup.add(fin);
    }

    // Metal Ports (USB 3.0 stack & Ethernet RJ45)
    const portGeo = new THREE.BoxGeometry(0.014, 0.012, 0.016);
    const portMesh1 = new THREE.Mesh(portGeo, shaftMat);
    portMesh1.position.set(-0.028, jetsonBaseY + 0.010, -0.038);
    jetsonGroup.add(portMesh1);

    const portMesh2 = new THREE.Mesh(portGeo, shaftMat);
    portMesh2.position.set(-0.010, jetsonBaseY + 0.010, -0.038);
    jetsonGroup.add(portMesh2);

    robotRoot.add(jetsonGroup);
    componentsMap.set('jetson-nano', jetsonGroup);

    // -------------------------------------------------------------
    // PART 9: MOTOR DRIVER (PCA9685 & TB6612FNG)
    // -------------------------------------------------------------
    const driverGroup = new THREE.Group();
    driverGroup.name = 'motor-driver';
    const driverPcbGeo = new THREE.BoxGeometry(0.042, 0.002, 0.024);
    const driverPcbMesh = new THREE.Mesh(driverPcbGeo, aluminumMat);
    driverPcbMesh.position.set(0, upperDeckY + 0.004, 0.036);
    driverGroup.add(driverPcbMesh);
    robotRoot.add(driverGroup);
    componentsMap.set('motor-driver', driverGroup);

    // -------------------------------------------------------------
    // PART 10: CAMERA MODULE CSI 8MP (IMX219 Fisheye 160°)
    // -------------------------------------------------------------
    const cameraGroup = new THREE.Group();
    cameraGroup.name = 'camera-module';

    const camX = ROBOT_GEOMETRY_CONFIG.sensorMounts[0].position[0];
    const camY = ROBOT_GEOMETRY_CONFIG.sensorMounts[0].position[1];
    const camZ = ROBOT_GEOMETRY_CONFIG.sensorMounts[0].position[2];
    const camPitch = (ROBOT_GEOMETRY_CONFIG.sensorMounts[0].orientationDeg[0] * Math.PI) / 180;

    // Camera Bracket Mount (Chân đế chữ L nghiêng 18 độ)
    const bracketGeo = new THREE.BoxGeometry(0.024, 0.038, 0.003);
    const bracketMesh = new THREE.Mesh(bracketGeo, aluminumMat);
    bracketMesh.position.set(camX, camY - 0.012, camZ - 0.008);
    bracketMesh.rotation.x = camPitch;
    cameraGroup.add(bracketMesh);

    // Camera Sensor Board (PCB IMX219)
    const camPcbGeo = new THREE.BoxGeometry(0.025, 0.024, 0.002);
    const camPcbMesh = new THREE.Mesh(camPcbGeo, heatsinkBlackMat);
    camPcbMesh.position.set(camX, camY, camZ);
    camPcbMesh.rotation.x = camPitch;
    cameraGroup.add(camPcbMesh);

    // Optical Lens Barrel
    const lensBarrelGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.012, 16);
    const lensBarrel = new THREE.Mesh(lensBarrelGeo, heatsinkBlackMat);
    lensBarrel.rotation.x = Math.PI / 2 + camPitch;
    lensBarrel.position.set(camX, camY + 0.001, camZ + 0.006);
    cameraGroup.add(lensBarrel);

    // Glass Front Element
    const glassLensGeo = new THREE.SphereGeometry(0.006, 16, 16);
    const glassLens = new THREE.Mesh(glassLensGeo, glassLensMat);
    glassLens.position.set(camX, camY + 0.001, camZ + 0.012);
    cameraGroup.add(glassLens);

    robotRoot.add(cameraGroup);
    componentsMap.set('camera-module', cameraGroup);

    // -------------------------------------------------------------
    // PART 11: ULTRASONIC SENSOR HC-SR04 (Mép cản trước)
    // -------------------------------------------------------------
    const ultrasonicGroup = new THREE.Group();
    ultrasonicGroup.name = 'ultrasonic-sensor';

    const usX = ROBOT_GEOMETRY_CONFIG.sensorMounts[1].position[0];
    const usY = ROBOT_GEOMETRY_CONFIG.sensorMounts[1].position[1];
    const usZ = ROBOT_GEOMETRY_CONFIG.sensorMounts[1].position[2];

    // Sensor PCB
    const usPcbGeo = new THREE.BoxGeometry(0.044, 0.018, 0.002);
    const usPcbMesh = new THREE.Mesh(usPcbGeo, jetsonPcbMat);
    usPcbMesh.position.set(usX, usY, usZ);
    ultrasonicGroup.add(usPcbMesh);

    // Transducer Cylinders (2 mắt phát/thu T and R)
    const eyeGeo = new THREE.CylinderGeometry(0.0075, 0.0075, 0.012, 16);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 });

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.rotation.x = Math.PI / 2;
    leftEye.position.set(usX - 0.012, usY, usZ + 0.006);
    ultrasonicGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.rotation.x = Math.PI / 2;
    rightEye.position.set(usX + 0.012, usY, usZ + 0.006);
    ultrasonicGroup.add(rightEye);

    robotRoot.add(ultrasonicGroup);
    componentsMap.set('ultrasonic-sensor', ultrasonicGroup);

    // -------------------------------------------------------------
    // PART 12: OLED DISPLAY 0.91" (Tầng trên)
    // -------------------------------------------------------------
    const oledGroup = new THREE.Group();
    oledGroup.name = 'oled-display';
    const oledPcbGeo = new THREE.BoxGeometry(0.038, 0.003, 0.014);
    const oledPcb = new THREE.Mesh(oledPcbGeo, aluminumMat);
    oledPcb.position.set(0, upperDeckY + 0.008, 0.016);
    oledGroup.add(oledPcb);

    const oledScreenGeo = new THREE.PlaneGeometry(0.030, 0.010);
    const oledScreenMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const oledScreen = new THREE.Mesh(oledScreenGeo, oledScreenMat);
    oledScreen.rotation.x = -Math.PI / 2;
    oledScreen.position.set(0, upperDeckY + 0.010, 0.016);
    oledGroup.add(oledScreen);

    robotRoot.add(oledGroup);
    componentsMap.set('oled-display', oledGroup);

    // -------------------------------------------------------------
    // PART 13: DUAL WI-FI ANTENNAS (Cặp ăng-ten SMA sau)
    // -------------------------------------------------------------
    const antennaGroup = new THREE.Group();
    antennaGroup.name = 'wifi-antennas';

    const antGeo = new THREE.CylinderGeometry(0.003, 0.0035, 0.088, 12);
    const antMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 });

    // Left antenna (tilted 35 deg left-back)
    const antL = new THREE.Mesh(antGeo, antMat);
    antL.position.set(-0.032, upperDeckY + 0.040, -0.052);
    antL.rotation.z = 0.35;
    antL.rotation.x = -0.3;
    antennaGroup.add(antL);

    // Right antenna (tilted 35 deg right-back)
    const antR = new THREE.Mesh(antGeo, antMat);
    antR.position.set(0.032, upperDeckY + 0.040, -0.052);
    antR.rotation.z = -0.35;
    antR.rotation.x = -0.3;
    antennaGroup.add(antR);

    robotRoot.add(antennaGroup);
    componentsMap.set('wifi-antennas', antennaGroup);

    // -------------------------------------------------------------
    // INSPECTION HELPERS: 1. WIREFRAME HELPER
    // -------------------------------------------------------------
    const wireframeObjects: THREE.Object3D[] = [];
    robotRoot.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const wireMat = new THREE.MeshBasicMaterial({
          color: 0x22d3ee,
          wireframe: true,
          transparent: true,
          opacity: 0.85
        });
        const wireMesh = new THREE.Mesh(child.geometry, wireMat);
        wireMesh.position.copy(child.position);
        wireMesh.rotation.copy(child.rotation);
        wireMesh.scale.copy(child.scale);
        wireMesh.visible = false;
        child.add(wireMesh);
        wireframeObjects.push(wireMesh);
      }
    });
    inspectionHelpersRef.current.wireframeObjects = wireframeObjects;

    // -------------------------------------------------------------
    // INSPECTION HELPERS: 2. COLLISION HULL (Bounding Box)
    // -------------------------------------------------------------
    const boxDim = ROBOT_GEOMETRY_CONFIG.collisionGeometry.boxDimensions;
    const boxOffset = ROBOT_GEOMETRY_CONFIG.collisionGeometry.boxCenterOffset;
    const colGeo = new THREE.BoxGeometry(boxDim[0], boxDim[1], boxDim[2]);
    const colMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      wireframe: true,
      transparent: true,
      opacity: 0.9
    });
    const colMesh = new THREE.Mesh(colGeo, colMat);
    colMesh.position.set(boxOffset[0], boxOffset[1], boxOffset[2]);
    colMesh.visible = false;

    // Inner filled translucent hull
    const colFillMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide
    });
    const colFillMesh = new THREE.Mesh(colGeo, colFillMat);
    colMesh.add(colFillMesh);

    scene.add(colMesh);
    inspectionHelpersRef.current.collisionHull = colMesh;

    // -------------------------------------------------------------
    // INSPECTION HELPERS: 3. COORDINATE AXES (ROS Frame RGB)
    // -------------------------------------------------------------
    const axesGroup = new THREE.Group();
    const axesLen = 0.085;
    const axesHelper = new THREE.AxesHelper(axesLen);
    axesGroup.add(axesHelper);

    // Center of contact ring
    const originMarkerGeo = new THREE.RingGeometry(0.008, 0.012, 24);
    const originMarkerMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, side: THREE.DoubleSide });
    const originMarker = new THREE.Mesh(originMarkerGeo, originMarkerMat);
    originMarker.rotation.x = -Math.PI / 2;
    originMarker.position.y = 0.001;
    axesGroup.add(originMarker);

    axesGroup.visible = false;
    scene.add(axesGroup);
    inspectionHelpersRef.current.axesHelper = axesGroup;

    // -------------------------------------------------------------
    // INSPECTION HELPERS: 4. SENSOR FOV CONES
    // -------------------------------------------------------------
    const sensorConesGroup = new THREE.Group();

    // Camera FOV Cone (Fisheye 160 deg)
    const camConeGeo = new THREE.ConeGeometry(0.18, 0.24, 24, 1, true);
    const camConeMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      wireframe: true,
      transparent: true,
      opacity: 0.65
    });
    const camConeMesh = new THREE.Mesh(camConeGeo, camConeMat);
    camConeMesh.position.set(camX, camY, camZ + 0.12);
    camConeMesh.rotation.x = -Math.PI / 2 + camPitch;
    sensorConesGroup.add(camConeMesh);

    // Ultrasonic Beam Cone (30 deg)
    const usConeGeo = new THREE.ConeGeometry(0.065, 0.20, 16, 1, true);
    const usConeMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.75
    });
    const usConeMesh = new THREE.Mesh(usConeGeo, usConeMat);
    usConeMesh.position.set(usX, usY, usZ + 0.10);
    usConeMesh.rotation.x = -Math.PI / 2;
    sensorConesGroup.add(usConeMesh);

    sensorConesGroup.visible = false;
    scene.add(sensorConesGroup);
    inspectionHelpersRef.current.sensorCones = sensorConesGroup;

    // -------------------------------------------------------------
    // INSPECTION HELPERS: 5. DIMENSION RULERS (CAD Annotations)
    // -------------------------------------------------------------
    const dimensionGroup = new THREE.Group();

    const makeRulerLine = (p1: [number, number, number], p2: [number, number, number], color: number = 0x38bdf8) => {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...p1),
        new THREE.Vector3(...p2)
      ]);
      const lineMat = new THREE.LineBasicMaterial({ color, linewidth: 2 });
      return new THREE.Line(lineGeo, lineMat);
    };

    // Body Length (138mm)
    dimensionGroup.add(makeRulerLine([0.075, 0.015, -0.068], [0.075, 0.015, 0.070]));
    // Body Width (125mm)
    dimensionGroup.add(makeRulerLine([-0.063, 0.015, 0.082], [0.063, 0.015, 0.082]));
    // Body Height (130mm)
    dimensionGroup.add(makeRulerLine([0.075, 0.0, 0.082], [0.075, 0.130, 0.082]));

    dimensionGroup.visible = false;
    scene.add(dimensionGroup);
    inspectionHelpersRef.current.dimensionRulers = dimensionGroup;

    // -------------------------------------------------------------
    // RENDER LOOP & REAL-TIME WHEEL ROTATION
    // -------------------------------------------------------------
    let lastTime = performance.now();

    const animate = () => {
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Rotate wheels based on real-time motor speeds v_L & v_R
      if (leftWheelGroupRef.current && rightWheelGroupRef.current) {
        const { left, right } = speedsRef.current;
        // Angular velocity omega = v / R
        // In our simulator speed scale: 1.0 corresponds to ~ 6.0 rad/s
        const omegaL = (left * 6.0);
        const omegaR = (right * 6.0);

        // Rotation around X axis of the wheel group (or its internal axis)
        leftWheelGroupRef.current.rotation.x -= omegaL * dt;
        rightWheelGroupRef.current.rotation.x -= omegaR * dt;
      }

      if (renderer) {
        renderer.render(scene, camera);
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    // -------------------------------------------------------------
    // RESIZE LISTENER
    // -------------------------------------------------------------
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animId) cancelAnimationFrame(animId);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (renderer) {
        try {
          renderer.dispose();
          if (container && renderer.domElement && container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
        } catch {
          // Ignore disposal errors
        }
      }
    };
  } catch (err) {
    console.warn('WebGL setup failed or not supported in current environment:', err);
    setWebglError(true);
  }
}, []);

  // Sync Inspection Mode with Three.js Scene Visibility
  useEffect(() => {
    const helpers = inspectionHelpersRef.current;
    const mode = internalMode;

    // 1. Wireframe
    helpers.wireframeObjects.forEach((obj) => {
      obj.visible = mode === 'wireframe';
    });

    // 2. Collision Hull
    if (helpers.collisionHull) {
      helpers.collisionHull.visible = mode === 'collision';
    }

    // 3. Coordinate Axes
    if (helpers.axesHelper) {
      helpers.axesHelper.visible = mode === 'coordinates';
    }

    // 4. Sensors FOV
    if (helpers.sensorCones) {
      helpers.sensorCones.visible = mode === 'sensors';
    }

    // 5. Dimensions
    if (helpers.dimensionRulers) {
      helpers.dimensionRulers.visible = mode === 'dimensions';
    }

    // Highlight selected component in 'components' mode
    if (mode === 'components' && selectedComponentId) {
      componentsMapRef.current.forEach((obj, id) => {
        if (id === selectedComponentId) {
          obj.scale.set(1.05, 1.05, 1.05);
        } else {
          obj.scale.set(1, 1, 1);
        }
      });
    } else {
      componentsMapRef.current.forEach((obj) => {
        obj.scale.set(1, 1, 1);
      });
    }
  }, [internalMode, selectedComponentId]);

  // Handle Mouse / Touch Orbit Interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      isDraggingRef.current = true;
    } else if (e.button === 2) {
      isRightDraggingRef.current = true;
    }
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current && !isRightDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };

    if (isDraggingRef.current) {
      // Orbit rotation
      cameraAzimuthAngleRef.current -= deltaX * 0.008;
      cameraPolarAngleRef.current = Math.max(
        0.05,
        Math.min(Math.PI / 2 - 0.02, cameraPolarAngleRef.current - deltaY * 0.008)
      );
    } else if (isRightDraggingRef.current) {
      // Pan target
      cameraTargetRef.current.y += deltaY * 0.0005;
    }
    updateCameraPosition();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    isRightDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    cameraDistanceRef.current = Math.max(
      0.18,
      Math.min(0.85, cameraDistanceRef.current + e.deltaY * 0.0005)
    );
    updateCameraPosition();
  };

  const changeMode = (m: InspectionMode) => {
    setInternalMode(m);
    if (onInspectionModeChange) onInspectionModeChange(m);
  };

  const handleSelectCompItem = (comp: ComponentSpec) => {
    setActiveComp(comp);
    if (onSelectComponent) onSelectComponent(comp);
    setInternalMode('components');
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#070D1B] rounded-2xl overflow-hidden border border-cyan-500/25 select-none shadow-2xl">
      {/* 3D Model Top Toolbar */}
      <div className="px-3.5 py-2.5 bg-gradient-to-r from-[#0C152B] via-[#0E1A36] to-[#122347] border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-white tracking-wide">
                Mô Hình 3D Chuẩn Cơ Khí CMU10
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                TỶ LỆ 1:1 (mm)
              </span>
            </div>
          </div>
        </div>

        {/* Camera View Presets */}
        <div className="flex items-center gap-1 text-[11px]">
          <button
            onClick={() => setViewPreset('isometric')}
            className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition font-bold"
            title="Góc nhìn phối cảnh 3D"
          >
            3D Iso
          </button>
          <button
            onClick={() => setViewPreset('top')}
            className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition font-bold"
            title="Nhìn từ trên xuống"
          >
            Top
          </button>
          <button
            onClick={() => setViewPreset('front')}
            className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition font-bold"
            title="Nhìn chính diện trước"
          >
            Front
          </button>
          <button
            onClick={() => setViewPreset('side')}
            className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition font-bold"
            title="Nhìn ngang cạnh"
          >
            Side
          </button>
          <button
            onClick={() => setViewPreset('reset')}
            className="p-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 transition"
            title="Khôi phục góc nhìn mặc định"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Area */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
        className="w-full flex-1 min-h-[340px] cursor-grab active:cursor-grabbing relative overflow-hidden"
      >
        {/* Dedicated Three.js canvas DOM container (Empty so React DOM tree is never touched) */}
        <div ref={canvasMountRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        {/* Fallback in case WebGL is disabled in user browser */}
        {webglError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070D1B] p-6 text-center z-20">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 mb-3">
              <Box className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Mô Phỏng 2.5D Chuẩn CMU10</h4>
            <p className="text-xs text-slate-400 max-w-sm mb-3">
              Môi trường trình duyệt đang tắt tăng tốc phần cứng WebGL. Bạn có thể sử dụng Chế độ Sân Đua Bám Đường 2D hoặc tra cứu danh mục kích thước linh kiện CAD bên dưới.
            </p>
          </div>
        )}

        {/* Floating Controls Overlay: 7 Inspection Modes Bar */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1 bg-[#091122]/90 backdrop-blur-md p-1.5 rounded-xl border border-cyan-500/30 text-[11px] z-10 shadow-lg">
          <button
            onClick={() => changeMode('realistic')}
            className={`px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
              internalMode === 'realistic' ? 'bg-cyan-500 text-slate-950 shadow-xs' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Thực Tế</span>
          </button>

          <button
            onClick={() => changeMode('wireframe')}
            className={`px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
              internalMode === 'wireframe' ? 'bg-cyan-500 text-slate-950 shadow-xs' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Khung Dây</span>
          </button>

          <button
            onClick={() => changeMode('components')}
            className={`px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
              internalMode === 'components' ? 'bg-cyan-500 text-slate-950 shadow-xs' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Box className="w-3 h-3" />
            <span>Linh Kiện</span>
          </button>

          <button
            onClick={() => changeMode('collision')}
            className={`px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
              internalMode === 'collision' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Maximize2 className="w-3 h-3" />
            <span>Va Chạm</span>
          </button>

          <button
            onClick={() => changeMode('coordinates')}
            className={`px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
              internalMode === 'coordinates' ? 'bg-emerald-500 text-slate-950 shadow-xs' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Compass className="w-3 h-3" />
            <span>Tọa Độ (0,0)</span>
          </button>

          <button
            onClick={() => changeMode('sensors')}
            className={`px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
              internalMode === 'sensors' ? 'bg-purple-500 text-white shadow-xs' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>Cảm Biến FOV</span>
          </button>

          <button
            onClick={() => changeMode('dimensions')}
            className={`px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
              internalMode === 'dimensions' ? 'bg-blue-500 text-white shadow-xs' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Ruler className="w-3 h-3" />
            <span>Kích Thước CAD</span>
          </button>
        </div>

        {/* In-canvas Interactive Instruction Hint */}
        <div className="absolute bottom-2.5 right-2.5 bg-[#091122]/85 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-700/60 text-[10px] text-slate-400 font-mono pointer-events-none">
          Click chuột trái: Xoay 360° | Cuộn: Zoom | Chuột phải: Dịch chuyển
        </div>

        {/* Real-time Dynamic Status HUD */}
        <div className="absolute bottom-2.5 left-2.5 bg-[#091122]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/40 text-[11px] font-mono text-cyan-200">
          <div className="flex items-center gap-3">
            <span>Bánh L: <strong className="text-blue-400">{(leftSpeed * 6).toFixed(1)} rad/s</strong></span>
            <span>Bánh R: <strong className="text-orange-400">{(rightSpeed * 6).toFixed(1)} rad/s</strong></span>
            <span>Gầm: <strong className="text-white">12 mm</strong></span>
          </div>
        </div>
      </div>

      {/* Component Detail Drawer when in 'components' mode */}
      {internalMode === 'components' && (
        <div className="p-3 bg-[#091122] border-t border-cyan-500/20 max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-cyan-300 uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Danh Mục Linh Kiện Cơ Khí Chuẩn:
            </span>
            <span className="text-[11px] text-slate-400">Bấm để chọn và phóng to linh kiện</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
            {ROBOT_GEOMETRY_CONFIG.components.map((comp) => {
              const isSelected = selectedComponentId === comp.id || activeComp?.id === comp.id;
              return (
                <button
                  key={comp.id}
                  onClick={() => handleSelectCompItem(comp)}
                  className={`p-2 rounded-xl text-left border transition ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-xs'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-bold text-[11px] truncate">{comp.nameVi.split('(')[0]}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{comp.dimensionsMm}</div>
                </button>
              );
            })}
          </div>

          {activeComp && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-[#060B16] border border-cyan-500/30 text-xs">
              <div className="flex items-center justify-between font-bold text-cyan-300 mb-1">
                <span>{activeComp.nameVi}</span>
                <span className="text-[10px] font-mono text-emerald-400">{activeComp.weightGrams}g | {activeComp.materialVi}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-1.5">{activeComp.descriptionVi}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-[10px] font-mono text-slate-400">
                {Object.entries(activeComp.specs).map(([k, v]) => (
                  <div key={k} className="bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800">
                    <span className="text-slate-500">{k}:</span> <strong className="text-slate-200">{v}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CAD Dimensions Panel when in 'dimensions' mode */}
      {internalMode === 'dimensions' && (
        <div className="p-3 bg-[#091122] border-t border-cyan-500/20 text-xs text-slate-300">
          <div className="font-black text-white text-xs mb-1.5 flex items-center gap-1.5">
            <Ruler className="w-3.5 h-3.5 text-blue-400" />
            Bảng Thông Số Kỹ Thuật Hình Học Chuẩn CMU10 / ISO:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
            <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px]">Dài tổng thể (L):</div>
              <div className="text-blue-400 font-bold text-sm">138 mm</div>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px]">Rộng tổng thể (W):</div>
              <div className="text-blue-400 font-bold text-sm">125 mm</div>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px]">Cao tổng thể (H):</div>
              <div className="text-blue-400 font-bold text-sm">130 mm</div>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px]">Khoảng cách 2 bánh (b):</div>
              <div className="text-orange-400 font-bold text-sm">102 mm</div>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px]">Đường kính bánh (2R):</div>
              <div className="text-orange-400 font-bold text-sm">65 mm</div>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px]">Khoảng sáng gầm:</div>
              <div className="text-emerald-400 font-bold text-sm">12 mm</div>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px]">Khối lượng xe (m):</div>
              <div className="text-purple-400 font-bold text-sm">0.95 kg</div>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px]">Camera Góc nhìn FOV:</div>
              <div className="text-yellow-400 font-bold text-sm">160° (Nghiêng 18°)</div>
            </div>
          </div>
        </div>
      )}

      {/* Collision Mode Analysis when in 'collision' mode */}
      {internalMode === 'collision' && (
        <div className="p-3 bg-[#091122] border-t border-amber-500/20 text-xs text-amber-200">
          <div className="font-black text-amber-300 text-xs mb-1 flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            Vùng Bao Va Chạm (Collision Hull Geometry):
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            Kích thước hộp va chạm: <strong>142mm × 132mm × 146mm</strong>. Khoảng cách an toàn gầm <strong>12mm</strong> đảm bảo robot không bao giờ xuyên sàn hoặc lọt khe hẹp dưới 142mm.
          </p>
        </div>
      )}
    </div>
  );
};
