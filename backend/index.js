require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth")
const adminRoutes = require("./routes/admin")

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);

app.listen(3001, () => console.log("Server listening on 3001"));