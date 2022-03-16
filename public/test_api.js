/* Fill this in with your assignment 3 API URL */
const REMOTE_API_URL = "TODO";

const checkParams = () => {
  let val = document.querySelector("#endpoint").value;
  document.querySelector("#idParam").style.display = val.includes(":id") ? "" : "none";
  document.querySelector("#targetParam").style.display = val.endsWith("follow") ? "" : "none";
};

const onSubmit = async event => {
  event.preventDefault();
  let form = document.querySelector("#form");
  let [method, path] = form.endpoint.value.split(" ");
  path = path.replace(":id", form.id.value);
  if (path.endsWith("follow")) path += `?target=${form.target.value}`;
  let body = form.body.value;
  let opts = { method };
  if (body) {
    opts.headers = { "Content-Type": "application/json" };
    opts.body = body;
  }
  let base = form.remote.checked ? REMOTE_API_URL : "/api";
  let res = await fetch(`${base}${path}`, opts);
  let json = await res.json();
  alert(`Status: ${res.status}\n\n${JSON.stringify(json, null, 2)}`);
};

const main = () => {
  document.querySelector("#endpoint").addEventListener("change", checkParams);
  document.querySelector("#form").addEventListener("submit", onSubmit);
  checkParams();
};
main();
