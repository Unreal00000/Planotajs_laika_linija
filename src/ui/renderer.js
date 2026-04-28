const timelineContainer = document.getElementById("timelineContainer");
const relevantContainer = document.getElementById("relevantContainer");
const todayContainer = document.getElementById("todayContainer");

const tagColors = {
    "skolas darbi": "purple",
    "ārpus skolas darbi": "green",
    "no tag": "black"
};

export function renderAll(data, filter) {
    renderTimeline(data, filter);
    renderRelevant(data, filter);
    renderToday(data, filter);
}

// ================= FILTER =================

function passesFilter(item, filter) {
    if (!filter) return true;
    return (item.tag || "").toLowerCase() === filter.toLowerCase();
}

function normalizeTag(tag) {
    if (!tag) return "no tag";
    return tag.trim().toLowerCase();
}

// ================= TIMELINE =================

function renderTimeline(data, filter) {
    timelineContainer.innerHTML = "";

    data
        .filter(e => e.date)
        .filter(e => passesFilter(e, filter))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .forEach(item => {
            let el = document.createElement("div");

            el.innerHTML = `
                <strong>${item.title}</strong>
                <div>${new Date(item.date).toLocaleDateString()}</div>
                <div>${item.description || ""}</div>
                <button onclick="deleteEvent(${item.id})">❌</button>
                <button onclick="editEvent(${item.id})">✏️</button>
            `;

            addTag(item, el);
            timelineContainer.appendChild(el);
        });
}

// ================= RELEVANT =================

function renderRelevant(data, filter) {
    relevantContainer.innerHTML = "";

    data
        .filter(e => !e.date)
        .filter(e => passesFilter(e, filter))
        .forEach(item => {
            let el = document.createElement("div");

            el.innerHTML = `
                <strong>${item.title}</strong>
                <div>${item.description || ""}</div>
                <button onclick="deleteEvent(${item.id})">❌</button>
                <button onclick="editEvent(${item.id})">✏️</button>
            `;

            addTag(item, el);
            relevantContainer.appendChild(el);
        });
}

// ================= TODAY =================

function renderToday(data, filter) {
    todayContainer.innerHTML = "";

    const todayString = new Date().toISOString().split("T")[0];

    const today = data.filter(e =>
        e.date &&
        e.date === todayString &&
        passesFilter(e, filter)
    );

    if (today.length === 0) {
        todayContainer.innerHTML = "<h2>Šodien nav notikumu</h2>";
        return;
    }

    today.forEach(item => {
        let div = document.createElement("div");
        div.innerHTML = `<h2>${item.title}</h2><p>${item.description || ""}</p>`;
        todayContainer.appendChild(div);
    });
}

// ================= TAGS =================

function addTag(item, el) {
    let tag = normalizeTag(item.tag);

    let div = document.createElement("div");
    div.textContent = tag;

    div.style.background = tagColors[tag] || "black";
    div.style.color = "white";
    div.style.padding = "2px 6px";
    div.style.marginTop = "5px";
    div.style.display = "inline-block";
    div.style.borderRadius = "5px";
    div.style.fontSize = "12px";

    el.appendChild(div);
}