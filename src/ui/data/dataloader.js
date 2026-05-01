// ================= LOAD DATA =================
export async function getEvents() {
    try {
        const res = await fetch("/api/events/");

        if (!res.ok) {
            console.error("GET events failed:", res.status);
            return [];
        }

        const data = await res.json();
        return Array.isArray(data.events) ? data.events : [];

    } catch (err) {
        console.error("Network error (GET events):", err);
        return [];
    }
}

// ================= ADD EVENT =================
export async function addEventAPI(body) {
    try {
        const res = await fetch("/api/events/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("Add event failed:", res.status, text);
        }

    } catch (err) {
        console.error("Network error (ADD event):", err);
    }
}

// ================= DELETE EVENT =================
export async function deleteEventAPI(id) {
    try {
        const res = await fetch("/api/events/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("Delete event failed:", res.status, text);
        }

    } catch (err) {
        console.error("Network error (DELETE event):", err);
    }
}

// ================= EDIT EVENT =================
export async function editEventAPI(body) {
    try {
        const res = await fetch("/api/events/edit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("Edit event failed:", res.status, text);
        }

    } catch (err) {
        console.error("Network error (EDIT event):", err);
    }
}

// ================= TAGS (no pārinieka idejas, bet tīri API) =================

// GET all tags
export async function getTags() {
    try {
        const res = await fetch("/api/events/tags");
        const data = await res.json();

        return Array.isArray(data.tags) ? data.tags : [];

    } catch (err) {
        console.error("GET tags failed:", err);
        return [];
    }
}

// ADD tag
export async function addTagAPI(name) {
    try {
        await fetch("/api/events/tags/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name })
        });
    } catch (err) {
        console.error("ADD tag failed:", err);
    }
}