// ================================
// DATA STORAGE
// ================================

let data = JSON.parse(localStorage.getItem("financeData")) || {};
let currentMonth = "";
let pieChart = null;

// ================================
// MONTH SYSTEM
// ================================

function saveData() {
  localStorage.setItem("financeData", JSON.stringify(data));
}

function createMonth(month) {
  data[month] = {
    income: [],
    expenses: [],
    categories: ["Rent", "Food", "Transport", "Utilities"],
    savings: 0,
    locked: false
  };
  saveData();
}

function setDefaultMonth() {
  const now = new Date().toISOString().slice(0, 7);
  document.getElementById("monthPicker").value = now;
  loadMonth(now);
}

function loadMonth(month) {
  currentMonth = month;

  if (!data[month]) {
    createMonth(month);
  }

  autoLockPastMonths();
  renderAll();
}

function autoLockPastMonths() {
  const now = new Date().toISOString().slice(0, 7);
  Object.keys(data).forEach(m => {
    if (m < now) {
      data[m].locked = true;
    }
  });
  saveData();
}

document.getElementById("loadMonthBtn").onclick = () => {
  const selected = document.getElementById("monthPicker").value;
  if (selected) loadMonth(selected);
};

document.getElementById("nextMonthBtn").onclick = () => {
  const d = new Date(document.getElementById("monthPicker").value + "-01");
  d.setMonth(d.getMonth() + 1);
  const next = d.toISOString().slice(0, 7);

  document.getElementById("monthPicker").value = next;
  loadMonth(next);
};

document.getElementById("submitTodayBtn").onclick = () => {
  data[currentMonth].locked = true;
  saveData();
  alert("This month is now locked.");
  renderAll();
};

document.getElementById("carryForwardBtn").onclick = () => {
  const d = new Date(document.getElementById("monthPicker").value + "-01");
  d.setMonth(d.getMonth() + 1);
  const next = d.toISOString().slice(0, 7);

  data[next] = JSON.parse(JSON.stringify(data[currentMonth]));
  data[next].locked = false;

  document.getElementById("monthPicker").value = next;
  loadMonth(next);
};

function isLocked() {
  return data[currentMonth].locked;
}

// ================================
// INCOME
// ================================

function addIncome() {
  if (isLocked()) return alert("This month is locked.");

  const name = document.getElementById("incomeName").value.trim();
  const amount = Number(document.getElementById("incomeAmount").value);

  if (!name || !amount) return;

  data[currentMonth].income.push({ name, amount });

  document.getElementById("incomeName").value = "";
  document.getElementById("incomeAmount").value = "";

  saveData();
  renderAll();
}

function editIncome(index) {
  if (isLocked()) return alert("This month is locked.");

  const item = data[currentMonth].income[index];
  const newName = prompt("Edit income source:", item.name);
  const newAmount = prompt("Edit amount:", item.amount);

  if (newName !== null && newAmount !== null) {
    item.name = newName.trim();
    item.amount = Number(newAmount);
    saveData();
    renderAll();
  }
}

function deleteIncome(index) {
  if (isLocked()) return alert("This month is locked.");

  data[currentMonth].income.splice(index, 1);
  saveData();
  renderAll();
}

// ================================
// CATEGORIES
// ================================

function addCategory() {
  if (isLocked()) return alert("This month is locked.");

  const cat = document.getElementById("newCategory").value.trim();
  if (cat && !data[currentMonth].categories.includes(cat)) {
    data[currentMonth].categories.push(cat);
  }

  document.getElementById("newCategory").value = "";
  saveData();
  renderAll();
}

// ================================
// EXPENSES
// ================================

function addExpense() {
  if (isLocked()) return alert("This month is locked.");

  const cat = document.getElementById("expenseCategory").value;
  const name = document.getElementById("expenseName").value.trim();
  const amount = Number(document.getElementById("expenseAmount").value);

  if (!cat || !amount) return;

  data[currentMonth].expenses.push({ cat, name, amount });

  document.getElementById("expenseName").value = "";
  document.getElementById("expenseAmount").value = "";

  saveData();
  renderAll();
}

function editExpense(index) {
  if (isLocked()) return alert("This month is locked.");

  const item = data[currentMonth].expenses[index];
  const newName = prompt("Edit description:", item.name);
  const newAmount = prompt("Edit amount:", item.amount);

  if (newName !== null && newAmount !== null) {
    item.name = newName.trim();
    item.amount = Number(newAmount);
    saveData();
    renderAll();
  }
}

function deleteExpense(index) {
  if (isLocked()) return alert("This month is locked.");

  data[currentMonth].expenses.splice(index, 1);
  saveData();
  renderAll();
}

// ================================
// SAVINGS
// ================================

function updateSavings() {
  if (isLocked()) return alert("This month is locked.");

  const value = Number(document.getElementById("monthlySaving").value) || 0;
  data[currentMonth].savings = value;

  saveData();
  renderAll();
}

// ================================
// RENDER FUNCTIONS
// ================================

function renderAll() {
  renderCategories();
  renderIncome();
  renderExpenses();
  renderDashboard();
  renderPieChart();
  renderInsights();
}

function renderCategories() {
  const select = document.getElementById("expenseCategory");
  select.innerHTML = "";

  data[currentMonth].categories.forEach(c => {
    const option = document.createElement("option");
    option.value = c;
    option.textContent = c;
    select.appendChild(option);
  });
}

function renderIncome() {
  const tbody = document.getElementById("incomeTable");
  tbody.innerHTML = "";

  data[currentMonth].income.forEach((i, idx) => {
    tbody.innerHTML += `
      <tr>
        <td>${i.name}</td>
        <td>${i.amount}</td>
        <td>
          <button onclick="editIncome(${idx})">Edit</button>
          <button onclick="deleteIncome(${idx})">Delete</button>
        </td>
      </tr>`;
  });
}

function renderExpenses() {
  const tbody = document.getElementById("expenseTable");
  tbody.innerHTML = "";

  data[currentMonth].expenses.forEach((e, idx) => {
    tbody.innerHTML += `
      <tr>
        <td>${e.cat}</td>
        <td>${e.name}</td>
        <td>${e.amount}</td>
        <td>
          <button onclick="editExpense(${idx})">Edit</button>
          <button onclick="deleteExpense(${idx})">Delete</button>
        </td>
      </tr>`;
  });
}

function renderDashboard() {
  const income = data[currentMonth].income.reduce((s, i) => s + i.amount, 0);
  const expenses = data[currentMonth].expenses.reduce((s, e) => s + e.amount, 0);
  const savings = data[currentMonth].savings;
  const balance = income - expenses - savings;

  document.getElementById("dashIncome").textContent = income;
  document.getElementById("dashExpenses").textContent = expenses;
  document.getElementById("dashSavings").textContent = savings;
  document.getElementById("dashBalance").textContent = balance;
}

// ================================
// PIE CHART
// ================================

function renderPieChart() {
  const totals = {};

  data[currentMonth].expenses.forEach(e => {
    totals[e.cat] = (totals[e.cat] || 0) + e.amount;
  });

  const labels = Object.keys(totals);
  const values = Object.values(totals);

  const ctx = document.getElementById("expensePieChart");

  if (pieChart) pieChart.destroy();

  pieChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: [
          "#4CAF50",
          "#42A5F5",
          "#FF7043",
          "#AB47BC",
          "#26A69A",
          "#FFA726"
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}

// ================================
// INSIGHTS
// ================================

function renderInsights() {
  const box = document.getElementById("insightsBox");

  const income = data[currentMonth].income.reduce((s, i) => s + i.amount, 0);
  const expenses = data[currentMonth].expenses.reduce((s, e) => s + e.amount, 0);
  const savings = data[currentMonth].savings;

  const totals = {};
  data[currentMonth].expenses.forEach(e => {
    totals[e.cat] = (totals[e.cat] || 0) + e.amount;
  });

  let insights = [];

  if (expenses > income) {
    insights.push("• You spent more than your income this month. A small adjustment next month could help.");
  } else {
    insights.push("• Your spending stayed within your income. This reflects healthy awareness.");
  }

  if (savings > 0) {
    insights.push("• You contributed to savings. Consistency builds long-term security.");
  } else {
    insights.push("• Consider setting aside even a small amount next month.");
  }

  if (Object.keys(totals).length) {
    const top = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
    insights.push(`• Your highest spending category is "${top[0]}". Reviewing it gently next month could help.`);
  }

  if (income - expenses - savings > 0) {
    insights.push("• You ended with a positive balance. This supports your future goals.");
  }

  box.innerHTML = insights.map(i => `<div>${i}</div>`).join("");
}

// ================================
// INIT
// ================================

setDefaultMonth();
