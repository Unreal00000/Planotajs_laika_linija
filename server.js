const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;


app.use(express.json());


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "code.html"));
});


app.post("/signal", (req, res) => {
    const message = req.body.message;

    console.log("Received from client:", message);

    const modifiedMessage = message * 2;

    res.json({ modifiedMessage });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});