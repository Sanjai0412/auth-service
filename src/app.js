const authRoutes = require("./routes/auth.routes");
const cors = require("cors");
const express = require("express");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

module.exports = app;
