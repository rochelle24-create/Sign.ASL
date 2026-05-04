"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Letter } from "@/lib/ml/labels";

interface PredictionMeterProps {
  letter: Letter | null;
  confidence: number;
  targetLetter: Letter | null;
}

export function PredictionMeter({ letter, confidence, targetLetter }: PredictionMeterProps) {
  const isMatch = letter && targetLetter && letter === targetLetter;
  const pct = Math.round(confidence * 100);

  return (
    <div className="bg-card border border-border rounded-xl p-4 w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-muted-foreground text-sm">Detecting...</span>
        <AnimatePresence mode="wait">
          {letter ? (
            <motion.span
              key={letter}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`text-2xl font-bold font-mono ${
                isMatch ? "text-accent" : "text-foreground"
              }`}
            >
              {letter}
            </motion.span>
          ) : (
            <span className="text-muted-foreground font-mono">—</span>
          )}
        </AnimatePresence>
      </div>

      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full transition-colors ${
            isMatch ? "bg-accent" : "bg-primary"
          }`}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>

      <div className="flex justify-between mt-1">
        <span className="text-xs text-muted-foreground">0%</span>
        <span className={`text-xs font-mono ${isMatch ? "text-accent" : "text-muted-foreground"}`}>
          {pct}%
        </span>
        <span className="text-xs text-muted-foreground">100%</span>
      </div>
    </div>
  );
}
