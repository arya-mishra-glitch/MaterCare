const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/test", (req, res) => {
  res.send("TEST WORKING");
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (email === "test@gmail.com" && password === "123456") {
    return res.json({ message: "Login success" });
  }

  return res.status(401).json({ message: "Invalid credentials" });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});