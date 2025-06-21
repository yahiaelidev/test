
class EmailHealthView {
  static render() {
    const root = document.createElement("div");
    root.classList.add("ext__sidebar-root-sub-block");

    const body = EmailHealthView._createBody();

    root.appendChild(body);

    return root;
  }

  static _createBody() {
    const menuDiv = document.createElement("div");
    menuDiv.className = "ext__sidebar-root-sub-menu";
    menuDiv.textContent = "Email Health: Empty for now";

    return menuDiv;
  }
}
