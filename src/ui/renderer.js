const timelineContainer = document.getElementById("timelineContainer");
const relevantContainer = document.getElementById("relevantContainer");
const todayContainer = document.getElementById("todayContainer");

// ================= TAG COLORS (random per tag) =================
const tagColorMap = {};

function getTagColor(tag) {
    if (!tag) return "black";

    const normalized = tag.toLowerCase();

    if (!tagColorMap[normalized]) {
        tagColorMap[normalized] =
            "#" + Math.floor(Math.random() * 16777215).toString(16);
    }

    return tagColorMap[normalized];
}

// ================= FILTER =================
function passesFilter(item, filter) {
    if (!filter) return true;
    return (item.tag || "").toLowerCase() === filter.toLowerCase();
}

// ================= DATE HELPERS =================
function getTodayBounds() {
    const now = new Date();

    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return {
        start: start.getTime(),
        end: end.getTime()
    };
}

function getStatusClass(date) {
    if (!date) return "timelineElement";

    const { start, end } = getTodayBounds();
    const d = new Date(date).getTime();

    if (d < start) return "timelineElement_past";
    if (d >= start && d < end) return "timelineElement_today";

    return "timelineElement";
}

// ================= CARD BUILDER =================
function createCard(item) {

    const card = document.createElement("div");

    // STATUS (background)
    card.className = getStatusClass(item.date);

    // ================= TOP (TAG COLOR STRIP) =================
    const tagStrip = document.createElement("div");
    tagStrip.className = "tagContainer";

    const tagBlock = document.createElement("div");
    tagBlock.className = "tagElement";
    tagBlock.style.backgroundColor = getTagColor(item.tag);

    tagStrip.appendChild(tagBlock);
    card.appendChild(tagStrip);

    // ================= TITLE =================
    const title = document.createElement("div");
    title.className = "timelineElement_name";
    title.textContent = item.title;

    // ================= DATE =================
    const date = document.createElement("div");
    date.className = "timelineElement_date";
    date.textContent = item.date
        ? new Date(item.date).toLocaleDateString()
        : "";

    card.appendChild(title);
    card.appendChild(date);

    // ================= ACTIONS =================
    card.onclick = () => {
        const action = prompt("1 - Dzēst\n2 - Rediģēt");

        if (action === "1") {
            deleteEvent(item.id);
        } else if (action === "2") {
            editEvent(item.id);
        }
    };

    return card;
}

// ================= MAIN RENDER =================
export function renderAll(data, filter) {
    renderTimeline(data, filter);
    renderRelevant(data, filter);
    renderToday(data, filter);
}

// ================= TIMELINE =================
function renderTimeline(data, filter) {
    timelineContainer.innerHTML = "";

    data
        .filter(e => e.date)
        .filter(e => passesFilter(e, filter))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .forEach(item => {
            timelineContainer.appendChild(createCard(item));
        });
}

// ================= RELEVANT =================
function renderRelevant(data, filter) {
    relevantContainer.innerHTML = "";

    data
        .filter(e => !e.date)
        .filter(e => passesFilter(e, filter))
        .forEach(item => {
            relevantContainer.appendChild(createCard(item));
        });
}

// ================= TODAY =================
function renderToday(data, filter) {
    todayContainer.innerHTML = "";

    const todayString = new Date().toISOString().split("T")[0];

    const todayEvents = data.filter(e =>
        e.date &&
        e.date === todayString &&
        passesFilter(e, filter)
    );

    // 🔥 Virsraksts
    const title = document.createElement("h2");
    title.textContent = "Šodienas notikumi";
    title.style.textAlign = "center";
    todayContainer.appendChild(title);

    // Ja nav notikumu
    if (todayEvents.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "Nav notikumu";
        empty.style.textAlign = "center";
        todayContainer.appendChild(empty);
        return;
    }

    // 🔥 Notikumu saraksts (bez kastītēm)
    todayEvents.forEach(item => {
        const wrapper = document.createElement("div");

        // nosaukums (centrēts)
        const name = document.createElement("div");
        name.textContent = item.title;
        name.style.textAlign = "center";
        name.style.fontWeight = "bold";
        name.style.marginTop = "10px";

        wrapper.appendChild(name);

        // apraksts (pa kreisi)
        if (item.description) {
            const desc = document.createElement("div");
            desc.textContent = item.description;
            desc.style.textAlign = "left";
            desc.style.margin = "5px 10px";

            wrapper.appendChild(desc);
        }

        todayContainer.appendChild(wrapper);
    });
}