"use client";

import { useRef, useCallback } from "react";
import type { Letter } from "@/lib/ml/labels";

const RING_SIZE = 5;
const CONFIDENCE_THRESHOLD = 0.85;

export interface StableDetection {
  letter: Letter;
  confidence: number;
}

export function useStableDetection(
  onStable: (detection: StableDetection) => void
) {
  const ringRef = useRef<Array<{ letter: Letter; confidence: number }>>([]);
  const lastEmittedRef = useRef<Letter | null>(null);

  const feed = useCallback(
    (letter: Letter, confidence: number) => {
      const ring = ringRef.current;
      ring.push({ letter, confidence });
      if (ring.length > RING_SIZE) ring.shift();

      if (ring.length < RING_SIZE) return;

      const allSame = ring.every((r) => r.letter === ring[0].letter);
      const avgConf = ring.reduce((s, r) => s + r.confidence, 0) / ring.length;

      if (allSame && avgConf >= CONFIDENCE_THRESHOLD) {
        const stableLetter = ring[0].letter;
        if (stableLetter !== lastEmittedRef.current) {
          lastEmittedRef.current = stableLetter;
          onStable({ letter: stableLetter, confidence: avgConf });
        }
      } else {
        lastEmittedRef.current = null;
      }
    },
    [onStable]
  );

  function reset() {
    ringRef.current = [];
    lastEmittedRef.current = null;
  }

  return { feed, reset };
}
