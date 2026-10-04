// components/ui/Modal.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  widthClass?: string; // 'max-w-md' | 'max-w-lg' | ...
};

export default function Modal({ open, onClose, children, widthClass = 'max-w-md' }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // lock scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // backdrop click
  const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!open || !mounted) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center"
      role="dialog" aria-modal="true"
      onMouseDown={onBackdropClick}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-ink/60" />

      {/* dialog */}
      <div
        ref={dialogRef}
        className={`relative z-[1000] w-full ${widthClass} mx-4 animate-[modalIn_.2s_ease-out]`}
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-3 top-3 z-[1001] grid h-9 w-9 cursor-pointer place-items-center bg-ink text-paper"
        >
          ✕
        </button>

        <div className="max-h-[90vh] w-full overflow-y-auto border-[1.5px] border-ink bg-paper p-6 shadow-hard-pink">{children}</div>
      </div>

      <style jsx>{`
        @keyframes modalIn {
          from { transform: translateY(8px) scale(0.98); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );

  return createPortal(modal, document.body);
}
