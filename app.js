const stackItems = [
  {
    name: "LMNT",
    time: "6:00 AM",
    category: "Foundation",
    frequency: "Daily",
    notes: "Water + electrolytes",
  },
  {
    name: "MOTS-c",
    time: "6:15 AM",
    category: "Peptides",
    frequency: "M-F",
    notes: "AM injection",
  },
  {
    name: "Coffee",
    time: "6:15 AM",
    category: "Foundation",
    frequency: "Daily",
    notes: "Morning coffee",
  },
  {
    name: "Tru Niagen",
    time: "6:15 AM",
    category: "NAD",
    frequency: "Daily",
    notes: "Morning",
  },
  {
    name: "NOVOS Boost",
    time: "6:15 AM",
    category: "NAD",
    frequency: "Daily",
    notes: "Morning",
  },
  {
    name: "IM8",
    time: "12:00 PM",
    category: "Foundation",
    frequency: "Daily",
    notes: "First meal",
  },
  {
    name: "OmegaPure 780 EC",
    time: "12:00 PM",
    category: "Foundation",
    frequency: "Daily",
    notes: "With food",
  },
  {
    name: "Xymogen Creatine",
    time: "12:00 PM",
    category: "Foundation",
    frequency: "Daily",
    notes: "With lunch",
  },
  {
    name: "Lunch",
    time: "12:00 PM",
    category: "Foundation",
    frequency: "Daily",
    notes: "First meal / lunch",
  },
  {
    name: "LMNT",
    time: "12:00 PM",
    category: "Foundation",
    frequency: "Daily",
    notes: "Water + electrolytes",
  },
  {
    name: "Metagenics Protein",
    time: "12:00 PM",
    category: "Protein",
    frequency: "As Needed",
    notes: "Protein target support",
  },
  {
    name: "Tesamorelin/Ipamorelin",
    time: "11:00 PM",
    category: "Peptides",
    frequency: "M-F",
    notes: "Empty stomach",
  },
  {
    name: "BPC-157",
    time: "11:00 PM",
    category: "Recovery",
    frequency: "M-F",
    notes: "Night injection",
  },
  {
    name: "Dinner",
    time: "7:00 PM",
    category: "Foundation",
    frequency: "Daily",
    notes: "Evening meal",
  },
  {
    name: "LMNT",
    time: "7:00 PM",
    category: "Foundation",
    frequency: "Daily",
    notes: "Water + electrolytes",
  },
  {
    name: "OptiMag 125",
    time: "11:00 PM",
    category: "Foundation",
    frequency: "Daily",
    notes: "Night",
  },
  {
    name: "Retatrutide",
    time: "7:00 PM Sundays",
    category: "Weekly",
    frequency: "Weekly",
    notes: "Same day each week",
  },
];

const resetItems = [
  "Refill syringes",
  "Check peptide inventory",
  "Restock LMNT",
  "Reorder supplements",
  "Prep weekly Retatrutide",
  "Review weight/waist",
];

const timeOrder = {
  "6:00 AM": 1,
  "6:15 AM": 2,
  "12:00 PM": 3,
  Midday: 4,
  "7:00 PM": 5,
  "11:00 PM": 6,
  "7:00 PM Sundays": 7,
};

const today = new Date();
const dateKey = formatDateKey(today);
const weekKey = getWeekKey(today);

const dailyStateKey = `daily-stack:${dateKey}`;
const weeklyStackStateKey = `weekly-stack:${weekKey}`;
const weeklyStateKey = `weekly-reset:${weekKey}`;
const firstUseDateKey = "daily-stack:first-use-date";
let dailyState = readState(dailyStateKey);
let weeklyStackState = readState(weeklyStackStateKey);
let weeklyState = readState(weeklyStateKey);
let calendarMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let selectedHistoryDate = dateKey;

const todayItems = stackItems
  .filter((item) => item.frequency === "Daily" || item.frequency === "M-F")
  .sort((a, b) => timeOrder[a.time] - timeOrder[b.time] || a.name.localeCompare(b.name));

const allItems = [...stackItems].sort(
  (a, b) => timeOrder[a.time] - timeOrder[b.time] || a.name.localeCompare(b.name),
);

document.getElementById("dateLabel").textContent = today.toLocaleDateString(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
});

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => showView(tab.dataset.view));
});

document.getElementById("exportButton").addEventListener("click", exportBackup);
document.getElementById("resetTodayButton").addEventListener("click", resetToday);
document.getElementById("prevMonthButton").addEventListener("click", () => {
  calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
  renderHistory();
});
document.getElementById("nextMonthButton").addEventListener("click", () => {
  calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
  renderHistory();
});

if (!localStorage.getItem(firstUseDateKey)) {
  const existingDates = getExistingDailyDates();
  localStorage.setItem(firstUseDateKey, existingDates[0] || dateKey);
}
saveState(dailyStateKey, dailyState);
render();

function render() {
  renderTable(document.getElementById("todayRows"), todayItems, dailyState, dailyStateKey);
  renderTable(document.getElementById("allRows"), allItems, dailyState, dailyStateKey);
  renderWeekly();
  renderReset();
  renderHistory();
  updateSummary();
}

function renderTable(target, items, state, stateKey) {
  target.innerHTML = "";

  items.forEach((item) => {
    const id = itemId(item);
    const row = document.createElement("tr");
    if (state[id]) row.classList.add("complete");

    row.innerHTML = `
      <td class="check-cell">
        <input class="check" type="checkbox" aria-label="Mark ${item.name} complete" ${
          state[id] ? "checked" : ""
        }>
      </td>
      <td class="name">${item.name}</td>
      <td>${item.time}</td>
      <td><span class="pill">${item.category}</span></td>
      <td>${item.frequency}</td>
      <td class="notes">${item.notes}</td>
    `;

    row.querySelector("input").addEventListener("change", (event) => {
      state[id] = event.target.checked;
      saveState(stateKey, state);
      render();
    });

    target.appendChild(row);
  });
}

function renderWeekly() {
  const target = document.getElementById("weeklyRows");
  const items = stackItems.filter((item) => item.frequency === "Weekly");
  target.innerHTML = "";

  items.forEach((item) => {
    const id = itemId(item);
    const row = document.createElement("label");
    row.className = "list-row";
    row.innerHTML = `
      <input class="check" type="checkbox" ${weeklyStackState[id] ? "checked" : ""}>
      <span><strong>${item.name}</strong><span>${item.notes}</span></span>
      <span class="pill weekly">${item.time}</span>
    `;

    row.querySelector("input").addEventListener("change", (event) => {
      weeklyStackState[id] = event.target.checked;
      saveState(weeklyStackStateKey, weeklyStackState);
      render();
    });

    target.appendChild(row);
  });
}

function renderReset() {
  const target = document.getElementById("resetRows");
  target.innerHTML = "";

  resetItems.forEach((item) => {
    const id = slug(item);
    const row = document.createElement("label");
    row.className = "list-row";
    row.innerHTML = `
      <input class="check" type="checkbox" ${weeklyState[id] ? "checked" : ""}>
      <strong>${item}</strong>
      <span></span>
    `;

    row.querySelector("input").addEventListener("change", (event) => {
      weeklyState[id] = event.target.checked;
      saveState(weeklyStateKey, weeklyState);
      render();
    });

    target.appendChild(row);
  });
}

function renderHistory() {
  const grid = document.getElementById("calendarGrid");
  const monthLabel = document.getElementById("calendarMonthLabel");
  const nextButton = document.getElementById("nextMonthButton");
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const lastCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  monthLabel.textContent = calendarMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  nextButton.disabled = calendarMonth >= lastCurrentMonth;
  grid.innerHTML = "";

  for (let i = 0; i < firstDay.getDay(); i += 1) {
    const blank = document.createElement("div");
    blank.className = "calendar-blank";
    grid.appendChild(blank);
  }

  for (let dayNumber = 1; dayNumber <= lastDay.getDate(); dayNumber += 1) {
    const date = new Date(year, month, dayNumber);
    const dayKey = formatDateKey(date);
    const summary = getDaySummary(dayKey);
    const isFuture = date > today;
    const dayButton = document.createElement("button");
    dayButton.className = [
      "calendar-day",
      dayKey === dateKey ? "today" : "",
      dayKey === selectedHistoryDate ? "selected" : "",
      summary.hasRecord ? "" : "no-record",
      isFuture ? "future" : "",
    ]
      .filter(Boolean)
      .join(" ");
    dayButton.type = "button";
    dayButton.disabled = isFuture;
    dayButton.setAttribute("aria-label", `View ${formatHistoryDate(dayKey)}`);
    dayButton.innerHTML = `
      <span class="calendar-day-number">${dayNumber}</span>
      <span class="calendar-day-count">${summary.hasRecord ? `${summary.done}/${todayItems.length}` : "No record"}</span>
    `;
    dayButton.addEventListener("click", () => {
      selectedHistoryDate = dayKey;
      renderHistory();
    });
    grid.appendChild(dayButton);
  }

  renderSelectedHistoryDay();
}

function renderSelectedHistoryDay() {
  const target = document.getElementById("historyDetails");
  const summary = getDaySummary(selectedHistoryDate);

  if (!summary.hasRecord) {
    target.innerHTML = `
      <div class="history-group">
        <h3>${formatHistoryDate(selectedHistoryDate)}</h3>
        <div class="empty-state">No checklist was saved for this day.</div>
      </div>
    `;
    return;
  }

  target.innerHTML = `
    <div class="history-group">
      <h3>${formatHistoryDate(selectedHistoryDate)} - Completed ${summary.done}/${todayItems.length}</h3>
      <div class="history-items">
        ${renderHistoryChips(summary.doneItems, "None completed")}
      </div>
    </div>
    <div class="history-group">
      <h3>Missed</h3>
      <div class="history-items">
        ${renderHistoryChips(summary.missedItems, "None missed", "missed")}
      </div>
    </div>
  `;
}

function updateSummary() {
  const done = todayItems.filter((item) => dailyState[itemId(item)]).length;
  const left = todayItems.length - done;
  const next = todayItems.find((item) => !dailyState[itemId(item)]);

  document.getElementById("doneCount").textContent = done;
  document.getElementById("leftCount").textContent = left;
  document.getElementById("progressLabel").textContent = `${done}/${todayItems.length} done`;
  document.getElementById("upcomingLabel").textContent = next ? next.time : "Clear";
}

function showView(viewName) {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.view === viewName);
  });

  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("active", view.id === `${viewName}View`);
  });
}

function readState(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch {
    return {};
  }
}

function saveState(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function resetToday() {
  const shouldReset = window.confirm("Clear today's checkoffs?");
  if (!shouldReset) return;

  dailyState = {};
  saveState(dailyStateKey, dailyState);
  selectedHistoryDate = dateKey;
  render();
}

function exportBackup() {
  const savedData = {};
  Object.keys(localStorage)
    .filter(
      (key) =>
        /^daily-stack:\d{4}-\d{2}-\d{2}$/.test(key) ||
        key.startsWith("weekly-stack:") ||
        key.startsWith("weekly-reset:"),
    )
    .sort()
    .forEach((key) => {
      savedData[key] = readState(key);
    });

  const backup = {
    exportedAt: new Date().toISOString(),
    dashboard: "Daily Optimization Dashboard",
    firstUseDate: localStorage.getItem(firstUseDateKey) || dateKey,
    stackItems,
    sundayReset: resetItems,
    savedData,
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `daily-dashboard-backup-${dateKey}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function renderHistoryChips(items, emptyLabel, className = "") {
  if (!items.length) return `<span class="${className}">${emptyLabel}</span>`;

  return items
    .map((item) => `<span class="${className}">${item.time} - ${item.name}</span>`)
    .join("");
}

function formatHistoryDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDateRange(startValue, endValue) {
  const [startYear, startMonth, startDay] = startValue.split("-").map(Number);
  const [endYear, endMonth, endDay] = endValue.split("-").map(Number);
  const dates = [];
  const cursor = new Date(startYear, startMonth - 1, startDay);
  const end = new Date(endYear, endMonth - 1, endDay);

  while (cursor <= end) {
    dates.push(formatDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

function getDaySummary(dayKey) {
  const key = `daily-stack:${dayKey}`;
  const hasRecord = localStorage.getItem(key) !== null;
  const state = hasRecord ? readState(key) : {};
  const doneItems = todayItems.filter((item) => state[itemId(item)]);
  const missedItems = todayItems.filter((item) => !state[itemId(item)]);

  return {
    done: doneItems.length,
    doneItems,
    hasRecord,
    missedItems,
  };
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getExistingDailyDates() {
  return Object.keys(localStorage)
    .map((key) => key.replace("daily-stack:", ""))
    .filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(value))
    .sort();
}

function itemId(item) {
  return slug(`${item.name}-${item.time}`);
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function getWeekKey(date) {
  const start = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date - start) / 86400000);
  return `${date.getFullYear()}-${Math.ceil((days + start.getDay() + 1) / 7)}`;
}
