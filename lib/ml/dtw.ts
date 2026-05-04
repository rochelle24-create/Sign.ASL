type Point = [number, number];

function euclidean(a: Point, b: Point): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

/**
 * Dynamic Time Warping distance between two 2D point sequences.
 * Lower = more similar.
 */
export function dtw(seq1: Point[], seq2: Point[]): number {
  const n = seq1.length;
  const m = seq2.length;
  if (n === 0 || m === 0) return Infinity;

  const cost: number[][] = Array.from({ length: n }, () =>
    new Array(m).fill(Infinity)
  );

  cost[0][0] = euclidean(seq1[0], seq2[0]);

  for (let i = 1; i < n; i++) {
    cost[i][0] = cost[i - 1][0] + euclidean(seq1[i], seq2[0]);
  }
  for (let j = 1; j < m; j++) {
    cost[0][j] = cost[0][j - 1] + euclidean(seq1[0], seq2[j]);
  }

  for (let i = 1; i < n; i++) {
    for (let j = 1; j < m; j++) {
      const prev = Math.min(cost[i - 1][j], cost[i][j - 1], cost[i - 1][j - 1]);
      cost[i][j] = euclidean(seq1[i], seq2[j]) + prev;
    }
  }

  return cost[n - 1][m - 1] / (n + m);
}

/**
 * Normalize a trajectory so it starts at origin and fits within unit square.
 */
export function normalizeTrajectory(points: Point[]): Point[] {
  if (points.length === 0) return [];

  const [x0, y0] = points[0];
  const translated: Point[] = points.map(([x, y]) => [x - x0, y - y0]);

  const maxDist = Math.max(
    ...translated.map(([x, y]) => Math.sqrt(x * x + y * y))
  );
  if (maxDist === 0) return translated;

  return translated.map(([x, y]) => [x / maxDist, y / maxDist]);
}
