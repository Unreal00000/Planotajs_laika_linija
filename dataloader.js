// ================= GLOBAL =================
const demoData = [
    {"name":"KD programmēšanā","date":1773798400,"tag":["Kontroldarbs"],"description":"Jāpabeidz projekts ar gatavām testējamām funkcijām!"},
    {"name":"KD matemātikā","date":1773898400,"tag":["Kontroldarbs", "Mājas darbs", "Skola"],"description":"Atvasināšana, funkcijas ekstrēmu noteikšana. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. "},
    {"name":"Literatūra, pērļu zvejnieks","date":null,"tag":["Mājas darbs"],"description":"Pabeigt lasīt 'Pērļu zvejnieku'"},
    {"name":"Pica!","date":1774017582,"tag":[],"description":"Picas ballīte piektdienā!"},
    {"name":"ZPD aizstāvēšana","date":1773352800,"tag":["Skola"],"description":""},
    {"name":"Kamermūzikas vakars","date":null,"tag":["Mājas darbs","Skola"],"description":"Gatavoties kamermūzikas vakaram."},
]

const demoColors = {
    "no tag":"rgb(0, 0, 0)", // "No tag" nav pievienojams vai nodzēšams, bet tā krāsa ir rediģējama
    "kontroldarbs":"rgb(255,0,0)",
    "mājas darbs":"rgb(0,166,255)",
    "skola":"rgb(102,0,255)",
    "skolas darbi": "rgb(102,0,255)",
    "ārpus skolas darbi": "rgb(255,0,0)",
}

let data = {}
let currentFilter = null

const tagColors = demoColors

const timelineContainer = document.getElementById("timelineContainer");
const relevantContainer = document.getElementById("relevantContainer");
const todayContainer = document.getElementById("todayContainer");

const todayUnixStart = Math.floor(new Date().setHours(0,0,0,0)/1000);
const todayUnixEnd = todayUnixStart + 86400;

// ================= LOAD =================
document.addEventListener("DOMContentLoaded", async function () {
    try {
        await refreshFromServer();

        // If server returned nothing, seed with demo data
        if (data.length === 0) {
            await seedDemoData();
        }
    } catch (e) {
        // Server unreachable — fall back to demo data locally
        data = demoData;
        renderAll();
    }
});

async function seedDemoData() {
    const promises = demoData.map(item =>
        fetch("/add-event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: item.name,
                date: item.date,
                description: item.description,
                tag: item.tag[0] ?? null  // server expects a single tag string, not an array
            })
        })
    );

    await Promise.all(promises);
    await refreshFromServer();
}

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

    // Build calendar days array (like calendarDays in loadTimeline)
    let days = data
        .filter(e => e.date !== null && e.date !== undefined)
        .map(e => e.date)
        .sort((a, b) => a - b);

    // Insert events into days (merging tasks into day slots)
    data
        .filter(e => e.date !== null && e.date !== undefined)
        .filter(passesFilter)
        .forEach(item => {
            var index = days.findIndex(day => typeof day === "number" && day <= item.date && (day + 86400) > item.date);
            if (index !== -1) {
                days[index] = item;
            } else {
                index = days.findIndex(day => typeof day === "object" && day.date <= item.date && (day.date + 86400) > item.date);
                if (index !== -1) {
                    days.splice(index + 1, 0, item);
                }
            }
        });

    days.forEach(item => {
        let TLE = document.createElement("div");
        TLE.className = "timelineElement";
        var itemType;
        var position;

        if (typeof item === "object") {
            let text = new Date(item.date * 1000).toString().slice(0, 15);

            let TLE_N = document.createElement("div");  // name wrapper
            TLE_N.className = "timelineElement_name";
            TLE_N.textContent = item.name;

            let TLE_D = document.createElement("div");
            TLE_D.textContent = text;
            TLE_D.className = "timelineElement_date";

            TLE.style.width = "20%";
            TLE.appendChild(TLE_N);
            TLE.appendChild(TLE_D);
            // addTagColor appends last, as before
            itemType = "task";
        } else if (typeof item === "number") {
            // Day marker element
            let text = new Date(item * 1000).toString().slice(0, 15);
            TLE.textContent = text;
            TLE.style.fontWeight = "normal";
            TLE.style.fontSize = "16px";
            itemType = "day";
        }

        // Determine past / today position
        if (itemType === "task") {
            addTagColor(item, TLE);
            if (item.date < todayUnixStart) {
                position = "past";
            } else if (item.date >= todayUnixStart && item.date < todayUnixEnd) {
                position = "today";
            }
        } else if (itemType === "day") {
            if (item < todayUnixStart) {
                position = "past";
            } else if (item === todayUnixStart) {
                position = "today";
            }
        }

        // Apply class based on position
        if (position === "past") {
            TLE.className = "timelineElement_past";
        } else if (position === "today") {
            TLE.className = "timelineElement_today";
            // Scroll today into view
            requestAnimationFrame(() => {
                timelineContainer.scrollLeft = TLE.offsetLeft - timelineContainer.clientWidth / 4 + TLE.clientWidth / 2;
            });
        }

        timelineContainer.appendChild(TLE);
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

    let body = {id: parseInt(id)};

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
}
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
}