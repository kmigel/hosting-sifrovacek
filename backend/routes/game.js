import express from "express";
import pool from "../db.js";

import verifyToken from "../middleware/verifyToken.js";
import requireAdmin from "../middleware/requireAdmin.js";
import requireGamePending from "../middleware/requireGamePending.js";

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

// Start or end game

router.post("/:id/start", requireAdmin, async(req, res) => {
    let {id} = req.params;
    let {reset} = req.query;
    let client = await pool.connect();
    try {
        await client.query("BEGIN");
        let result = await pool.query(
            `SELECT * FROM ciphers WHERE game_id = $1`,
            [id]
        );
        if(result.rowCount === 0) {
            await client.query("ROLLBACK");
            return res.status(400).json({error: "Cannot start a game with no ciphers"});
        }

        if(!reset) {
            result = await pool.query(
                `UPDATE games SET state = 'active'
                WHERE id = $1 AND state = 'pending'
                RETURNING *`,
                [id]
            );
            if(result.rowCount === 0) {
                await client.query("ROLLBACK");
                return res.status(409).json({error: "Game cannot be started"});
            }

            await pool.query(
                `UPDATE game_teams
                SET current = 1,
                score = 0,
                last_update = NOW()
                WHERE game_id = $1`,
                [id]
            );
        }
        else {
            result = await pool.query(
                `UPDATE games SET state = 'pending'
                WHERE id = $1
                RETURNING *`,
                [id]
            );

            await pool.query(
                `UPDATE game_teams
                SET current = 0,
                score = 0,
                last_update = NOW()
                WHERE game_id = $1`,
                [id]
            );
        }

        await client.query(
            `DELETE FROM team_hint_usage
            WHERE hint_id IN (
                SELECT ch.id FROM cipher_hints AS ch
                JOIN ciphers AS c ON c.id = ch.cipher_id
                WHERE c.game_id = $1  
            )`,
            [id]
        );

        await client.query("COMMIT");
        res.status(200).json(result.rows[0]);
    } catch(err) {
        await client.query("ROLLBACK");
        console.error(err);
        res.status(500).json({error: "Database error"});
    } finally {
        client.release();
    }
});

router.post("/:id/end", requireAdmin, async(req, res) => {
    let {id} = req.params;
    try {
        let result = await pool.query(
            `UPDATE games SET state = 'finished'
            WHERE id = $1 AND state = 'active'
            RETURNING *`,
            [id]
        );
        if(result.rowCount === 0) {
            return res.status(409).json({error: "Game cannot be ended"});
        }
        res.status(200).json(result.rows[0]);
    } catch(err) {
        console.error(err);
        res.status(500).json({error: "Database error"});
    }
});

router.patch("/:gameId/hints", requireAdmin, async(req, res) => {
    let {gameId} = req.params;
    let {orderedHints} = req.body;
    try {
        let result = await pool.query(
            `UPDATE games
            SET ordered_hints = COALESCE($1, ordered_hints)
            WHERE id = $2
            RETURNING *`,
            [orderedHints, gameId]
        );
        return res.status(200).json(result.rows[0]);
    } catch(err) {
        console.error(err);
        return res.status(500).json({error: "Database error"});
    }
});

router.get("/:gameId/leaderboard", async(req, res) => {
    let {gameId} = req.params;
    try {
        let game = await pool.query(
            `SELECT show_leaderboard FROM games WHERE id = $1`,
            [gameId]
        );
        if(game.rowCount === 0) return res.status(404).json({error: "Game not found"});
        if(!game.rows[0].show_leaderboard && req.user.role === "team") {
            return res.status(403).json({error: "Leaderboard disabled"});
        }

        let result = await pool.query(
            `SELECT u.id, u.name, gt.score, gt.last_update
            FROM game_teams AS gt
            JOIN users AS u ON u.id = gt.team_id
            WHERE gt.game_id = $1
            ORDER BY gt.score DESC, gt.last_update ASC`,
            [gameId]
        );
        return res.status(200).json(result.rows);
    } catch(err) {
        console.error(err);
        return res.status(500).json({error: "Database error"});
    }
});

router.patch("/:gameId/leaderboard", requireAdmin, async(req, res) => {
    let {gameId} = req.params;
    let {show} = req.body;
    try {
        let result = await pool.query(
            `UPDATE games SET show_leaderboard = $1
            WHERE id = $2
            RETURNING *`
            [show, gameId]
        );
        return res.status(200).json(result.rows[0]);
    } catch(err) {
        console.error(err);
        return res.status(500).json({error: "Database error"});
    }
});

router.patch("/:gameId/cipher", requireAdmin, requireGamePending, async(req, res) => {
    let {gameId} = req.params;
    let {order} = req.body;

    if(!Array.isArray(order)) {
        return res.status(400).json({error: "Invalid order"});
    }

    let client = await pool.connect();
    try {
        await client.query("BEGIN");
        for(let item of order) {
            await client.query(
                "UPDATE ciphers SET position = $1 WHERE id = $2 AND game_id = $3",
                [item.position, item.id, gameId]
            );
        }
        await client.query("COMMIT");
        return res.status(200).json({message: "Order updated"});
    } catch(err) {
        await client.query("ROLLBACK");
        console.error(err);
        return res.status(500).json({error: "Database error"});
    } finally {
        client.release();
    }
});

export default router;