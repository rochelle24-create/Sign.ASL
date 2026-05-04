"use client";

import { useRef, useCallback, useEffect } from "react";
import { feedLandmarks, recognizeMotion, resetMotionBuffer } from "@/lib/ml/motionRecognizer";
import type { Landmark } from "@/lib/mediapipe/types";

export function useMotionDetection(
  targetLetter: "J" | "Z" | null,
  onDetected: (letter: "J" | "Z") => void
) {
  const cooldownRef = useRef(false);

  useEffect(() => {
    resetMotionBuffer();
    cooldownRef.current = false;
  }, [targetLetter]);

  const feed = useCallback(
    (landmarks: Landmark[]) => {
      if (!targetLetter || cooldownRef.current) return;

      feedLandmarks(landmarks);
      const result = recognizeMotion(targetLetter, landmarks);

      if (result.detected && result.letter) {
        cooldownRef.current = true;
        onDetected(result.letter);
      }
    },
    [targetLetter, onDetected]
  );

  function reset() {
    resetMotionBuffer();
    cooldownRef.current = false;
  }

  return { feed, reset };
}
