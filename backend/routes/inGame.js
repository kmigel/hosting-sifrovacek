import express from "express";
import pool from "../db.js";

import verifyToken from "../middleware/verifyToken.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router({mergeParams: true});
router.use(verifyToken);

router.get("/:gameId/team/:teamId/current", async(req, res) => {
    let {gameId, teamId} = req.params;
    try {
        let result = await pool.query(
            `SELECT current FROM game_teams
            WHERE game_id = $1 AND team_id = $2`,
            [gameId, teamId]
        );
        if(result.rowCount === 0) return res.status(404).json({error: "Team not assigned"});

        return res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({error: "Database error"});
    }
});

export default router;