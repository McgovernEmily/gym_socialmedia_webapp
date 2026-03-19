const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

let posts = [
  {username: "lifter1", text: "315 Bench PR", lift:"Bench", likes: 0},
  {username: "lifter2", text: "405 Deadlift PR", lift:"Deadlift", likes: 0},
];

// GET posts
app.get("/api/posts", (req, res) => {
  res.json(posts);
});

// POST new post ✅ FIXED
app.post("/api/posts", (req, res) => {
  const { text, lift } = req.body;

  if (!text || !lift) {
    return res.status(400).json({ error: "Missing Data" });
  }

  const newPost = {
    username: "username",
    text,
    lift,
    likes: 0
  };

  posts.unshift(newPost);
  res.json(newPost);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});