"use client";

import { motion } from "framer-motion";

interface MotionGuideProps {
  letter: "J" | "Z";
  width: number;
  height: number;
}

const J_PATH = "M 96 40 L 96 140 Q 96 180 56 180 Q 16 180 16 150";
const Z_PATH = "M 16 40 L 176 40 L 16 160 L 176 160";

export function MotionGuide({ letter, width, height }: MotionGuideProps) {
  const path = letter === "J" ? J_PATH : Z_PATH;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={width}
      height={height}
      viewBox="0 0 192 200"
      style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
    >
      {/* Static dashed guide path */}
      <path
        d={path}
        fill="none"
        stroke="rgba(52, 211, 153, 0.4)"
        strokeWidth="6"
        strokeDasharray="12 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Animated dot travelling the path */}
      <motion.circle
        r="8"
        fill="rgba(52, 211, 153, 0.9)"
        animate={{
          offsetDistance: ["0%", "100%"],
        }}
        style={{ offsetPath: `path('${path}')` } as React.CSSProperties}
        transition={{
          duration: letter === "J" ? 1.8 : 2.2,
          repeat: Infinity,
          repeatDelay: 0.5,
          ease: "easeInOut",
        }}
      />

      {/* Label */}
      <text
        x="192"
        y="20"
        textAnchor="end"
        fill="rgba(52, 211, 153, 0.8)"
        fontSize="14"
        fontWeight="bold"
      >
        Trace {letter}
      </text>
    </svg>
  );
}
