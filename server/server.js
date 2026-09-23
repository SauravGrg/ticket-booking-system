require("dotenv").config();

const express = require("express");
const { Pool } = require("pg");

const app = express();
const port = 5000;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

app.get("/", (req, res) => {
    res.send("Hello World! I am runnin on port 5000 right now");
});

pool.query("SELECT NOW()", (err, result) => {
    if (err) {
        console.log("Database connection failed");
        console.log(err.message);
    } else {
        console.log("Connection to PostgresSQL");
        console.log("Database time:", result.rows[0].now);
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
})