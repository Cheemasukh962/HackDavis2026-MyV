import { useEffect, useRef } from 'react';
import { triggerPanicExit } from '../hooks/usePrivacyMode';

/**
 * PanicExit — always-on quick-exit system.
 *
 * Triggers on:
 *  1. Escape key (single press)
 *  2. Rapid triple-tap anywhere on a touch screen (within 600ms)
 *  3. Click/tap of the visible quick-exit button in the corner
 *
 * On trigger:
 *  - Clears sessionStorage
 *  - Tells the Service Worker to purge all caches
 *  - Calls window.location.replace(safeUrl) — removes history entry
 *
 * The visible button is intentionally small and low-contrast so it
 * doesn't draw attention on a shared or monitored device, but is
 * reachable in an emergency.
 */
export default function PanicExit() {
  const tapCount = useRef(0);
  const tapTimer = useRef(null);

  // ── Keyboard: Escape ────────────────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') triggerPanicExit();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // ── Touch: triple-tap anywhere ───────────────────────────────────────────────
  useEffect(() => {
    const onTouchEnd = () => {
      tapCount.current += 1;

      if (tapCount.current >= 3) {
        clearTimeout(tapTimer.current);
        tapCount.current = 0;
        triggerPanicExit();
        return;
      }

      clearTimeout(tapTimer.current);
      tapTimer.current = setTimeout(() => {
        tapCount.current = 0;
      }, 600);
    };

    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('touchend', onTouchEnd);
      clearTimeout(tapTimer.current);
    };
  }, []);

  return (
    <button
      onClick={triggerPanicExit}
      aria-label="Quick exit"
      title="Quick exit"
      style={{
        position: 'fixed',
        bottom: '12px',
        right: '12px',
        zIndex: 9999,
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        border: 'none',
        background: 'rgba(180, 180, 180, 0.25)',
        color: 'rgba(120, 120, 120, 0.6)',
        fontSize: '14px',
        lineHeight: 1,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      ✕
    </button>
  );
}
