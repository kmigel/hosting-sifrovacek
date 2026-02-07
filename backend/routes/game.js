import express from "express";
import pool from "../db.js";

import verifyToken from "../middleware/verifyToken.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();
router.use(verifyToken);

// Get all games with this team

router.get("/my", async(req, res) => {
    let teamId = req.user.id;
    if(req.user.role !== "team") {
        return res.status(403).json({error: "Forbidden"});
    }
    try {
        let result = await pool.query(
            `SELECT g.id, g.title FROM game_teams gt
            JOIN games g ON g.id = gt.game_id
            WHERE gt.team_id = $1
            ORDER BY g.id`,
            [teamId]
        );
        return res.status(200).json(result.rows);
    } catch(err) {
        console.error(err);
        return res.status(500).json({error: "Database error"});
    }
});

// CRUD endpoints

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

export default router;