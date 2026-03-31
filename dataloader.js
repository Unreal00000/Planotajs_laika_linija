// ================= GLOBAL =================
let data = [];
let currentFilter = null;

const timelineContainer = document.getElementById("timelineContainer");
const relevantContainer = document.getElementById("relevantContainer");
const todayContainer = document.getElementById("todayContainer");

const todayUnixStart = Math.floor(new Date().setHours(0,0,0,0)/1000);
const todayUnixEnd = todayUnixStart + 86400;

// TAG KRĀSAS
const tagColors = {
    "skolas darbi": "purple",
    "ārpus skolas darbi": "green",
    "no tag": "black"
};

// ================= LOAD =================
document.addEventListener("DOMContentLoaded", async function () {
    await refreshFromServer();
});

// ================= REFRESH =================
window.refreshFromServer = async function () {
    const res = await fetch("/events");
    const dataRes = await res.json();

    data = dataRes.events.map(e => ({
        id: e.id,
        name: e.title,
        date: e.date,
        description: e.description,
        tag: [normalizeTag(e.tag)]
    }));

    renderAll();
};

// ================= UTILS =================
function normalizeTag(tag) {
    if (!tag) return "no tag";
    return tag.trim().toLowerCase();
}

function passesFilter(item) {
    if (!currentFilter) return true;
    return item.tag.includes(currentFilter);
}

// ================= RENDER =================
function renderAll() {
    renderTimeline();
    renderRelevant();
    renderToday();
}

// ================= TIMELINE =================
function renderTimeline() {
    timelineContainer.innerHTML = "";

    data
        .filter(e => e.date !== null && e.date !== undefined)
        .filter(passesFilter)
        .sort((a, b) => a.date - b.date)
        .forEach(item => {

            let el = document.createElement("div");

            let className = "timelineElement";

            if (item.date < todayUnixStart) className = "timelineElement_past";
            else if (item.date >= todayUnixStart && item.date < todayUnixEnd) className = "timelineElement_today";

            el.className = className;
            el.textContent = item.name;

            let dateDiv = document.createElement("div");
            dateDiv.className = "timelineElement_date";
            dateDiv.textContent = new Date(item.date * 1000).toLocaleDateString();
            el.appendChild(dateDiv);

            addTagColor(item, el);
            timelineContainer.appendChild(el);
        });
}

// ================= RELEVANT =================
function renderRelevant() {
    relevantContainer.innerHTML = "";

    data
        .filter(e => e.date === null || e.date === undefined)
        .filter(passesFilter)
        .forEach(item => {

            let el = document.createElement("div");
            el.className = "relevantElement";
            el.textContent = item.name;

            addTagColor(item, el);
            relevantContainer.appendChild(el);
        });
}

// ================= TODAY =================
function renderToday() {
    todayContainer.innerHTML = "";

    let todayEvents = data
        .filter(e => e.date !== null && e.date !== undefined)
        .filter(e => e.date >= todayUnixStart && e.date < todayUnixEnd)
        .filter(passesFilter);

    if (todayEvents.length === 0) {
        todayContainer.innerHTML = "<h2>Šodien nav notikumu</h2>";
        return;
    }

    todayEvents.forEach(item => {
        let div = document.createElement("div");

        div.innerHTML = `
            <h2>${item.name}</h2>
            <p>${item.description || ""}</p>
            <small>${new Date(item.date * 1000).toLocaleDateString()}</small>
        `;

        todayContainer.appendChild(div);
    });
}

// ================= TAG =================
function addTagColor(item, element) {
    let tagDiv = document.createElement("div");
    tagDiv.className = "tagContainer";

    item.tag.forEach(tag => {
        let t = document.createElement("div");
        t.className = "tagElement";
        t.style.backgroundColor = tagColors[tag] || tagColors["no tag"];
        tagDiv.appendChild(t);
    });

    element.appendChild(tagDiv);
}

// ================= ADD =================
window.addEvent = async function () {
    const name = prompt("Nosaukums:");
    if (!name) return;

    const dateInput = prompt("Datums (YYYY-MM-DD, tukšs = nav):");
    const description = prompt("Apraksts:");
    const tag = prompt("Tags (Skolas darbi / Ārpus skolas darbi):");

    let date = null;
    if (dateInput) date = Math.floor(new Date(dateInput).getTime() / 1000);

    await fetch("/add-event", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ title: name, date, description, tag })
    });

    refreshFromServer();
};

// ================= DELETE =================
window.deleteEvent = async function () {
    let msg = "ID:\n";
    data.forEach(e => msg += `${e.id}: ${e.name}\n`);

    const id = prompt(msg);
    if (!id) return;

    await fetch("/delete-event", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ id: parseInt(id) })
    });

    refreshFromServer();
};

// ================= EDIT (LATVISKI) =================
window.editEvent = async function () {
    let msg = "ID:\n";
    data.forEach(e => msg += `${e.id}: ${e.name}\n`);

    const id = prompt(msg);
    if (!id) return;

    const field = prompt("Ko vēlies rediģēt? (nosaukums / datums / apraksts / tags)");
    if (!field) return;

    let body = { id: parseInt(id) };

    if (field === "nosaukums") {
        const val = prompt("Jauns nosaukums:");
        if (val) body.title = val;
    }

    if (field === "datums") {
        const val = prompt("Jauns datums (YYYY-MM-DD) vai ieraksti DELETE lai dzēstu:");
        if (val === "DELETE") body.date = null;
        else if (val) body.date = Math.floor(new Date(val).getTime() / 1000);
    }

    if (field === "apraksts") {
        const val = prompt("Jauns apraksts vai DELETE:");
        if (val === "DELETE") body.description = "";
        else if (val) body.description = val;
    }

    if (field === "tags") {
        const val = prompt("Jauns tags:");
        if (val) body.tag = val;
    }

    await fetch("/edit-event", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body)
    });

    refreshFromServer();

// ================= FILTER (FIXED) =================
window.filterTag = function () {
    const input = prompt(
        "Filtrs:\n- Skolas darbi\n- Ārpus skolas darbi\n- Rādīt visus"
    );

    if (!input) {
        // tukšs → noņem filtru
        currentFilter = null;
        renderAll();
        return;
    }

    const normalized = normalizeTag(input);

    if (normalized === "rādīt visus") {
        currentFilter = null;
        renderAll();
        return;
    }

    if (normalized === "skolas darbi" || normalized === "ārpus skolas darbi") {
        currentFilter = normalized;
        renderAll();
        return;
    }

    // nepareizs ievads → neko nemaina
    alert("Nepareizs filtrs!");
};

// ================= RESET =================
window.resetFilter = function () {
    currentFilter = null;
    renderAll();
};}