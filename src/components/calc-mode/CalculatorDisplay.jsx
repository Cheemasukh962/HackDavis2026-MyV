/**
 * CalculatorDisplay — Expression and result output panel.
 *
 * Shows:
 *  - Current calculation expression (muted, multi-line)
 *  - Result with dynamic font sizing for large numbers
 *  - Adapts layout for scientific vs standard modes
 */

import styles from '../../styles/calc-mode/calculatordisplay.module.css';

export default function CalculatorDisplay({ liveExpression, liveResultFormatted, fontSize, isScientific }) {
  return (
    <div className={`${styles.displayArea} ${isScientific ? styles.displayAreaSci : ''}`}>
      <div className={styles.expression} aria-hidden="true">{liveExpression}</div>
      <div className={styles.display} style={{ fontSize }} aria-live="polite">
        {liveResultFormatted}
      </div>
    </div>
  );
}
