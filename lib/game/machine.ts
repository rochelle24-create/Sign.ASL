import { setup, assign, fromPromise } from "xstate";
import { type Letter, isMotionLetter } from "@/lib/ml/labels";

export type GameMode = "alphabetical" | "random";

interface GameContext {
  mode: GameMode;
  sequence: Letter[];
  currentIndex: number;
  screenshotUrl: string | null;
  score: number;
}

type GameEvent =
  | { type: "START"; mode: GameMode; sequence: Letter[] }
  | { type: "DEMO_DONE" }
  | { type: "LETTER_DETECTED"; letter: Letter; screenshotUrl: string }
  | { type: "NEXT" }
  | { type: "SKIP" }
  | { type: "EXIT" }
  | { type: "RESTART" };

export const gameMachine = setup({
  types: {
    context: {} as GameContext,
    events: {} as GameEvent,
  },
  guards: {
    isLastLetter: ({ context }) =>
      context.currentIndex >= context.sequence.length - 1,
    letterMatches: ({ context, event }) => {
      if (event.type !== "LETTER_DETECTED") return false;
      return event.letter === context.sequence[context.currentIndex];
    },
  },
  actions: {
    assignStart: assign(({ event }) => {
      if (event.type !== "START") return {};
      return {
        mode: event.mode,
        sequence: event.sequence,
        currentIndex: 0,
        screenshotUrl: null,
        score: 0,
      };
    }),
    assignScreenshot: assign(({ context, event }) => {
      if (event.type !== "LETTER_DETECTED") return {};
      return { screenshotUrl: event.screenshotUrl, score: context.score + 1 };
    }),
    nextLetter: assign(({ context }) => ({
      currentIndex: context.currentIndex + 1,
      screenshotUrl: null,
    })),
  },
}).createMachine({
  id: "asl-game",
  initial: "idle",
  context: {
    mode: "alphabetical",
    sequence: [],
    currentIndex: 0,
    screenshotUrl: null,
    score: 0,
  },
  states: {
    idle: {
      on: {
        START: {
          target: "showingSign",
          actions: "assignStart",
        },
      },
    },
    showingSign: {
      on: {
        DEMO_DONE: "waitingForInput",
        EXIT: "idle",
      },
    },
    waitingForInput: {
      on: {
        LETTER_DETECTED: [
          {
            guard: "letterMatches",
            target: "correct",
            actions: "assignScreenshot",
          },
          {
            target: "waitingForInput",
          },
        ],
        SKIP: [
          { guard: "isLastLetter", target: "complete" },
          { target: "showingSign", actions: "nextLetter" },
        ],
        EXIT: "idle",
      },
    },
    correct: {
      on: {
        NEXT: [
          { guard: "isLastLetter", target: "complete" },
          { target: "showingSign", actions: "nextLetter" },
        ],
        EXIT: "idle",
      },
    },
    complete: {
      on: {
        RESTART: "idle",
        EXIT: "idle",
      },
    },
  },
});

export function currentLetter(context: GameContext): Letter | null {
  return context.sequence[context.currentIndex] ?? null;
}

export function isCurrentMotionLetter(context: GameContext): boolean {
  const letter = currentLetter(context);
  return letter ? isMotionLetter(letter) : false;
}
