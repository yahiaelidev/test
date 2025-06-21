let BLOCK_LIST = [];
let EMPTY_BLOCK_LIST = false;
let ERROR_FETCHING_BLOCK_LIST = `${LOCALE.yourBlockListIsEmpty} 😲`;
let BLOCK_LIST_MAP = {};

// TODO: MOVE DUPLICATE FUNCTIONALITY IMPLEMENTATIONS INTO A SINGLE FILE
class BlockListView {
  static render() {
    const root = document.createElement("div");
    root.classList.add("ext__sidebar-root-sub-block");

    if (BLOCK_LIST.length > 0 || EMPTY_BLOCK_LIST) {
      root.appendChild(BlockListView._createMenuV2());
      if (EMPTY_BLOCK_LIST) {
        root.appendChild(
          BlockListView._createEmptyList(ERROR_FETCHING_BLOCK_LIST)
        );
      } else {
        const selectCount = Object.values(BLOCK_LIST_MAP).length;
        root.appendChild(BlockListView._createBlockList());
        root.appendChild(
          Component.createSelectFooter(selectCount, "block-select-count")
        );
      }
    } else {
      root.appendChild(BlockListView._createLoadingList());
    }

    return root;
  }

  static _createSkeletonListItem() {
    const listItem = document.createElement("li");
    const listItemDiv = document.createElement("div");
    listItemDiv.className = "ext__sidebar-root-sub-list-item";
    listItem.appendChild(listItemDiv);

    const listItemCheckDiv = document.createElement("div");
    listItemCheckDiv.className = "ext__sidebar-root-sub-list-check";
    listItemDiv.appendChild(listItemCheckDiv);

    const listItemImgDiv = document.createElement("div");
    listItemImgDiv.style.marginRight = "10px";
    listItemDiv.appendChild(listItemImgDiv);

    // Add image or text depending on the listItem

    const listItemText = document.createElement("span");
    listItemText.className = "ext__sidebar-root-sub-list-item-img-alt";
    listItemText.classList.add("skeleton");
    listItemImgDiv.appendChild(listItemText);

    const listItemLabelDiv = document.createElement("div");
    listItemLabelDiv.className = "ext__sidebar-root-sub-list-item-label";
    listItemDiv.appendChild(listItemLabelDiv);

    const listItemNameDiv = document.createElement("div");
    listItemNameDiv.className = "ext__label-name";
    listItemNameDiv.classList.add("skeleton", "skeleton-text");
    listItemLabelDiv.appendChild(listItemNameDiv);

    const listItemEmailDiv = document.createElement("div");
    listItemEmailDiv.className = "ext__label-email";
    listItemEmailDiv.classList.add("skeleton", "skeleton-text");
    listItemLabelDiv.appendChild(listItemEmailDiv);

    const listItemButtonsDiv = document.createElement("div");
    listItemButtonsDiv.className = "ext__sidebar-root-sub-buttons";
    //THIS HIDES THE BUTTONS IN THE LIST
    // listItemDiv.appendChild(listItemButtonsDiv);

    const listItemUnsubDiv = document.createElement("div");
    listItemButtonsDiv.appendChild(listItemUnsubDiv);

    const listItemUnsubLink = document.createElement("a");
    listItemUnsubLink.href = "#";
    listItemUnsubLink.style.marginRight = "15px";
    listItemUnsubDiv.appendChild(listItemUnsubLink);

    const listItemUnsubIcon = document.createElement("i");
    listItemUnsubIcon.className = "material-icons unsubscribe";
    listItemUnsubIcon.style.marginTop = "3px";
    listItemUnsubIcon.textContent = "unsubscribe";
    listItemUnsubLink.appendChild(listItemUnsubIcon);

    const listItemKeepDiv = document.createElement("div");
    listItemButtonsDiv.appendChild(listItemKeepDiv);

    const listItemKeepLink = document.createElement("a");
    listItemKeepLink.href = "#";
    listItemKeepDiv.appendChild(listItemKeepLink);

    const listItemKeepIcon = document.createElement("i");
    listItemKeepIcon.className = "material-icons keep";
    listItemKeepIcon.textContent = "thumb_up";
    listItemKeepLink.appendChild(listItemKeepIcon);

    return listItem;
  }

  static _createLoadingList() {
    const listDiv = document.createElement("div");

    const list = document.createElement("ul");
    list.className = "ext__sidebar-root-sub-list";

    for (let i = 0; i < 6; i++) {
      const listItem = BlockListView._createSkeletonListItem();
      list.appendChild(listItem);
    }

    listDiv.appendChild(list);

    return listDiv;
  }

  static handleBlockList(request) {
    if (request.blockList.length > 0) {
      BLOCK_LIST = request.blockList;
    } else {
      EMPTY_BLOCK_LIST = true;
      if (request.error) {
        ERROR_FETCHING_BLOCK_LIST = `${LOCALE.errorFetchingBlockList} 😢`;
      }
    }
  }

  static async getBlockList() {
    if (!(await UserService.isCurrentEmailLoggedIn())) {
      return;
    }

    BlockListView._reset();
    Utils.switchViewTo(MainView.render(true));

    await MessageService.send("get-block-list", {
      email: UserService.getCurrentEmail(),
      sync: false
    });
  }

  static _reset() {
    BLOCK_LIST = [];
    EMPTY_BLOCK_LIST = false;
    ERROR_FETCHING_BLOCK_LIST = `${LOCALE.yourBlockListIsEmpty} 😲`;
    BLOCK_LIST_MAP = {};
  }

  static _createEmptyList(text) {
    const listDiv = document.createElement("div");

    const list = document.createElement("div");
    list.className = "ext__sidebar-root-sub-list-empty-state";
    list.textContent = text;

    listDiv.appendChild(list);

    return listDiv;
  }

  static _setSelectCount() {
    const selectCount = Object.values(BLOCK_LIST_MAP).length;
    const count = document.getElementById("block-select-count");
    count.innerHTML = selectCount;
  }

  static _createMenu() {
    const menuDiv = document.createElement("div");
    menuDiv.className = "ext__sidebar-root-sub-menu";

    const mainOptions = document.createElement("div");
    mainOptions.style.flexGrow = "2";

    const mainButtons = document.createElement("div");
    mainButtons.className = "ext__sidebar-root-sub-buttons";
    mainOptions.appendChild(mainButtons);

    const unblockBtn = BlockListView._createMenuUnblockBtn();
    const helpBtn = BlockListView._createMenuHelpBtn();
    const searchField = BlockListView._createSearchField();

    mainButtons.appendChild(unblockBtn);
    mainButtons.appendChild(helpBtn);
    mainButtons.appendChild(searchField);

    const utilityOptions = document.createElement("div");
    utilityOptions.style.display = "flex";
    utilityOptions.style.alignItems = "center";
    utilityOptions.style.gap = "13px";

    // TODO: Implement sort
    // const sortBtn = BlockListView._createMenuSortBtn();
    const rescanBtn = BlockListView._createMenuRescanBtn();

    utilityOptions.appendChild(rescanBtn);
    // utilityOptions.appendChild(sortBtn);

    menuDiv.appendChild(mainOptions);
    menuDiv.appendChild(utilityOptions);

    return menuDiv;
  }

  static _createMenuV2() {
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "15px";

    // container.appendChild(SubscriptionView._createSearchField());
    container.appendChild(
      Component.createSearchBar(
        BlockListView._onSearch,
        `${LOCALE.searchYourBlockList}`
      )
    );
    container.appendChild(BlockListView._createBtnMenu());

    return container;
  }

  static _createBtnMenu() {
    const menuDiv = document.createElement("div");
    menuDiv.className = "ext__sidebar-root-sub-menu";
    menuDiv.style.gap = "10px";
    menuDiv.style.alignItems = "center";

    const mainOptions = document.createElement("div");
    mainOptions.style.flexGrow = "2";

    const mainButtons = document.createElement("div");
    mainButtons.className = "ext__sidebar-root-sub-buttons";
    mainButtons.style.gap = "10px";
    mainOptions.appendChild(mainButtons);

    mainButtons.appendChild(BlockListView._createMenuUnblockBtn());

    const utilityOptions = document.createElement("div");
    utilityOptions.style.display = "flex";
    utilityOptions.style.alignItems = "center";
    utilityOptions.style.gap = "13px";

    const rescanBtn = BlockListView._createMenuRescanBtn();

    utilityOptions.appendChild(rescanBtn);

    menuDiv.appendChild(mainOptions);
    menuDiv.appendChild(utilityOptions);

    return menuDiv;
  }

  static _createSearchField() {
    const searchDiv = document.createElement("div");
    searchDiv.style.marginLeft = "20px";

    const searchIcon = document.createElement("i");
    searchIcon.className = "material-icons search-icon";
    searchIcon.style.position = "absolute";
    searchIcon.textContent = "search";
    searchIcon.innerHTML =
      '<svg width="20px" height="20px" viewBox="0 0 24 24" stroke-width="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M17 17l4 4M3 11a8 8 0 1016 0 8 8 0 00-16 0z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>';

    const searchInput = document.createElement("input");
    // searchInput.classList.add("ext__sidebar-root-search-input");
    searchInput.style.padding = "5px 10px";
    searchInput.classList.add("custom-input");
    searchInput.placeholder = "Search Block List";

    searchInput.addEventListener("input", BlockListView._onSearch);

    // searchDiv.appendChild(searchIcon);
    searchDiv.appendChild(searchInput);

    return searchDiv;
  }

  static _onSearch(event) {
    const currentList = document.getElementById("block-list");

    if (currentList) {
      const searchText = event.target.value;
      if (searchText && searchText.length > 0) {
        const regex = new RegExp(Utils.escapeRegex(searchText), "i");
        const results = BLOCK_LIST.filter(
          (list) => regex.test(list.senderName) || regex.test(list.senderEmail)
        );

        const newList = BlockListView._createBlockList(results);
        currentList.replaceWith(newList);
      } else {
        const originalList = BlockListView._createBlockList(BLOCK_LIST);
        currentList.replaceWith(originalList);
      }
    }
  }

  static _createMenuUnblockBtn() {
    const unblockDiv = document.createElement("div");
    unblockDiv.title = `${LOCALE.unblock}`;

    const unblockLink = document.createElement("a");
    unblockLink.classList.add("inbox-purge-custom-btn");
    unblockLink.href = "#";

    unblockLink.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="none" stroke-width="1.5" viewBox="0 0 24 24" color="currentColor"><path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M15.87 20.121 17.993 18m2.121-2.121L17.993 18m0 0-2.122-2.121M17.992 18l2.121 2.121M12.412 10.343a4 4 0 1 0 5.657-5.657 4 4 0 0 0-5.657 5.657Zm0 0-8.485 8.485 2.121 2.122M6.755 16l2.122 2.121"></path></svg>${LOCALE.unblock}`;

    unblockDiv.appendChild(unblockLink);

    unblockDiv.addEventListener("click", BlockListView._unblock);

    return unblockDiv;
  }

  static _unblock() {
    const unblockListArr = Object.values(BLOCK_LIST_MAP);
    if (unblockListArr.length > 0) {
      BlockListView._openConfirmation();
    } else {
      SubscriptionView.openGenericModal(
        `${LOCALE.pleaseSelectOneUnblock}`,
        null,
        null,
        null,
        `${BASE_URL}/images/gif/unblock-warning.gif`
      );
    }
  }

  // ALLOW BUTTON TO CANCEL OR CONFIRM
  static _openConfirmation() {
    const confirmationMenu = document.createElement("div");
    confirmationMenu.classList.add("ext__sidebar-root-generic-modal");
    confirmationMenu.style.width = "300px";

    const confirmationMenuHeader = document.createElement("div");
    confirmationMenuHeader.classList.add(
      "ext__sidebar-root-generic-modal-header"
    );
    confirmationMenuHeader.textContent = `${LOCALE.unblockConfirmation}`;

    const confirmationText = document.createElement("div");
    confirmationText.style.textAlign = "center";
    confirmationText.style.borderBottom = "0.5px solid #c4c4c4";
    confirmationText.classList.add("ext__sidebar-root-generic-modal-body");
    const noOfSelected = Object.values(BLOCK_LIST_MAP).length;
    confirmationText.innerHTML = `<span>${LOCALE.areYouSureYouWantTo} <b>${
      LOCALE.unblockLowerCase
    }</b> ${LOCALE.theSelected} <b>(${noOfSelected})</b> ${
      noOfSelected > 1 ? `${LOCALE.senders}` : `${LOCALE.sender}`
    }</span>`;

    const confirmButton = document.createElement("div");
    confirmButton.classList.add("ext__sidebar-root-sort-modal-btn");

    const confirmButtonAnchor = document.createElement("a");
    confirmButtonAnchor.classList.add("button");
    confirmButtonAnchor.textContent = `${LOCALE.confirm}`;

    confirmButtonAnchor.addEventListener(
      "click",
      BlockListView._sendUnblockMessage
    );

    confirmButton.appendChild(confirmButtonAnchor);

    confirmationMenu.appendChild(confirmationMenuHeader);
    confirmationMenu.appendChild(confirmationText);
    confirmationMenu.appendChild(confirmButton);

    Utils.triggerModal(confirmationMenu);
  }

  static async _sendUnblockMessage() {
    Utils.closeModal();
    Utils.launchGlobalLoadingModal(
      `${LOCALE.unblocking}, ${LOCALE.thisMightTakeSomeTime}`
    );
    await MessageService.send("unblock", {
      email: UserService.getCurrentEmail(),
      blockList: Object.values(BLOCK_LIST_MAP),
    });
  }

  static async refreshBlockList() {
    if (!(await UserService.isCurrentEmailLoggedIn())) {
      return;
    }

    BlockListView._reset();
    Utils.switchViewTo(MainView.render(true));

    await MessageService.send("get-block-list", {
      email: UserService.getCurrentEmail(),
      sync: true
    });
  }

  static _createMenuKeepBtn() {
    const keepDiv = document.createElement("div");
    keepDiv.title = "Keep";

    const keepLink = document.createElement("a");
    keepLink.href = "#";
    keepLink.style.marginRight = "10px";
    keepDiv.appendChild(keepLink);

    const keepIcon = document.createElement("i");
    keepIcon.className = "material-icons keep";
    keepIcon.textContent = "thumb_up";
    keepLink.appendChild(keepIcon);

    return keepDiv;
  }

  static _createMenuHelpBtn() {
    const helpDiv = document.createElement("div");
    helpDiv.title = "Help";

    const helpLink = document.createElement("a");
    helpLink.href = "#";
    helpDiv.appendChild(helpLink);

    const helpIcon = document.createElement("i");
    helpIcon.className = "material-icons help";
    helpIcon.style.color = "#656565";
    // helpIcon.textContent = "help_outline";
    helpIcon.innerHTML =
      '<svg width="26px" height="26px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9 9c0-3.5 5.5-3.5 5.5 0 0 2.5-2.5 2-2.5 5M12 18.01l.01-.011" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
    helpLink.appendChild(helpIcon);

    // helpDiv.addEventListener("click", _openSupportPage);
    helpDiv.addEventListener("click", Utils.triggerProductTour);

    return helpDiv;
  }

  static _createMenuSortBtn() {
    const sortDiv = document.createElement("div");
    sortDiv.title = "Sort";

    const sortLink = document.createElement("a");
    sortLink.href = "#";
    sortDiv.appendChild(sortLink);
    sortDiv.addEventListener("click", BlockListView._openSortMenu);

    const sortIcon = document.createElement("i");
    sortIcon.className = "material-icons sort";
    // sortIcon.textContent = "sort";
    sortIcon.innerHTML =
      '<svg width="24px" height="24px" viewBox="0 0 24 24" stroke-width="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M10 14H2M8 10H2M6 6H2M12 18H2M19 20V4m0 16l3-3m-3 3l-3-3m3-13l3 3m-3-3l-3 3" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
    sortLink.appendChild(sortIcon);

    return sortDiv;
  }

  static _createMenuRescanBtn() {
    const rescan = document.createElement("div");
    rescan.title = `${LOCALE.rescan}`;

    const rescanLink = document.createElement("a");
    rescanLink.href = "#";
    rescan.appendChild(rescanLink);

    const rescanIcon = document.createElement("i");
    rescanIcon.className = "material-icons sort";
    // rescanIcon.textContent = "refresh";
    rescanIcon.innerHTML =
      '<svg width="20px" height="20px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M21.888 13.5C21.164 18.311 17.013 22 12 22 6.477 22 2 17.523 2 12S6.477 2 12 2c4.1 0 7.625 2.468 9.168 6" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M17 8h4.4a.6.6 0 00.6-.6V3" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
    rescanLink.appendChild(rescanIcon);

    rescan.addEventListener("click", BlockListView.refreshBlockList);

    return rescan;
  }

  static _createBlockList(customList) {
    const listDiv = document.createElement("div");
    listDiv.id = "block-list";

    const list = document.createElement("ul");
    list.className = "ext__sidebar-root-sub-list";

    const subList = (customList || BLOCK_LIST).map((blockList) => ({
      ...(blockList.logoUrl && { logo: blockList.logoUrl }),
      labelName: blockList.senderName,
      labelEmail: Utils.shortenText(blockList.senderEmail),
      labelEmailFull: blockList.senderEmail,
    }));

    for (let item of subList) {
      const listItem = BlockListView._createListItem(item);
      list.appendChild(listItem);
    }

    listDiv.appendChild(list);

    return listDiv;
  }

  static _createListItem(item) {
    const listItem = document.createElement("li");
    const listItemDiv = document.createElement("div");
    listItemDiv.className = "ext__sidebar-root-sub-list-item";
    listItem.appendChild(listItemDiv);

    const listItemCheckDiv = document.createElement("div");
    listItemCheckDiv.className = "ext__sidebar-root-sub-list-check";
    listItemDiv.appendChild(listItemCheckDiv);

    const listItemCheckbox = document.createElement("input");
    listItemCheckbox.type = "checkbox";
    listItemCheckbox.checked = BLOCK_LIST_MAP[item.labelEmailFull] != undefined;

    listItemCheckDiv.appendChild(listItemCheckbox);

    listItemCheckbox.addEventListener("change", (event) => {
      if (event.target.checked) {
        BLOCK_LIST_MAP[item.labelEmailFull] = item;
        listItem.classList.add("ext__active-list-item");
      } else {
        delete BLOCK_LIST_MAP[item.labelEmailFull];
        listItem.classList.remove("ext__active-list-item");
      }
      BlockListView._setSelectCount();
    });

    const listItemImgDiv = document.createElement("div");
    listItemImgDiv.style.marginRight = "10px";
    listItemDiv.appendChild(listItemImgDiv);

    // Add image or text depending on the listItem
    if (item.logo) {
      const listItemImg = document.createElement("img");
      listItemImg.className = "ext__sidebar-root-sub-list-item-img";
      listItemImg.alt = "logo";
      listItemImg.src = item.logo;
      listItemImgDiv.appendChild(listItemImg);
    } else {
      const listItemText = document.createElement("span");
      listItemText.className = "ext__sidebar-root-sub-list-item-img-alt";
      listItemText.textContent = Utils.getFirstLetter(item.labelName);
      listItemImgDiv.appendChild(listItemText);
    }

    const listItemLabelDiv = document.createElement("div");
    listItemLabelDiv.className = "ext__sidebar-root-sub-list-item-label";
    listItemDiv.appendChild(listItemLabelDiv);

    const listItemNameDiv = document.createElement("div");
    listItemNameDiv.className = "ext__label-name";
    listItemNameDiv.textContent = item.labelName;
    listItemLabelDiv.appendChild(listItemNameDiv);

    const listItemEmailDiv = document.createElement("div");
    listItemEmailDiv.className = "ext__label-email";
    listItemEmailDiv.textContent = item.labelEmail;
    listItemEmailDiv.style.cursor = "pointer";
    listItemEmailDiv.addEventListener("click", () => {
      Utils.getEmails(item.labelEmailFull);
    });
    listItemLabelDiv.appendChild(listItemEmailDiv);

    const listItemButtonsDiv = document.createElement("div");
    listItemButtonsDiv.className = "ext__sidebar-root-sub-buttons";
    // listItemDiv.appendChild(listItemButtonsDiv);

    const listItemUnsubDiv = document.createElement("div");
    listItemButtonsDiv.appendChild(listItemUnsubDiv);

    const listItemUnsubLink = document.createElement("a");
    listItemUnsubLink.href = "#";
    listItemUnsubLink.style.marginRight = "15px";
    listItemUnsubDiv.appendChild(listItemUnsubLink);

    const listItemUnsubIcon = document.createElement("i");
    listItemUnsubIcon.className = "material-icons unsubscribe";
    listItemUnsubIcon.style.marginTop = "3px";
    listItemUnsubIcon.textContent = "lock_open";
    listItemUnsubLink.appendChild(listItemUnsubIcon);

    const listItemKeepDiv = document.createElement("div");
    listItemButtonsDiv.appendChild(listItemKeepDiv);

    const listItemKeepLink = document.createElement("a");
    listItemKeepLink.href = "#";
    listItemKeepDiv.appendChild(listItemKeepLink);

    const listItemKeepIcon = document.createElement("i");
    listItemKeepIcon.className = "material-icons keep";
    listItemKeepIcon.textContent = "thumb_up";
    listItemKeepLink.appendChild(listItemKeepIcon);

    return listItem;
  }

  static _openSortMenu() {
    const sortMenu = document.createElement("div");
    sortMenu.classList.add("ext__sidebar-root-sort-modal");

    const sortMenuHeader = document.createElement("div");
    sortMenuHeader.classList.add("ext__sidebar-root-sort-modal-header");
    sortMenuHeader.textContent = "Sort By";

    const openingRate = document.createElement("div");
    openingRate.classList.add("ext__sidebar-root-sort-modal-option");

    const openingRateHeader = document.createElement("span");
    openingRateHeader.classList.add(
      "ext__sidebar-root-sort-modal-option-header"
    );
    openingRateHeader.textContent = "Opening Rate";

    const openingRateOption1 = document.createElement("span");
    openingRateOption1.innerHTML =
      '<label><input type="radio"> The most opened</label>';

    const openingRateOption2 = document.createElement("span");
    openingRateOption2.innerHTML =
      '<label><input type="radio"> The least opened</label>';

    openingRate.appendChild(openingRateHeader);
    openingRate.appendChild(openingRateOption1);
    openingRate.appendChild(openingRateOption2);

    const noOfEmailsRecieved = document.createElement("div");
    noOfEmailsRecieved.classList.add("ext__sidebar-root-sort-modal-option");

    const noOfEmailsHeader = document.createElement("span");
    noOfEmailsHeader.classList.add(
      "ext__sidebar-root-sort-modal-option-header"
    );
    noOfEmailsHeader.textContent = "Number of emails recieved";

    const noOfEmailsOption1 = document.createElement("span");
    noOfEmailsOption1.innerHTML =
      '<label><input type="radio"> Ascending order</label>';

    const noOfEmailsOption2 = document.createElement("span");
    noOfEmailsOption2.innerHTML =
      '<label><input type="radio"> Descending order</label>';

    noOfEmailsRecieved.appendChild(noOfEmailsHeader);
    noOfEmailsRecieved.appendChild(noOfEmailsOption1);
    noOfEmailsRecieved.appendChild(noOfEmailsOption2);

    const confirmButton = document.createElement("div");
    confirmButton.classList.add("ext__sidebar-root-sort-modal-btn");

    const confirmButtonAnchor = document.createElement("a");
    confirmButtonAnchor.classList.add("button");
    confirmButtonAnchor.textContent = "Confirm";

    confirmButtonAnchor.addEventListener("click", Utils.closeModal);

    confirmButton.appendChild(confirmButtonAnchor);

    sortMenu.appendChild(sortMenuHeader);
    sortMenu.appendChild(openingRate);
    sortMenu.appendChild(noOfEmailsRecieved);
    sortMenu.appendChild(confirmButton);

    Utils.triggerModal(sortMenu);
  }

}
