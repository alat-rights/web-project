import apiRequest from "./api.js";

/* A class to represent a Post */
export default class Post {
  /* data is the post data from the API. */
  constructor(data) {
    this.time = new Date(data.time);
    this.id = data.id;
    this.tags = data.tags;
    this.text = data.text;
  }

  /* Lists posts */
  static async listPosts(id) {
    let data = await apiRequest("GET", "/posts");
    return data.posts;
  }

  /* Finds post. */
  static async load(id) {
    try {
      let post = await apiRequest("GET", `/posts/${id}`);
      return post;
    }
    catch (error) {
      alert("Aw, shucks! We couldn't find that post.");
      return null;
    }
  }

  /* Creates post. A tag is just a parent. A child is just another post with this post's tag. Every post has a tag. Like 4chan. */
  static async createPost(id, parents, content) {
    try {
      return await apiRequest("POST", "/posts", {"post_id" : `${id}`, "tags" : parents, "text" : content});
    }
    catch (error) {
      alert("A post with this title already exists, so we ignored your request.");
    }
  }

  /* Gets all first level children */
  async getReplies() {
    return await apiRequest("GET", `/users/${this.id}/replies`);
  }

  /* Gets all first level parents */
  async getParents() {
    return this.tags;
  }

  /* Gets a recommended post */
  async getFrontPage() {
    return await apiRequest("GET", `/users/${this.id}/front`);
  }
}
