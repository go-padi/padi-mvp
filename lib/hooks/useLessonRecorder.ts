'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';

const MAX_DURATION_SEC = 900; // 15 min

type RecorderState = 'idle' | 'recording' | 'uploading' | 'success' | 'error';

export type UseLessonRecorderArgs = {
  tenantId: string | null;
  studentId: string | null;
  moduleId: string | null;
  lessonCompletionId?: string | null;
};

export type UseLessonRecorderResult = {
  state: RecorderState;
  elapsedSec: number;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
};

function pickMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return 'audio/webm';
  const preferred = 'audio/webm;codecs=opus';
  if (MediaRecorder.isTypeSupported(preferred)) return preferred;
  if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm';
  if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4';
  return '';
}

export function useLessonRecorder({
  tenantId,
  studentId,
  moduleId,
  lessonCompletionId,
}: UseLessonRecorderArgs): UseLessonRecorderResult {
  const [state, setState] = useState<RecorderState>('idle');
  const [elapsedSec, setElapsedSec] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number>(0);

  const teardown = useCallback(() => {
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    recorderRef.current = null;
  }, []);

  useEffect(() => {
    return () => teardown();
  }, [teardown]);

  const upload = useCallback(
    async (blob: Blob, mimeType: string, durationSec: number) => {
      if (!tenantId || !studentId || !moduleId) {
        throw new Error('Missing context for upload');
      }
      const sb = supabaseClient();
      const ext = mimeType.includes('mp4') ? 'm4a' : 'webm';
      const ts = Date.now();
      const path = `${tenantId}/${studentId}/${moduleId}/${ts}.${ext}`;
      const { error: upErr } = await sb.storage
        .from('lesson-recordings')
        .upload(path, blob, { contentType: mimeType, upsert: false });
      if (upErr) throw upErr;
      const { error: dbErr } = await sb.from('lesson_recordings').insert({
        tenant_id: tenantId,
        student_id: studentId,
        module_id: moduleId,
        lesson_completion_id: lessonCompletionId ?? null,
        storage_path: path,
        duration_sec: durationSec,
        mime_type: mimeType,
      });
      if (dbErr) throw dbErr;
    },
    [tenantId, studentId, moduleId, lessonCompletionId],
  );

  const stop = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setElapsedSec(0);
    chunksRef.current = [];

    if (typeof MediaRecorder === 'undefined' || typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Audio recording is not supported in this browser.');
      setState('error');
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError('Mic permission denied — enable mic access in your browser settings.');
      setState('error');
      return;
    }

    streamRef.current = stream;
    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = async () => {
      const effectiveMime = recorder.mimeType || mimeType || 'audio/webm';
      const blob = new Blob(chunksRef.current, { type: effectiveMime });
      const durationSec = Math.floor((Date.now() - startedAtRef.current) / 1000);
      teardown();
      setState('uploading');
      try {
        await upload(blob, effectiveMime, durationSec);
        setState('success');
      } catch (err) {
        console.error('LR-14b upload failed:', err);
        setError('Upload failed — check your connection and try again.');
        setState('error');
      }
    };

    startedAtRef.current = Date.now();
    recorder.start();
    setState('recording');

    tickIntervalRef.current = setInterval(() => {
      const sec = Math.floor((Date.now() - startedAtRef.current) / 1000);
      setElapsedSec(sec);
      if (sec >= MAX_DURATION_SEC) {
        stop();
      }
    }, 1000);
  }, [upload, teardown, stop]);

  return { state, elapsedSec, error, start, stop };
}
