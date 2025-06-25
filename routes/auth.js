const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { r, connectToDB } = require("../db");
require("dotenv").config();

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const conn = await connectToDB();

  const cursor = await r.table("users").filter({ username }).run(conn);
  const users = await cursor.toArray();

  if (users.length > 0) {
    return res.status(400).json({ message: "Username already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await r
    .table("users")
    .insert({
      username,
      password: hashedPassword,
    })
    .run(conn);

  res.status(201).json({ message: "User registered successfully" });
});

// LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const conn = await connectToDB();

  const cursor = await r.table("users").filter({ username }).run(conn);
  const users = await cursor.toArray();

  if (users.length === 0) {
    return res.status(400).json({ message: "Invalid username or password" });
  }

  const user = users[0];
  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(400).json({ message: "Invalid username or password" });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ message: "Login successful", token });
});

module.exports = router;
