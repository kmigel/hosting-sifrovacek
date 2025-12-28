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

// Game-Team endpoints

router.get("/:gameId/teams", async(req, res) => {
    let {gameId} = req.params;
    try {
        let check = await pool.query(
            "SELECT * FROM games WHERE id = $1",
            [gameId]
        );
        if(check.rowCount == 0) {
            return res.status(404).json({error: "Game not found"});
        }

        let result = await pool.query(
            `SELECT u.id, u.login, u.name, u.members FROM game_teams gt
            JOIN users u ON u.id = gt.team_id
            WHERE gt.game_id = $1 AND u.role = 'team'
            ORDER BY u.name`,
            [gameId]
        );
        return res.status(200).json(result.rows);
    } catch(err) {
        console.error(err);
        return res.status(500).json({error: "Database error"});
    }
});

router.post("/:gameId/teams/:teamId", requireAdmin, async(req, res) => {
    let {gameId, teamId} = req.params;

    try {
        let check = await pool.query(
            "SELECT * FROM games WHERE id = $1",
            [gameId]
        );
        if(check.rowCount == 0) {
            return res.status(404).json({error: "Game not found"});
        }

        check = await pool.query(
            "SELECT * FROM users WHERE id = $1 AND role = 'team'",
            [teamId]
        );
        if(check.rowCount == 0) {
            return res.status(404).json({error: "Team not found"});
        }

        check = await pool.query(
            "SELECT * FROM game_teams WHERE game_id = $1 AND team_id = $2",
            [gameId, teamId]
        );
        if(check.rowCount > 0) {
            return res.status(409).json({error: "Team already assigned"});
        }

        await pool.query(
            "INSERT INTO game_teams (game_id, team_id) VALUES ($1, $2)",
            [gameId, teamId]
        );

        return res.status(201).json({success: true});
    } catch (err) {
        console.error(err);
        return res.status(500).json({error: "Database error"});
    }
});

router.delete("/:gameId/teams/:teamId", requireAdmin, async(req, res) => {
    let {gameId, teamId} = req.params;

    try {
        let check = await pool.query(
            "SELECT * FROM games WHERE id = $1",
            [gameId]
        );
        if(check.rowCount == 0) {
            return res.status(404).json({error: "Game not found"});
        }

        check = await pool.query(
            "SELECT * FROM users WHERE id = $1 AND role = 'team'",
            [teamId]
        );
        if(check.rowCount == 0) {
            return res.status(404).json({error: "Team not found"});
        }

        let result = await pool.query(
            "DELETE FROM game_teams WHERE game_id = $1 AND team_id = $2",
            [gameId, teamId]
        );
        if(result.rowCount == 0) {
            return res.status(409).json({error: "Team not assigned"});
        }

        return res.status(200).json({success: true});
    } catch (err) {
        console.error(err);
        return res.status(500).json({error: "Database error"});
    }
});

module.exports = router;