import { useRef, useState } from 'react';
import {
  OPS, OP_SYMBOLS, compute, factorial, fmt, fmtExpr, addCommas,
  PREFIX_FN_NAMES, IS_PREFIX_FN,
} from '../utils/calcUtils';

export function useCalculator() {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState(null);
  const [op, setOp] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [expression, setExpression] = useState('');
  const [lastOp, setLastOp] = useState(null);
  const [lastOperand, setLastOperand] = useState(null);
  const [history, setHistory] = useState([]);
  const [isScientific, setIsScientific] = useState(false);
  const [is2nd, setIs2nd] = useState(false);
  const [isRad, setIsRad] = useState(true);
  const [memory, setMemory] = useState(0);
  const [pendingFn, setPendingFn] = useState(null);
  const [fnName, setFnName] = useState('');
  const [justCompleted, setJustCompleted] = useState(false);
  const [opStack, setOpStack] = useState([]);
  const [parenStack, setParenStack] = useState([]);
  const [resultReady, setResultReady] = useState(false);

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

  const clear = () => {
    setDisplay('0'); setPrev(null); setOp(null);
    setWaiting(false); setExpression('');
    setLastOp(null); setLastOperand(null);
    setPendingFn(null); setFnName('');
    setJustCompleted(false);
    setOpStack([]); setParenStack([]); setResultReady(false);
  };

  const backspace = () => {
    if (display === 'Error') { setDisplay('0'); return; }
    if (justCompleted) { clear(); return; }
    if (op && waiting) {
      if (opStack.length > 0) {
        const { prev: savedPrev, op: savedOp, displayStr, exprBase, resultReady: savedRR } = opStack[opStack.length - 1];
        setOpStack(s => s.slice(0, -1));
        setPrev(savedPrev); setOp(savedOp); setDisplay(displayStr);
        setExpression(exprBase); setResultReady(savedRR || false);
        setWaiting(savedRR ? true : false);
      } else {
        setDisplay(fmt(prev)); setOp(null); setPrev(null);
        setWaiting(false); setExpression('');
      }
      return;
    }
    if (op && !waiting) {
      if (display.length > 1) { setDisplay(display.slice(0, -1)); }
      else { setDisplay('0'); setWaiting(true); }
      return;
    }
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

  const handleBackLeave = () => clearTimeout(longTimerRef.current);

  const inputDigit = (d) => {
    if (display === 'Error' || waiting) {
      setDisplay(d); setWaiting(false);
      if (resultReady) setResultReady(false);
      if (justCompleted) { setExpression(''); setJustCompleted(false); }
    } else setDisplay(display === '0' ? d : display + d);
  };

  const inputDot = () => {
    if (waiting || display === 'Error') {
      setDisplay('0.'); setWaiting(false);
      if (resultReady) setResultReady(false);
      if (justCompleted) { setExpression(''); setJustCompleted(false); }
      return;
    }
    if (!display.includes('.')) setDisplay(display + '.');
  };

  const handleOp = (nextOp) => {
    const wasJustCompleted = justCompleted;
    const hadResultReady = resultReady;
    if (justCompleted) setJustCompleted(false);
    if (resultReady) setResultReady(false);
    let rawDisplay = display;
    let currentExpr = expression;

    if (pendingFn) {
      const x = parseFloat(display);
      if (!Number.isFinite(x)) return;
      const result = applyFn(pendingFn, x);
      const fnStr = `${fnName}(${addCommas(display)})`;
      rawDisplay = fmt(result);
      setDisplay(rawDisplay);
      currentExpr = currentExpr + fnStr;
      setPendingFn(null); setFnName('');
    }

    const cur = parseFloat(rawDisplay);
    if (!Number.isFinite(cur)) { clear(); return; }

    if (prev !== null && op && (!waiting || hadResultReady)) {
      setOpStack(s => [...s, { prev, op, displayStr: fmt(cur), exprBase: currentExpr, resultReady: hadResultReady }]);
      const result = compute(prev, cur, op);
      setDisplay(fmt(result)); setPrev(result);
      const newExpr = hadResultReady
        ? `${currentExpr}${OP_SYMBOLS[nextOp]}`
        : `${currentExpr}${fmtExpr(cur)}${OP_SYMBOLS[nextOp]}`;
      setExpression(newExpr);
    } else if (prev === null) {
      setPrev(cur);
      const exprHasOperand = currentExpr.endsWith(')');
      if (wasJustCompleted || !currentExpr) {
        setExpression(`${fmtExpr(cur)}${OP_SYMBOLS[nextOp]}`);
      } else if (exprHasOperand) {
        setExpression(`${currentExpr}${OP_SYMBOLS[nextOp]}`);
      } else {
        setExpression(`${currentExpr}${fmtExpr(cur)}${OP_SYMBOLS[nextOp]}`);
      }
    } else {
      const sym = OP_SYMBOLS[op];
      const base = sym && currentExpr.endsWith(sym) ? currentExpr.slice(0, -sym.length) : currentExpr;
      setExpression(`${base}${OP_SYMBOLS[nextOp]}`);
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
      setExpression(`${expression}${fnStr}`); setDisplay(resultStr);
      pushHistory(`${expression}${fnStr}`, addCommas(resultStr));
      setPendingFn(null); setFnName('');
      setPrev(null); setOp(null); setWaiting(true);
      setOpStack([]); setJustCompleted(true);
      return;
    }
    if (prev !== null && op) {
      const cur = parseFloat(display);
      const result = compute(prev, cur, op);
      const expr = resultReady ? expression : `${expression}${fmtExpr(cur)}`;
      const resultStr = fmt(result);
      setExpression(expr); setDisplay(resultStr);
      pushHistory(expr, addCommas(resultStr));
      setLastOp(op); setLastOperand(cur);
      setPrev(null); setOp(null); setWaiting(true);
      setOpStack([]); setResultReady(false); setJustCompleted(true);
    } else if (lastOp !== null && lastOperand !== null) {
      const cur = parseFloat(display);
      const result = compute(cur, lastOperand, lastOp);
      const expr = `${fmtExpr(cur)}${OP_SYMBOLS[lastOp]}${fmtExpr(lastOperand)}`;
      const resultStr = fmt(result);
      setExpression(expr); setDisplay(resultStr);
      pushHistory(expr, addCommas(resultStr));
      setWaiting(true); setOpStack([]); setJustCompleted(true);
    }
  };

  const handleStdClick = ({ id, kind }) => {
    if (kind === 'num') { inputDigit(id); return; }
    if (OPS.includes(id)) { handleOp(id); return; }
    switch (id) {
      case '.':       inputDot(); break;
      case '=':       handleEquals(); break;
      case 'clear':   clear(); break;
      case 'negate':
        if (display !== 'Error' && display !== '0') setDisplay(fmt(-parseFloat(display)));
        break;
      case 'percent':
        if (display !== 'Error') setDisplay(fmt(parseFloat(display) / 100));
        break;
      default: break;
    }
  };

  const handleSciClick = (btn) => {
    const id = is2nd ? btn.id2 : btn.id;

    if (id === '2nd') { setIs2nd((v) => !v); return; }
    if (id === 'radDeg') { setIsRad((v) => !v); return; }

    switch (id) {
      case 'mc':     setMemory(0); return;
      case 'mplus':  setMemory((m) => m + (parseFloat(display) || 0)); return;
      case 'mminus': setMemory((m) => m - (parseFloat(display) || 0)); return;
      case 'mr':     setDisplay(fmt(memory)); setWaiting(true); return;
      case 'lparen': {
        setParenStack(s => [...s, { prev, op, opStack, expression }]);
        setPrev(null); setOp(null); setOpStack([]);
        setDisplay('0'); setWaiting(false); setResultReady(false);
        setExpression(expression + '(');
        if (is2nd) setIs2nd(false);
        return;
      }
      case 'rparen': {
        if (parenStack.length === 0) return;
        // Apply any staged prefix fn before closing  e.g. ( √( 4 ) )
        let curDisplay = display;
        let curExpr = expression;
        let hadPendingFn = false;
        if (pendingFn) {
          const x = parseFloat(display);
          if (!Number.isFinite(x)) return;
          const r = applyFn(pendingFn, x);
          if (!Number.isFinite(r)) { setDisplay('Error'); return; }
          hadPendingFn = true;
          curDisplay = fmt(r);
          curExpr = `${expression}${fnName}(${addCommas(display)})`;
        }
        const curVal = parseFloat(curDisplay);
        let innerResult;
        if (prev !== null && op && !waiting) {
          innerResult = Number.isFinite(curVal) ? compute(prev, curVal, op) : NaN;
        } else if (prev !== null && op && waiting) {
          innerResult = prev;
        } else {
          innerResult = curVal;
        }
        if (!Number.isFinite(innerResult)) { setDisplay('Error'); return; }
        let innerStr;
        if (op && !waiting) {
          innerStr = `${curExpr}${fmtExpr(curVal)}`;
        } else if (op || resultReady || hadPendingFn) {
          innerStr = curExpr;
        } else {
          innerStr = `${curExpr}${fmtExpr(curVal)}`;
        }
        const closedExpr = `${innerStr})`;
        if (hadPendingFn) { setPendingFn(null); setFnName(''); }
        const saved = parenStack[parenStack.length - 1];
        setParenStack(s => s.slice(0, -1));
        setPrev(saved.prev); setOp(saved.op); setOpStack(saved.opStack);
        setDisplay(fmt(innerResult)); setExpression(closedExpr);
        setResultReady(true); setWaiting(true);
        if (is2nd) setIs2nd(false);
        return;
      }
      case 'ee':
        if (!display.includes('e') && display !== 'Error') setDisplay(display + 'e+');
        return;
      default: break;
    }

    if (id === 'pow' || id === 'yroot') {
      handleOp(id);
      if (is2nd) setIs2nd(false);
      return;
    }

    if (id === 'pi')     { setDisplay(fmt(Math.PI));     setWaiting(true); if (is2nd) setIs2nd(false); return; }
    if (id === 'eConst') { setDisplay(fmt(Math.E));      setWaiting(true); if (is2nd) setIs2nd(false); return; }
    if (id === 'rand')   { setDisplay(fmt(Math.random())); setWaiting(true); if (is2nd) setIs2nd(false); return; }

    if (IS_PREFIX_FN.has(id)) {
      setPendingFn(id); setFnName(PREFIX_FN_NAMES[id]);
      setDisplay('0'); setWaiting(true);
      if (is2nd) setIs2nd(false);
      return;
    }

    const x = parseFloat(display);
    if (!Number.isFinite(x)) return;

    let result, postfixLabel;
    switch (id) {
      case 'x2':   result = x * x;          postfixLabel = '²'; break;
      case 'x3':   result = Math.pow(x, 3); postfixLabel = '³'; break;
      case 'fact': result = factorial(x);   postfixLabel = '!'; break;
      default: return;
    }
    if (!Number.isFinite(result)) { setDisplay('Error'); return; }

    if (pendingFn) {
      setDisplay(fmt(result));
      if (is2nd) setIs2nd(false);
      return;
    }

    setDisplay(fmt(result));
    setExpression(`${expression}${addCommas(display)}${postfixLabel}`);
    setResultReady(true); setWaiting(true);
    if (is2nd) setIs2nd(false);
  };

  const toggleScientific = () => { setIsScientific(v => !v); setIs2nd(false); };
  const clearHistory = () => setHistory([]);

  // ── Display formatting ──
  const liveExpression = (() => {
    if (pendingFn && !waiting) return `${expression}${fnName}(${addCommas(display)}`;
    if (pendingFn) return `${expression}${fnName}(`;
    if (op && !waiting && !resultReady && prev !== null) return `${expression}${addCommas(display)}`;
    if (!op && !resultReady && display !== '0') {
      if (!expression) return addCommas(display);
      if (expression.endsWith('(')) return `${expression}${addCommas(display)}`;
    }
    return expression;
  })();

  const liveResult = (() => {
    if (display === 'Error') return 'Error';
    if (op && prev !== null && (!waiting || resultReady)) {
      const cur = parseFloat(display);
      if (Number.isFinite(cur)) {
        const r = compute(prev, cur, op);
        return Number.isFinite(r) ? fmt(r) : 'Error';
      }
    }
    if (op && waiting && prev !== null) return fmt(prev);
    if (pendingFn && !waiting) {
      const x = parseFloat(display);
      if (Number.isFinite(x)) {
        const r = applyFn(pendingFn, x);
        return Number.isFinite(r) ? fmt(r) : 'Error';
      }
    }
    return display;
  })();

  const liveResultFormatted = addCommas(liveResult);
  const charCount = liveResultFormatted.length;
  const fontSize = isScientific
    ? (charCount > 11 ? '28px' : charCount > 8 ? '38px' : charCount > 5 ? '50px' : '60px')
    : (charCount > 11 ? '38px' : charCount > 8 ? '52px' : charCount > 5 ? '66px' : '82px');

  return {
    op, isScientific, is2nd,
    history, clearHistory,
    liveExpression, liveResultFormatted, fontSize,
    handleStdClick, handleSciClick,
    handleBackDown, handleBackUp, handleBackLeave,
    toggleScientific,
  };
}
