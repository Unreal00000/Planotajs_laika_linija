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
    tag TEXT
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
        res.json({ events: rows });
    });
});

router.get("/tags", (req, res) => {
    db.all("SELECT * FROM tags", (err, rows) => {
        res.json({ tags: rows });
    });
});

// ADD
router.post("/add", (req, res) => {
    const { title, date, description, tag } = req.body;

    db.run(
        "INSERT INTO events (title, date, description, tag) VALUES (?, ?, ?, ?)",
        [title, date, description, tag],
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
    const { id, title, date, description, tag } = req.body;

    db.run(
        `UPDATE events SET title=?, date=?, description=?, tag=? WHERE id=?`,
        [title, date, description, tag, id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ ok: true });
        }
    );
});

module.exports = router;