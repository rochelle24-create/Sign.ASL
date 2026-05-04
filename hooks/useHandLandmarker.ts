"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getHandLandmarker } from "@/lib/mediapipe/handLandmarker";
import type { Landmark, HandDetectionResult } from "@/lib/mediapipe/types";

export function useHandLandmarker(
  videoRef: React.RefObject<HTMLVideoElement>,
  isActive: boolean
) {
  const [result, setResult] = useState<HandDetectionResult | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rafRef = useRef<number>(0);
  const landmarkerRef = useRef<Awaited<ReturnType<typeof getHandLandmarker>> | null>(null);

  useEffect(() => {
    let cancelled = false;
    getHandLandmarker()
      .then((lm) => {
        if (cancelled) return;
        landmarkerRef.current = lm;
        setIsReady(true);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Failed to initialize hand tracker";
        setError(msg);
        setIsReady(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const detect = useCallback(() => {
    const video = videoRef.current;
    const lm = landmarkerRef.current;
    if (!video || !lm || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(detect);
      return;
    }

    const ts = performance.now();
    const detection = lm.detectForVideo(video, ts);

    setResult({
      landmarks: detection.landmarks,
      worldLandmarks: detection.worldLandmarks,
      handednesses: detection.handednesses,
    });

    rafRef.current = requestAnimationFrame(detect);
  }, [videoRef]);

  useEffect(() => {
    if (!isActive || !isReady) return;
    rafRef.current = requestAnimationFrame(detect);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isActive, isReady, detect]);

  const firstHand = result?.landmarks[0] ?? null;
  const handedness = result?.handednesses[0]?.[0]?.categoryName ?? null;
  const isLeftHand = handedness === "Left";

  return { result, firstHand, isLeftHand, isReady, error };
}
