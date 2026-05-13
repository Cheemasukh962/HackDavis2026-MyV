import { useMemo, useState } from 'react';
import { Heart } from 'lucide-react';
import styles from '../../styles/private-mode/home.module.css';

const QUOTES = [
  { text: 'You deserve to feel safe. That is not too much to ask.' },
  { text: 'Leaving is not giving up. It is choosing yourself.' },
  { text: 'Your feelings are valid. Every single one of them.' },
  { text: 'You are not what was done to you.' },
  { text: 'Healing is not linear. Every small step counts.' },
  { text: 'Your voice matters. What happened to you matters.' },
  { text: 'Asking for help is an act of courage, not weakness.' },
  { text: 'You are stronger than you know. You are not alone.' },
  { text: 'Safety is a right, not a privilege. You deserve it.' },
  { text: 'Today I choose myself. That is enough.' },
  { text: 'Your worth is not defined by how someone treated you.' },
  { text: 'Peace is possible. Not easy, but possible.' },
  { text: 'You are allowed to take up space and feel safe in it.' },
  { text: 'You made it through yesterday. You can today too.' },
  { text: 'Your story does not end here.' },
  { text: 'You are worthy of love that does not hurt.' },
  { text: 'Being gentle with yourself is wisdom, not weakness.' },
  { text: 'The hardest part is often the first step. You took it.' },
  { text: 'There is no shame in your story.' },
  { text: 'You survived something you were never meant to face.' },
];

const BREATHING_STEPS = [
  { count: '4s', label: 'Breathe in' },
  { count: '4s', label: 'Hold' },
  { count: '4s', label: 'Out' },
  { count: '4s', label: 'Hold' },
];

function getDailySlides() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const a = ((seed * 1664525 + 1013904223) >>> 0);
  const b = ((a * 1664525 + 1013904223) >>> 0);
  const idx1 = a % QUOTES.length;
  const idx2raw = b % QUOTES.length;
  const idx2 = idx2raw === idx1 ? (idx2raw + 1) % QUOTES.length : idx2raw;
  return [
    { type: 'quote', text: QUOTES[idx1].text },
    { type: 'quote', text: QUOTES[idx2].text },
    { type: 'breathing' },
  ];
}

export default function MomentForYou() {
  const slides = useMemo(() => getDailySlides(), []);
  const [activeIndex, setActiveIndex] = useState(0);

  const active = slides[activeIndex];

  return (
    <div className={styles.momentCard} onClick={() => setActiveIndex((i) => (i + 1) % slides.length)} style={{ cursor: 'pointer' }}>
      <div className={styles.momentHeader}>
        <span className={styles.actionIcon} aria-hidden="true">
          <Heart />
        </span>
        <span className={styles.momentCounter}>{activeIndex + 1} / {slides.length}</span>
      </div>

      {active.type !== 'breathing' && <strong>A moment for you</strong>}

      <div key={activeIndex} className={styles.momentSlide}>
        {active.type === 'quote' ? (
          <p className={styles.momentQuote}>&ldquo;{active.text}&rdquo;</p>
        ) : (
          <div className={styles.momentBreathing}>
            {BREATHING_STEPS.map((s) => (
              <div key={s.label} className={styles.momentBreathStep}>
                <strong>{s.count}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.momentDots} aria-label="Moment slides">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.momentDot} ${i === activeIndex ? styles.momentDotActive : ''}`}
            aria-label={`Show slide ${i + 1}`}
            aria-pressed={i === activeIndex}
            onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
          />
        ))}
      </div>
    </div>
  );
}
