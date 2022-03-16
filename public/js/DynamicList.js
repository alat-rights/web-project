/* A DOM component which displays a list of items (strings) and allows the user to add and remove
   items. Note that the list will not automatically update after calling onAdd or onDelete; you
   must call setList to give it a new list of items whenever the list of items has changed. */
export default class DynamicList {
  /* name and placeholder are set as attributes of the add input. */
  constructor(name, placeholder) {
    this._name = name;
    this._placeholder = placeholder;

    this._callbacks = { onAdd: null, onDelete: null };
    this._list = null;
    this._form = null;

    this._onAdd = this._onAdd.bind(this);
    this._onDelete = this._onDelete.bind(this);

    this._createElements();
  }

  /* Add this component to the DOM tree under parent. When a new item is added, the onAdd callback is called with the
     value of the item as argument. When an item is deleted, onDelete is called with the value being deleted. */
  addToDOM(parent, onAdd, onDelete) {
    this._callbacks = { onAdd, onDelete };
    parent.append(this._list, this._form);
  }

  /* Set the list of items being displayed. items is an Array of item strings. */
  setList(items) {
    this._list.textContent = "";
    for (let item of items) {
      let node = document.createElement("li");
      let label = document.createElement("span");
      label.textContent = item;
      label.classList.add("label");
      node.append(label);

      let button = document.createElement("button");
      button.type = "button";
      button.classList.add("deleteButton");
      /* Set this attribute to make the button readable with assistive technology. */
      button.setAttribute("aria-label", `Remove ${item}`);
      button.textContent = "\u00d7"; /* The "times" character */
      button.addEventListener("click", this._onDelete);
      node.append(button);

      this._list.append(node);
    }
  }

  /* Create the DOM elements for this component, storing them in instance variables. This method does not add the
     elements to the tree; that is done by addToDOM. */
  _createElements() {
    this._list = document.createElement("ul");
    this._list.classList.add("dynamicList");
    this._form = document.createElement("form");
    this._form.classList.add("dynamicListForm");

    let input = document.createElement("input");
    input.type = "text";
    input.name = this._name;
    input.placeholder = this._placeholder;
    this._form.append(input);

    let button = document.createElement("button");
    button.type = "submit";
    button.textContent = "Add";
    button.addEventListener("click", this._onAdd);
    this._form.append(button);
  }

  _onAdd(event) {
    event.preventDefault();
    let item = this._form[this._name].value;
    this._form.reset();
    this._callbacks.onAdd(item);
  }

  _onDelete(event) {
    let li = event.currentTarget.closest("li");
    let item = li.querySelector(".label").textContent;
    this._callbacks.onDelete(item);
  }
}
