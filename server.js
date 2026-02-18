const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// lai var lasīt JSON no fetch()
app.use(express.json());

// atdod HTML failu
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "code.html"));
});

// saņem signālu no front-end
app.post("/signal", (req, res) => {
    const { message } = req.body;

    console.log("📩 Signal received from client:", message);

    // atbilde uz klientu
    res.json({
        status: "ok",
        modifiedMessage: message * 2, // piemērs: pārveidojam signālu
    });
});

app.listen(PORT, () => {
    console.log(`✅ Server running: http://localhost:${PORT}`);
});
