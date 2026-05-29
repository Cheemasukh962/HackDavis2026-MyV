/**
 * SciPad — Scientific calculator button grid.
 *
 * 6-column button layout featuring:
 *  - Trigonometric and logarithmic functions
 *  - Constants (pi, e)
 *  - Secondary function toggle (2nd)
 *  - Active state indicators
 */

import styles from '../../styles/calc-mode/scipad.module.css';
import { SCI_BUTTONS } from './buttonData';

export default function SciPad({ is2nd, onSciClick }) {
  return (
    <div className={styles.sciPad}>
      {SCI_BUTTONS.map((btn) => {
        const label = is2nd ? btn.label2 : btn.label;
        const is2ndBtn = btn.kind === 'sci2nd';
        const isModeBtn = btn.kind === 'sciMode';
        return (
          <button
            key={btn.id}
            type="button"
            className={[
              styles.sciKey,
              is2ndBtn && is2nd ? styles.sciKeyActive : '',
              isModeBtn ? styles.sciKeyMode : '',
            ].filter(Boolean).join(' ')}
            onClick={() => onSciClick(btn)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
