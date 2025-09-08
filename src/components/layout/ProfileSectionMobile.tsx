import React from 'react';
import { PencilLine, X } from 'lucide-react';

type SectionKey = 'personal' | 'contact' | 'professional' | 'password' | 'picture';

type SectionProps = {
  id: SectionKey;
  title: string;
  open: boolean;
  saving: boolean;
  onToggle: (id: SectionKey) => void;
  onSave: (id: SectionKey) => void;
  onCancel: (id: SectionKey) => void;
  readView: React.ReactNode;
  children: React.ReactNode;
};

export const Section = React.memo(function Section({
  id, title, open, saving, onToggle, onSave, onCancel, readView, children,
}: SectionProps) {
  return (
    <div className="rounded-2xl border border-orange-600 bg-white mb-4 overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer"
        onClick={() => onToggle(id)}
        aria-expanded={open}
        onMouseDown={(e) => e.preventDefault()}
      >
        <span className="text-base font-semibold text-gray-900">{title}</span>
        {open ? <X className="shrink-0" /> : <PencilLine className="shrink-0 pointer-events-none" />}
      </button>

      <div
        className="px-4 pb-4"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {!open ? (
          <div className="text-sm text-gray-900 space-y-2">{readView}</div>
        ) : (
          <div className="space-y-4">
            {children}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-white bg-black cursor-pointer disabled:opacity-50"
                onClick={() => onSave(id)}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-xl border cursor-pointer"
                onClick={() => onCancel(id)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
