import type { Landmark } from "@/lib/mediapipe/types";

/**
 * Converts 21 MediaPipe hand landmarks into a 63-dim feature vector
 * that is invariant to translation, scale, and handedness.
 *
 * Landmark indices: 0=wrist, 9=middle-MCP, 8=index-tip, 20=pinky-tip
 */
export function normalizeLandmarks(
  landmarks: Landmark[],
  isLeftHand: boolean
): Float32Array {
  if (landmarks.length !== 21) {
    return new Float32Array(63);
  }

  const wrist = landmarks[0];

  // 1. Translate: subtract wrist
  const translated = landmarks.map((lm) => ({
    x: lm.x - wrist.x,
    y: lm.y - wrist.y,
    z: lm.z - wrist.z,
  }));

  // 2. Scale: divide by wrist→middle-MCP distance
  const ref = translated[9];
  const scale = Math.sqrt(ref.x ** 2 + ref.y ** 2 + ref.z ** 2) || 1;

  const scaled = translated.map((lm) => ({
    x: lm.x / scale,
    y: lm.y / scale,
    z: lm.z / scale,
  }));

  // 3. Handedness: mirror x if left hand so classifier always sees right hand
  const xSign = isLeftHand ? -1 : 1;

  const features = new Float32Array(63);
  for (let i = 0; i < 21; i++) {
    features[i * 3] = scaled[i].x * xSign;
    features[i * 3 + 1] = scaled[i].y;
    features[i * 3 + 2] = scaled[i].z;
  }

  return features;
}
