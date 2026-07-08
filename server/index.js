const bcrypt = require("bcrypt");
const pool = require("./config/db");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    // Step 1: User not found
    if (result.rows.length === 0) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    // Step 2: Get the user
    const user = result.rows[0];

    // Step 3: Check password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.json({
        success: false,
        message: "Invalid password",
      });
    }

    // Step 4: Login successful
    return res.json({
      success: true,
      message: "Login Successful",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.json({
      success: false,
      message: "Email already exists",
      });
    }
    // Step 1: Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 2: Store the user
    await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)`,
      [name, email, hashedPassword]
    );

    return res.json({
      success: true,
      message: "Registration Successful",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

