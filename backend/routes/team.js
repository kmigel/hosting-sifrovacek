const express = require("express");
const pool = require("../db");
const bcrypt = require("bcrypt");

const verifyToken = require("../middleware/verifyToken")
const requireAdmin = require("../middleware/requireAdmin")

const router = express.Router();
router.use(verifyToken);
router.use(requireAdmin);

router.post("/", async(req, res) => {
    let {login, password, name, members} = req.body;
    if(!login || !password || !name) {
        return res.status(400).json({error: "Missing fields"});
    }

    try {
        let password_hash = await bcrypt.hash(password, 10);

        let result = await pool.query(
            "INSERT INTO users (login, password_hash, name, members, role) VALUES ($1, $2, $3, $4, 'team') RETURNING id, login, name, members, role",
            [login, password_hash, name, members]
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
            "SELECT id, login, name, members FROM users WHERE role = 'team' ORDER BY name"
        );
        res.status(200).json(result.rows);
    } catch(err) {
        console.log(err);
        res.status(500).json({error: "Database error"});
    }
});

router.put("/:id", async(req, res) => {
    let {name, password, members} = req.body;
    let {id} = req.params;
    if(!name && !password && !members) {
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
        if(members) {
            let result = await pool.query(
                "UPDATE users SET members = $1 WHERE id = $2",
                [members, id]
            );
            rowCountTotal += result.rowCount;
        }

        if(rowCountTotal === 0) {
            return res.status(404).json({error: "Team not found"});
        }
        res.status(200).json({success: true});
    } catch(err) {
        console.log(err);
        res.status(500).json({error: "Database error"});
    }
});

router.delete("/:id", async(req, res) => {
    let {id} = req.params;
    try {
        let result = await pool.query(
            "DELETE FROM users WHERE id = $1 AND role = 'team",
            [id]
        );
        
        if(result.rowCount === 0) {
            return res.status(404).json({error: "Team not found"});
        }

        res.status(200).json({success: true});
    } catch(err) {
        console.log(err);
        res.status(500).json({error: "Database error"});
    }
});

module.exports = router;