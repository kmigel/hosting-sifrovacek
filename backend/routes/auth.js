import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", async(req, res) => {
    let {login, password} = req.body;
    if(!login || !password) {
        return res.status(400).json({error: "Missing fields"});
    }

    try {
        let result = await pool.query("SELECT * FROM users WHERE login = $1", [login]);
        let user = result.rows[0];
        if(!user) {
            return res.status(401).json({error: "Invalid credentials"});
        }

        let isMatch = await bcrypt.compare(password, user.password_hash);
        if(!isMatch) {
            return res.status(401).json({error: "Invalid credentials"});
        }

        let token = jwt.sign(
            {id: user.id, login: user.login, name: user.name, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: "8h"}
        );

        res.json({access_token: token, token_type: "bearer", expiresIn: 28800});
    } catch(err) {
        console.error(err);
        res.status(500).json({error: "Database error"});
    }
});

export default router;