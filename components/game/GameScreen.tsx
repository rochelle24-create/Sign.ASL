"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMachine } from "@xstate/react";
import { toast } from "sonner";
import { X, SkipForward, Loader2, Radio } from "lucide-react";

import {
  gameMachine,
  currentLetter,
  type GameMode,
} from "@/lib/game/machine";
import { buildAlphabetical, buildRandom } from "@/lib/game/sequences";
import { isMotionLetter } from "@/lib/ml/labels";

import { useWebcam } from "@/hooks/useWebcam";
import { useHandLandmarker } from "@/hooks/useHandLandmarker";
import { useVideoClassifier } from "@/hooks/useVideoClassifier";

import { WebcamView } from "./WebcamView";
import { ReferenceSign } from "./ReferenceSign";
import { PredictionMeter } from "./PredictionMeter";
import { ProgressBar } from "./ProgressBar";
import { CorrectModal } from "./CorrectModal";
import { MotionGuide } from "./MotionGuide";

interface GameScreenProps {
  mode: GameMode;
  letterCount?: number;
  onExit: () => void;
}

export function GameScreen({ mode, letterCount = 26, onExit }: GameScreenProps) {
  const [state, send] = useMachine(gameMachine);
  const { videoRef, status: camStatus, startWebcam, error: camError, setVideoElement } = useWebcam();

  // Hand landmark overlay (visual only — detection is done by VideoMAE)
  const { firstHand, isReady: landmarkerReady } = useHandLandmarker(
    videoRef,
    camStatus === "active"
  );

  // Keep a ref to latest landmarks so the classifier can crop screenshots to the hand
  const landmarksRef = useRef(firstHand);
  useEffect(() => {
    landmarksRef.current = firstHand;
  }, [firstHand]);

  const isWaiting = state.matches("waitingForInput");
  const isCorrect = state.matches("correct");
  const isShowingSign = state.matches("showingSign");
  const letter = currentLetter(state.context);
  const isMotion = letter ? isMotionLetter(letter) : false;

  // VideoMAE classifier — captures 16 frames and calls Flask /predict
  const { result: prediction, reset: resetClassifier } = useVideoClassifier(
    videoRef,
    isWaiting && camStatus === "active",
    landmarksRef
  );

  // Trigger correct when stable detection matches the target letter
  useEffect(() => {
    if (!isWaiting || !prediction.stableLetter) return;
    if (prediction.stableLetter !== letter) return;

    send({ type: "LETTER_DETECTED", letter: prediction.stableLetter, screenshotUrl: prediction.screenshotUrl ?? "" });
    resetClassifier();
  }, [prediction.stableLetter, isWaiting, letter, send, prediction.screenshotUrl, resetClassifier]);

  // Start game once camera is ready.
  // Hand-landmarker is visual-only, so we don't block gameplay on it.
  useEffect(() => {
    if (camStatus === "active" && state.matches("idle")) {
      const sequence =
        mode === "alphabetical" ? buildAlphabetical() : buildRandom(letterCount);
      send({ type: "START", mode, sequence });
    }
  }, [camStatus, landmarkerReady, mode, letterCount, send, state]);

  // Auto-advance from demo card to camera input after a short delay.
  useEffect(() => {
    if (!isShowingSign) return;
    const t = setTimeout(() => {
      send({ type: "DEMO_DONE" });
    }, 1400);
    return () => clearTimeout(t);
  }, [isShowingSign, send, letter]);

  // Start camera on mount
  useEffect(() => {
    startWebcam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (camStatus === "denied") {
      toast.error("Camera access denied. Please allow camera permissions and refresh.");
    }
    if (camError && camStatus === "error") {
      toast.error(`Camera error: ${camError}`);
    }
  }, [camStatus, camError]);

  useEffect(() => {
    if (prediction.error) {
      toast.error(`Detector offline: ${prediction.error}. Is the Flask server running on port 5000?`);
    }
  }, [prediction.error]);

  const isLoading =
    camStatus === "idle" ||
    camStatus === "requesting" ||
    state.matches("idle");

  if (state.matches("complete")) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <div className="text-7xl mb-4">🎉</div>
          <h2 className="text-4xl font-bold mb-2">All done!</h2>
          <p className="text-muted-foreground text-lg">
            You signed {state.context.score} / {state.context.sequence.length}{" "}
            letters correctly.
          </p>
        </motion.div>
        <div className="flex gap-4">
          <button
            onClick={() => send({ type: "RESTART" })}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-xl"
          >
            Play Again
          </button>
          <button
            onClick={onExit}
            className="bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold px-6 py-3 rounded-xl"
          >
            Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <button
          onClick={onExit}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        {letter && (
          <ProgressBar
            current={state.context.currentIndex}
            total={state.context.sequence.length}
            score={state.context.score}
          />
        )}
        <div className="w-9" />
      </header>

      {/* Loading */}
      {isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground">
            {camStatus === "requesting"
              ? "Requesting camera access..."
              : "Starting game..."}
          </p>
        </div>
      )}

      {/* Game area */}
      {!isLoading && letter && (
        <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 p-6">
          {/* Reference sign */}
          <AnimatePresence mode="wait">
            {(state.matches("showingSign") || state.matches("waitingForInput")) && (
              <ReferenceSign
                key={letter}
                letter={letter}
                onDemoDone={
                  state.matches("showingSign")
                    ? () => send({ type: "DEMO_DONE" })
                    : undefined
                }
              />
            )}
          </AnimatePresence>

          {/* Camera feed + detection */}
          {state.matches("waitingForInput") && (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <WebcamView
                  videoRef={videoRef}
                  onVideoMount={setVideoElement}
                  landmarks={firstHand}
                  width={480}
                  height={360}
                />
                {isMotion && letter && (
                  <MotionGuide
                    letter={letter as "J" | "Z"}
                    width={480}
                    height={360}
                  />
                )}

                {/* Recording indicator */}
                {prediction.isLoading && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 rounded-full px-3 py-1">
                    <Radio className="w-3 h-3 text-red-400 animate-pulse" />
                    <span className="text-xs text-white">Analysing...</span>
                  </div>
                )}
              </div>

              <PredictionMeter
                letter={prediction.letter}
                confidence={prediction.confidence}
                targetLetter={letter}
              />

              <p className="text-xs text-muted-foreground text-center max-w-xs">
                Hold the sign steady — the AI analyses 1 second of video at a time
              </p>

              {/* Skip after 30s */}
              <SkipButton
                onSkip={() => send({ type: "SKIP" })}
              />
            </div>
          )}
        </main>
      )}

      {/* Correct modal */}
      <AnimatePresence>
        {isCorrect && letter && (
          <CorrectModal
            letter={letter}
            screenshotUrl={state.context.screenshotUrl ?? ""}
            onNext={() => send({ type: "NEXT" })}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SkipButton({ onSkip }: { onSkip: () => void }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  if (seconds < 30) return null;

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onSkip}
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <SkipForward className="w-4 h-4" />
      Skip this letter
    </motion.button>
  );
}

