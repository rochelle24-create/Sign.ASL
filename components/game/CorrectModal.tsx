"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import type { Letter } from "@/lib/ml/labels";
import { CuteLetter } from "./CuteLetter";

interface CorrectModalProps {
  letter: Letter;
  screenshotUrl: string;
  onNext: () => void;
  autoAdvanceMs?: number;
}

function ReferenceImage({ letter }: { letter: Letter }) {
  const initialSrc = useMemo(() => `/signs/${letter}.svg`, [letter]);
  const [src, setSrc] = useState(initialSrc);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    setSrc(initialSrc);
    setShowFallback(false);
  }, [initialSrc]);

  if (showFallback) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-primary/10 to-accent/10">
        <div className="text-4xl">🤟</div>
        <div className="text-xs font-semibold text-foreground">Sign {letter}</div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`Reference ASL ${letter}`}
      className="object-contain w-full h-full p-2"
      onError={() => {
        if (src === `/signs/${letter}.svg`) {
          setSrc(`https://commons.wikimedia.org/wiki/Special:FilePath/Sign_language_${letter}.svg`);
        } else if (src.startsWith("https://")) {
          setSrc(`/signs/${letter}.gif`);
        } else if (src === `/signs/${letter}.gif`) {
          setSrc("/signs/placeholder.svg");
        } else {
          setShowFallback(true);
        }
      }}
    />
  );
}

export function CorrectModal({
  letter,
  screenshotUrl,
  onNext,
  autoAdvanceMs = 3000,
}: CorrectModalProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    // Fire confetti
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors: ["#a78bfa", "#34d399", "#f87171", "#fbbf24", "#60a5fa"],
    });

    timerRef.current = setTimeout(onNext, autoAdvanceMs);
    return () => clearTimeout(timerRef.current);
  }, [onNext, autoAdvanceMs]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-card border border-border rounded-2xl p-8 max-w-2xl w-full shadow-2xl"
      >
        {/* Cute animated letter */}
        <div className="flex justify-center mb-6">
          <CuteLetter letter={letter} />
        </div>

        {/* Side-by-side: reference vs your sign */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Reference
            </span>
            <div className="bg-secondary rounded-xl overflow-hidden w-full aspect-square flex items-center justify-center">
              <ReferenceImage letter={letter} />
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Your Sign
            </span>
            <div className="bg-secondary rounded-xl overflow-hidden w-full aspect-square flex items-center justify-center">
              {screenshotUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={screenshotUrl}
                  alt="Your hand sign"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <div className="text-3xl">📷</div>
                  <span className="text-xs">No snapshot</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onNext}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Next Letter →
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-3">
          Auto-advancing in {Math.round(autoAdvanceMs / 1000)}s...
        </p>
      </motion.div>
    </motion.div>
  );
}
