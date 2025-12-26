require("dotenv").config();
const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
    let header = req.headers["authorization"];
    if(!header) return res.status(401).json({error: "No token provided"});

    let token = header.split(" ")[1];
    if(!token) return res.status(401).json({error: "No token provided"});

    try {
        let decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch(err) {
        return res.status(401).json({error: "Invalid token"});
    }
}

module.exports = verifyToken;