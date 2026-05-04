import * as tf from "@tensorflow/tfjs";
import { LABELS, type Letter } from "./labels";

let model: tf.LayersModel | null = null;
let loadPromise: Promise<tf.LayersModel> | null = null;

export async function loadClassifier(): Promise<tf.LayersModel> {
  if (model) return model;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    await tf.ready();
    model = await tf.loadLayersModel("/models/asl-classifier/model.json");
    // Warmup pass to prime the GPU
    const warmup = tf.zeros([1, 63]);
    (model.predict(warmup) as tf.Tensor).dispose();
    warmup.dispose();
    return model;
  })();

  return loadPromise;
}

export interface Prediction {
  letter: Letter;
  confidence: number;
  allScores: Record<Letter, number>;
}

export function predict(features: Float32Array): Prediction {
  if (!model) throw new Error("Classifier not loaded");

  return tf.tidy(() => {
    const input = tf.tensor2d(features, [1, 63]);
    const output = model!.predict(input) as tf.Tensor;
    const scores = Array.from(output.dataSync());

    const maxIdx = scores.indexOf(Math.max(...scores));
    const allScores = Object.fromEntries(
      LABELS.map((label, i) => [label, scores[i]])
    ) as Record<Letter, number>;

    return {
      letter: LABELS[maxIdx],
      confidence: scores[maxIdx],
      allScores,
    };
  });
}

export function isClassifierLoaded(): boolean {
  return model !== null;
}
