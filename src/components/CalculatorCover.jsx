import { useState } from 'react';
import styles from '../styles/calc-mode/cover.module.css';
import { useCalculator } from '../hooks/useCalculator';
import CalculatorDisplay from './calc-mode/CalculatorDisplay';
import HistoryPanel from './calc-mode/HistoryPanel';
import SciPad from './calc-mode/SciPad';
import StdKeypad from './calc-mode/StdKeypad';
import { HistoryIcon, SciToggleIcon } from './calc-mode/Icons';

export default function CalculatorCover() {
  const [showHistory, setShowHistory] = useState(false);

  const {
    op, isScientific, is2nd,
    history, clearHistory,
    liveExpression, liveResultFormatted, fontSize,
    handleStdClick, handleSciClick,
    handleBackDown, handleBackUp, handleBackLeave,
    toggleScientific,
  } = useCalculator();

  return (
    <section
      className={`${styles.page} ${isScientific ? styles.pageSci : ''}`}
      aria-label="Calculator"
    >
      {/* ── Top overlay buttons ── */}
      <div className={styles.topBar}>
        <button
          type="button"
          aria-label="Calculation history"
          className={styles.overlayBtn}
          onClick={() => setShowHistory((v) => !v)}
        >
          <HistoryIcon />
        </button>
        <button
          type="button"
          aria-label={isScientific ? 'Switch to basic calculator' : 'Switch to scientific calculator'}
          className={`${styles.overlayBtn} ${isScientific ? styles.overlayBtnActive : ''}`}
          onClick={toggleScientific}
        >
          <SciToggleIcon />
        </button>
      </div>

      {/* ── History panel ── */}
      {showHistory && (
        <HistoryPanel
          history={history}
          onClear={clearHistory}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* ── Calculator body ── */}
      <div className={`${styles.calculator} ${isScientific ? styles.calculatorSci : ''}`}>
        <CalculatorDisplay
          liveExpression={liveExpression}
          liveResultFormatted={liveResultFormatted}
          fontSize={fontSize}
          isScientific={isScientific}
        />

        {isScientific && (
          <SciPad is2nd={is2nd} onSciClick={handleSciClick} />
        )}

        <StdKeypad
          isScientific={isScientific}
          op={op}
          onStdClick={handleStdClick}
          onBackDown={handleBackDown}
          onBackUp={handleBackUp}
          onBackLeave={handleBackLeave}
        />
      </div>
    </section>
  );
}
