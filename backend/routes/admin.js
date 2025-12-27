require("dotenv").config();
const express = require("express");
const pool = require("../db");
const bcrypt = require("bcrypt");

const verifyToken = require("../middleware/verifyToken")
const requireAdmin = require("../middleware/requireAdmin")

const router = express.Router();
router.use(verifyToken);
router.use(requireAdmin);

router.post("/", async(req, res) => {
    let {login, password, name} = req.body;
    if(!login || !password || !name) {
        return res.status(400).json({error: "Missing fields"});
    }

    try {
        let password_hash = await bcrypt.hash(password, 10);

        let result = await pool.query(
            "INSERT INTO users (login, password_hash, name, role) VALUES ($1, $2, $3, 'admin') RETURNING id, login, name, role",
            [login, password_hash, name]
        );
        res.status(201).json(result.rows[0]);
    } catch(err) {
        console.error(err);
        if(err.code === "23505") {
            res.status(409).json({error: "Login already exists"});
        }
        else {
            res.status(500).json({error: "Database error"});
        }
    }
});

router.get("/", async(req, res) => {
    try {
        let result = await pool.query(
            "SELECT id, login, name FROM users WHERE role = 'admin' ORDER BY id"
        );
        res.status(200).json(result.rows);
    } catch(err) {
        console.log(err);
        res.status(500).json({error: "Database error"});
    }
});

router.put("/:id", async(req, res) => {
    let {name, password} = req.body;
    let {id} = req.params;
    if(!name && !password) {
        return res.status(400).json({error: "Nothing to update"});
    }

    try {
        let rowCountTotal = 0;
        if(password) {
            let password_hash = await bcrypt.hash(password, 10);
            let result = await pool.query(
                "UPDATE users SET password_hash = $1 WHERE id = $2",
                [password_hash, id]
            );
            rowCountTotal += result.rowCount;
        }
        if(name) {
            let result = await pool.query(
                "UPDATE users SET name = $1 WHERE id = $2",
                [name, id]
            );
            rowCountTotal += result.rowCount;
        }

        if(rowCountTotal === 0) {
            return res.status(404).json({error: "Admin not found"});
        }
        res.status(200).json({success: true});
    } catch(err) {
        console.log(err);
        res.status(500).json({error: "Database error"});
    }
});

router.delete("/:id", async(req, res) => {
    let {id} = req.params;
    if(req.user.id == Number(id)) {
        return res.status(400).json({error: "You cannot delete yourself"});
    }

    try {
        let result = await pool.query(
            "DELETE FROM users WHERE id = $1",
            [id]
        );
        
        if(result.rowCount === 0) {
            return res.status(404).json({error: "Admin not found"});
        }

        res.status(200).json({success: true});
    } catch(err) {
        console.log(err);
        res.status(500).json({error: "Database error"});
    }
});

module.exports = router;