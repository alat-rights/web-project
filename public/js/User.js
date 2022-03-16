import apiRequest from "./api.js";

/* A small class to represent a Post */
export class Post {
  /* data is the post data from the API. */
  constructor(data) {
    this.user = new User(data.user);
    this.time = new Date(data.time);
    this.text = data.text;
  }
}

/* A data model representing a user of the app. */
export default class User {
  /* Returns an array of user IDs */
  static async listUsers() {
    let data = await apiRequest("GET", "/users");
    return data.users;
  }
  
  /* Returns a User object, creating the user if necessary. */
  static async loadOrCreate(id) {
    try {
      await apiRequest("POST", "/users", {"id" : `${id}`});
      console.log("User doesn't exist. Creating new user.");
    }
    catch (error) {
      console.log("User exists! Logging in.");
    }
    return new User(await apiRequest("GET", `/users/${id}`));
  }

  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.avatarURL = data.avatarURL;
    this._following = data.following;
  }

  /* Returns an Object containing only the public instances variables (i.e. the ones sent to the API). */
  toJSON() {
    return {"name" : `${this.name}`, "avatarURL" : `${this.avatarURL}`};
  }

  /* Save the current state (name and avatar URL) of the user to the server. */
  async save() {
    await apiRequest("PATCH", `/users/${this.id}`, this.toJSON());
  }

  /* Returns an Array of Post objects. Includes the user's own posts as well as those of users they are following. */
  async getFeed() {
    return await apiRequest("GET", `/users/${this.id}/feed`);
  }

  /* Create a new post with the given text. */
  async makePost(text) {
    await apiRequest("POST", `/users/${this.id}/posts`, {"text" : text});
  }

  /* Start following the specified user id. Throws an HTTPError if the specified user ID does not exist. */
  async addFollow(id) {
    try {
      await apiRequest("POST", `/users/${this.id}/follow?target=${id}`);
    }
    catch (error) {
      throw error;
    }
    this._following.push(id);
  }

  /* Stop following the specified user id. Throws an HTTPError if the user isn't following them. */
  async deleteFollow(id) {
    try {
      await apiRequest("DELETE", `/users/${this.id}/follow?target=${id}`);
    }
    catch (error) {
      throw error;
    }
    const user = await apiRequest("GET", `/users/${this.id}`);
    this._following = user.following;
  }
}
