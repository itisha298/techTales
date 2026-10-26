import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { ui } from '../content/presentationContent';
import { useMotionPreset } from '../lib/motion';

/**
 * Modal surface. Moves focus inside on open, traps Tab, restores focus on
 * close. Escape is handled centrally by the keyboard controller.
 */
export function Dialog({
  title,
  onClose,
  children,
  variant = 'full',
  labelledBy,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  variant?: 'full' | 'left' | 'right';
  labelledBy?: string;
}) {
  const m = useMotionPreset();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const el = ref.current;
    el?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !el) return;
      const focusable = el.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, []);

  const panel =
    variant === 'full'
      ? 'inset-0'
      : variant === 'left'
        ? 'inset-y-0 left-0 w-[min(560px,100vw)] border-r border-line shadow-[24px_0_60px_-40px_rgba(70,0,115,0.4)]'
        : 'inset-y-0 right-0 w-[min(720px,100vw)] border-l border-line shadow-[-24px_0_60px_-40px_rgba(70,0,115,0.4)]';
  const x = variant === 'left' ? -32 : variant === 'right' ? 32 : 0;

  return (
    <div className="fixed inset-0 z-50">
      {variant !== 'full' && (
        <motion.div
          className="absolute inset-0 bg-ink/25"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={m.t(0.25)}
          onClick={onClose}
        />
      )}
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={labelledBy ? undefined : title}
        aria-labelledby={labelledBy}
        tabIndex={-1}
        data-native-keys
        className={`thin-scroll absolute overflow-y-auto bg-white outline-none ${panel}`}
        initial={{ opacity: 0, x: m.y(x), y: variant === 'full' ? m.y(16) : 0 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: m.y(x), y: variant === 'full' ? m.y(10) : 0 }}
        transition={m.t(0.4)}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={`${ui.close} (Esc)`}
          className="absolute right-[clamp(12px,2vw,32px)] top-[clamp(12px,2vw,32px)] z-10 flex h-11 w-11 items-center justify-center text-ink hover:bg-lavender"
        >
          <X aria-hidden className="h-6 w-6" />
        </button>
        {children}
      </motion.div>
    </div>
  );
}
