class Component {
  static createSelectFooter(selectCount, countIdentifier) {
    function selectAll() {
      const checkboxes = document.querySelectorAll(
        '.ext__sidebar-root-sub-list input[type="checkbox"]'
      );
      checkboxes.forEach((checkbox) => {
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event("change"));
      });
    }

    function unselectAll() {
      const checkboxes = document.querySelectorAll(
        '.ext__sidebar-root-sub-list input[type="checkbox"]'
      );
      checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
        checkbox.dispatchEvent(new Event("change"));
      });
    }

    const selectedDiv = document.createElement("div");
    selectedDiv.style.display = "flex";
    selectedDiv.style.alignItems = "center";
    selectedDiv.style.fontSize = "15px";

    const selectAllAnchor = document.createElement("a");
    selectAllAnchor.classList.add("inbox-purge-no-border-btn");
    selectAllAnchor.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="none" stroke-width="1.5" viewBox="0 0 24 24" color="currentColor"><path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M16 5h3m3 0h-3m0 0V2m0 3v3M16.819 14.329l-5.324 5.99a2 2 0 0 1-2.99 0l-5.324-5.99a2 2 0 0 1 0-2.658l5.324-5.99a2 2 0 0 1 2.99 0l5.324 5.99a2 2 0 0 1 0 2.658Z"></path></svg>${LOCALE.selectAll}`;

    selectAllAnchor.addEventListener("click", selectAll);

    const deselectAnchor = document.createElement("a");
    deselectAnchor.style.color = "red";
    deselectAnchor.classList.add("inbox-purge-no-border-btn");
    deselectAnchor.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="none" stroke-width="1.5" viewBox="0 0 24 24" color="currentColor"><path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M16 5h6M16.819 14.329l-5.324 5.99a2 2 0 0 1-2.99 0l-5.324-5.99a2 2 0 0 1 0-2.658l5.324-5.99a2 2 0 0 1 2.99 0l5.324 5.99a2 2 0 0 1 0 2.658Z"></path></svg>${LOCALE.deselect}`;

    deselectAnchor.addEventListener("click", unselectAll);

    const textSpan = document.createElement("span");
    textSpan.innerHTML = `- <span id='${countIdentifier}'>${selectCount}</span> - ${LOCALE.selected}`;
    textSpan.style.textAlign = "center";
    textSpan.style.fontWeight = "500";

    selectedDiv.appendChild(selectAllAnchor);
    selectedDiv.appendChild(deselectAnchor);
    selectedDiv.appendChild(textSpan);

    return selectedDiv;
  }

  static createSearchBar(onSearchFunc, placeholderText) {
    const menuDiv = document.createElement("div");
    menuDiv.className = "ext__sidebar-root-sub-menu";

    const searchDiv = document.createElement("div");
    searchDiv.style.width = "100%";

    const searchIcon = document.createElement("i");
    searchIcon.className = "material-icons search-icon";
    searchIcon.style.position = "absolute";
    searchIcon.textContent = "search";
    searchIcon.innerHTML =
      '<svg width="20px" height="20px" viewBox="0 0 24 24" stroke-width="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M17 17l4 4M3 11a8 8 0 1016 0 8 8 0 00-16 0z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>';

    const searchInput = document.createElement("input");
    // searchInput.classList.add("ext__sidebar-root-search-input");
    searchInput.style.padding = "5px 10px";
    searchInput.style.width = "95%";
    searchInput.classList.add("custom-input");
    searchInput.placeholder =
      placeholderText || `${LOCALE.searchYourSubscriptions}`;

    searchInput.addEventListener("input", onSearchFunc);

    // searchDiv.appendChild(searchIcon);
    searchDiv.appendChild(searchInput);

    menuDiv.appendChild(searchDiv);

    return menuDiv;
  }
}
