const authRoutes = require("./routes/auth.routes");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();

app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

app.use("/auth", authRoutes);

module.exports = app;
