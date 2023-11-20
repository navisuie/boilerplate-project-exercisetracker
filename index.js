const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URL);
const { Schema } = mongoose;

const ExcersizeSchema = new Schema({
  username: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: String,
});

const Excersize = mongoose.model("Exersize", ExcersizeSchema);
const UserSchema = new Schema({
  username: String,
  log: [ExcersizeSchema],
});

const User = mongoose.model("User", UserSchema);

app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

//Add new users route
app.post("/api/users", (req, res) => {
  let newUser = new User({
    username: req.body.username,
  });

  newUser
    .save()
    .then(() => {
      let userObj = {};
      userObj["username"] = newUser.username;
      userObj["_id"] = newUser.id;
      res.json(userObj);
    })
    .catch((err) => {
      console.log(err);
    });
});

//Get all users array
app.get("/api/users", (req, res) => {
  User.find({})
    .then(function (allUsers) {
      res.json(allUsers);
    })
    .catch((err) => {
      console.log(err);
    });
});

//post to add exersizes
app.post(
  "/api/users/:_id/exercises",
  express.urlencoded({ extended: false }),
  (req, res) => {
    let responseObject = {};
    let exercise = new Excersize({
      description: req.body.description,
      duration: parseInt(req.body.duration),
      date: req.body.date,
    });

    if (exercise.date === "") {
      exercise.date = new Date().toISOString.substring(0, 10);
    }

    User.findByIdAndUpdate(
      req.body.userId,
      { $push: { log: exercise } },
      { new: true }
    )
      .then(
        (responseObject["_id"] = req.body.id),
        (responseObject["username"] = exercise.username),
        (responseObject["description"] = exercise.description),
        (responseObject["duration"] = exercise.duration),
        (responseObject["date"] = new Date(exercise.date).toDateString()),
        res.json(responseObject)
      )
      .catch((err) => console.log(err));
  }
);

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
