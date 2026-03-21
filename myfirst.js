const express = require('express');
const app = express();
const PORT = 3000;
const fs = require("fs");
const path = require("path");

// Load badge definitions
const badgeData = JSON.parse(
  fs.readFileSync("./public/json/badges.json")
);

const workoutFile = path.join(
  __dirname, "public/json/workout.json");

// Uses the js in my public
app.use(express.json());
app.use(express.static("public"));

// Temporary in-memory for posts
let posts =[
  {id : 1, username: "lifter1", text: "315 Bench PR", lift:"Bench", likes: 0},
  {id : 2, username: "lifter2", text: "405 Deadlift PR", lift:"Deadlift", likes: 0},
];

let workout = {
  types: [],
  text: ""
};

let prs = {
  bench: 0,
  squat: 0,
  deadlift: 0
};

// User stats (will expand later)
let userStats = {
  workoutsLogged: 0,
  streakDays: 0,
  weeklyWorkouts: 0,
  monthlyWorkouts: 0,
  posts: 0,
  likes: 0,
  legWorkouts: 0,
  chestWorkouts: 0,
  backWorkouts: 0,
  armWorkouts: 0,
  comments: 0,
  morningWorkouts: 0,
  nightWorkouts: 0,
  weekendWorkouts: 0,

  unlockedBadges: []
};

function checkBadges() {
  const newlyUnlocked = [];

  badgeData.badges.forEach(badge => {
    const alreadyUnlocked = userStats.unlockedBadges.includes(badge.id);
    if (alreadyUnlocked) return;

    const criteria = badge.criteria;
    let unlocked = false;

    if (criteria.workoutsLogged && userStats.workoutsLogged >= criteria.workoutsLogged) {
      unlocked = true;
    }

    if (criteria.weeklyWorkouts && userStats.weeklyWorkouts >= criteria.weeklyWorkouts) {
      unlocked = true;
    }

    if (criteria.monthlyWorkouts && userStats.monthlyWorkouts >= criteria.monthlyWorkouts) {
      unlocked = true;
    }

    if (criteria.legWorkouts && userStats.legWorkouts >= criteria.legWorkouts) {
      unlocked = true;
    }

    if (criteria.chestWorkouts && userStats.chestWorkouts >= criteria.chestWorkouts) {
      unlocked = true;
    }

    if (criteria.backWorkouts && userStats.backWorkouts >= criteria.backWorkouts) {
      unlocked = true;
    }

    if (criteria.armWorkouts && userStats.armWorkouts >= criteria.armWorkouts) {
      unlocked = true;
    }

    if (criteria.morningWorkouts && userStats.morningWorkouts >= criteria.morningWorkouts) {
      unlocked = true;
    }

    if (criteria.nightWorkouts && userStats.nightWorkouts >= criteria.nightWorkouts) {
      unlocked = true;
    }

    if (criteria.weekendWorkouts && userStats.weekendWorkouts >= criteria.weekendWorkouts) {
      unlocked = true;
    }

    if (criteria.newPR && userStats.newPR) {
      unlocked = true;
    }

    if (unlocked) {
      userStats.unlockedBadges.push(badge.id);
      newlyUnlocked.push(badge); // 🔥 KEY LINE
    }
  });

  return newlyUnlocked;
}

// Getting the posts
app.get("/api/posts", (req, res) => {
  const type = req.query.type;

  if (type) {
    return res.json(posts.filter(p => p.type === type));
  }

  res.json(posts);
});

// Workout get
app.get("/api/workout", (req, res) => {
  const data = fs.readFileSync(workoutFile, "utf-8");
  const workouts = JSON.parse(data);

  // return latest workout
  const latest = workouts[workouts.length - 1] || {
    types: [],
    text: ""
  };

  res.json(latest);
});

// GET PRs
app.get("/api/prs", (req, res) => {
  res.json(prs);
});

// Getting the badges
app.get("/api/badges", (req, res) => {
  const unlocked = badgeData.badges.filter(b =>
    userStats.unlockedBadges.includes(b.id)
  );

  res.json(unlocked);
});

// Getting the history of the workouts
app.get("/api/workouts", (req, res) => {
  const data = fs.readFileSync(workoutFile, "utf-8");
  const workouts = JSON.parse(data);

  res.json(workouts);
});

// Workout
app.post("/api/workout", (req,res) => {
  const { types, text } = req.body;

  const newWorkout = {
    id: Date.now(),
    types,
    text,
    date: new Date().toISOString()
  };

  // read file
  const data = fs.readFileSync(workoutFile, "utf-8");
  const workouts = JSON.parse(data);

  // add new workout
  workouts.push(newWorkout);

  // save file
  fs.writeFileSync(workoutFile, JSON.stringify(workouts, null, 2));

  // stats
  userStats.workoutsLogged++;
  userStats.weeklyWorkouts++;
  userStats.monthlyWorkouts++;

  if (types?.includes("Legs")) userStats.legWorkouts++;
  if (types?.includes("Chest")) userStats.chestWorkouts++;
  if (types?.includes("Back")) userStats.backWorkouts++;
  if (types?.includes("Arms")) userStats.armWorkouts++;

  const hour = new Date().getHours();
  if (hour < 6) userStats.morningWorkouts++;
  if (hour >= 22) userStats.nightWorkouts++;

  const day = new Date().getDay();
  if (day === 0 || day === 6) userStats.weekendWorkouts++;

  const newBadges = checkBadges();

  res.json({
    workout: newWorkout,
    newBadges
  });
});


// SAVE PRs
app.post("/api/prs", (req, res) => {
  const { bench, squat, deadlift } = req.body;

  prs = { bench, squat, deadlift };
  
  userStats.newPR = true;

  checkBadges();

  userStats.newPR = false;

  res.json(prs);
});

// POST a new post
app.post("/api/posts", (req, res) => {
  const {text, lift} = req.body;

  if (!text || !lift) {
    return res.status (400).json({error: "Missing Data"});
  }

  const newPost = {
    id: Date.now(),
    username: "username",
    text,
    lift,
    likes: 0,
    type: req.body.type || "index"
  };

  userStats.posts++;
  checkBadges();

  posts.unshift(newPost)
  res.json(newPost)
  
});

// Likes
app.post("/api/posts/:id/like", (req,res) => {
  const postId = parseInt(req.params.id);
  const post = posts.find(p => p.id === postId);

  if(!post) {
    return res.status(404).json({error: "No post"})
  }

  userStats.likes++;
  checkBadges();
  post.likes +=1;
  res.json(post)
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
