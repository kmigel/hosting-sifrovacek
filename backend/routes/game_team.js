import express from "express";
import pool from "../db.js";

import verifyToken from "../middleware/verifyToken.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router({mergeParams: true});
router.use(verifyToken);
router.use(requireAdmin);

router.get("/", async(req, res) => {
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

router.post("/:teamId", async(req, res) => {
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

router.delete("/:teamId", async(req, res) => {
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

export default router;