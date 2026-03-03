const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;

app.use(express.json());

// Izveido vai atver datubāzi
const db = new sqlite3.Database("events.db");

// Izveido tabulu, ja vēl nav
db.run(`
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT
    )
`);

// Servē HTML
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "code.html"));
});

// Pievienot jaunu notikumu
app.post("/add-event", (req, res) => {
    const text = req.body.text;
    if (!text) return res.status(400).json({ error: "Empty text" });

    db.run("INSERT INTO events (text) VALUES (?)", [text], function(err) {
        if (err) return res.status(500).json({ error: "DB error" });

        db.all("SELECT text FROM events ORDER BY id ASC", (err, rows) => {
            if (err) return res.status(500).json({ error: "DB error" });
            res.json({ events: rows.map(r => r.text) });
        });
    });
});

app.post("/delete-event", (req, res) => {
    const index = req.body.index; // kurš notikums dzēst
    if (index == null) return res.status(400).json({ error: "No index provided" });

    // Iegūst id pēc secības
    db.all("SELECT id FROM events ORDER BY id ASC", (err, rows) => {
        if (err) return res.status(500).json({ error: "DB error" });
        if (index < 0 || index >= rows.length) return res.status(400).json({ error: "Index out of range" });

        const idToDelete = rows[index].id;
        db.run("DELETE FROM events WHERE id = ?", [idToDelete], function(err) {
            if (err) return res.status(500).json({ error: "DB error" });

            // Atgriež visus notikumus pēc dzēšanas
            db.all("SELECT text FROM events ORDER BY id ASC", (err, rows) => {
                if (err) return res.status(500).json({ error: "DB error" });
                res.json({ events: rows.map(r => r.text) });
            });
        });
    });
});

// Atgriezt visus notikumus
app.get("/events", (req, res) => {
    db.all("SELECT text FROM events ORDER BY id ASC", (err, rows) => {
        if (err) return res.status(500).json({ error: "DB error" });
        res.json({ events: rows.map(r => r.text) });
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});