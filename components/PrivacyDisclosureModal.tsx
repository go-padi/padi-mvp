'use client';

import { useEffect, useRef } from 'react';

type PrivacyDisclosureModalProps = {
  open: boolean;
  onAcknowledge: () => void;
  onCancel: () => void;
};

export function PrivacyDisclosureModal({ open, onAcknowledge, onCancel }: PrivacyDisclosureModalProps) {
  const ackButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    ackButtonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lr14d-modal-title"
        className="max-w-md w-full rounded-2xl bg-white p-6 shadow-xl space-y-4"
      >
        <h2 id="lr14d-modal-title" className="text-lg font-semibold text-gray-900">
          About audio recording
        </h2>
        <ul className="space-y-2 text-sm text-gray-700 list-disc pl-5">
          <li>Audio captures the live teacher-student session — both voices.</li>
          <li>Stored privately to your Padi workspace. You control the recording at all times.</li>
          <li>Please inform parents/guardians and follow local laws on recording minors.</li>
        </ul>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            ref={ackButtonRef}
            type="button"
            onClick={onAcknowledge}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            I understand — start recording
          </button>
        </div>
      </div>
    </div>
  );
}
