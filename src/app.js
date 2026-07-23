const authRoutes = require("./routes/auth.routes");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();

app.use(cookieParser());
app.use(
  cors({
    origin: "https://pingx-ginnxelrf-sanjaii04.vercel.app/",
    credentials: true,
  }),
);
app.use(express.json());

app.use("/auth", authRoutes);

module.exports = app;
