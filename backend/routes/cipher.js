import express from "express";
import pool from "../db.js";
import path from "path";
import fs from "fs";

import verifyToken from "../middleware/verifyToken.js";
import requireAdmin from "../middleware/requireAdmin.js";
import uploadCipher from "../middleware/uploadCipher.js";
import requireGamePending from "../middleware/requireGamePending.js";
import requireGamePendingCipher from "../middleware/requireGamePendingCipher.js";
import { error } from "console";

const router = express.Router();
router.use(verifyToken);

function uploadSingle(field) {
    return (req, res, next) => {
        uploadCipher.single(field)(req, res, err => {
            if (err) {
                return res.status(400).json({error: err.message});
            }
            next();
        });
    };
}

router.post("/:gameId", requireAdmin, requireGamePending, uploadSingle("pdf"),
async(req, res) => {
    let {gameId} = req.params;
    let {name, solution} = req.body;
    if(!name || !solution) {
        return res.status(400).json({error: "Missing fields"});
    }
    if(!req.file) {
        return res.status(400).json({error: "File is required"});
    }

    let newPath;
    try {
        let check = await pool.query(
            "SELECT * FROM games WHERE id = $1",
            [gameId]
        );
        if(check.rowCount == 0) {
            return res.status(404).json({error: "Game not found"});
        }
        
        let gameDir = path.join(process.cwd(), "uploads", "games", gameId);
        if(!fs.existsSync(gameDir)) {
            fs.mkdirSync(gameDir, {recursive: true});
        }

        let oldPath = req.file.path;
        newPath = path.join(gameDir, req.file.filename);
        fs.renameSync(oldPath, newPath);

        let posRes = await pool.query(
            `SELECT COALESCE(MAX("position"), 0) + 1 as next FROM ciphers
            WHERE game_id = $1`,
            [gameId]
        );
        let nextPos = posRes.rows[0].next;

        let result = await pool.query(
            `INSERT INTO ciphers (game_id, name, solution, path, position)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [gameId, name, solution, path.relative(process.cwd(), newPath), nextPos]
        );
        return res.status(201).json(result.rows[0]);
    } catch(err) {
        console.error(err);
        if(req.file && fs.existsSync(newPath)) {
            fs.unlinkSync(newPath);
        }
        return res.status(500).json({error: "Database error"});
    }
});

router.get("/game/:gameId", requireAdmin, async(req, res) => {
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
            `SELECT id, name, position FROM ciphers
            WHERE game_id = $1
            ORDER BY position ASC`,
            [gameId]
        );
        return res.status(200).json(result.rows);
    } catch(err) {
        console.error(err);
        return res.status(500).json({error: "Database error"});
    }
});

router.get("/:id/pdf", async(req, res) => {
    let {id} = req.params;
    let userId = req.user.id;
    try {
        let result = await pool.query(
            "SELECT * FROM ciphers WHERE id = $1",
            [id]
        );
        if(result.rowCount == 0) {
            return res.status(404).json({error: "Cipher not found"});
        }

        let {path: relPath, game_id} = result.rows[0];
        
        if(req.user.role === "team") {
            let check = await pool.query(
                `SELECT current FROM game_teams WHERE game_id = $1 AND team_id = $2`,
                [game_id, userId]
            );
            if(check.rowCount === 0 || check.rows[0].current !== result.rows[0].position) {
                return res.status(403).json({error: "Cannot view this cipher"});
            }
        }

        let filePath = path.join(process.cwd(), relPath);
        if(!fs.existsSync(filePath)) {
            return res.status(404).json({error: "File not found"});
        }

        res.setHeader("Content-Type", "application/pdf");
        return res.status(200).sendFile(filePath);
    } catch(err) {
        console.error(err);
        return res.status(500).json({error: "Database error"});
    }
});

router.get("/:id/solution", requireAdmin, async(req, res) => {
    let {id} = req.params;
    try {
        let result = await pool.query(
            "SELECT solution FROM ciphers WHERE id = $1",
            [id]
        );
        if(result.rowCount == 0) {
            return res.status(404).json({error: "Cipher not found"});
        }
        res.json({solution: result.rows[0].solution});
    } catch(err) {
        console.error(err);
        return res.status(500).json({error: "Database error"});
    }
});

router.put("/:gameId/reorder", requireAdmin, requireGamePending, async(req, res) => {
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

router.delete("/:id", requireAdmin, requireGamePendingCipher, async(req, res) => {
    let {id} = req.params;
    let client = await pool.connect();
    try {
        await client.query("BEGIN");
        let result = await pool.query(
            "SELECT game_id, position FROM ciphers WHERE id = $1",
            [id]
        );
        if(result.rowCount == 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({error: "Cipher not found"});
        }

        await client.query("DELETE FROM ciphers WHERE id = $1", [id]);
        
        let {game_id, position} = result.rows[0];

        await client.query(
            `UPDATE ciphers
            SET position = position - 1
            WHERE game_id = $1 AND position >= $2`,
            [game_id, position]
        );
        
        await client.query("COMMIT");
        return res.status(204).json({message: "Cipher deleted"});
    } catch(err) {
        await client.query("ROLLBACK");
        console.error(err);
        return res.status(500).json({error: "Database error"});
    } finally {
        client.release();
    }
});

router.patch("/:id", requireAdmin, requireGamePendingCipher, uploadSingle("pdf"),
async(req, res) => {
    let {id} = req.params;
    let {name, solution} = req.body;
    try {
        let prev = await pool.query(
            "SELECT * FROM ciphers WHERE id = $1",
            [id]
        );
        if(prev.rowCount === 0) {
            return res.status(404).json({error: "Cipher not found"});
        }

        let oldPath = prev.rows[0].path;
        let newPath = oldPath;
        if(req.file) {
            let gameDir = path.dirname(oldPath);
            newPath = path.join(gameDir, req.file.filename);
            fs.renameSync(req.file.path, newPath);
            if(fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        let result = await pool.query(
            `UPDATE ciphers SET name = COALESCE($1, name),
            solution = COALESCE($2, solution), path = $3
            WHERE id = $4 RETURNING *`,
            [name, solution, newPath, id]
        );

        return res.status(200).json(result.rows[0]);
    } catch(err) {
        console.error(err);
        return res.status(500).json({error: "Database error"});
    }
});

router.get("/:gameId/total", async(req, res) => {
    let {gameId} = req.params;
    try {
        let result = await pool.query(
            `SELECT MAX(position) as total
            FROM ciphers WHERE game_id = $1`,
            [gameId]
        );
        return res.json({total: Number(result.rows[0].total)});
    } catch(err) {
        console.error(err);
        res.status(500).json({error: "Database error"});
    }
});

export default router;