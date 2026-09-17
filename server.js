const express = require("express");

const app = express();
const port = 5000;

app.get("/", (req, res) => {
    res.send("Hello World! I am runnin on port 5000 right now");
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
})