import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { MongoClient } from "mongodb";

let DATABASE_NAME = "cs193x_assign4";
let conn = null;
let db = null;
let Posts = null;
let Tags = null;

const api = express.Router();

const initAPI = async app => {
  app.set("json spaces", 2);
  app.use("/api", api);

  conn = await MongoClient.connect("mongodb://localhost");
  db = conn.db(DATABASE_NAME);

  Tags = db.collection("tags");
};

api.use(bodyParser.json());
api.use(cors());

api.get("/", (req, res) => {
  res.json({ db: DATABASE_NAME });
});

api.get("/posts", async (req, res) => {
  let posts = [];
  for (const post of await Tags.find().toArray()) {
    posts.push(post.id);
  }
  res.json({ posts });
});

api.post("/posts", async (req, res) => {
  if (!req.body.post_id) {
    res.status(400).json({ error: "The request body needs to have an `post_id` attribute." });
  }
  else if (await Tags.count({ id: req.body.post_id }, { limit: 1 }) == 1) {
    res.status(400).json({ error: `The tag ${req.body.post_id} already exists. Did you mean to create a reply?` });
  }
  else {
    for (const tag of req.body.tags) {
      let foundTag = (Tags.findOne({ id: tag }));
      if (foundTag) {
        foundTag.posts.push(tag);
      }
    }
    Tags.insertOne({ id: req.body.post_id, post: req.body, children: [] })
    console.log(`Tags: ${Tags}`);
    res.json({ id: req.body.post_id, tags: req.body.tags, text: req.body.text });
  }
});

api.use("/posts/:post_id", async (req, res, next) => {
  let id = req.params.post_id;
  let tag = await Tags.findOne({ id: id });
  let post = tag.post;
  if (!post) {
    console.log(post);
    res.status(404).json({ error: `The post ${id} does not exist` });
    return;
  }
  res.locals.post = post;
  next();
});

api.get("/posts/:post_id", async (req, res, next) => {
  let post = res.locals.post;
  delete post._id;
  res.json( post );
});

api.get("/posts/:post_id/replies", async (req, res, next) => {
  let tag = Tags.findOne({ id: req.params.id });
  res.json( tag.posts );
});

api.get("/posts/:post_id/parents", async (req, res, next) => {
  let tag = Tags.findOne({ id: req.params.id });
  res.json( tag.tags );
});

/* Catch-all route to return a JSON error if endpoint not defined */
api.all("/*", (req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.url}` });
});

export default initAPI;
