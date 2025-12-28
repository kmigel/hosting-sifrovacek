require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth")
const adminRoutes = require("./routes/admin")
const gameRoutes = require("./routes/game")
const teamRoutes = require("./routes/team")

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/game", gameRoutes);
app.use("/team", teamRoutes);

app.listen(3001, () => console.log("Server listening on 3001"));