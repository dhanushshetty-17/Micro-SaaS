const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "micro_saas",
  password: "dhanushshetty17@",
  port: 5432,
});

module.exports = pool;