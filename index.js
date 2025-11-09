const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();

// --- Configuration ---
app.use(cors());
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// Parse application/json (for safety, though forms send x-www-form-urlencoded)
app.use(bodyParser.json());
app.use(express.static("public"));

// --- Database Setup (Mongoose) ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s
});

// Check connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("MongoDB connected successfully!");
});

// --- Mongoose Schemas ---
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
});

const ExerciseSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);
const Exercise = mongoose.model("Exercise", ExerciseSchema);

// --- Helper Function ---
// Converts a Date object to the required "Day Mon DD YYYY" format
const dateToString = (date) => new Date(date).toDateString();

// --- Routes ---

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

/**
 * 2, 3: POST /api/users
 * Creates a new user
 */
app.post("/api/users", async (req, res) => {
  const username = req.body.username;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const newUser = new User({ username });
    const savedUser = await newUser.save();

    // Response structure: { username: "fcc_test", _id: "5fb5853f734231456ccb3b05"}
    res.json({
      username: savedUser.username,
      _id: savedUser._id,
    });
  } catch (err) {
    // Handle duplicate username (MongoDB error code 11000)
    if (err.code === 11000) {
      return res.status(409).json({ error: "Username already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error creating user" });
  }
});

/**
 * 4, 5, 6: GET /api/users
 * Gets a list of all users
 */
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().select("_id username");
    // The response is an array of objects: [{ username: "fcc_test", _id: "..." }, ...]
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error retrieving users" });
  }
});

/**
 * 7, 8: POST /api/users/:_id/exercises
 * Adds a new exercise for a user
 */
app.post("/api/users/:_id/exercises", async (req, res) => {
  const userId = req.params._id;
  const { description, duration, date } = req.body;

  // Basic validation
  if (!description || !duration) {
    return res
      .status(400)
      .json({ error: "Description and duration are required" });
  }
  const durationNum = parseInt(duration);
  if (isNaN(durationNum)) {
    return res.status(400).json({ error: "Duration must be a number" });
  }

  // Find the user
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Format date: use provided date or current date
  const dateObj = date ? new Date(date) : new Date();
  if (isNaN(dateObj)) {
    return res
      .status(400)
      .json({ error: "Invalid date format. Use yyyy-mm-dd" });
  }

  try {
    const newExercise = new Exercise({
      user_id: userId,
      description,
      duration: durationNum,
      date: dateObj,
    });

    const savedExercise = await newExercise.save();

    // Response structure: user object with exercise fields added
    // { username: "fcc_test", description: "test", duration: 60, date: "Mon Jan 01 1990", _id: "..."}
    res.json({
      _id: user._id,
      username: user.username,
      date: dateToString(savedExercise.date),
      duration: savedExercise.duration,
      description: savedExercise.description,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error adding exercise" });
  }
});

/**
 * 9 - 16: GET /api/users/:_id/logs
 * Retrieves a user's full or filtered exercise log
 */
app.get("/api/users/:_id/logs", async (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;

  // Find the user
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Build the query filter for exercises
  const dateFilter = { user_id: userId };

  if (from || to) {
    dateFilter.date = {};
    if (from) {
      const fromDate = new Date(from);
      if (isNaN(fromDate))
        return res.status(400).json({ error: 'Invalid "from" date format' });
      dateFilter.date.$gte = fromDate;
    }
    if (to) {
      const toDate = new Date(to);
      if (isNaN(toDate))
        return res.status(400).json({ error: 'Invalid "to" date format' });
      dateFilter.date.$lte = toDate;
    }
  }

  try {
    let exerciseQuery = Exercise.find(dateFilter).sort({ date: "asc" });

    // Apply limit if present and is a valid number
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        exerciseQuery = exerciseQuery.limit(limitNum);
      }
    }

    const exercises = await exerciseQuery;

    // Format the log array
    const log = exercises.map((ex) => ({
      description: ex.description,
      duration: ex.duration,
      date: dateToString(ex.date), // Use dateToString for required format
    }));

    // Response structure: { username: "fcc_test", count: 1, _id: "...", log: [...] }
    res.json({
      _id: user._id,
      username: user.username,
      count: log.length,
      log,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error retrieving logs" });
  }
});

// --- Listener ---
const listener = app.listen(process.env.PORT || 3000, () => {
  // Changed default port to 3000
  console.log("Your app is listening on port " + listener.address().port);
});
