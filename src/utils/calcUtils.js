export const OPS = ['/', 'x', '-', '+', 'pow', 'yroot'];
export const OP_SYMBOLS = { '/': '÷', x: '×', '-': '−', '+': '+', pow: '^', yroot: 'ʸ√' };

export const addCommas = (str) => {
  if (!str || str === 'Error') return str || '0';
  const neg = str.startsWith('-');
  const abs = neg ? str.slice(1) : str;
  const [intPart, decPart] = abs.split('.');
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const result = decPart !== undefined ? `${formatted}.${decPart}` : formatted;
  return neg ? `-${result}` : result;
};

export const fmt = (v) => {
  if (!Number.isFinite(v)) return 'Error';
  return String(Number.parseFloat(v.toFixed(10)));
};

export const fmtExpr = (num) => addCommas(fmt(num));

export const compute = (a, b, o) => {
  switch (o) {
    case '+':     return a + b;
    case '-':     return a - b;
    case 'x':     return a * b;
    case '/':     return b === 0 ? NaN : a / b;
    case 'pow':   return Math.pow(a, b);
    case 'yroot': return Math.pow(a, 1 / b);
    default:      return b;
  }
};

export const factorial = (n) => {
  if (n < 0 || !Number.isInteger(n) || n > 170) return n > 170 ? Infinity : NaN;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
};

export const PREFIX_FN_NAMES = {
  sin: 'sin', cos: 'cos', tan: 'tan',
  asin: 'sin⁻¹', acos: 'cos⁻¹', atan: 'tan⁻¹',
  sinh: 'sinh', cosh: 'cosh', tanh: 'tanh',
  asinh: 'sinh⁻¹', acosh: 'cosh⁻¹', atanh: 'tanh⁻¹',
  ln: 'ln', log10: 'log₁₀',
  ex: 'eˣ', '10x': '10ˣ',
  sqrt2: '√', sqrt3: '∛',
  '1/x': '1/',
};
export const IS_PREFIX_FN = new Set(Object.keys(PREFIX_FN_NAMES));
