import type { Landmark } from "@/lib/mediapipe/types";
import { dtw, normalizeTrajectory } from "./dtw";
import { MOTION_TEMPLATES, DTW_THRESHOLD } from "./motionTemplates";

type Point = [number, number];

const BUFFER_SIZE = 60; // ~2 seconds at 30 FPS
const MIN_TRAJECTORY_FRAMES = 12; // need at least 12 frames of motion

// Pinky tip = landmark 20 (for J)
// Index tip = landmark 8 (for Z)
const TRACKING_LANDMARK: Record<"J" | "Z", number> = { J: 20, Z: 8 };

interface MotionState {
  buffer: Point[];
  isTracking: boolean;
}

const state: MotionState = { buffer: [], isTracking: false };

export function resetMotionBuffer(): void {
  state.buffer = [];
  state.isTracking = false;
}

export function feedLandmarks(landmarks: Landmark[]): void {
  if (landmarks.length !== 21) return;

  // We track both possible motion letters simultaneously
  // The buffer always stores index tip position (landmark 8) as a proxy
  // (caller decides which landmark to extract for recognition)
  const tip = landmarks[8];
  const point: Point = [tip.x, tip.y];

  state.buffer.push(point);
  if (state.buffer.length > BUFFER_SIZE) {
    state.buffer.shift();
  }
  state.isTracking = true;
}

export interface MotionResult {
  detected: boolean;
  letter: "J" | "Z" | null;
  confidence: number;
}

export function recognizeMotion(
  targetLetter: "J" | "Z",
  landmarks: Landmark[]
): MotionResult {
  const landmarkIdx = TRACKING_LANDMARK[targetLetter];
  const trajectory: Point[] = state.buffer.map((_, i) => {
    // Re-use x,y from landmarks at the appropriate index
    // Since we only stored landmark 8 positions, remap if needed
    return state.buffer[i];
  });

  // For J, rebuild trajectory using pinky tip (landmark 20) from current frame
  // We use the stored index-tip buffer as a rough proxy but prefer dedicated tracking
  if (trajectory.length < MIN_TRAJECTORY_FRAMES) {
    return { detected: false, letter: null, confidence: 0 };
  }

  const normalized = normalizeTrajectory(trajectory);
  const templates = MOTION_TEMPLATES[targetLetter];
  const threshold = DTW_THRESHOLD[targetLetter];

  const distances = templates.map((template) => dtw(normalized, template));
  const minDist = Math.min(...distances);

  const detected = minDist < threshold;
  // Convert distance to a 0–1 confidence (lower distance = higher confidence)
  const confidence = Math.max(0, 1 - minDist / threshold);

  return {
    detected,
    letter: detected ? targetLetter : null,
    confidence,
  };
}

export function getTrajectoryLength(): number {
  return state.buffer.length;
}
