import { useRef, useState } from 'react';
import styles from '../styles/CalculatorCover.module.css';

/* ── Math helpers ──────────────────────────────────────────────────────────── */
const OPS = ['/', 'x', '-', '+', 'pow', 'yroot'];
const OP_SYMBOLS = { '/': '÷', x: '×', '-': '−', '+': '+', pow: '^', yroot: 'ʸ√' };

const addCommas = (str) => {
  if (!str || str === 'Error') return str || '0';
  const neg = str.startsWith('-');
  const abs = neg ? str.slice(1) : str;
  const [intPart, decPart] = abs.split('.');
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const result = decPart !== undefined ? `${formatted}.${decPart}` : formatted;
  return neg ? `-${result}` : result;
};

const fmt = (v) => {
  if (!Number.isFinite(v)) return 'Error';
  return String(Number.parseFloat(v.toFixed(10)));
};

const fmtExpr = (num) => addCommas(fmt(num));

const compute = (a, b, o) => {
  switch (o) {
    case '+': return a + b;
    case '-': return a - b;
    case 'x': return a * b;
    case '/': return b === 0 ? NaN : a / b;
    case 'pow': return Math.pow(a, b);
    case 'yroot': return Math.pow(a, 1 / b);
    default: return b;
  }
};

const factorial = (n) => {
  if (n < 0 || !Number.isInteger(n) || n > 170) return n > 170 ? Infinity : NaN;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
};

/* ── Scientific prefix function metadata ──────────────────────────────────── */
const PREFIX_FN_NAMES = {
  sin: 'sin', cos: 'cos', tan: 'tan',
  asin: 'sin⁻¹', acos: 'cos⁻¹', atan: 'tan⁻¹',
  sinh: 'sinh', cosh: 'cosh', tanh: 'tanh',
  asinh: 'sinh⁻¹', acosh: 'cosh⁻¹', atanh: 'tanh⁻¹',
  ln: 'ln', log10: 'log₁₀',
  ex: 'eˣ', '10x': '10ˣ',
  sqrt2: '√', sqrt3: '∛',
  '1/x': '1/',
};
const IS_PREFIX_FN = new Set(Object.keys(PREFIX_FN_NAMES));

/* ── Icons ─────────────────────────────────────────────────────────────────── */
const BackspaceIcon = () => (
  <svg viewBox="0 0 24 24" width="36" height="36" fill="none"
       stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
       aria-hidden="true">
    <path d="M20 5H8c-.53 0-1.04.26-1.37.68L2 12l4.63 6.32c.33.43.84.68 1.37.68H20a2 2 0 002-2V7a2 2 0 00-2-2z" />
    <line x1="12.5" y1="9.5" x2="17.5" y2="14.5" />
    <line x1="17.5" y1="9.5" x2="12.5" y2="14.5" />
  </svg>
);

const HistoryIcon = () => (
  <svg viewBox="0 0 22 22" fill="white" width="20" height="20" aria-hidden="true">
    <rect x="2" y="3"    width="3" height="3" rx="0.75" />
    <rect x="7" y="3.75" width="13" height="1.5" rx="0.75" />
    <rect x="2" y="9.5"  width="3" height="3" rx="0.75" />
    <rect x="7" y="10.25" width="13" height="1.5" rx="0.75" />
    <rect x="2" y="16"   width="3" height="3" rx="0.75" />
    <rect x="7" y="16.75" width="13" height="1.5" rx="0.75" />
  </svg>
);

/* iOS Calculator app icon — always the same regardless of mode */
const SciToggleIcon = () => (
  <svg viewBox="0 0 16 19" width="15" height="18" aria-hidden="true" fill="white">
    {/* Display */}
    <rect x="0" y="0" width="16" height="4.5" rx="1.2" />
    {/* Row 1: AC  +/-  %  ÷ */}
    <rect x="0"   y="6"    width="3"   height="2.8" rx="0.7" opacity="0.55" />
    <rect x="4.3" y="6"    width="3"   height="2.8" rx="0.7" opacity="0.55" />
    <rect x="8.7" y="6"    width="3"   height="2.8" rx="0.7" opacity="0.55" />
    <rect x="13"  y="6"    width="3"   height="2.8" rx="0.7" />
    {/* Row 2: 7  8  9  × */}
    <rect x="0"   y="9.6"  width="3"   height="2.8" rx="0.7" opacity="0.75" />
    <rect x="4.3" y="9.6"  width="3"   height="2.8" rx="0.7" opacity="0.75" />
    <rect x="8.7" y="9.6"  width="3"   height="2.8" rx="0.7" opacity="0.75" />
    <rect x="13"  y="9.6"  width="3"   height="2.8" rx="0.7" />
    {/* Row 3: 4  5  6  − */}
    <rect x="0"   y="13.2" width="3"   height="2.8" rx="0.7" opacity="0.75" />
    <rect x="4.3" y="13.2" width="3"   height="2.8" rx="0.7" opacity="0.75" />
    <rect x="8.7" y="13.2" width="3"   height="2.8" rx="0.7" opacity="0.75" />
    <rect x="13"  y="13.2" width="3"   height="2.8" rx="0.7" />
    {/* Row 4: 0(wide)  .  = */}
    <rect x="0"   y="16.8" width="7.3" height="2.2" rx="0.7" opacity="0.75" />
    <rect x="8.7" y="16.8" width="3"   height="2.2" rx="0.7" opacity="0.75" />
    <rect x="13"  y="16.8" width="3"   height="2.2" rx="0.7" />
  </svg>
);

/* ── Button data ───────────────────────────────────────────────────────────── */
const mk = (label, id, label2, id2, kind = 'sci') => ({
  label, id,
  label2: label2 ?? label,
  id2: id2 ?? id,
  kind,
});

const SCI_BUTTONS = [
  mk('(', 'lparen'), mk(')', 'rparen'), mk('mc', 'mc'), mk('m+', 'mplus'), mk('m-', 'mminus'), mk('mr', 'mr'),
  mk('2ⁿᵈ', '2nd', '2ⁿᵈ', '2nd', 'sci2nd'),
  mk('x²', 'x2'), mk('x³', 'x3'),
  mk('xʸ', 'pow', 'ʸ√x', 'yroot'),
  mk('eˣ', 'ex', 'ln', 'ln'),
  mk('10ˣ', '10x', 'log₁₀', 'log10'),
  mk('¹/ₓ', '1/x'), mk('²√x', 'sqrt2'), mk('³√x', 'sqrt3'),
  mk('ʸ√x', 'yroot', 'xʸ', 'pow'),
  mk('ln', 'ln', 'eˣ', 'ex'),
  mk('log₁₀', 'log10', '10ˣ', '10x'),
  mk('x!', 'fact'),
  mk('sin', 'sin', 'sin⁻¹', 'asin'),
  mk('cos', 'cos', 'cos⁻¹', 'acos'),
  mk('tan', 'tan', 'tan⁻¹', 'atan'),
  mk('e', 'eConst'), mk('EE', 'ee'),
  mk('Rand', 'rand'),
  mk('sinh', 'sinh', 'sinh⁻¹', 'asinh'),
  mk('cosh', 'cosh', 'cosh⁻¹', 'acosh'),
  mk('tanh', 'tanh', 'tanh⁻¹', 'atanh'),
  mk('π', 'pi'),
  mk('Rad', 'radDeg', 'Deg', 'radDeg', 'sciMode'),
];

const STD_BUTTONS = [
  { id: 'backspace', kind: 'fn', isBack: true },
  { label: 'AC', id: 'clear',   kind: 'fn'  },
  { label: '%',  id: 'percent', kind: 'fn'  },
  { label: '÷',  id: '/',       kind: 'op'  },
  { label: '7',  id: '7',       kind: 'num' },
  { label: '8',  id: '8',       kind: 'num' },
  { label: '9',  id: '9',       kind: 'num' },
  { label: '×',  id: 'x',       kind: 'op'  },
  { label: '4',  id: '4',       kind: 'num' },
  { label: '5',  id: '5',       kind: 'num' },
  { label: '6',  id: '6',       kind: 'num' },
  { label: '−',  id: '-',       kind: 'op'  },
  { label: '1',  id: '1',       kind: 'num' },
  { label: '2',  id: '2',       kind: 'num' },
  { label: '3',  id: '3',       kind: 'num' },
  { label: '+',  id: '+',       kind: 'op'  },
  { label: '+/-', id: 'negate',  kind: 'fn'  },
  { label: '0',  id: '0',       kind: 'num' },
  { label: '.',  id: '.',       kind: 'num' },
  { label: '=',  id: '=',       kind: 'op'  },
];

/* ── Component ─────────────────────────────────────────────────────────────── */
export default function CalculatorCover({ onEnterPrivateMode }) {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState(null);
  const [op, setOp] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [expression, setExpression] = useState('');
  const [lastOp, setLastOp] = useState(null);
  const [lastOperand, setLastOperand] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  /* Scientific state */
  const [isScientific, setIsScientific] = useState(false);
  const [is2nd, setIs2nd] = useState(false);
  const [isRad, setIsRad] = useState(true);
  const [memory, setMemory] = useState(0);

  const [pendingFn, setPendingFn] = useState(null);
  const [fnName, setFnName] = useState('');

  const longPressRef = useRef(false);
  const longTimerRef = useRef(null);

  const applyFn = (fnId, x) => {
    const toRad = (v) => isRad ? v : v * Math.PI / 180;
    const fromRad = (v) => isRad ? v : v * 180 / Math.PI;
    switch (fnId) {
      case 'sin':   return Math.sin(toRad(x));
      case 'cos':   return Math.cos(toRad(x));
      case 'tan':   return Math.tan(toRad(x));
      case 'asin':  return fromRad(Math.asin(x));
      case 'acos':  return fromRad(Math.acos(x));
      case 'atan':  return fromRad(Math.atan(x));
      case 'sinh':  return Math.sinh(x);
      case 'cosh':  return Math.cosh(x);
      case 'tanh':  return Math.tanh(x);
      case 'asinh': return Math.asinh(x);
      case 'acosh': return Math.acosh(x);
      case 'atanh': return Math.atanh(x);
      case 'ln':    return Math.log(x);
      case 'log10': return Math.log10(x);
      case 'ex':    return Math.exp(x);
      case '10x':   return Math.pow(10, x);
      case 'sqrt2': return Math.sqrt(x);
      case 'sqrt3': return Math.cbrt(x);
      case '1/x':   return x === 0 ? NaN : 1 / x;
      default:      return x;
    }
  };

  const pushHistory = (expr, result) =>
    setHistory((h) => [{ expr, result }, ...h].slice(0, 20));

  /* ── Standard calc logic ── */
  const clear = () => {
    setDisplay('0'); setPrev(null); setOp(null);
    setWaiting(false); setExpression('');
    setLastOp(null); setLastOperand(null);
    setPendingFn(null); setFnName('');
  };

  const handleClear = () => { clear(); };

  const backspace = () => {
    if (display === 'Error') { setDisplay('0'); return; }

    // After equals — clear everything
    if (expression.endsWith('=')) { clear(); return; }

    // Operator just pressed, waiting for second operand — undo the operator
    if (op && waiting) {
      setDisplay(fmt(prev));
      setOp(null);
      setPrev(null);
      setWaiting(false);
      setExpression('');
      return;
    }

    // Typing second operand — delete digit, or leave empty slot
    if (op && !waiting) {
      if (display.length > 1) {
        setDisplay(display.slice(0, -1));
      } else {
        setDisplay('0');
        setWaiting(true);
      }
      return;
    }

    // Typing first operand
    setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
  };

  const handleBackDown = () => {
    longPressRef.current = false;
    longTimerRef.current = setTimeout(() => { longPressRef.current = true; clear(); }, 600);
  };

  const handleBackUp = () => {
    clearTimeout(longTimerRef.current);
    if (!longPressRef.current) backspace();
  };

  const inputDigit = (d) => {
    if (display === 'Error' || waiting) { setDisplay(d); setWaiting(false); }
    else setDisplay(display === '0' ? d : display + d);
  };

  const inputDot = () => {
    if (waiting || display === 'Error') { setDisplay('0.'); setWaiting(false); return; }
    if (!display.includes('.')) setDisplay(display + '.');
  };

  const handleOp = (nextOp) => {
    let rawDisplay = display;
    if (pendingFn) {
      const x = parseFloat(display);
      if (!Number.isFinite(x)) return;
      const result = applyFn(pendingFn, x);
      const fnStr = `${fnName}(${addCommas(display)})`;
      rawDisplay = fmt(result);
      setDisplay(rawDisplay);
      setExpression((e) => e + fnStr);
      setPendingFn(null); setFnName('');
    }
    const cur = parseFloat(rawDisplay);
    if (!Number.isFinite(cur)) { clear(); return; }
    if (prev !== null && op && !waiting) {
      const result = compute(prev, cur, op);
      const resultStr = fmt(result);
      setDisplay(resultStr); setPrev(result);
      setExpression(`${fmtExpr(result)}${OP_SYMBOLS[nextOp]}`);
    } else if (prev === null) {
      setPrev(cur);
      setExpression(`${fmtExpr(cur)}${OP_SYMBOLS[nextOp]}`);
    } else {
      setExpression(`${fmtExpr(prev)}${OP_SYMBOLS[nextOp]}`);
    }
    setOp(nextOp); setWaiting(true);
  };

  const handleEquals = () => {
    if (pendingFn) {
      const x = parseFloat(display);
      if (!Number.isFinite(x)) return;
      const result = applyFn(pendingFn, x);
      const fnStr = `${fnName}(${addCommas(display)})`;
      const resultStr = fmt(result);
      setExpression(`${expression}${fnStr}=`);
      setDisplay(resultStr);
      pushHistory(`${expression}${fnStr}`, addCommas(resultStr));
      setPendingFn(null); setFnName('');
      setPrev(null); setOp(null); setWaiting(true);
      return;
    }
    if (prev !== null && op) {
      const cur = parseFloat(display);
      const result = compute(prev, cur, op);
      const expr = `${fmtExpr(prev)}${OP_SYMBOLS[op]}${fmtExpr(cur)}`;
      const resultStr = fmt(result);
      setExpression(`${expr}=`); setDisplay(resultStr);
      pushHistory(expr, addCommas(resultStr));
      setLastOp(op); setLastOperand(cur);
      setPrev(null); setOp(null); setWaiting(true);
    } else if (lastOp !== null && lastOperand !== null) {
      const cur = parseFloat(display);
      const result = compute(cur, lastOperand, lastOp);
      const expr = `${fmtExpr(cur)}${OP_SYMBOLS[lastOp]}${fmtExpr(lastOperand)}`;
      const resultStr = fmt(result);
      setExpression(`${expr}=`); setDisplay(resultStr);
      pushHistory(expr, addCommas(resultStr));
      setWaiting(true);
    }
  };

  const handleStdClick = ({ id, kind }) => {
    if (kind === 'num') { inputDigit(id); return; }
    if (OPS.includes(id)) { handleOp(id); return; }
    switch (id) {
      case '.':      inputDot(); break;
      case '=':      handleEquals(); break;
      case 'clear':  handleClear(); break;
      case 'negate':
        if (display !== 'Error' && display !== '0') setDisplay(fmt(-parseFloat(display)));
        break;
      case 'percent':
        if (display !== 'Error') setDisplay(fmt(parseFloat(display) / 100));
        break;
      default: break;
    }
  };

  /* ── Scientific logic ── */
  const handleSciClick = (btn) => {
    const id = is2nd ? btn.id2 : btn.id;

    if (id === '2nd') { setIs2nd((v) => !v); return; }
    if (id === 'radDeg') { setIsRad((v) => !v); return; }

    switch (id) {
      case 'mc':     setMemory(0); return;
      case 'mplus':  setMemory((m) => m + (parseFloat(display) || 0)); return;
      case 'mminus': setMemory((m) => m - (parseFloat(display) || 0)); return;
      case 'mr':     setDisplay(fmt(memory)); setWaiting(true); return;
      case 'lparen':
      case 'rparen': return; // parentheses deferred
      case 'ee':
        if (!display.includes('e') && display !== 'Error')
          setDisplay(display + 'e+');
        return;
      default: break;
    }

    /* Two-operand sci functions act as operators */
    if (id === 'pow' || id === 'yroot') {
      handleOp(id);
      if (is2nd) setIs2nd(false);
      return;
    }

    /* Constants — don't need current display value */
    if (id === 'pi') { setDisplay(fmt(Math.PI)); setWaiting(true); if (is2nd) setIs2nd(false); return; }
    if (id === 'eConst') { setDisplay(fmt(Math.E)); setWaiting(true); if (is2nd) setIs2nd(false); return; }
    if (id === 'rand') { setDisplay(fmt(Math.random())); setWaiting(true); if (is2nd) setIs2nd(false); return; }

    /* Prefix functions — stage them in the expression, wait for argument */
    if (IS_PREFIX_FN.has(id)) {
      setPendingFn(id);
      setFnName(PREFIX_FN_NAMES[id]);
      setDisplay('0');
      setWaiting(true);
      if (is2nd) setIs2nd(false);
      return;
    }

    /* Postfix / immediate functions */
    const x = parseFloat(display);
    if (!Number.isFinite(x)) return;

    let result;
    switch (id) {
      case 'x2':   result = x * x; break;
      case 'x3':   result = Math.pow(x, 3); break;
      case 'fact': result = factorial(x); break;
      default: return;
    }

    setDisplay(fmt(result));
    setWaiting(true);
    if (is2nd) setIs2nd(false);
  };

  /* ── Display formatting ── */
  const displayFormatted = addCommas(display);
  const liveExpression =
    pendingFn && !waiting ? `${expression}${fnName}(${addCommas(display)}`
    : pendingFn            ? `${expression}${fnName}(`
    : op && !waiting && prev !== null ? `${expression}${addCommas(display)}`
    : !op && !expression && display !== '0' ? addCommas(display)
    : expression;
  const charCount = displayFormatted.length;
  const fontSize = isScientific
    ? (charCount > 11 ? '28px' : charCount > 8 ? '38px' : charCount > 5 ? '50px' : '60px')
    : (charCount > 11 ? '38px' : charCount > 8 ? '52px' : charCount > 5 ? '66px' : '82px');

  return (
    <section className={`${styles.page} ${isScientific ? styles.pageSci : ''}`} aria-label="Calculator">

      {/* ── Top overlay buttons ── */}
      <div className={styles.topBar}>
        <button type="button" aria-label="Calculation history" className={styles.overlayBtn}
          onClick={() => setShowHistory((v) => !v)}>
          <HistoryIcon />
        </button>
        <button type="button"
          aria-label={isScientific ? 'Switch to basic calculator' : 'Switch to scientific calculator'}
          className={`${styles.overlayBtn} ${isScientific ? styles.overlayBtnActive : ''}`}
          onClick={() => { setIsScientific((v) => !v); setIs2nd(false); }}>
          <SciToggleIcon />
        </button>
      </div>

      {/* ── History panel ── */}
      {showHistory && (
        <div className={styles.historyBackdrop} onClick={() => setShowHistory(false)}>
          <div className={styles.historyPanel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.historyHeader}>
              <span className={styles.historyTitle}>Recent</span>
              {history.length > 0 && (
                <button type="button" className={styles.historyClear} onClick={() => setHistory([])}>Clear</button>
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
      )}

      <div className={`${styles.calculator} ${isScientific ? styles.calculatorSci : ''}`}>
        {/* ── Display ── */}
        <div className={`${styles.displayArea} ${isScientific ? styles.displayAreaSci : ''}`}>
          <div className={styles.expression} aria-hidden="true">{liveExpression}</div>
          <div className={styles.display} style={{ fontSize }} aria-live="polite">
            {displayFormatted}
          </div>
        </div>

        {/* ── Scientific pad ── */}
        {isScientific && (
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
                  onClick={() => handleSciClick(btn)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Standard keypad ── */}
        <div className={isScientific ? styles.keypadSci : styles.keypad}>
          {STD_BUTTONS.map((btn) => {
            const label = btn.isBack
              ? <BackspaceIcon />
              : btn.label;

            const keyClass = isScientific
              ? [
                  styles.keyRect,
                  btn.kind === 'fn'  ? styles.fnKeyRect  : '',
                  btn.kind === 'op'  ? styles.opKeyRect  : '',
                  btn.kind === 'num' ? styles.numKeyRect : '',
                ].filter(Boolean).join(' ')
              : [
                  styles.key,
                  btn.kind === 'fn'  ? styles.fnKey  : '',
                  btn.kind === 'op'  ? styles.opKey  : '',
                  btn.kind === 'num' ? styles.numKey : '',
                ].filter(Boolean).join(' ');

            return (
              <button
                key={btn.id}
                type="button"
                aria-label={btn.isBack ? 'Delete last digit' : undefined}
                className={keyClass}
                onClick={btn.isBack ? undefined : () => handleStdClick(btn)}
                onMouseDown={btn.isBack ? handleBackDown : undefined}
                onMouseUp={btn.isBack ? handleBackUp : undefined}
                onMouseLeave={btn.isBack ? () => clearTimeout(longTimerRef.current) : undefined}
                onTouchStart={btn.isBack ? (e) => { e.preventDefault(); handleBackDown(); } : undefined}
                onTouchEnd={btn.isBack ? (e) => { e.preventDefault(); handleBackUp(); } : undefined}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
