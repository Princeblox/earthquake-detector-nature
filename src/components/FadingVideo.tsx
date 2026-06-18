import React, { useEffect, useRef } from "react";

interface FadingVideoProps {
  src: string;
  className?: string;
  style?: React.CSSProperties;
}

export function FadingVideo({ src, className = "", style = {} }: FadingVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const fadingOutRef = useRef<boolean>(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Direct styles configuration
    video.style.opacity = "0";
    video.style.transition = "none";
    video.loop = false; // Implement manual loop for crossfade
    fadingOutRef.current = false;

    const fadeTo = (targetOpacity: number, duration: number = 500) => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      const startOpacity = parseFloat(video.style.opacity || "0");
      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Calculate current opacity smoothly
        const currentOpacity = startOpacity + (targetOpacity - startOpacity) * progress;
        video.style.opacity = currentOpacity.toFixed(3);

        if (progress < 1) {
          rafIdRef.current = requestAnimationFrame(animate);
        }
      };

      rafIdRef.current = requestAnimationFrame(animate);
    };

    const handleLoadedData = () => {
      video.style.opacity = "0";
      video.play().catch(() => {});
      fadeTo(1, 500);
    };

    const handleTimeUpdate = () => {
      if (!video.duration || video.duration === Infinity) return;

      const timeLeft = video.duration - video.currentTime;
      // FADE_OUT_LEAD = 0.55 seconds
      if (!fadingOutRef.current && timeLeft <= 0.55 && timeLeft > 0) {
        fadingOutRef.current = true;
        fadeTo(0, 500);
      }
    };

    const handleEnded = () => {
      video.style.opacity = "0";
      // restart loop manually with tiny timeout to clear frames
      setTimeout(() => {
        if (!video) return;
        video.currentTime = 0;
        video.play().catch(() => {});
        fadingOutRef.current = false;
        fadeTo(1, 500);
      }, 100);
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    // If already pre-mounted and loaded
    if (video.readyState >= 3) {
      handleLoadedData();
    }

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      style={{ ...style, transition: "none" }}
      muted
      playsInline
      preload="auto"
    />
  );
}
