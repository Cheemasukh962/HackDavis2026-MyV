/**
 * HistoryPanel — Calculation history modal.
 *
 * Displays recent calculations with:
 *  - Expression and result for each calculation
 *  - Clear history action
 *  - Dismissible overlay interface
 */

import styles from '../../styles/calc-mode/historypanel.module.css';

export default function HistoryPanel({ history, onClear, onClose }) {
  return (
    <div className={styles.historyBackdrop} onClick={onClose}>
      <div className={styles.historyPanel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.historyHeader}>
          <span className={styles.historyTitle}>Recent</span>
          {history.length > 0 && (
            <button type="button" className={styles.historyClear} onClick={onClear}>Clear</button>
          )}
        </div>
        {history.length === 0
          ? <p className={styles.historyEmpty}>No calculations yet.</p>
          : (
            <ul className={styles.historyList}>
              {history.map((item, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <li key={i} className={styles.historyItem}>
                  <span className={styles.historyExpr}>{item.expr}</span>
                  <span className={styles.historyResult}>{item.result}</span>
                </li>
              ))}
            </ul>
          )}
      </div>
    </div>
  );
}
