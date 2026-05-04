"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Shuffle } from "lucide-react";
import { motion } from "framer-motion";

const GameScreen = dynamic(
  () => import("@/components/game/GameScreen").then((m) => m.GameScreen),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    ),
  }
);

export default function PracticePage() {
  const router = useRouter();
  const [count, setCount] = useState(10);
  const [started, setStarted] = useState(false);

  if (started) {
    return (
      <GameScreen
        mode="random"
        letterCount={count}
        onExit={() => router.push("/")}
      />
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 gap-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <Shuffle className="w-12 h-12 text-accent mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-2">Random Practice</h1>
        <p className="text-muted-foreground">
          Choose how many letters to practice — they'll appear in random order.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-2xl p-8 w-full max-w-md"
      >
        <label className="block text-sm text-muted-foreground mb-3">
          Number of letters:{" "}
          <span className="text-foreground font-bold text-lg">{count}</span>
        </label>

        <input
          type="range"
          min={1}
          max={50}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-full accent-accent"
        />

        <div className="flex justify-between text-xs text-muted-foreground mt-1 mb-6">
          <span>1</span>
          <span>25</span>
          <span>50</span>
        </div>

        <div className="bg-secondary rounded-lg p-3 mb-6 text-sm text-center text-muted-foreground">
          {count <= 26
            ? `${count} unique letter${count === 1 ? "" : "s"} from A–Z`
            : `All 26 letters + ${count - 26} repeat${count - 26 === 1 ? "" : "s"}`}
        </div>

        <button
          onClick={() => setStarted(true)}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-4 rounded-xl text-lg transition-colors flex items-center justify-center gap-2"
        >
          <Shuffle className="w-5 h-5" />
          Start ({count} letter{count === 1 ? "" : "s"})
        </button>
      </motion.div>

      <button
        onClick={() => router.push("/")}
        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
      >
        ← Back to home
      </button>
    </main>
  );
}
