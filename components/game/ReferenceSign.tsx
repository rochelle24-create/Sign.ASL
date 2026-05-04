"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { Letter } from "@/lib/ml/labels";
import { isMotionLetter } from "@/lib/ml/labels";

interface ReferenceSignProps {
  letter: Letter;
  onDemoDone?: () => void;
}

export function ReferenceSign({ letter, onDemoDone }: ReferenceSignProps) {
  const isMotion = isMotionLetter(letter);
  const initialSrc = useMemo(() => `/signs/${letter}.svg`, [letter]);
  const [src, setSrc] = useState(initialSrc);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    setSrc(initialSrc);
    setShowFallback(false);
  }, [initialSrc]);

  return (
    <motion.div
      key={letter}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center gap-4"
    >
      <div className="text-8xl font-bold text-primary font-mono">{letter}</div>

      <div className="relative bg-white rounded-xl overflow-hidden w-48 h-48 flex items-center justify-center border border-border">
        {/* Reference sign image — falls back to a visible hand guide if missing */}
        {!showFallback ? (
          <img
            src={src}
            alt={`ASL sign for ${letter}`}
            width={192}
            height={192}
            className="object-contain w-full h-full p-2"
            onError={() => {
              if (src !== `https://commons.wikimedia.org/wiki/Special:FilePath/Sign_language_${letter}.svg`) {
                setSrc(`https://commons.wikimedia.org/wiki/Special:FilePath/Sign_language_${letter}.svg`);
                return;
              }
              if (src !== `/signs/${letter}.gif`) {
                setSrc(`/signs/${letter}.gif`);
                return;
              }
              if (src !== "/signs/placeholder.svg") {
                setSrc("/signs/placeholder.svg");
                return;
              }
              setShowFallback(true);
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-primary/10 to-accent/10">
            <div className="text-5xl leading-none">🤟</div>
            <div className="text-sm font-semibold text-foreground">Sign {letter}</div>
            <div className="text-[11px] text-muted-foreground">Reference image coming soon</div>
          </div>
        )}
      </div>

      {isMotion && (
        <div className="bg-accent/10 border border-accent/30 rounded-lg px-3 py-1.5">
          <p className="text-accent text-sm font-medium text-center">
            {letter === "J"
              ? "Trace a J shape — pinky starts up, curves down and left"
              : "Trace a Z shape — index finger draws 3 lines"}
          </p>
        </div>
      )}

      {onDemoDone && (
        <button
          onClick={onDemoDone}
          className="mt-2 text-sm text-muted-foreground hover:text-foreground transition-colors underline"
        >
          Ready to try →
        </button>
      )}
    </motion.div>
  );
}
