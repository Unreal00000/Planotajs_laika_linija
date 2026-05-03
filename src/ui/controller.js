import {
    getEvents,
    addEventAPI,
    deleteEventAPI,
    editEventAPI,
    getTags,
    addTagAPI
} from "./data/dataloader.js";

import { renderAll } from "./renderer.js";

let data = [];
let tags = [];
let currentFilter = {
    tags: [],
    matchMode: "any",
    filterMode: "include",
    reversed: false,
    showMarkers: true,
    showPast: false
};

// ================= INIT =================

async function init() {
    // await fetch("/api/events/reset", { method: "POST" });
    await loadTags();                 // 🔥 svarīgi
    data = await getEvents();
    renderAll(data, currentFilter);
}

init();

// ================= TAG LOAD =================

async function loadTags() {
    tags = await getTags();

    const select = document.getElementById("tagSelect");
    if (!select) return;

    select.innerHTML = `<option value="">Bez taga</option>`;

    tags.forEach(tag => {
        const option = document.createElement("option");
        option.value = tag.name;
        option.textContent = tag.name;
        select.appendChild(option);
    });
}

// ================= ACTIONS =================

window.addEvent = async function () {
    const title = prompt("Nosaukums:");
    if (!title) return;

    const dateInput = prompt("Datums YYYY-MM-DD:");
    const description = prompt("Apraksts:");

    let date = null;
    if (dateInput) date = dateInput;

    // 🔥 TAG IZVĒLE
    let selectedTags = [];

    let message = "Izvēlies tagus (atdali ar '/'):\n";

    tags.forEach((t, i) => {
        message += `${i + 1} - ${t.name}\n`;
    });

    message += "0 - Bez taga";

    const choice = prompt(message);

    if (choice !== null) {
        const input = choice.trim();

        if (input === "0") {
            selectedTags = [];
        } else {
            const choices = input.split("/").map(c => c.trim());

            selectedTags = choices
                .map(c => {
                    const index = parseInt(c);
                    if (!isNaN(index) && index > 0 && index <= tags.length) {
                        return tags[index - 1].name;
                    }
                    return null;
                })
                .filter(Boolean);
        }
    } else {
        selectedTags = [];
    }

    //console.log(selectedTags);
    await addEventAPI({ title, date, description, tags: selectedTags });
    await refresh();
};

// ================= DELETE =================

window.deleteEvent = async function (id) {
    await deleteEventAPI(id);
    await refresh();
};

// ================= EDIT =================

window.editEvent = async function (id) {
    const event = data.find(e => e.id === id);

    const title = prompt("Jauns nosaukums:", event.title);
    if (!title) return;

    const date = prompt("Jauns datums YYYY-MM-DD:", event.date || "");
    const description = prompt("Jauns apraksts:", event.description || "");

    let selectedTags = [];

    let message = "Izvēlies jaunus tagus (atdali ar '/'):\n";

    tags.forEach((t, i) => {
        message += `${i + 1} - ${t.name}\n`;
    });

    message += "0 - Bez taga";

    const indices = event.tags
        .map(tagName => {
            const index = tags.findIndex(t => t.name === tagName);
            return index !== -1 ? index + 1 : null;
        })
        .filter(Boolean)
        .join("/");

    const choice = prompt(message, indices || "");

    if (choice !== null) {
        const input = choice.trim();

        if (input === "0") {
            selectedTags = [];
        } else {
            const choices = input.split("/").map(c => c.trim());

            selectedTags = choices
                .map(c => {
                    const index = parseInt(c);
                    if (!isNaN(index) && index > 0 && index <= tags.length) {
                        return tags[index - 1].name;
                    }
                    return null;
                })
                .filter(Boolean);
        }
    } else {
        selectedTags = [];
    }

    await editEventAPI({
        id,
        title,
        date: date || null,
        description: description || null,
        tags: selectedTags
    });

    await refresh();
};

// ================= FILTER =================

window.filterTag = function () {
    // ================= STEP 1: SELECT TAGS =================
    let message = "Izvēlies tagus (atdali ar '/'):\n";
    tags.forEach((t, i) => {
        message += `${i + 1} - ${t.name}\n`;
    });
    message += "\nAtstāj tukšu, lai izlaistu tagu filtru";

    const tagChoice = prompt(message);
    if (tagChoice === null) return;

    const selectedTags = tagChoice.trim() === ""
        ? []
        : tagChoice.split("/").map(c => {
            const index = parseInt(c.trim()) - 1;
            return tags[index]?.name || null;
        }).filter(Boolean);

    // ================= STEP 2: MATCH MODE =================
    let matchMode = "any";
    if (selectedTags.length > 0) {
        const matchChoice = prompt("Atbilstības režīms:\n1 - Vismaz viens tags (noklusējums)\n2 - Visi tagi\n3 - Precīza atbilstība");
        if (matchChoice === null) return;
        if (matchChoice === "2") matchMode = "all";
        if (matchChoice === "3") matchMode = "exact";
    }

    // ================= STEP 3: INCLUDE / EXCLUDE =================
    let filterMode = "include";
    if (selectedTags.length > 0) {
        const includeChoice = prompt("Filtra režīms:\n1 - Iekļaut notikumus ar šiem tagiem (noklusējums)\n2 - Izslēgt notikumus ar šiem tagiem");
        if (includeChoice === null) return;
        if (includeChoice === "2") filterMode = "exclude";
    }

    // ================= STEP 4: ORDER DIRECTION =================
    const orderChoice = prompt("Secība:\n1 - Normāla (noklusējums)\n2 - Apgriezta");
    if (orderChoice === null) return;
    const reversed = orderChoice === "2";

    // ================= STEP 5: EMPTY DAY MARKERS =================
    const markersChoice = prompt("Tukšās dienas:\n1 - Rādīt (noklusējums)\n2 - Slēpt");
    if (markersChoice === null) return;
    const showMarkers = markersChoice !== "2";

    // ================= STEP 6: PAST EVENTS =================
    const pastChoice = prompt("Pagātnes notikumi:\n1 - Slēpt (noklusējums)\n2 - Rādīt");
    if (pastChoice === null) return;
    const showPast = pastChoice === "2";

    // ================= APPLY =================
    currentFilter = {
        tags: selectedTags,
        matchMode,
        filterMode,
        reversed,
        showMarkers,
        showPast
    };

    renderAll(data, currentFilter);
};

// ================= RESET FILTER =================

window.resetFilter = function () {
    currentFilter = {
        tags: [],
        matchMode: "any",
        filterMode: "include",
        reversed: false,
        showMarkers: true,
        showPast: false
    };
    renderAll(data, currentFilter);
};

// ================= CREATE TAG =================

window.createTag = async function () {
    const name = prompt("Jaunā taga nosaukums:");
    if (!name) return;

    await addTagAPI(name);
    await loadTags();
};

// ================= REFRESH =================

async function refresh() {
    data = await getEvents();
    renderAll(data, currentFilter);
}