import styles from '../../styles/calc-mode/keypad.module.css';
import { STD_BUTTONS } from './buttonData';
import { BackspaceIcon } from './Icons';

export default function StdKeypad({ isScientific, op, onStdClick, onBackDown, onBackUp, onBackLeave }) {
  return (
    <div className={isScientific ? styles.keypadSci : styles.keypad}>
      {STD_BUTTONS.map((btn) => {
        const label = btn.isBack ? <BackspaceIcon /> : btn.label;
        const isActiveOp = btn.kind === 'op' && btn.id === op;

        const keyClass = isScientific
          ? [
              styles.keyRect,
              btn.kind === 'fn'  ? styles.fnKeyRect  : '',
              btn.kind === 'op'  ? styles.opKeyRect  : '',
              btn.kind === 'num' ? styles.numKeyRect : '',
              isActiveOp         ? styles.opKeyRectActive : '',
            ].filter(Boolean).join(' ')
          : [
              styles.key,
              btn.kind === 'fn'  ? styles.fnKey  : '',
              btn.kind === 'op'  ? styles.opKey  : '',
              btn.kind === 'num' ? styles.numKey : '',
              isActiveOp         ? styles.opKeyActive : '',
            ].filter(Boolean).join(' ');

        return (
          <button
            key={btn.id}
            type="button"
            aria-label={btn.isBack ? 'Delete last digit' : undefined}
            className={keyClass}
            onClick={btn.isBack ? undefined : () => onStdClick(btn)}
            onMouseDown={btn.isBack ? onBackDown : undefined}
            onMouseUp={btn.isBack ? onBackUp : undefined}
            onMouseLeave={btn.isBack ? onBackLeave : undefined}
            onTouchStart={btn.isBack ? (e) => { e.preventDefault(); onBackDown(); } : undefined}
            onTouchEnd={btn.isBack ? (e) => { e.preventDefault(); onBackUp(); } : undefined}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
