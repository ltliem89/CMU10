/**
 * CMU10 — Coordinate Transformation Engine & Spatial Math
 * 
 * Formal separation of 3 coordinate spaces:
 * 1. World Coordinates: metric space (X in [-1.5, 1.5]m, Z in [-1.0, 1.0]m)
 * 2. View / Base SVG Coordinates: viewBox [0, 600] x [0, 400]
 * 3. Screen / Client Coordinates: pixels on user display transformed via getScreenCTM()
 * 
 * Complies with MDN SVG Scripting & Pointer Events specifications.
 */

export interface Point2D {
  x: number;
  z: number;
}

export interface SvgPoint {
  u: number;
  v: number;
}

export interface ScreenPoint {
  clientX: number;
  clientY: number;
}

export interface ViewportTransform {
  zoom: number;
  panX: number;
  panY: number;
}

export interface ObstacleSpec {
  id?: string;
  nameVi?: string;
  x: number;
  z: number;
  radius: number;
}

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
}

export const ARENA_WIDTH_M = 3.0;
export const ARENA_LENGTH_M = 2.0;
export const ARENA_X_MIN = -1.5;
export const ARENA_X_MAX = 1.5;
export const ARENA_Z_MIN = -1.0;
export const ARENA_Z_MAX = 1.0;

export const SVG_VIEWBOX_WIDTH = 600;
export const SVG_VIEWBOX_HEIGHT = 400;

export const ROBOT_RADIUS_M = 0.11;
export const DEFAULT_MIN_ZOOM = 0.5;
export const DEFAULT_MAX_ZOOM = 5.0;

/**
 * Transforms World coordinates (meters) to Base SVG viewBox coordinates [0, 600] x [0, 400].
 */
export function worldToSvg(world: Point2D): SvgPoint {
  const u = ((world.x - ARENA_X_MIN) / ARENA_WIDTH_M) * SVG_VIEWBOX_WIDTH;
  const v = ((world.z - ARENA_Z_MIN) / ARENA_LENGTH_M) * SVG_VIEWBOX_HEIGHT;
  return { u, v };
}

/**
 * Transforms Base SVG coordinates [0, 600] x [0, 400] to World coordinates (meters).
 */
export function svgToWorld(svg: SvgPoint): Point2D {
  const x = (svg.u / SVG_VIEWBOX_WIDTH) * ARENA_WIDTH_M + ARENA_X_MIN;
  const z = (svg.v / SVG_VIEWBOX_HEIGHT) * ARENA_LENGTH_M + ARENA_Z_MIN;
  return {
    x: parseFloat(x.toFixed(4)),
    z: parseFloat(z.toFixed(4))
  };
}

/**
 * Transforms Client screen pointer coordinates into SVG viewport coordinates
 * using MDN standard getScreenCTM() and inverse matrix transformation.
 */
export function screenToSvg(screen: ScreenPoint, svgElement: SVGSVGElement | null): SvgPoint {
  if (!svgElement) {
    return { u: 0, v: 0 };
  }

  try {
    const ctm = svgElement.getScreenCTM();
    if (ctm) {
      const inverse = ctm.inverse();
      const pt = svgElement.createSVGPoint();
      pt.x = screen.clientX;
      pt.y = screen.clientY;
      const svgPt = pt.matrixTransform(inverse);
      return { u: svgPt.x, v: svgPt.y };
    }
  } catch {
    // Fallback if getScreenCTM() throws in non-standard DOM environments
  }

  const rect = svgElement.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    return { u: 0, v: 0 };
  }

  return {
    u: ((screen.clientX - rect.left) / rect.width) * SVG_VIEWBOX_WIDTH,
    v: ((screen.clientY - rect.top) / rect.height) * SVG_VIEWBOX_HEIGHT
  };
}

/**
 * Transforms SVG viewport coordinates back to Client screen coordinates.
 */
export function svgToScreen(svgPt: SvgPoint, svgElement: SVGSVGElement | null): ScreenPoint {
  if (!svgElement) {
    return { clientX: 0, clientY: 0 };
  }

  try {
    const ctm = svgElement.getScreenCTM();
    if (ctm) {
      const pt = svgElement.createSVGPoint();
      pt.x = svgPt.u;
      pt.y = svgPt.v;
      const screenPt = pt.matrixTransform(ctm);
      return { clientX: screenPt.x, clientY: screenPt.y };
    }
  } catch {
    // Fallback
  }

  const rect = svgElement.getBoundingClientRect();
  return {
    clientX: rect.left + (svgPt.u / SVG_VIEWBOX_WIDTH) * rect.width,
    clientY: rect.top + (svgPt.v / SVG_VIEWBOX_HEIGHT) * rect.height
  };
}

/**
 * Transforms Client screen pointer to World coordinates, accounting for active zoom & pan.
 */
export function screenToWorld(
  screen: ScreenPoint,
  svgElement: SVGSVGElement | null,
  transform: ViewportTransform
): Point2D {
  const svgView = screenToSvg(screen, svgElement);
  // Invert display pan and zoom: uView = zoom * uBase + panX
  const uBase = (svgView.u - transform.panX) / transform.zoom;
  const vBase = (svgView.v - transform.panY) / transform.zoom;
  return svgToWorld({ u: uBase, v: vBase });
}

/**
 * Transforms World coordinates to Client screen coordinates, accounting for active zoom & pan.
 */
export function worldToScreen(
  world: Point2D,
  svgElement: SVGSVGElement | null,
  transform: ViewportTransform
): ScreenPoint {
  const baseSvg = worldToSvg(world);
  const uView = transform.zoom * baseSvg.u + transform.panX;
  const vView = transform.zoom * baseSvg.v + transform.panY;
  return svgToScreen({ u: uView, v: vView }, svgElement);
}

/**
 * Calculates focal-point preserved zoom transformation.
 * Anchors the world point directly under the mouse pointer so it remains invariant on screen.
 */
export function zoomAtPoint(
  focalScreen: ScreenPoint,
  currentTransform: ViewportTransform,
  zoomFactor: number,
  svgElement: SVGSVGElement | null,
  minZoom = DEFAULT_MIN_ZOOM,
  maxZoom = DEFAULT_MAX_ZOOM
): ViewportTransform {
  const focalSvg = screenToSvg(focalScreen, svgElement);
  const newZoom = Math.max(minZoom, Math.min(maxZoom, currentTransform.zoom * zoomFactor));

  if (Math.abs(newZoom - currentTransform.zoom) < 0.0001) {
    return currentTransform;
  }

  // Preservation equation: P = zoom * Base + pan -> Base = (P - pan) / zoom
  // After newZoom: P = newZoom * Base + newPan -> newPan = P - (newZoom / zoom) * (P - pan)
  const ratio = newZoom / currentTransform.zoom;
  const newPanX = focalSvg.u - ratio * (focalSvg.u - currentTransform.panX);
  const newPanY = focalSvg.v - ratio * (focalSvg.v - currentTransform.panY);

  return {
    zoom: newZoom,
    panX: newPanX,
    panY: newPanY
  };
}

/**
 * Calculates focal-point preserved zoom centered at SVG center (300, 200).
 */
export function zoomAtCenter(
  currentTransform: ViewportTransform,
  zoomFactor: number,
  centerU = SVG_VIEWBOX_WIDTH / 2,
  centerV = SVG_VIEWBOX_HEIGHT / 2,
  minZoom = DEFAULT_MIN_ZOOM,
  maxZoom = DEFAULT_MAX_ZOOM
): ViewportTransform {
  const newZoom = Math.max(minZoom, Math.min(maxZoom, currentTransform.zoom * zoomFactor));
  if (Math.abs(newZoom - currentTransform.zoom) < 0.0001) {
    return currentTransform;
  }

  const ratio = newZoom / currentTransform.zoom;
  const newPanX = centerU - ratio * (centerU - currentTransform.panX);
  const newPanY = centerV - ratio * (centerV - currentTransform.panY);

  return {
    zoom: newZoom,
    panX: newPanX,
    panY: newPanY
  };
}

/**
 * Applies pan delta in screen coordinates to view pan.
 */
export function panByScreenDelta(
  deltaScreenX: number,
  deltaScreenY: number,
  currentTransform: ViewportTransform,
  svgElement: SVGSVGElement | null
): ViewportTransform {
  if (!svgElement) {
    return currentTransform;
  }

  const rect = svgElement.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    return currentTransform;
  }

  const deltaSvgX = (deltaScreenX / rect.width) * SVG_VIEWBOX_WIDTH;
  const deltaSvgY = (deltaScreenY / rect.height) * SVG_VIEWBOX_HEIGHT;

  return {
    ...currentTransform,
    panX: currentTransform.panX + deltaSvgX,
    panY: currentTransform.panY + deltaSvgY
  };
}

/**
 * Focuses camera on a target world coordinate, centering it in the viewport.
 */
export function focusWorldPoint(
  targetWorld: Point2D,
  zoom: number,
  centerU = SVG_VIEWBOX_WIDTH / 2,
  centerV = SVG_VIEWBOX_HEIGHT / 2
): ViewportTransform {
  const targetSvg = worldToSvg(targetWorld);
  return {
    zoom,
    panX: centerU - zoom * targetSvg.u,
    panY: centerV - zoom * targetSvg.v
  };
}

/**
 * Resets camera to default 100% view fitting entire arena bounds.
 */
export function fitAllBounds(): ViewportTransform {
  return {
    zoom: 1.0,
    panX: 0,
    panY: 0
  };
}

/**
 * Validates whether a candidate target point is safe for robot navigation:
 * 1. Inside valid physical arena boundaries (-1.5m .. 1.5m, -1.0m .. 1.0m).
 * 2. Has adequate clearance from all static obstacles (distance > obstacle.radius + robot.radius).
 */
export function validateGoalPoint(
  goal: Point2D,
  obstacles: ObstacleSpec[] = []
): ValidationResult {
  // Boundary check
  if (goal.x < ARENA_X_MIN || goal.x > ARENA_X_MAX || goal.z < ARENA_Z_MIN || goal.z > ARENA_Z_MAX) {
    return {
      isValid: false,
      reason: `Tọa độ ngoài phạm vi sa bàn [${ARENA_X_MIN}m..${ARENA_X_MAX}m, ${ARENA_Z_MIN}m..${ARENA_Z_MAX}m]`
    };
  }

  // Check collision clearance with each obstacle
  for (const obs of obstacles) {
    const dist = Math.hypot(goal.x - obs.x, goal.z - obs.z);
    const minSafeClearance = obs.radius + ROBOT_RADIUS_M;
    if (dist < minSafeClearance) {
      return {
        isValid: false,
        reason: `Va chạm vật cản: ${obs.nameVi || 'Vật cản'} (cách tâm ${dist.toFixed(2)}m < an toàn ${minSafeClearance.toFixed(2)}m)`
      };
    }
  }

  return {
    isValid: true
  };
}
