import express from "express";
import pool from "../db.js";

import verifyToken from "../middleware/verifyToken.js";

const router = express.Router({mergeParams: true});
router.use(verifyToken);

router.get("/current", async(req, res) => {
    let {gameId, teamId} = req.params;
    try {
        let result = await pool.query(
            `SELECT current FROM game_teams
            WHERE game_id = $1 AND team_id = $2`,
            [gameId, teamId]
        );
        if(result.rowCount === 0) return res.status(404).json({error: "Team not assigned"});
        let current = result.rows[0].current;

        result = await pool.query(
            `SELECT * FROM ciphers
            WHERE game_id = $1 AND position = $2`,
            [gameId, current]
        );
        if(result.rowCount === 0) return res.status(200).json({current: current});

        result.rows[0].current = current;
        return res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({error: "Database error"});
    }
});

router.post("/answer", async(req, res) => {
    let {gameId, teamId} = req.params;
    let {answer} = req.body;
    try {
        let current = await pool.query(
            `SELECT current FROM game_teams
            WHERE game_id = $1 AND team_id = $2`,
            [gameId, teamId]
        );
        if(current.rowCount === 0) return res.status(404).json({error: "Team not assigned"});
        let position = current.rows[0].current;

        let cipher = await pool.query(
            `SELECT * FROM ciphers WHERE game_id = $1 AND position = $2`,
            [gameId, position]
        );
        if(cipher.rowCount === 0) return res.status(404).json({error: "Cipher not found"});
        
        let correct = cipher.rows[0].solution;

        if(answer.trim().toLowerCase() !== correct.trim().toLowerCase()) {
            return res.status(400).json({error: "Incorrect answer"});
        }

        await pool.query(
            `UPDATE game_teams SET current = current + 1
            WHERE game_id = $1 AND team_id = $2`,
            [gameId, teamId]
        );
        return res.status(200).json({success: true});
    } catch (err) {
        console.error(err);
        return res.status(500).json({error: "Database error"});
    }
});

export default router;