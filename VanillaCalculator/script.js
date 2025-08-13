
(() => {
  const display = document.getElementById('display');
  const keys = document.querySelector('.keys');

  // Calculator state
  let first = null;       // number
  let operator = null;    // 'add' | 'subtract' | 'multiply' | 'divide' | null
  let overwrite = true;   // if true, next digit replaces display
  let lastKey = null;     // 'digit' | 'op' | 'equals' | 'fn'

  const MAX_LEN = 14;

  function format(n){
    if (!isFinite(n)) return 'Error';
    const s = n.toString();
    if (s.length <= MAX_LEN) return s;
    return n.toExponential(8).replace(/\+?0+e/, 'e');
  }

  function setDisplay(text){
    display.textContent = text;
  }

  function getDisplayNumber(){
    const s = display.textContent.replace(/,/g,'');
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  }

  function inputDigit(d){
    let s = display.textContent;
    if (overwrite || s === '0' || s === 'Error') {
      s = String(d);
      overwrite = false;
    } else if (s.length < MAX_LEN) {
      s += String(d);
    }
    setDisplay(s);
    lastKey = 'digit';
  }

  function inputDot(){
    let s = display.textContent;
    if (overwrite || s === 'Error') {
      s = '0.';
      overwrite = false;
    } else if (!s.includes('.')) {
      s += '.';
    }
    setDisplay(s);
    lastKey = 'digit';
  }

  function clearAll(){
    first = null;
    operator = null;
    overwrite = true;
    setDisplay('0');
    lastKey = 'fn';
  }

  function backspace(){
    let s = display.textContent;
    if (overwrite || s === 'Error') return;
    if (s.length <= 1 || (s.length === 2 && s.startsWith('-'))) {
      setDisplay('0'); overwrite = true;
    } else {
      setDisplay(s.slice(0, -1));
    }
    lastKey = 'fn';
  }

  function setOp(op){
    const current = getDisplayNumber();
    if (first === null) {
      first = current;
    } else if (!overwrite && operator) {
      first = operate(first, operator, current);
      setDisplay(format(first));
    }
    operator = op;
    overwrite = true;
    lastKey = 'op';
  }

  function equals(){
    if (operator === null) return;
    const a = first;
    const b = getDisplayNumber();
    const res = operate(a, operator, b);
    setDisplay(format(res));
    first = res;
    operator = null;
    overwrite = true;
    lastKey = 'equals';
  }

  function toggleSign(){
    if (display.textContent === '0' || display.textContent === 'Error') return;
    const n = -getDisplayNumber();
    setDisplay(format(n));
    lastKey = 'fn';
  }

  function percent(){
    let n = getDisplayNumber();
    if (first !== null && operator && lastKey !== 'equals') {
      n = first * (n / 100);
    } else {
      n = n / 100;
    }
    setDisplay(format(n));
    overwrite = true;
    lastKey = 'fn';
  }

  function operate(a, op, b){
    switch(op){
      case 'add': return a + b;
      case 'subtract': return a - b;
      case 'multiply': return a * b;
      case 'divide': return b === 0 ? NaN : a / b;
      default: return b;
    }
  }

  // Click handlers
  keys.addEventListener('click', (e) => {
    const btn = e.target.closest('button.key');
    if (!btn) return;

    if (btn.dataset.digit !== undefined) {
      inputDigit(btn.dataset.digit);
    } else if (btn.dataset.action === 'dot') {
      inputDot();
    } else if (btn.dataset.action === 'clear') {
      clearAll();
    } else if (btn.dataset.action === 'backspace') {
      backspace();
    } else if (btn.dataset.action === 'equals') {
      equals();
    } else if (btn.dataset.action === 'sign') {
      toggleSign();
    } else if (btn.dataset.action === 'percent') {
      percent();
    } else if (btn.dataset.op) {
      setOp(btn.dataset.op);
    }
  });

  // Keyboard support
  window.addEventListener('keydown', (e) => {
    const k = e.key;
    if (/^\d$/.test(k)) {
      inputDigit(k);
    } else if (k === '.' || k === ',') {
      inputDot();
    } else if (k === '+' ) {
      setOp('add');
    } else if (k === '-' ) {
      setOp('subtract');
    } else if (k === '*' || k.toLowerCase() === 'x') {
      setOp('multiply');
    } else if (k === '/' ) {
      setOp('divide');
    } else if (k === 'Enter' || k === '=') {
      e.preventDefault();
      equals();
    } else if (k === 'Backspace') {
      backspace();
    } else if (k === 'Escape') {
      clearAll();
    } else if (k === '%') {
      percent();
    }
  });

  // Init
  clearAll();
})();
