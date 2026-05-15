import styles from '../../styles/calc-mode/display.module.css';

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
