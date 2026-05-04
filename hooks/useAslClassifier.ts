"use client";

import { useEffect, useRef, useState } from "react";
import { loadClassifier, predict, type Prediction } from "@/lib/ml/classifier";
import { normalizeLandmarks } from "@/lib/ml/normalize";
import type { Landmark } from "@/lib/mediapipe/types";

export function useAslClassifier() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadClassifier()
      .then(() => setIsLoaded(true))
      .catch((err) => setLoadError(String(err)));
  }, []);

  function classify(
    landmarks: Landmark[],
    isLeftHand: boolean
  ): Prediction | null {
    if (!isLoaded || landmarks.length !== 21) return null;
    try {
      const features = normalizeLandmarks(landmarks, isLeftHand);
      return predict(features);
    } catch {
      return null;
    }
  }

  return { isLoaded, loadError, classify };
}
