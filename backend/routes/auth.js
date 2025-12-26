require("dotenv").config();
const express = require("express");
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/login", async(req, res) => {
    console.log("Request received:", req.body);
    let {login, password} = req.body;
    if(!login || !password) {
        return res.status(400).json({error: "Missing fields"});
    }

    try {
        console.log("Starting")
        let result = await pool.query("SELECT * FROM users WHERE login = $1", [login]);
        console.log('Query result:', result.rows);
        let user = result.rows[0];
        if(!user) {
            return res.status(401).json({error: "Invalid credentials"});
        }

        let isMatch = await bcrypt.compare(password, user.password_hash);
        if(!isMatch) {
            return res.status(401).json({error: "Invalid credentials"});
        }

        let token = jwt.sign(
            {id: user.id, login: user.login, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: "8h"}
        );

        res.json({access_token: token, token_type: "bearer", expiresIn: 28800});
    } catch(err) {
        console.error(err);
        res.status(500).json({error: "Database error"});
    }
});

module.exports = router;