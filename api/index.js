import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { MongoClient } from "mongodb";

let DATABASE_NAME = "cs193x_assign4";
let conn = null;
let db = null;
let Users = null;
let Posts = null;

/* Do not modify or remove this line. It allows us to change the database for grading */
if (process.env.DATABASE_NAME) DATABASE_NAME = process.env.DATABASE_NAME;

const api = express.Router();

const initAPI = async app => {
  app.set("json spaces", 2);
  app.use("/api", api);

  conn = await MongoClient.connect("mongodb://localhost");
  db = conn.db(DATABASE_NAME);

  Users = db.collection("users");
  Posts = db.collection("posts");
};

api.use(bodyParser.json());
api.use(cors());

api.get("/", (req, res) => {
  res.json({ db: DATABASE_NAME });
});

api.get("/users", async (req, res) => {
  let users = [];
  for (const user of await Users.find().toArray()) {
    users.push(user.id);
  }
  res.json({ users });
});

api.post("/users", async (req, res) => {
  if (!req.body.id) {
    res.status(400).json({ error: "The request body needs to have an `id` attribute." });
  }
  else if (await Users.count({ id: req.body.id }, { limit: 1 }) == 1) {
    res.status(400).json({ error: `The requested user ${req.body.id} already exists.` });
  }
  else {
    req.body.name = req.body.id;
    req.body.avatarURL = "images/default.png";
    req.body.following = [];
    Users.insertOne(req.body);
    res.json({ id: req.body.id, name: req.body.name, avatarURL: req.body.avatarURL, following: req.body.following });
  }
});

api.use("/users/:id", async (req, res, next) => {
  let id = req.params.id;
  let user = await Users.findOne({ id });
  if (!user) {
    res.status(404).json({ error: `No user with ID ${id}` });
    return;
  }
  res.locals.user = user;
  next();
});

api.get("/users/:id", async (req, res) => {
  let user = res.locals.user;
  delete user._id;
  res.json( user );
});

api.get("/users/:id/feed", async (req, res) => {
  let following = res.locals.user.following;
  const feed = [];
  for (const post of await Posts.find().toArray()) {
    if (following.includes(post.userId) || req.params.id == post.userId) {
      let user = await Users.findOne({ id: post.userId });
      delete user._id;
      let pushPost = post;
      delete pushPost.userId;
      delete pushPost._id;
      pushPost.user = user;
      feed.push(pushPost);
    }
  }
  feed.sort((obj1, obj2) => { return obj1.time.getTime() >= obj2.time.getTime() ? -1 : 1 })
  res.json({ posts: feed });
});

api.post("/users/:id/posts", async (req, res) => {
  if (!req.body.text) {
    res.status(400).json({ error: "We either did not find a text field or found an empty text field in the body." });
    return;
  }
  Posts.insertOne(new Object({ userId: res.locals.user.id, time: new Date(), text: req.body.text }));
  res.json({ success: true });
});

api.post("/users/:id/follow", async (req, res) => {
  if (!req.query.target) {
    res.status(400).json({ error: "`target` is empty or non-existent." });
  }
  else if (req.query.target == res.locals.user.id) {
    res.status(400).json({ error: "You can't follow yourself." });
  }
  else if (await Users.count({ id: req.query.target }, { limit: 1}) == 0) {
    res.status(404).json({ error: `Could not find ${req.query.target}.` });
  }
  else if (res.locals.user.following.includes(req.query.target)) {
    res.status(400).json({ error: `${res.locals.user.id} is already following ${req.query.target}.` });
  }
  else {
    Users.updateOne({
      id: res.locals.user.id
    }, {
      $push: { following: req.query.target }
    });
    res.json({ success: true });
  }
});

api.patch("/users/:id", async (req, res) => {
  let id = res.locals.user.id;
  let name = 'name' in req.body ? req.body.name : res.locals.user.name;
  let avatarURL = 'avatarURL' in req.body ? req.body.avatarURL : res.locals.user.avatarURL;

  Users.updateOne({
    id: id
  }, {
    $set: {
      name: name,
      avatarURL: avatarURL
    }
  });
  let user = res.locals.user;
  delete user._id;
  res.json( user );
});

api.delete("/users/:id/follow", async (req, res) => {
  if (!req.query.target) {
    res.status(400).json({ error: "No target property, or target is empty." });
    return;
  }
  else if (!(res.locals.user.following.includes(req.query.target))) {
    res.status(400).json({ error: "The target user isn't being followed." });
    return;
  }
  Users.updateOne({
    id: res.locals.user.id
  }, {
    $pull: { following: req.query.target }
  });
  res.json({ success: true });
});

/* Catch-all route to return a JSON error if endpoint not defined */
api.all("/*", (req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.url}` });
});

export default initAPI;
