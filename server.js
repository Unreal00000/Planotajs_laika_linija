const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;

// Izveido vai atver datubāzi
const basePath = process.pkg ? path.dirname(process.execPath) : __dirname;
const db = new sqlite3.Database(path.join(basePath, "events.db"));

app.use(express.json());
app.use(express.static(basePath));

// Izveido tabulu, ja vēl nav
db.run(`
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        date INTEGER,
        tag TEXT,
        description TEXT
    )
`);

// Servē HTML
app.get("/", (req, res) => {
    res.sendFile(path.join(basePath, "code.html"));
});

// Pievienot jaunu notikumu
app.post("/add-event", (req, res) => {
    const { name, date, tag, description } = req.body;
    if (!name) return res.status(400).json({ error: "Empty name" });

    const tagStr = JSON.stringify(tag || []);

    db.run(
        "INSERT INTO events (name, date, tag, description) VALUES (?, ?, ?, ?)",
        [name, date || null, tagStr, description || ""],
        function(err) {
            if (err) return res.status(500).json({ error: "DB error" });

            db.all("SELECT * FROM events ORDER BY id ASC", (err, rows) => {
                if (err) return res.status(500).json({ error: "DB error" });
                const formatted = rows.map(r => ({ ...r, tag: JSON.parse(r.tag) }));
                res.json({ events: formatted });
            });
        }
    );
});

// Dzēst notikumu pēc secības
app.post("/delete-event", (req, res) => {
    const index = req.body.index;
    if (index == null) return res.status(400).json({ error: "No index provided" });

    db.all("SELECT id FROM events ORDER BY id ASC", (err, rows) => {
        if (err) return res.status(500).json({ error: "DB error" });
        if (index < 0 || index >= rows.length) return res.status(400).json({ error: "Index out of range" });

        const idToDelete = rows[index].id;
        db.run("DELETE FROM events WHERE id = ?", [idToDelete], function(err) {
            if (err) return res.status(500).json({ error: "DB error" });

            db.all("SELECT * FROM events ORDER BY id ASC", (err, rows) => {
                if (err) return res.status(500).json({ error: "DB error" });
                const formatted = rows.map(r => ({ ...r, tag: JSON.parse(r.tag) }));
                res.json({ events: formatted });
            });
        });
    });
});

// Rediģēt notikumu
app.post("/edit-event", (req, res) => {
    const { index, name, date, tag, description } = req.body;

    if (index == null || !name) return res.status(400).json({ error: "Invalid data" });

    db.all("SELECT id FROM events ORDER BY id ASC", (err, rows) => {
        if (err) return res.status(500).json({ error: "DB error" });
        if (index < 0 || index >= rows.length) return res.status(400).json({ error: "Index out of range" });

        const idToUpdate = rows[index].id;
        const tagStr = JSON.stringify(tag || []);

        db.run(
            "UPDATE events SET name = ?, date = ?, tag = ?, description = ? WHERE id = ?",
            [name, date || null, tagStr, description || "", idToUpdate],
            function(err) {
                if (err) return res.status(500).json({ error: "DB error" });

                db.all("SELECT * FROM events ORDER BY id ASC", (err, rows) => {
                    if (err) return res.status(500).json({ error: "DB error" });
                    const formatted = rows.map(r => ({ ...r, tag: JSON.parse(r.tag) }));
                    res.json({ events: formatted });
                });
            }
        );
    });
});

// Atgriezt visus notikumus
app.get("/events", (req, res) => {
    db.all("SELECT * FROM events ORDER BY id ASC", (err, rows) => {
        if (err) return res.status(500).json({ error: "DB error" });
        const formatted = rows.map(r => ({ ...r, tag: JSON.parse(r.tag) }));
        res.json({ events: formatted });
    });
});

// Piemērs /signal (neobligāti)
app.post("/signal", (req, res) => {
    const message = req.body.message;
    console.log("Received from client:", message);
    const modifiedMessage = message.toUpperCase();
    res.json({ modifiedMessage });
});

// Serveris klausās portu
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Atver pārlūkprogrammu un ej uz http://localhost:${PORT}`);
});