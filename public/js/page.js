import Post from "./Post.js";
import EditableText from "./EditableText.js"
import DynamicList from "./DynamicList.js"

class App {
  constructor() {
    this._post = null;
    this._parents = [];

    this._loginForm = null;
    this._postForm = null;

    this._onListPosts = this._onListPosts.bind(this);
    this._onLogin = this._onLogin.bind(this);

    // Instance variables, bind event handlers, etc.
    this._onPost = this._onPost.bind(this);
    this._parents = [];
    this._tag = "";
  }

  setup() {
    this._loginForm = document.querySelector("#loginForm");
    this._loginForm.addEventListener("submit", this._onLogin);
    this._loginForm.listPosts.addEventListener("click", this._onListPosts);

    this._postForm = document.querySelector("#postForm");
    this._postForm.addEventListener("submit", this._onPost);
  }

  async _displayPost(post) {
    /* Make sure we receive a Post object. */
    if (!(post instanceof Post)) throw new Error("displayPost wasn't passed a Post object");

    let elem = document.querySelector("#templatePost").cloneNode(true);
    elem.id = "";

    elem.querySelector(".text").textContent = post.text;

    document.querySelector("#page").append(elem);
  }

  async _loadPage() {
    const post = await Post.load(this._tag);

    if (post) {
      document.querySelector("#welcome").classList.add("hidden");
      document.querySelector("#main").classList.remove("hidden");
      /* Reset the page */
      document.querySelector("#page").textContent = "";

      this._post = post;
      this._displayPost(new Post(post));
    }
  }

  /*** Event Handlers ***/

  async _onListPosts() {
    let posts = await Post.listPosts();
    let postsStr = posts.join("\n");
    alert(`List of posts:\n\n${postsStr}`);
  }

  async _onLogin(event) {
    event.preventDefault();
    this._tag = event.target[0].value;
    this._post = await Post.load(this._tag);
    alert(`Text: ${this._post.text}`);
    if (this._post) {
      this._loadPage();
    }
  }
  
  async _onPost(event) {
    event.preventDefault();
    const tag = event.target[0].value;
    const text = event.target[1].value;
    console.log(`Post tag: ${tag}`);
    await Post.createPost(tag, this._parents, text);
  }
}

let app = new App();
app.setup();
