"use client";

import { motion } from "framer-motion";
import type { Letter } from "@/lib/ml/labels";

const LETTER_COLORS: Record<string, string> = {
  A: "#f87171", B: "#fb923c", C: "#fbbf24", D: "#a3e635",
  E: "#34d399", F: "#22d3ee", G: "#60a5fa", H: "#818cf8",
  I: "#a78bfa", J: "#e879f9", K: "#f472b6", L: "#fb7185",
  M: "#f97316", N: "#eab308", O: "#84cc16", P: "#10b981",
  Q: "#06b6d4", R: "#3b82f6", S: "#6366f1", T: "#8b5cf6",
  U: "#d946ef", V: "#ec4899", W: "#f43f5e", X: "#ef4444",
  Y: "#f59e0b", Z: "#10b981",
};

interface CuteLetterProps {
  letter: Letter;
}

export function CuteLetter({ letter }: CuteLetterProps) {
  const color = LETTER_COLORS[letter] ?? "#a78bfa";

  return (
    <motion.div
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className="flex flex-col items-center"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        {/* Letter with face */}
        <div
          className="w-32 h-32 rounded-2xl flex items-center justify-center text-6xl font-bold shadow-2xl"
          style={{
            background: `radial-gradient(circle at 35% 35%, ${color}dd, ${color}88)`,
            boxShadow: `0 0 30px ${color}66`,
          }}
        >
          <span className="drop-shadow-sm">{letter}</span>
        </div>

        {/* Eyes */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-5">
          <motion.div
            className="w-3 h-3 bg-white rounded-full"
            animate={{ scaleY: [1, 0.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
          <motion.div
            className="w-3 h-3 bg-white rounded-full"
            animate={{ scaleY: [1, 0.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-3 text-lg font-semibold"
        style={{ color }}
      >
        Correct!
      </motion.p>
    </motion.div>
  );
}
