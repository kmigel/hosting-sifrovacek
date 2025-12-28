const express = require("express");
const pool = require("../db")

const verifyToken = require("../middleware/verifyToken")
const requireAdmin = require("../middleware/requireAdmin")

const router = express.Router();
router.use(verifyToken);

router.post("/", requireAdmin, async(req, res) => {
    let {title} = req.body;
    if(!title) {
        return res.status(400).json({error: "Missing fields"});
    }

    try {
        let result = await pool.query(
            "INSERT INTO games (title) VALUES ($1) RETURNING id, title",
            [title]
        );
        res.status(201).json(result.rows[0]);
    } catch(err) {
        console.error(err);
        if(err.code === "23505") {
            res.status(409).json({error: "Title already exists"});
        }
        else {
            res.status(500).json({error: "Database error"});
        }
    }
});

router.get("/", async(req, res) => {
    try {
        let games = await pool.query(
            "SELECT * FROM games ORDER BY id"
        );
        res.status(200).json(games.rows);
    } catch(err) {
        console.error(err);
        res.status(500).json({error: "Database error"});
    }
});

router.get("/:id", async(req, res) => {
    let {id} = req.params;
    try {
        let result = await pool.query(
            "SELECT * FROM games WHERE id = $1",
            [id]
        );
        if(result.rowCount == 0) {
            return res.status(404).json({error: "Game not found"});
        }
        res.status(200).json(result.rows[0]);
    } catch(err) {
        console.error(err);
        res.status(500).json({error: "Database error"});
    }
});

router.put("/:id", requireAdmin, async(req, res) => {
    let {title} = req.body;
    let {id} = req.params;
    if(!title) {
        return res.status(400).json({error: "Nothing to update"});
    }

    try {
        let result = await pool.query(
            "UPDATE games SET title = $1 WHERE id = $2",
            [title, id]
        );

        if(result.rowCount == 0) {
            return res.status(404).json({error: "Game not found"});
        }
        res.status(204).json({success: true});
    } catch(err) {
        console.error(err);
        if(err.code === "23505") {
            res.status(409).json({error: "Title already exists"});
        }
        else {
            res.status(500).json({error: "Database error"});
        }
    }
});

router.delete("/:id", requireAdmin, async(req, res) => {
    let {id} = req.params;
    try {
        let result = await pool.query(
            "DELETE FROM games WHERE id = $1",
            [id]
        );
        if(result.rowCount == 0) {
            return res.status(404).json({error: "Game not found"});
        }
        res.status(204).json({success: true});
    } catch(err) {
        console.error(err);
        res.status(500).json({error: "Database error"});
    }
});

module.exports = router;