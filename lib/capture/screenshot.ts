export function captureScreenshot(videoEl: HTMLVideoElement): string {
  if (videoEl.readyState < 2) return "";

  const w = videoEl.videoWidth || 640;
  const h = videoEl.videoHeight || 480;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Mirror to match what user sees (selfie view)
  ctx.translate(w, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(videoEl, 0, 0);

  return canvas.toDataURL("image/jpeg", 0.85);
}
