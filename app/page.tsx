"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Hand, Shuffle, ArrowRight, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Hand className="w-10 h-10 text-primary" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Sign.ASL
          </h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-md">
          Learn the ASL alphabet with real-time AI hand detection. Your camera
          checks your signs instantly — all 26 letters.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl"
      >
        <Link href="/learn" className="group">
          <div className="bg-card border border-border rounded-xl p-8 h-full transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10 cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 rounded-lg p-2">
                <ArrowRight className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Alphabetical</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Sign all 26 letters in order, A through Z. See each sign
              demonstrated, then try it yourself on camera.
            </p>
            <div className="flex flex-wrap gap-2">
              {["A","B","C","D","E","F"].map((l) => (
                <span key={l} className="bg-secondary text-secondary-foreground text-xs font-mono px-2 py-1 rounded">
                  {l}
                </span>
              ))}
              <span className="text-muted-foreground text-xs py-1">→ Z</span>
            </div>
          </div>
        </Link>

        <Link href="/practice" className="group">
          <div className="bg-card border border-border rounded-xl p-8 h-full transition-all hover:border-accent hover:shadow-lg hover:shadow-accent/10 cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-accent/10 rounded-lg p-2">
                <Shuffle className="w-6 h-6 text-accent" />
              </div>
              <h2 className="text-2xl font-bold">Random Practice</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Pick 1–50 letters, shown in random order. Great for testing
              yourself once you know the alphabet.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Q","M","Z","F","J","B"].map((l) => (
                <span key={l} className="bg-secondary text-secondary-foreground text-xs font-mono px-2 py-1 rounded">
                  {l}
                </span>
              ))}
              <span className="text-muted-foreground text-xs py-1">× random</span>
            </div>
          </div>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-10 flex items-center gap-2 text-muted-foreground text-sm"
      >
        <Shield className="w-4 h-4" />
        <span>
          All processing happens on your device. No video leaves your browser.
        </span>
      </motion.div>
    </main>
  );
}
