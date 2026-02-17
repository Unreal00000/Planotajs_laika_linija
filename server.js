const express = require('express');
const app = express();
const port = 3000;
app.use(express(json));
app.post("/api/data", (req, res) => {
    console.log("Sanemtie dati:", req.body);
    res.json({message: "Dati sanemti veiksmigi!"})
});
app.listen(port, () =>{
    console.log(`Serveris darbojas uz http://localhost:${port}`);
});
