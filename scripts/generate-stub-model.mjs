/**
 * Generates a stub ASL classifier model with random weights.
 * The app will load and run — predictions won't be accurate until
 * you replace this with a real trained model.
 *
 * Run: node scripts/generate-stub-model.mjs
 *
 * To get a real model:
 * 1. Search Kaggle for "ASL alphabet MediaPipe landmarks"
 * 2. Train a model using the notebook in scripts/train/ (coming soon)
 * 3. Convert with: tensorflowjs_converter --input_format=keras model.h5 public/models/asl-classifier/
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "models", "asl-classifier");

mkdirSync(outDir, { recursive: true });

// Minimal TFJS LayersModel topology
const modelTopology = {
  class_name: "Sequential",
  config: {
    name: "asl_classifier",
    layers: [
      {
        class_name: "Dense",
        config: {
          units: 128,
          activation: "relu",
          batch_input_shape: [null, 63],
          name: "dense_1",
          trainable: true,
          use_bias: true,
          kernel_initializer: { class_name: "GlorotUniform", config: { seed: null } },
          bias_initializer: { class_name: "Zeros", config: {} },
        },
      },
      {
        class_name: "Dropout",
        config: { rate: 0.3, name: "dropout_1", trainable: true },
      },
      {
        class_name: "Dense",
        config: {
          units: 64,
          activation: "relu",
          name: "dense_2",
          trainable: true,
          use_bias: true,
          kernel_initializer: { class_name: "GlorotUniform", config: { seed: null } },
          bias_initializer: { class_name: "Zeros", config: {} },
        },
      },
      {
        class_name: "Dropout",
        config: { rate: 0.3, name: "dropout_2", trainable: true },
      },
      {
        class_name: "Dense",
        config: {
          units: 26,
          activation: "softmax",
          name: "dense_output",
          trainable: true,
          use_bias: true,
          kernel_initializer: { class_name: "GlorotUniform", config: { seed: null } },
          bias_initializer: { class_name: "Zeros", config: {} },
        },
      },
    ],
  },
  keras_version: "2.9.0",
  backend: "tensorflow",
};

// Generate random weights
function randomWeights(size) {
  const scale = 0.1;
  return Array.from({ length: size }, () => (Math.random() - 0.5) * scale);
}

const weightsManifest = [
  {
    paths: ["group1-shard1of1.bin"],
    weights: [
      { name: "dense_1/kernel", shape: [63, 128], dtype: "float32" },
      { name: "dense_1/bias", shape: [128], dtype: "float32" },
      { name: "dense_2/kernel", shape: [128, 64], dtype: "float32" },
      { name: "dense_2/bias", shape: [64], dtype: "float32" },
      { name: "dense_output/kernel", shape: [64, 26], dtype: "float32" },
      { name: "dense_output/bias", shape: [26], dtype: "float32" },
    ],
  },
];

const modelJson = {
  modelTopology,
  weightsManifest,
  format: "layers-model",
  generatedBy: "stub-generator",
  convertedBy: null,
};

// Generate binary weights blob
const sizes = [63 * 128, 128, 128 * 64, 64, 64 * 26, 26];
const totalFloats = sizes.reduce((a, b) => a + b, 0);
const buffer = new Float32Array(totalFloats);
let offset = 0;
for (const size of sizes) {
  const vals = randomWeights(size);
  for (let i = 0; i < size; i++) {
    buffer[offset + i] = vals[i];
  }
  offset += size;
}

writeFileSync(join(outDir, "model.json"), JSON.stringify(modelJson, null, 2));
writeFileSync(join(outDir, "group1-shard1of1.bin"), Buffer.from(buffer.buffer));

const labels = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
writeFileSync(join(outDir, "labels.json"), JSON.stringify(labels));

console.log("Stub model written to public/models/asl-classifier/");
console.log("WARNING: This model has random weights and will not recognize signs.");
console.log("Replace with a real trained model for actual ASL recognition.");
