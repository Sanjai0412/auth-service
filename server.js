require("dotenv").config();
const pool = require("./src/config/db");
const app = require("./src/app");
const port = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log("Connecting to database...");
    await pool.query("SELECT 1");

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}
startServer();
