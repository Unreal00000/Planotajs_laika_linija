const express = require("express");
const path = require("path");

const eventsRoutes = require("./routes/events");

const app = express();
const PORT = 3000;

app.use(express.json());

// UI
app.use(express.static(path.join(__dirname, "../ui")));

// MAIN PAGE
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../ui/code.html"));
});

// API
app.use("/api/events", eventsRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});