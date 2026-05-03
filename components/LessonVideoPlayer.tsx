'use client';
import { useEffect, useState, type MouseEvent } from 'react';

export type LessonVideoSource = {
  src: string;
  poster?: string | null;
  captionsSrc?: string | null;
  label?: string;
};

export function LessonVideoModal({
  source,
  onClose,
}: {
  source: LessonVideoSource | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!source) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [source, onClose]);

  if (!source) return null;

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={source.label || 'Lesson video'}
    >
      <div className="relative w-full max-w-3xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-10 right-0 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-gray-900 shadow"
          aria-label="Close video"
        >
          Close
        </button>
        {/* Unmounting on close kills playback — no manual pause() needed. */}
        <video
          className="w-full rounded-2xl bg-black shadow-2xl"
          controls
          preload="metadata"
          poster={source.poster || undefined}
        >
          <source src={source.src} />
          {source.captionsSrc && (
            <track kind="subtitles" src={source.captionsSrc} srcLang="en" label="English" default />
          )}
        </video>
      </div>
    </div>
  );
}

export function LessonVideoPlayer({
  src,
  poster,
  captionsSrc,
  label = 'Watch lesson intro',
}: {
  src?: string | null;
  poster?: string | null;
  captionsSrc?: string | null;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  if (!src) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block w-full overflow-hidden rounded-2xl border border-gray-100 bg-gray-900 shadow-sm aspect-video"
        aria-label={label}
      >
        {poster ? (
          <img src={poster} alt="" className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-gray-700 to-gray-900" />
        )}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-lg transition group-hover:scale-105">
            <span className="ml-1 border-y-[10px] border-l-[16px] border-y-transparent border-l-blue-600" aria-hidden />
          </span>
        </span>
        <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
          {label}
        </span>
      </button>
      <LessonVideoModal
        source={open ? { src, poster, captionsSrc, label } : null}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
