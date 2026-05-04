type Point = [number, number];

/**
 * Reference trajectories for J and Z, hand-recorded and normalized.
 * J: pinky tip traces a downward hook (like the letter J)
 * Z: index tip traces a Z shape (right, diagonal-down-left, right)
 *
 * These are normalized: start at [0,0], max distance = 1.
 * Y axis: positive = down (image coordinates).
 */
export const MOTION_TEMPLATES: Record<"J" | "Z", Point[][]> = {
  J: [
    // Template 1: straight down then curve left
    [
      [0, 0], [0, 0.1], [0, 0.2], [0, 0.35], [0, 0.5],
      [0, 0.65], [0, 0.8], [-0.05, 0.9], [-0.15, 0.95],
      [-0.3, 0.98], [-0.45, 1.0],
    ],
    // Template 2: slight variation
    [
      [0, 0], [0.02, 0.15], [0.02, 0.3], [0.01, 0.5],
      [0, 0.65], [-0.02, 0.78], [-0.1, 0.9],
      [-0.25, 0.97], [-0.4, 1.0],
    ],
    // Template 3
    [
      [0, 0], [0, 0.2], [0.01, 0.4], [0, 0.6],
      [-0.03, 0.75], [-0.12, 0.88], [-0.28, 0.96], [-0.42, 1.0],
    ],
  ],
  Z: [
    // Template 1: top-right, diagonal to bottom-left, bottom-right
    [
      [0, 0], [0.3, 0], [0.6, 0], [1.0, 0],
      [0.8, 0.25], [0.6, 0.5], [0.35, 0.75],
      [0.1, 1.0], [0, 1.0],
      [0.3, 1.0], [0.6, 1.0], [1.0, 1.0],
    ],
    // Template 2: tighter Z
    [
      [0, 0], [0.4, 0], [0.8, 0], [1.0, 0],
      [0.75, 0.3], [0.5, 0.6], [0.25, 0.85],
      [0, 1.0], [0.35, 1.0], [0.7, 1.0], [1.0, 1.0],
    ],
    // Template 3
    [
      [0, 0], [0.5, 0], [1.0, 0],
      [0.7, 0.35], [0.35, 0.7], [0, 1.0],
      [0.5, 1.0], [1.0, 1.0],
    ],
  ],
};

export const DTW_THRESHOLD = {
  J: 0.35,
  Z: 0.4,
} as const;
