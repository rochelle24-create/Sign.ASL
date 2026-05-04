"use client";

import { useEffect, useRef, useState } from "react";

export type WebcamStatus = "idle" | "requesting" | "active" | "denied" | "error";

export function useWebcam() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<WebcamStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  async function startWebcam() {
    setStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus("active");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("Permission") || msg.includes("NotAllowed")) {
        setStatus("denied");
      } else {
        setStatus("error");
      }
      setError(msg);
    }
  }

  function stopWebcam() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus("idle");
  }

  function setVideoElement(node: HTMLVideoElement | null) {
    videoRef.current = node;
    if (!node) return;
    const stream = streamRef.current;
    if (!stream) return;
    node.srcObject = stream;
    void node.play().catch(() => {
      // Ignore play timing errors; retry happens on next interaction/frame.
    });
  }

  // If the webcam stream was acquired before the <video> mounted,
  // attach it as soon as the element becomes available.
  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (status !== "active" || !video || !stream) return;
    if (video.srcObject !== stream) {
      video.srcObject = stream;
    }
    void video.play().catch(() => {
      // Ignore autoplay/play race errors; next user interaction will recover.
    });
  }, [status]);

  useEffect(() => {
    return () => stopWebcam();
  }, []);

  return { videoRef, status, error, startWebcam, stopWebcam, setVideoElement };
}
