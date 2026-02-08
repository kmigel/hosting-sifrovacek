import pool from "../db.js";

async function requireGamePendingCipher(req, res, next) {
    let {id} = req.params;
    try {
        let result = await pool.query(
            "SELECT game_id FROM ciphers WHERE id = $1",
            [id]
        );
        if(result.rowCount === 0) {
            return res.status(404).json({error: "Cipher not found"});
        }
        let gameId = result.rows[0].game_id;

        result = await pool.query(
            "SELECT state FROM games WHERE id = $1",
            [gameId]
        );
        if(result.rowCount === 0) {
            return res.status(404).json({error: "Game not found"});
        }
        
        if(result.rows[0].state !== "pending") {
            return res.status(403).json({error: "Game already started. No changes can be made"});
        }
        next();
    } catch(err) {
        console.error(err);
        res.status(500).json({error: "Database error"});
    }
}

export default requireGamePendingCipher;