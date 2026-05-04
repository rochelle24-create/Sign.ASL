"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

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

export default function LearnPage() {
  const router = useRouter();
  return <GameScreen mode="alphabetical" onExit={() => router.push("/")} />;
}
