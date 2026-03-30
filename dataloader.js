// ================= GLOBAL =================
let data = [];

const timelineContainer = document.getElementById("timelineContainer");
const relevantContainer = document.getElementById("relevantContainer");
const todayContainer = document.getElementById("todayContainer");

const todayUnix = Math.floor(Date.now() / 1000);

// TAG KRĀSAS
const tagColors = {
    "Skolas darbi": "purple",
    "Ārpus skolas darbi": "green",
    "No tag": "black"
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
        tag: [e.tag]
    }));

    renderAll();
};

// ================= RENDER =================
function renderAll(filterTags = null) {
    renderTimeline(filterTags);
    renderRelevant(filterTags);
    renderToday(filterTags);
}

// ================= TIMELINE =================
function renderTimeline(filterTags) {
    timelineContainer.innerHTML = "";

    let filtered = filterData(filterTags);

    filtered
        .filter(e => e.date)
        .sort((a, b) => a.date - b.date)
        .forEach(item => {

            let el = document.createElement("div");

            let className = "timelineElement";

            if (item.date < todayUnix) className = "timelineElement_past";
            else if (Math.abs(item.date - todayUnix) < 86400) className = "timelineElement_today";

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
function renderRelevant(filterTags) {
    relevantContainer.innerHTML = "";

    let filtered = filterData(filterTags);

    filtered.forEach(item => {
        let el = document.createElement("div");
        el.className = "relevantElement";
        el.textContent = item.name;

        addTagColor(item, el);

        relevantContainer.appendChild(el);
    });
}

// ================= TODAY =================
function renderToday(filterTags) {
    todayContainer.innerHTML = "";

    let filtered = filterData(filterTags);

    let todayEvents = filtered.filter(e =>
        e.date && Math.abs(e.date - todayUnix) < 86400
    );

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
        t.style.backgroundColor = tagColors[tag] || tagColors["No tag"];
        tagDiv.appendChild(t);
    });

    element.appendChild(tagDiv);
}

// ================= FILTER =================
function filterData(filterTags) {
    if (!filterTags) return data;

    return data.filter(item =>
        item.tag.some(tag => filterTags.includes(tag))
    );
}

// ================= BUTTON FUNCTIONS =================
window.addEvent = async function () {
    const name = prompt("Nosaukums:");
    const dateInput = prompt("Datums (YYYY-MM-DD):");
    const description = prompt("Apraksts:");
    const tag = prompt("Tags (Skolas darbi / Ārpus skolas darbi):");

    if (!name || !dateInput) return;

    const date = Math.floor(new Date(dateInput).getTime() / 1000);

    await fetch("/add-event", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ title: name, date, description, tag })
    });

    refreshFromServer();
};

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

window.editEvent = async function () {
    let msg = "ID:\n";
    data.forEach(e => msg += `${e.id}: ${e.name}\n`);

    const id = prompt(msg);
    if (!id) return;

    const name = prompt("Jauns nosaukums:");
    const dateInput = prompt("Jauns datums (YYYY-MM-DD):");
    const description = prompt("Jauns apraksts:");
    const tag = prompt("Tags:");

    const date = Math.floor(new Date(dateInput).getTime() / 1000);

    await fetch("/edit-event", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            id: parseInt(id),
            title: name,
            date,
            description,
            tag
        })
    });

    refreshFromServer();
};

window.filterTag = function () {
    const tag = prompt("Filtrs (Skolas darbi / Ārpus skolas darbi):");
    if (!tag) return;

    renderAll([tag]);
};