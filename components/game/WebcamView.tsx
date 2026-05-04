"use client";

import { useEffect, useRef } from "react";
import type { Landmark } from "@/lib/mediapipe/types";

interface WebcamViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onVideoMount?: (node: HTMLVideoElement | null) => void;
  landmarks: Landmark[] | null;
  width?: number;
  height?: number;
  className?: string;
}

const CONNECTIONS: [number, number][] = [
  [0,1],[1,2],[2,3],[3,4],       // thumb
  [0,5],[5,6],[6,7],[7,8],       // index
  [5,9],[9,10],[10,11],[11,12],  // middle
  [9,13],[13,14],[14,15],[15,16],// ring
  [13,17],[17,18],[18,19],[19,20],// pinky
  [0,17],                        // palm edge
];

export function WebcamView({
  videoRef,
  onVideoMount,
  landmarks,
  width = 640,
  height = 480,
  className = "",
}: WebcamViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    if (!landmarks || landmarks.length === 0) return;

    // Mirror coords to match the mirrored video display
    const mx = (x: number) => (1 - x) * width;
    const my = (y: number) => y * height;

    // Draw connections
    ctx.strokeStyle = "rgba(139, 92, 246, 0.8)";
    ctx.lineWidth = 2;
    for (const [a, b] of CONNECTIONS) {
      const lmA = landmarks[a];
      const lmB = landmarks[b];
      ctx.beginPath();
      ctx.moveTo(mx(lmA.x), my(lmA.y));
      ctx.lineTo(mx(lmB.x), my(lmB.y));
      ctx.stroke();
    }

    // Draw keypoints
    for (let i = 0; i < landmarks.length; i++) {
      const lm = landmarks[i];
      ctx.beginPath();
      ctx.arc(mx(lm.x), my(lm.y), i === 0 ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? "rgba(255,255,255,0.9)" : "rgba(139, 92, 246, 0.9)";
      ctx.fill();
    }
  }, [landmarks, width, height]);

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`} style={{ width, height }}>
      <video
        ref={(node) => {
          videoRef.current = node;
          onVideoMount?.(node);
        }}
        className="webcam-mirror w-full h-full object-cover"
        playsInline
        muted
        style={{ width, height }}
      />
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="absolute inset-0 pointer-events-none"
      />
    </div>
  );
}
