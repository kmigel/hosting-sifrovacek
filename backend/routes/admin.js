require("dotenv").config();
const express = require("express");
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();
const verifyToken = require("../middleware/verifyToken")

router.post("/", verifyToken, async(req, res) => {
    if(req.user.role !== "admin") {
        return res.status(403).json({error: "Forbidden"});
    }

    let {login, password, name} = req.body;
    if(!login || !password || !name) {
        return res.status(400).json({error: "Missing fields"});
    }

    try {
        let password_hash = await bcrypt.hash(password, 10);

        let result = await pool.query(
            "INSERT INTO admins (login, password_hash, name) VALUES ($1, $2, $3) RETURNING id, login, name",
            [login, password_hash, name]
        );
        res.status(201).json(result.rows[0]);
    } catch(err) {
        console.error(err);
        if(err.code === "23505") {
            res.status(403).json({error: "Login already exists"});
        }
        else {
            res.status(500).json({error: "Database error"});
        }
    }
});

module.exports = router;