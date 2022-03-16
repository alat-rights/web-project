import User, { Post } from "./User.js";
import EditableText from "./EditableText.js"
import DynamicList from "./DynamicList.js"
class App {
  constructor() {
    this._user = null;

    this._loginForm = null;
    this._postForm = null;

    this._onListUsers = this._onListUsers.bind(this);
    this._onLogin = this._onLogin.bind(this);

    // Instance variables, bind event handlers, etc.
    this._displayName = new EditableText("displayName");
    this._avatarURL = new EditableText("avatarURL");
    this._onUserChange = this._onUserChange.bind(this);
    this._onPost = this._onPost.bind(this);

    this._following = new DynamicList("following", "Follow user");
    this._onFollowAdd = this._onFollowAdd.bind(this);
    this._onFollowDelete = this._onFollowDelete.bind(this);
  }

  setup() {
    this._loginForm = document.querySelector("#loginForm");
    this._loginForm.addEventListener("submit", this._onLogin);
    this._loginForm.listUsers.addEventListener("click", this._onListUsers);

    this._postForm = document.querySelector("#postForm");
    this._postForm.addEventListener("submit", this._onPost);

    this._displayName.addToDOM(document.getElementById("nameContainer"), this._onUserChange);
    this._avatarURL.addToDOM(document.getElementById("avatarContainer"), this._onUserChange);

    this._following.addToDOM(document.getElementById("followContainer"), this._onFollowAdd, this._onFollowDelete);
  }

  _displayPost(post) {
    /* Make sure we receive a Post object. */
    if (!(post instanceof Post)) throw new Error("displayPost wasn't passed a Post object");

    let elem = document.querySelector("#templatePost").cloneNode(true);
    elem.id = "";

    let avatar = elem.querySelector(".avatar");
    avatar.src = post.user.avatarURL;
    avatar.alt = `${post.user.name}'s avatar`;

    elem.querySelector(".name").textContent = post.user.name;
    elem.querySelector(".userid").textContent = post.user.id;
    elem.querySelector(".time").textContent = post.time.toLocaleString();
    elem.querySelector(".text").textContent = post.text;

    document.querySelector("#feed").append(elem);
  }

  async _loadProfile() {
    document.querySelector("#welcome").classList.add("hidden");
    document.querySelector("#main").classList.remove("hidden");
    document.querySelector("#idContainer").textContent = this._user.id;
    /* Reset the feed */
    document.querySelector("#feed").textContent = "";

    /* Update the avatar, name, and user ID in the new post form */
    this._postForm.querySelector(".avatar").src = this._user.avatarURL;
    this._postForm.querySelector(".name").textContent = this._user.name;
    this._postForm.querySelector(".userid").textContent = this._user.id;

    const feed = await this._user.getFeed();
    const posts = feed.posts;
    for (const post of posts) {
      this._displayPost(new Post(post));
    }
    this._displayName.setValue(this._user.name);
    this._avatarURL.setValue(this._user.avatarURL);
    this._following.setList(this._user._following);
  }

  /*** Event Handlers ***/

  async _onListUsers() {
    let users = await User.listUsers();
    let usersStr = users.join("\n");
    alert(`List of users:\n\n${usersStr}`);
  }

  async _onLogin(event) {
    event.preventDefault();
    const id = event.target[0].value;
    this._user = await User.loadOrCreate(id);
    this._loadProfile();
  }
  
  // Additional event handlers
  async _onUserChange(form) {
    if (form.id == "displayName") {
      this._user.name = form.value;
    }
    else if (form.id == "avatarURL") {
      this._user.avatarURL = form.value;
    }
    this._user.save();
    this._loadProfile();
  }

  async _onFollowAdd(target) {
    try {
      await this._user.addFollow(target);
    }
    catch (error) {
      alert(error);
    }
    this._loadProfile();
  }

  async _onFollowDelete(target) {
    await this._user.deleteFollow(target);
    this._loadProfile();
  }

  async _onPost(event) {
    event.preventDefault();
    const text = event.target[0].value;
    await this._user.makePost(text);
    this._loadProfile();
  }
}

let app = new App();
app.setup();
