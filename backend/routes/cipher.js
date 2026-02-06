import express from "express";
import pool from "../db.js";
import path from "path";
import fs from "fs";

import verifyToken from "../middleware/verifyToken.js";
import requireAdmin from "../middleware/requireAdmin.js";
import uploadCipher from "../middleware/uploadCipher.js";

const router = express.Router();
router.use(verifyToken);

router.post("/:gameId", requireAdmin, uploadCipher.single("pdf"), async(req, res) => {
    let {gameId} = req.params;
    let {name, solution} = req.body;
    if(!name || !solution) {
        return res.status(400).json({error: "Missing fields"});
    }
    if(!req.file) {
        return res.status(400).json({error: "File is required"});
    }

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
        let newPath = path.join(gameDir, req.file.filename);
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

export default router;