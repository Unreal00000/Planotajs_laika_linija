// dati laika līnijai un aktuālajiem notikumiem
async function loadDataFromServer() {
    try {
        const res = await fetch("/events");
        const data = await res.json();

        // sadala notikumus ar datumu un bez datuma
        var data_TR = seperateAndSortData(
            data.events.map(ev => ({
                name: ev.name,
                date: ev.date ? new Date(ev.date) : null, // ja ir datums
                tag: ev.tag || [],
                description: ev.description || ""
            }))
        );
        return data_TR;
    } catch (err) {
        console.error("Neizdevās ielādēt datus no servera:", err);
        return [[], []];
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    const data_TR = await loadDataFromServer();
    const data_T = data_TR[0];
    const data_R = data_TR[1];

    loadTimeline(data_T, calendarDays);
    loadRelevant(data_R);
    loadToday();
});