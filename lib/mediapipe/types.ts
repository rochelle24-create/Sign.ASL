export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface HandDetectionResult {
  landmarks: Landmark[][];
  worldLandmarks: Landmark[][];
  handednesses: Array<Array<{ categoryName: string; score: number }>>;
}

export type Handedness = "Left" | "Right";
