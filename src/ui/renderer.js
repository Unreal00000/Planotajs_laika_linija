//await fetch("/api/events/reset", { method: "POST" });

const timelineContainer = document.getElementById("timelineContainer");
const relevantContainer = document.getElementById("relevantContainer");
const todayContainer = document.getElementById("todayContainer");
const todayContainer_sub = document.getElementById("todayContainer_sub");

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

// ================= TAG COLORS =================
const defaultTagColors = {
    "no tag": "rgb(0, 0, 0)",
    "tag_1": "rgb(255, 0, 0)",
    "tag_2": "rgb(0, 166, 255)",
    "tag_3": "rgb(102, 0, 255)",
};

const tagColorMap = (() => {
    try {
        const saved = localStorage.getItem("tagColorMap");
        return saved ? { ...JSON.parse(saved), ...defaultTagColors } : { ...defaultTagColors };
    } catch {
        return { ...defaultTagColors };
    }
})();

function saveTagColorMap() {
    try {
        localStorage.setItem("tagColorMap", JSON.stringify(tagColorMap));
    } catch {
        console.warn("Could not save tag colors to localStorage");
    }
}

function getTagColor(tag) {
    if (!tag) return tagColorMap["no tag"] || "rgb(0, 0, 0)";

    const normalized = tag.toLowerCase();

    if (!tagColorMap[normalized]) {
        // Generate random color for unknown tags and persist it
        tagColorMap[normalized] = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
        saveTagColorMap();
    }

    return tagColorMap[normalized];
}

// ================= FILTER =================
function passesFilter(item, filter) {
    if (!filter || filter.tags.length === 0) return true;

    const itemTags = Array.isArray(item.tags) ? item.tags : item.tags ? [item.tags] : [];
    const normalizedItem = itemTags.map(t => t.toLowerCase());
    const normalizedFilter = filter.tags.map(t => t.toLowerCase());

    const matches = filter.matchMode === "all"
        ? normalizedFilter.every(t => normalizedItem.includes(t))
        : filter.matchMode === "exact"
            ? normalizedFilter.length === normalizedItem.length &&
            normalizedFilter.every(t => normalizedItem.includes(t))
            : normalizedFilter.some(t => normalizedItem.includes(t));

    return filter.filterMode === "exclude" ? !matches : matches;
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

    // const tagBlock = document.createElement("div");
    // tagBlock.className = "tagElement";
    // tagBlock.style.backgroundColor = getTagColor(item.tag);

    const tags = Array.isArray(item.tags) ? item.tags : item.tags ? [item.tags] : [];

    if (tags.length === 0) {
        const tagBlock = document.createElement("div");
        tagBlock.className = "tagElement";
        tagBlock.style.backgroundColor = getTagColor(null); // returns "no tag" color
        tagStrip.appendChild(tagBlock);
    } else {
        tags.forEach(tag => {
            const tagBlock = document.createElement("div");
            tagBlock.className = "tagElement";
            tagBlock.style.backgroundColor = getTagColor(tag);
            tagStrip.appendChild(tagBlock);
        });
    }

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
    //localStorage.clear()
    renderTimeline(data, filter);
    renderRelevant(data, filter);
    renderToday(data, filter);
}

// ================= TIMELINE =================
function renderTimeline(data, filter) {
    if (firstTime_T) {
        timelineContainer.addEventListener('wheel', transformScroll);
        firstTime_T = false;
    }

    timelineContainer.innerHTML = "";
    todayTaskBox = [];

    const showPast    = !filter || filter.showPast    !== false ? true  : filter.showPast;
    const showMarkers = !filter || filter.showMarkers !== false ? true  : filter.showMarkers;
    const reversed    = !filter || filter.reversed    !== true  ? false : filter.reversed;

    const [data_t] = separateAndSortData(data);
    let days = getCalendarDays(data_t);

    data_t
        .filter(e => passesFilter(e, filter))
        .forEach(item => {
            const itemUnix = Math.floor(new Date(item.date).getTime() / 1000);

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

    if (reversed) days.reverse();

    days.forEach(item => {
        if (typeof item === "number") {
            // skip past day markers if showPast is false
            if (!showPast && item < todayUnix) return;
            // skip empty markers if showMarkers is false
            if (!showMarkers) return;

            const marker = document.createElement("div");
            const title = document.createElement("div");
            title.className = "timelineElement_name";
            title.textContent = new Date(item * 1000).toString().slice(0, 15);
            marker.style.fontWeight = "normal";
            marker.style.fontSize = "16px";

            if (item < todayUnix) marker.className = "timelineElement_past";
            else if (item === todayUnix) {
                marker.className = "timelineElement_today";
                todayTaskBox.push(marker);
            }
            else marker.className = "timelineElement";

            marker.appendChild(title);
            timelineContainer.appendChild(marker);
        } else {
            // skip past events if showPast is false
            const itemUnix = Math.floor(new Date(item.date).getTime() / 1000);
            if (!showPast && itemUnix < todayUnix) return;

            const card = createCard(item);
            card.style.width = "20%";

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
        relevantContainer.addEventListener('wheel', transformScroll);
        firstTime_R = false;
    }

    relevantContainer.innerHTML = "";

    const reversed = filter?.reversed === true;

    let items = data
        .filter(e => !e.date)
        .filter(e => passesFilter(e, filter));

    if (reversed) items.reverse();

    items.forEach(item => {
        relevantContainer.appendChild(createCard(item));
    });
}

// ================= TODAY =================
function renderToday(data, filter) {
    Array.from(todayContainer.children).forEach(child => {
        if (child !== todayContainer_sub) {
            todayContainer.removeChild(child);
        }
    });
    todayContainer_sub.innerHTML = "";

    const todayString = new Date().toISOString().split("T")[0];

    const todayEvents = data.filter(e =>
        e.date &&
        e.date === todayString &&
        passesFilter(e, filter)
    );

    // ================= BLANK =================
    function addBlank(sub) {
        const blank = document.createElement("div");
        blank.className = "todayElement_blank";

        if (sub) {
            todayContainer_sub.appendChild(blank);
        } else {
            blank.style.height = "1%"
            todayContainer.appendChild(blank);
        }

    }

    // ================= HEADER =================
    function addHeader(text, tags = []) {
        const TDE_H = document.createElement("div");
        TDE_H.className = "todayElement_headerContainer";

        function addDecor(bool) {
            const D1 = document.createElement("div");
            D1.className = "todayDecoration_1";

            const usedTags = [];
            const tagsArray = bool ? [...tags] : [...tags].reverse();

            if (tagsArray.length > 0) {
                tagsArray.forEach(tag => {
                    if (usedTags.includes(tag)) return;

                    const color = getTagColor(tag);
                    if (color) {
                        const TE = document.createElement("div");
                        TE.className = "tagElement";
                        TE.style.backgroundColor = color;
                        D1.appendChild(TE);
                    }

                    usedTags.push(tag);
                });
            } else {
                D1.style.backgroundColor = getTagColor(null);
            }

            TDE_H.appendChild(D1);
        }

        addDecor(true);

        const TDE_HC = document.createElement("div");
        TDE_HC.textContent = text;
        TDE_HC.className = "todayElement_header";
        TDE_H.appendChild(TDE_HC);

        addDecor(false);
        todayContainer_sub.appendChild(TDE_H);
    }

    // ================= RENDER =================
    //addBlank(false);
    addBlank(true);

    const title = document.createElement("h2");
    title.style.textAlign = "center";
    title.style.fontSize = "xx-large"

    if (todayEvents.length === 0) {
        title.textContent = "Šodien notikumu nav!";
        todayContainer.appendChild(title);
        return;
    } else {
        title.textContent = "Šodienas notikumi:";
        todayContainer.appendChild(title);
    }

    todayEvents.forEach(item => {
        addHeader(item.title, Array.isArray(item.tags) ? item.tags : item.tags ? [item.tags] : []);

        if (item.description && item.description.length > 0) {
            const TDE_T = document.createElement("div");
            TDE_T.textContent = item.description;
            TDE_T.className = "todayElement_text";
            todayContainer_sub.appendChild(TDE_T);
        }

        addBlank(true);
    });
}