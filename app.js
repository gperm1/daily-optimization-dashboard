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
const dateKey = today.toISOString().slice(0, 10);
const weekKey = getWeekKey(today);

const dailyStateKey = `daily-stack:${dateKey}`;
const weeklyStackStateKey = `weekly-stack:${weekKey}`;
const weeklyStateKey = `weekly-reset:${weekKey}`;
let dailyState = readState(dailyStateKey);
let weeklyStackState = readState(weeklyStackStateKey);
let weeklyState = readState(weeklyStateKey);

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

render();

function render() {
  renderTable(document.getElementById("todayRows"), todayItems, dailyState, dailyStateKey);
  renderTable(document.getElementById("allRows"), allItems, dailyState, dailyStateKey);
  renderWeekly();
  renderReset();
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
