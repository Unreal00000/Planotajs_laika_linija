const express = require("express");
const router = express.Router();

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("events.db");

db.run(`
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    date TEXT,
    description TEXT,
    tags TEXT DEFAULT '[]'
)
`);

db.run(`
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE
)
`);

// GET
router.get("/", (req, res) => {
    db.all("SELECT * FROM events", (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const events = rows.map(row => ({
            ...row,
            tags: JSON.parse(row.tags || "[]")
        }));

        res.json({ events });
    });
});

router.get("/tags", (req, res) => {
    db.all("SELECT * FROM tags", (err, rows) => {
        res.json({ tags: rows });
    });
});

// ADD
router.post("/add", (req, res) => {
    const { title, date, description, tags } = req.body;
    const tagsString = JSON.stringify(tags ?? []);  // ["tag1", "tag2"] → string

    db.run(
        "INSERT INTO events (title, date, description, tags) VALUES (?, ?, ?, ?)",
        [title, date, description, tagsString],
        function (err) {
            if (err) {
                console.error("DB INSERT ERROR:", err);
                return res.status(500).json({ error: err.message });
            }

            res.json({ ok: true, id: this.lastID });
        }
    );
});

// DELETE
router.post("/delete", (req, res) => {
    const { id } = req.body;

    db.run("DELETE FROM events WHERE id = ?", [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ ok: true });
    });
});

//TAG
router.post("/tags/add", (req, res) => {
    const { name } = req.body;

    db.run(
        "INSERT INTO tags (name) VALUES (?)",
        [name],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({ ok: true });
        }
    );
});

// EDIT
router.post("/edit", (req, res) => {
    const { id, title, date, description, tags } = req.body;
    const tagsString = JSON.stringify(tags ?? []);

    db.run(
        `UPDATE events SET title=?, date=?, description=?, tags=? WHERE id=?`,
        [title, date, description, tagsString, id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ ok: true });
        }
    );
});

// RESET
router.post("/reset", (req, res) => {
    db.run("DROP TABLE IF EXISTS events", function (err) {
        if (err) return res.status(500).json({ error: err.message });

        db.run(`
            CREATE TABLE events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                date TEXT,
                description TEXT,
                tags TEXT DEFAULT '[]'
            )
        `, function (err2) {
            if (err2) return res.status(500).json({ error: err2.message });

            db.run("DELETE FROM tags", function (err3) {
                if (err3) return res.status(500).json({ error: err3.message });

                res.json({ ok: true });
            });
        });
    });
});

module.exports = router;