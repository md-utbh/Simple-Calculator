const display = document.querySelector('.display');
const buttons = document.querySelectorAll('.calculator-button button');
const historyList = document.getElementById('history-list');

let expression = '';
let resultDisplayed = false;
let history = [];

function formatNumber(num) {
  if (num === '' || num === 'Error' || isNaN(num)) return num;
  let [integer, decimal] = num.toString().split('.');
  integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return decimal ? `${integer},${decimal}` : integer;
}

function formatExpression(expr) {
  // Format numbers in the expression
  return expr.replace(/(\d+)(\.\d+)?/g, (match) => {
    if (match.includes('.')) {
      let [int, dec] = match.split('.');
      return formatNumber(int) + ',' + dec;
    }
    return formatNumber(match);
  });
}

function updateDisplay(value) {
  display.value = value ? formatExpression(value) : '0';
  if (value && value !== 'Error') {
    display.classList.add('active');
  } else {
    display.classList.remove('active');
  }
}

function addHistory(expr, result) {
  history.unshift(`${formatExpression(expr)} = ${formatNumber(result)}`);
  if (history.length > 10) history.pop();
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = '';
  history.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    historyList.appendChild(li);
  });
}

function appendToExpression(val) {
  if (resultDisplayed) {
    expression = '';
    resultDisplayed = false;
  }
  expression += val;
  updateDisplay(expression);
}

function handleOperator(op) {
  if (expression === '' && op !== '-') return;
  // Prevent double operator except minus after operator
  if (/[+\-*/]$/.test(expression)) {
    if (op === '-' && !expression.endsWith('-')) {
      expression += op;
    } else {
      expression = expression.slice(0, -1) + op;
    }
  } else {
    expression += op;
  }
  updateDisplay(expression);
}

function handleComma() {
  // Find last number in expression
  const parts = expression.split(/([+\-*/])/);
  let last = parts[parts.length - 1];
  if (!last.includes('.')) {
    expression += '.';
    updateDisplay(expression);
  }
}

function handlePercent() {
  // Replace last number with its percent
  const parts = expression.split(/([+\-*/])/);
  let last = parts[parts.length - 1];
  if (last && !isNaN(last)) {
    let percent = (parseFloat(last) / 100).toString();
    parts[parts.length - 1] = percent;
    expression = parts.join('');
    updateDisplay(expression);
  }
}

function handleDelete() {
  if (expression) {
    expression = expression.slice(0, -1);
    updateDisplay(expression);
  }
}

function handleClear() {
  expression = '';
  updateDisplay('');
}

function handleEquals() {
  if (!expression) return;
  let safeExpr = expression.replace(/,/g, '.'); // replace comma with dot for decimal
  try {
    // Only allow numbers and operators
    if (/^[\d+\-*/.]+$/.test(safeExpr)) {
      let result = Function(`return ${safeExpr}`)();
      if (result === undefined || result === null || isNaN(result)) result = 'Error';
      addHistory(expression, result);
      updateDisplay(result.toString());
      expression = result.toString();
      resultDisplayed = true;
    } else {
      updateDisplay('Error');
      resultDisplayed = true;
    }
  } catch {
    updateDisplay('Error');
    resultDisplayed = true;
  }
}

// Button click handler
buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const id = button.id;
    const text = button.textContent.trim();

    if (id.startsWith('button-') && /\d/.test(text)) {
      // Number
      if (text === '00') {
        if (expression !== '' && !/[+\-*/]$/.test(expression)) {
          appendToExpression('00');
        }
      } else {
        // Prevent leading zero
        if (expression === '0') {
          expression = text;
        } else {
          appendToExpression(text);
        }
      }
    } else if (id === 'button-coma') {
      handleComma();
    } else if (id === 'button-plus' || id === 'button-minus' || id === 'button-multiply' || id === 'button-divide') {
      const op = getOperator(id);
      handleOperator(op);
    } else if (id === 'button-percent') {
      handlePercent();
    } else if (id === 'button-delete') {
      handleDelete();
    } else if (id === 'clear') {
      handleClear();
    } else if (id === 'button-equals') {
      handleEquals();
    }
  });
});

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.altKey || e.metaKey) return;
  if (e.key >= '0' && e.key <= '9') {
    appendToExpression(e.key);
  } else if (e.key === 'Backspace') {
    handleDelete();
  } else if (e.key === 'Delete') {
    handleClear();
  } else if (e.key === 'Enter' || e.key === '=') {
    handleEquals();
  } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
    handleOperator(e.key);
  } else if (e.key === ',' || e.key === '.') {
    handleComma();
  } else if (e.key === '%') {
    handlePercent();
  }
});

// Helper: get operator symbol
function getOperator(id) {
  switch (id) {
    case 'button-plus':
      return '+';
    case 'button-minus':
      return '-';
    case 'button-multiply':
      return '*';
    case 'button-divide':
      return '/';
    default:
      return '';
  }
}

// Inisialisasi tampilan
updateDisplay('');
renderHistory();
