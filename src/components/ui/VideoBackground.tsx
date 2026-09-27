"use client";

import React, { useRef, useEffect } from "react";

interface VideoBackgroundProps {
  src: string;
  poster?: string;
  className?: string;
  overlayClassName?: string;
  children?: React.ReactNode;
}

function VideoBackgroundComponent({
  src,
  poster,
  className = "w-full h-full object-cover object-center",
  overlayClassName,
  children,
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure programmatic muted & playsInline for strict autoplay policies
    video.muted = true;
    video.defaultMuted = true;

    // Start playback safely without throwing if browser delays autoplay
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Silently handled - video will continue once user interacts or caches
      });
    }
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        controls={false}
        // Strict download blockers for Chrome, Edge, Safari, Firefox, and IDM extensions:
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        disableRemotePlayback
        poster={poster}
        className={className}
        onContextMenu={(e) => e.preventDefault()}
        style={{ pointerEvents: "none" }}
      >
        <source src={src} type="video/mp4" />
      </video>

      {overlayClassName && <div className={overlayClassName} />}
      {children}
    </>
  );
}

// React.memo with custom comparison ensures the video NEVER re-renders or re-downloads
// when parent component state updates (scroll events, form typing, slider inputs, etc.)
export const VideoBackground = React.memo(
  VideoBackgroundComponent,
  (prev, next) => prev.src === next.src && prev.poster === next.poster
);

export default VideoBackground;
