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
let currentFilter = null;

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
    let tag = null;

    let message = "Izvēlies tagu:\n";

    tags.forEach((t, i) => {
        message += `${i + 1} - ${t.name}\n`;
    });

    message += "0 - Bez taga";

    const choice = prompt(message);

    if (choice !== null) {
        const index = parseInt(choice);

        if (index === 0) {
            tag = null;
        } else if (index > 0 && index <= tags.length) {
            tag = tags[index - 1].name;
        }
    }

    await addEventAPI({ title, date, description, tag });
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

    let tag = null;

    let message = "Izvēlies jaunu tagu:\n";

    tags.forEach((t, i) => {
        message += `${i + 1} - ${t.name}\n`;
    });

    message += "0 - Bez taga";

    const choice = prompt(message);

    if (choice !== null) {
        const index = parseInt(choice);

        if (index === 0) {
            tag = null;
        } else if (index > 0 && index <= tags.length) {
            tag = tags[index - 1].name;
        }
    }

    await editEventAPI({
        id,
        title,
        date: date || null,
        description: description || null,
        tag
    });

    await refresh();
};

// ================= FILTER =================

window.filterTag = function () {
    let message = "Izvēlies tagu:\n";

    tags.forEach((t, i) => {
        message += `${i + 1} - ${t.name}\n`;
    });

    message += "0 - Visi";

    const choice = prompt(message);

    if (choice === "0") {
        currentFilter = null;
    } else {
        const index = parseInt(choice) - 1;
        currentFilter = tags[index]?.name || null;
    }

    renderAll(data, currentFilter);
};

// ================= RESET FILTER =================

window.resetFilter = function () {
    currentFilter = null;
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