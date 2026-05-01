const timelineContainer = document.getElementById("timelineContainer");
const relevantContainer = document.getElementById("relevantContainer");
const todayContainer = document.getElementById("todayContainer");

const daysPast = 365;
const daysFuture = 365;
const today = new Date();
today.setHours(0, 0, 0, 0);
const todayUnix = Math.floor(today.getTime() / 1000);

let firstTime_T = true
let firstTime_R = true

let todayTaskBox = []

function generateDays(daysPast, daysFuture) {
    const result = [];
    for (let i = -daysPast; i <= daysFuture; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        result.push(Math.floor(d.getTime() / 1000));
    }
    return result;
}

function getCalendarDays(data) {
    let past = daysPast;
    let future = daysFuture;

    data.filter(item => item.date).forEach(item => {
        const itemUnix = Math.floor(new Date(item.date).getTime() / 1000);
        const diffDays = Math.ceil((itemUnix - todayUnix) / 86400);

        if (diffDays < -past) past = Math.abs(diffDays);
        if (diffDays > future) future = diffDays;
    });

    return generateDays(past, future);
}

function separateAndSortData(data) {
    const data_t = data.filter(item => item.date);
    const data_r = data.filter(item => !item.date);
    data_t.sort((a, b) => a.date - b.date);
    return [data_t, data_r];
}

function transformScroll(event) {
    if (!event.deltaY) {
        return
    }

    event.currentTarget.scrollLeft += event.deltaY + event.deltaX
    event.preventDefault()
}

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
    if (!date) return "relevantElement";

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
    if (firstTime_T) {
        timelineContainer.addEventListener('wheel', transformScroll)
        firstTime_T = false
    }

    timelineContainer.innerHTML = "";
    todayTaskBox = [];

    const [data_t] = separateAndSortData(data);
    let days = getCalendarDays(data_t);

    data_t
        .filter(e => passesFilter(e, filter))
        .forEach(item => {
            const itemUnix = Math.floor(new Date(item.date).getTime() / 1000); // convert here

            const index = days.findIndex(day =>
                typeof day === "number" &&
                day <= itemUnix &&
                (day + 86400) > itemUnix
            );

            if (index !== -1) {
                days[index] = item;
            } else {
                const index2 = days.findIndex(day =>
                    typeof day === "object" &&
                    Math.floor(new Date(day.date).getTime() / 1000) <= itemUnix &&
                    (Math.floor(new Date(day.date).getTime() / 1000) + 86400) > itemUnix
                );
                if (index2 !== -1) {
                    days.splice(index2 + 1, 0, item);
                }
            }
        });

    days.forEach(item => {
        if (typeof item === "number") {
            const marker = document.createElement("div");
            marker.textContent = new Date(item * 1000).toString().slice(0, 15);
            marker.style.fontWeight = "normal";
            marker.style.fontSize = "16px";

            if (item < todayUnix) marker.className = "timelineElement_past";
            else if (item === todayUnix) marker.className = "timelineElement_today";
            else marker.className = "timelineElement";

            timelineContainer.appendChild(marker);
        } else {
            const card = createCard(item);

            card.style.width = "20%"

            const itemUnix = Math.floor(new Date(item.date).getTime() / 1000);
            if (itemUnix >= todayUnix && itemUnix < todayUnix + 86400) {
                todayTaskBox.push(card);
            }

            timelineContainer.appendChild(card);
        }
    });

    if (todayTaskBox.length > 0) {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                timelineContainer.scrollLeft =
                    todayTaskBox[0].offsetLeft -
                    timelineContainer.clientWidth / 4 +
                    todayTaskBox[0].clientWidth / 2;
            });
        });
    }
}

// ================= RELEVANT =================
function renderRelevant(data, filter) {
    if (firstTime_R) {
        relevantContainer.addEventListener('wheel', transformScroll)
        firstTime_R = false
    }

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