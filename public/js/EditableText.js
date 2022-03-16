/* A DOM component that displays text and allows the user to edit it, turning into an input.
   The current text value is exposed through .value, and it can be set directly with .setValue(). */
export default class EditableText {
  /* id is the name and id for the input element, needed to associate a label with it. */
  constructor(id) {
    this.id = id;
    this.value = "";
  }

  /* Add the component (in display state) to the DOM tree under parent. When the value changes, onChange is called
     with a reference to this object as argument. */
  addToDOM(parent, onChange) {
    const toAdd = this._createDisplay();
    this.container = toAdd;
    this.onChange = onChange;
    parent.append(toAdd);
  }

  /* Set the value of the component and switch to display state if necessary. Does not call onChange. */
  setValue(value) {
    this.value = value;
    this._edit(this.container, false);
  }

  /* Create and return a DOM element representing this component in display state. */
  _createDisplay() {
    let container = document.createElement("div");
    container.classList.add("editableText");

    let text = document.createElement("span");
    text.textContent = this.value;
    container.append(text);

    let button = this._createImageButton("edit");
    button.type = "button";
    container.append(button);

    button.onclick = () => {
      this._edit(container, true);
      document.getElementById(this.id).focus();
    };

    return container;
  }

  /* Create and return a DOM element representing this component in input state. */
  _createInput() {
    let form = document.createElement("form");
    form.classList.add("editableText");

    let input = document.createElement("input");
    input.type = "text";
    input.name = this.id;
    input.id = this.id;
    input.value = this.value;
    form.append(input);

    let button = this._createImageButton("save");
    button.type = "submit";
    form.append(button);

    form.addEventListener("submit", () => {
      this.value = form[0].value;
      this.onChange(this);
      this._edit(form, false)
    });

    return form;
  }

  /* Helper to create a button containing an image. name is the name of the image, without directory or extension. */
  _createImageButton(name) {
    let button = document.createElement("button");
    let img = document.createElement("img");
    img.src = `images/${name}.svg`;
    img.alt = name;
    button.append(img);
    return button;
  }

  _edit(box, makeInput) {
    const replacement = makeInput ? this._createInput() : this._createDisplay();
    if (!makeInput) {
      this.box = replacement;
    }
    box.replaceWith(replacement);
  }
}
