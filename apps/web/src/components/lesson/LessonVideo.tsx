'use client';

import { Maximize2, Minimize2 } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useLanguage } from '@/context/LanguageProvider';

interface LessonVideoProps {
  src: string;
  title?: string;
}

export function LessonVideo({ src, title }: LessonVideoProps) {
  const { t } = useLanguage();
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(async () => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    try {
      if (!document.fullscreenElement) {
        await wrap.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Fallback: use video element fullscreen if available
      const video = videoRef.current as HTMLVideoElement & {
        webkitEnterFullscreen?: () => void;
      };
      video?.webkitEnterFullscreen?.();
    }
  }, []);

  return (
    <div className="lesson-video-block" ref={wrapRef}>
      <div className="lesson-video-toolbar">
        <span className="lesson-video-label">{title || t('lesson.video')}</span>
        <button
          type="button"
          className="pill-btn lesson-fullscreen-btn"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? t('lesson.exitFullscreen') : t('lesson.fullscreen')}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          <span>{isFullscreen ? t('lesson.exitFullscreen') : t('lesson.fullscreen')}</span>
        </button>
      </div>
      <div className="lesson-video">
        <video
          ref={videoRef}
          key={src}
          controls
          playsInline
          preload="metadata"
          controlsList="nodownload"
          src={src}
        >
          {t('lesson.videoUnsupported')}
        </video>
      </div>
    </div>
  );
}
