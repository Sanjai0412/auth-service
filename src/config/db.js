const pg = require("pg");

const pool = new pg.Pool({
  connectionString: process.env.DB_URL,
});

pool.on("connect", () => {
  console.log("Database connected successfully");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

module.exports = pool;
