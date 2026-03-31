const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;

const basePath = process.pkg ? path.dirname(process.execPath) : __dirname;
const db = new sqlite3.Database(path.join(basePath, "events.db"));

app.use(express.json());
app.use(express.static(basePath));

// DB
db.run(`
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        date INTEGER,
        description TEXT,
        tag TEXT
    )
`);

// ROOT
app.get("/", (req, res) => {
    res.sendFile(path.join(basePath, "code.html"));
});

// GET EVENTS
app.get("/events", (req, res) => {
    db.all("SELECT * FROM events ORDER BY id ASC", (err, rows) => {
        if (err) return res.status(500).json({ error: "DB error" });
        res.json({ events: rows });
    });
});

// ADD
app.post("/add-event", (req, res) => {
    const { title, date, description, tag } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Missing title" });
    }

    db.run(
        "INSERT INTO events (title, date, description, tag) VALUES (?, ?, ?, ?)",
        [title, date || null, description || "", tag || "Skolas darbi"],
        function(err) {
            if (err) return res.status(500).json({ error: "DB error" });

            db.all("SELECT * FROM events ORDER BY id ASC", (err, rows) => {
                res.json({ events: rows });
            });
        }
    );
});

// DELETE
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

// EDIT
app.post("/edit-event", (req, res) => {
    const { id, title, date, description, tag } = req.body;
    if (!id) return res.status(400).json({ error: "Nav ID" });

    db.get("SELECT * FROM events WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: "DB error" });
        if (!row) return res.status(404).json({ error: "Not found" });

        const newTitle = title !== undefined && title !== "" ? title : row.title;
        const newDate = (date !== undefined && date !== "") ? date : row.date;
        const newDesc = description !== undefined ? description : row.description;
        const newTag = tag !== undefined && tag !== "" ? tag : row.tag;

        db.run(
            `UPDATE events 
             SET title = ?, date = ?, description = ?, tag = ?
             WHERE id = ?`,
            [newTitle, newDate, newDesc, newTag, id],
            function(err) {
                if (err) return res.status(500).json({ error: "DB error" });

                db.all("SELECT * FROM events ORDER BY id ASC", (err, rows) => {
                    if (err) return res.status(500).json({ error: "DB error" });
                    res.json({ events: rows });
                });
            }
        );
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});