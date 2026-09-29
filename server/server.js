require("dotenv").config();

const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

const app = express();
const port = 5000;

app.use(express.json());

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

app.post("/api/register", async (req, res) => {
    const {first_name, last_name, email, password} = req.body;

    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({
            message: "All field are require"
        })
    }

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!passwordPattern.test(password)) {
        return res.status(400).json({
            message: "Password must be at least 8 characters and include an uppercase letter, lowercase letter, number and special character"
        })
    }

    try {
        const existingUser = await pool.query(
            "SELECT user_id FROM users WHERE email = $1", [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                message: "Email is already registered"
            });
        }

        const hashedPasswrord = await bcrypt.hash(password, 10);

        await pool.query(
            `INSERT INTO users
            (first_name, last_name, email, password, role, account_status)
            VALUES ($1, $2, $3, $4, $5, $6)`, 
            [
                first_name, last_name, email, hashedPasswrord, "Regular User", "Active"
            ]
        );

        res.status(201).json({
            message: "Account created successfully"
        });
    } catch (err) {
        console.log(err.message);
        
        res.status(500).json({
            message: "Something went wrong"
        })
    }
});

app.post("/api/login", async (req, res) => {
    const {email, password} = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are require"
        });
    }

    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1", [email]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        res.status(200).json({
            message: "Login successful"
        });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({
            message: "Something went wrong"
        });
    }
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