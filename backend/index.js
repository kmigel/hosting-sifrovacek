import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import gameRoutes from "./routes/game.js";
import teamRoutes from "./routes/team.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/game", gameRoutes);
app.use("/team", teamRoutes);

app.listen(3001, () => console.log("Server listening on 3001"));