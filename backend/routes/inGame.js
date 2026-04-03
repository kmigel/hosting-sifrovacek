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

        let cipher = result.rows[0];
        let cipherId = cipher.id;

        let hintsResult = await pool.query(
            `SELECT * FROM cipher_hints
            WHERE cipher_id = $1
            ORDER BY position ASC`,
            [cipherId]
        );

        let usedHints = await pool.query(
            `SELECT * FROM team_hint_usage
            WHERE team_id = $1`,
            [teamId]
        );
        let used = new Set(usedHints.rows.map(r => r.hint_id));

        let hints = hintsResult.rows.map(hint => {
            let unlocked = used.has(hint.id);
            return {
                id: hint.id,
                cost: hint.cost,
                unlocked,
                content: unlocked ? hint.content : null
            }
        });

        cipher.current = current;
        cipher.hints = hints;
        return res.status(200).json(cipher);
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

router.post("/hint/:hintId", async(req, res) => {
    let {gameId, teamId, hintId} = req.params;

    try {
        let check = await pool.query(
            `SELECT current FROM game_teams
            WHERE game_id = $1 AND team_id = $2`,
            [gameId, teamId]
        );
        if(check.rowCount === 0) return res.status(404).json({error: "Team not assigned"});
        
        let current = check.rows[0].current;

        let result = await pool.query(
            `SELECT * FROM cipher_hints AS ch
            JOIN ciphers AS c ON c.id = ch.cipher_id
            WHERE ch.id = $1 AND c.game_id = $2 AND c.position = $3`,
            [hintId, gameId, current]
        );
        if(result.rowCount === 0) return res.status(404).json({error: "Hint doesn't belong to current cipher"});

        check = await pool.query(
            `SELECT * FROM team_hint_usage
            WHERE team_id = $1 AND hint_id = $2`,
            [teamId, hintId]
        );
        if(check.rowCount > 0) return res.status(409).json({error: "Hint already unlocked"});

        await pool.query(
            `INSERT INTO team_hint_usage (team_id, hint_id)
            VALUES ($1, $2)`,
            [teamId, hintId]
        );

        let hint = result.rows[0];
        return res.status(200).json({
            id: hint.id,
            cost: hint.cost,
            content: hint.content
        });

    } catch(err) {
        console.error(err);
        return res.status(500).json({error: "Database error"});
    }
});

export default router;