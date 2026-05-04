"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Letter } from "@/lib/ml/labels";
import type { Landmark } from "@/lib/mediapipe/types";

const POLL_INTERVAL_MS = 300;
const STABILITY_WINDOW = 3;
const CONFIDENCE_THRESHOLD = 0.60;
const API_URL = "http://localhost:5000/predict";

export interface VideoClassification {
  letter: Letter | null;
  confidence: number;
  isLoading: boolean;
  error: string | null;
  stableLetter: Letter | null;
  screenshotUrl: string | null;
}

export function useVideoClassifier(
  videoRef: React.RefObject<HTMLVideoElement>,
  isActive: boolean,
  landmarksRef?: React.RefObject<Landmark[] | null>
) {
  const isPredictingRef = useRef(false);
  const ringRef = useRef<Letter[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const [result, setResult] = useState<VideoClassification>({
    letter: null,
    confidence: 0,
    isLoading: false,
    error: null,
    stableLetter: null,
    screenshotUrl: null,
  });

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;

    const canvas = document.createElement("canvas");
    canvas.width = 224;
    canvas.height = 224;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Un-mirror so the server sees a natural hand orientation
    ctx.translate(224, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, 224, 224);

    return canvas.toDataURL("image/jpeg", 0.80).split(",")[1];
  }, [videoRef]);

  const captureScreenshot = useCallback((): string => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return "";

    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;

    // Draw full mirrored frame onto an offscreen canvas
    const full = document.createElement("canvas");
    full.width = w;
    full.height = h;
    const fctx = full.getContext("2d");
    if (!fctx) return "";
    fctx.translate(w, 0);
    fctx.scale(-1, 1);
    fctx.drawImage(video, 0, 0);

    // Crop to hand bounding box if landmarks are available
    const landmarks = landmarksRef?.current;
    if (landmarks && landmarks.length > 0) {
      // Landmarks are in normalized video coords; convert to mirrored canvas pixels
      const xs = landmarks.map((l) => (1 - l.x) * w);
      const ys = landmarks.map((l) => l.y * h);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      // Square crop centered on hand with generous padding
      const handSize = Math.max(maxX - minX, maxY - minY);
      const pad = handSize * 0.6;
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const half = handSize / 2 + pad;

      const sx = Math.max(0, Math.round(cx - half));
      const sy = Math.max(0, Math.round(cy - half));
      const sw = Math.min(w - sx, Math.round(half * 2));
      const sh = Math.min(h - sy, Math.round(half * 2));

      const out = document.createElement("canvas");
      out.width = 400;
      out.height = 400;
      const octx = out.getContext("2d");
      if (octx) {
        octx.drawImage(full, sx, sy, sw, sh, 0, 0, 400, 400);
        return out.toDataURL("image/jpeg", 0.85);
      }
    }

    return full.toDataURL("image/jpeg", 0.85);
  }, [videoRef, landmarksRef]);

  const sendFrame = useCallback(async () => {
    if (isPredictingRef.current) return;
    const frame = captureFrame();
    if (!frame) return;

    isPredictingRef.current = true;
    setResult((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frame }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = (await res.json()) as { letter: string | null; confidence: number };
      const letter = (data.letter as Letter) ?? null;
      const confidence = data.confidence;

      if (letter && confidence >= CONFIDENCE_THRESHOLD) {
        ringRef.current.push(letter);
      } else {
        ringRef.current = [];
      }
      if (ringRef.current.length > STABILITY_WINDOW) ringRef.current.shift();

      const allSame =
        ringRef.current.length === STABILITY_WINDOW &&
        ringRef.current.every((l) => l === ringRef.current[0]);

      setResult({
        letter,
        confidence,
        isLoading: false,
        error: null,
        stableLetter: allSame ? ringRef.current[0] : null,
        screenshotUrl: allSame ? captureScreenshot() : null,
      });
    } catch (err) {
      ringRef.current = [];
      setResult((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Prediction failed",
        stableLetter: null,
        screenshotUrl: null,
      }));
    } finally {
      isPredictingRef.current = false;
    }
  }, [captureFrame, captureScreenshot]);

  useEffect(() => {
    if (!isActive) {
      clearInterval(intervalRef.current);
      ringRef.current = [];
      return;
    }

    intervalRef.current = setInterval(sendFrame, POLL_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [isActive, sendFrame]);

  function reset() {
    ringRef.current = [];
    isPredictingRef.current = false;
    setResult({ letter: null, confidence: 0, isLoading: false, error: null, stableLetter: null, screenshotUrl: null });
  }

  return { result, reset };
}
