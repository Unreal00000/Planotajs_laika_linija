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


db.run(`
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        date TEXT,
        description TEXT,
        tag TEXT
    )
`);

// Servē HTML
app.get("/", (req, res) => {
    res.sendFile(path.join(basePath, "code.html"));
});
app.post("/signal", (req, res) => {
    const message = req.body.message;

    console.log("Received from client:", message);

    // piemērs – pārveido tekstu
    const modifiedMessage = message.toUpperCase();

    res.json({ modifiedMessage });
});

// Pievienot jaunu notikumu
app.post("/add-event", (req, res) => {
    const { title, date, description, tag } = req.body;

    if (!title || !date) {
        return res.status(400).json({ error: "Missing data" });
    }

    db.run(
        "INSERT INTO events (title, date, description, tag) VALUES (?, ?, ?, ?)",
        [title, date, description || "", tag || "Skolas darbi"],
        function(err) {
            if (err) return res.status(500).json({ error: "DB error" });

            db.all("SELECT * FROM events ORDER BY id ASC", (err, rows) => {
                res.json({ events: rows });
            });
        }
    );
});


app.post("/delete-event", (req, res) => {
    const { id } = req.body;

    if (!id) return res.status(400).json({ error: "No ID provided" });

    db.run("DELETE FROM events WHERE id = ?", [id], function(err) {
        if (err) return res.status(500).json({ error: "DB error" });

        db.all("SELECT * FROM events ORDER BY id ASC", (err, rows) => {
            res.json({ events: rows });
        });
    });
});

// Atgriezt visus notikumus
app.get("/events", (req, res) => {
    db.all("SELECT * FROM events ORDER BY id ASC", (err, rows) => {
        if (err) return res.status(500).json({ error: "DB error" });
        res.json({ events: rows });
    });
});

app.post("/edit-event", (req, res) => {
    const { id, title, date, description, tag } = req.body;

    if (!id) return res.status(400).json({ error: "No ID" });

    db.run(
        `UPDATE events 
         SET title = ?, date = ?, description = ?, tag = ?
         WHERE id = ?`,
        [title, date, description, tag, id],
        function(err) {
            if (err) return res.status(500).json({ error: "DB error" });

            db.all("SELECT * FROM events ORDER BY id ASC", (err, rows) => {
                res.json({ events: rows });
            });
        }
    );
});

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
        console.log(`Atver pārlūkprogrammu un ej uz http://localhost:${PORT}`);
    })
