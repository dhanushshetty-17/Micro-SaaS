const pool = require("./config/db");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/login", (req, res) => {
  console.log("Login Request Received");

  console.log(req.body);

  res.json({
    success: true,
    message: "Login Successful",
  });
});

pool.query("SELECT * FROM users", (err, result) => {
  if (err) {
    console.error("Database Connection Error:", err);
  } else {
    console.log("Database Connected!");
    console.log(result.rows);
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});