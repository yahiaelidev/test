// Handles loading view (This is mainly because subscription is likely to take time)
let loadingIndex = 0;
const loadingTextArray = [
  `${LOCALE.subscriptionLoadingTxt1}`,
  `${LOCALE.subscriptionLoadingTxt2}`,
  `${LOCALE.subscriptionLoadingTxt3}`,
  `${LOCALE.subscriptionLoadingTxt4}`,
  `${LOCALE.subscriptionLoadingTxt5}`,
  `${LOCALE.subscriptionLoadingTxt6}`,
  `${LOCALE.subscriptionLoadingTxt7}`,
  `${LOCALE.subscriptionLoadingTxt8}`,
  `${LOCALE.subscriptionLoadingTxt9}`,
  `${LOCALE.subscriptionLoadingTxt10}`,
  `${LOCALE.subscriptionLoadingTxt11}`,
];
setInterval(() => {
  const loading = document.getElementById("subscriptions-loading");

  if (loading) {
    loading.innerText = loadingTextArray[loadingIndex];
    loadingIndex = (loadingIndex + 1) % loadingTextArray.length;
  }
}, 2000);

let MAILING_LIST = [];
let EMPTY_LIST = false;
let ERROR_FETCHING_LIST = `${LOCALE.noSubscriptionFound} 😲`;
let UNSUBSCRIBE_LIST_MAP = {};
let SUB_DELETE_CHECKED = true;
let SUB_SORT_ALGO = "num-emails-asc"; //num-emails-desc
let DELETION_FILTERS_MAP = {
  excludeImportantEmails: false,
  excludeStarredEmails: false,
};
class SubscriptionView {
  static render() {
    const root = document.createElement("div");
    root.classList.add("ext__sidebar-root-sub-block");

    if (MAILING_LIST.length > 0 || EMPTY_LIST) {
      root.appendChild(SubscriptionView._createMenu());
      if (EMPTY_LIST) {
        root.appendChild(
          SubscriptionView._createEmptyList(ERROR_FETCHING_LIST)
        );
      } else {
        const selectCount = Object.values(UNSUBSCRIBE_LIST_MAP).length;
        root.appendChild(SubscriptionView._createSubscriptionList());
        root.appendChild(
          Component.createSelectFooter(selectCount, "sub-select-count")
        );
        // root.appendChild(SubscriptionView._createSelectedDiv());
      }
    } else {
      root.appendChild(SubscriptionView._createLoadingList());
    }

    return root;
  }

  static handleMailingList(request) {
    if (request.mailingList.length > 0) {
      MAILING_LIST = request.mailingList;
    } else {
      EMPTY_LIST = true;
      if (request.error) {
        ERROR_FETCHING_LIST = `${LOCALE.errorFetchingMailingList} 😢`;
      }
    }
  }

  static async getMailingList(ignoreCache) {
    if (!(await UserService.isCurrentEmailLoggedIn())) {
      return;
    }

    SubscriptionView._reset();
    Utils.switchViewTo(MainView.render(true));

    await MessageService.send("get-mailing-list", {
      email: UserService.getCurrentEmail(),
      ignoreCache: ignoreCache || false,
    });
  }

  static _reset() {
    MAILING_LIST = [];
    EMPTY_LIST = false;
    ERROR_FETCHING_LIST = `${LOCALE.noSubscriptionFound} 😲`;
    UNSUBSCRIBE_LIST_MAP = {};
  }

  static _createMenu() {
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "15px";

    // container.appendChild(SubscriptionView._createSearchField());
    container.appendChild(
      Component.createSearchBar(
        SubscriptionView._onSearch,
        `${LOCALE.searchYourSubscriptions}`
      )
    );
    container.appendChild(SubscriptionView._createBtnMenu());

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

    mainButtons.appendChild(SubscriptionView._createMenuUnsubscribeBtn());
    mainButtons.appendChild(SubscriptionView._createMenuDeleteBtn());

    const utilityOptions = document.createElement("div");
    utilityOptions.style.display = "flex";
    utilityOptions.style.alignItems = "center";
    utilityOptions.style.gap = "13px";

    const sortBtn = SubscriptionView._createMenuSortBtn();
    const rescanBtn = SubscriptionView._createMenuRescanBtn();

    utilityOptions.appendChild(rescanBtn);
    utilityOptions.appendChild(sortBtn);

    menuDiv.appendChild(mainOptions);
    menuDiv.appendChild(utilityOptions);

    return menuDiv;
  }

  static _createSearchField() {
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
    searchInput.placeholder = `${LOCALE.searchYourSubscriptions}`;

    searchInput.addEventListener("input", SubscriptionView._onSearch);

    // searchDiv.appendChild(searchIcon);
    searchDiv.appendChild(searchInput);

    menuDiv.appendChild(searchDiv);

    return menuDiv;
  }

  static _onSearch(event) {
    const currentList = document.getElementById("subscription-list");

    if (currentList) {
      const searchText = event.target.value;
      if (searchText && searchText.length > 0) {
        const regex = new RegExp(Utils.escapeRegex(searchText), "i");
        const results = MAILING_LIST.filter(
          (list) => regex.test(list.senderName) || regex.test(list.senderEmail)
        );
        const newList = SubscriptionView._createSubscriptionList(results);
        currentList.replaceWith(newList);
      } else {
        const originalList =
          SubscriptionView._createSubscriptionList(MAILING_LIST);
        currentList.replaceWith(originalList);
      }
    }
  }

  static _setSelectCount() {
    const selectCount = Object.values(UNSUBSCRIBE_LIST_MAP).length;
    const count = document.getElementById("sub-select-count");
    count.innerHTML = selectCount;
  }

  static _createMenuUnsubscribeBtn() {
    const unsubscribeDiv = document.createElement("div");
    unsubscribeDiv.title = `${LOCALE.unsubscribe}`;

    const unsubscribeLink = document.createElement("a");
    unsubscribeLink.classList.add("inbox-purge-custom-btn");
    unsubscribeLink.href = "#";

    unsubscribeLink.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="none" stroke-width="1.5" viewBox="0 0 24 24" color="currentColor"><path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M7.143 16.995c-.393 0-.775-.043-1.143-.123-2.29-.506-4-2.496-4-4.874 0-2.714 2.226-4.923 5-4.996M13.318 9.634A5.517 5.517 0 0 0 11 7.5"></path><path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M16.857 7c.393 0 .775.043 1.143.124 2.29.505 4 2.495 4 4.874 0 2.76-2.302 4.997-5.143 4.997h-1.714c-2.826 0-5.143-2.506-5.143-4.997 0 0 0-.998.5-1.498M3 3l18 18"></path></svg>${LOCALE.unsubscribe}`;

    unsubscribeDiv.appendChild(unsubscribeLink);

    unsubscribeDiv.addEventListener("click", SubscriptionView._unsubscribe);

    return unsubscribeDiv;
  }

  static _createMenuDeleteBtn() {
    const deleteDiv = document.createElement("div");
    deleteDiv.title = `${LOCALE.delete}`;

    const deleteLink = document.createElement("a");
    deleteLink.classList.add("inbox-purge-custom-btn");
    deleteLink.style.background = "#F36360";
    deleteLink.href = "#";

    deleteLink.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="none" stroke-width="1.5" viewBox="0 0 24 24" color="currentColor"><path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="m20 9-1.995 11.346A2 2 0 0 1 16.035 22h-8.07a2 2 0 0 1-1.97-1.654L4 9M21 6h-5.625M3 6h5.625m0 0V4a2 2 0 0 1 2-2h2.75a2 2 0 0 1 2 2v2m-6.75 0h6.75"></path></svg>${LOCALE.delete}`;

    deleteDiv.appendChild(deleteLink);

    deleteDiv.addEventListener("click", SubscriptionView._delete);

    return deleteDiv;
  }

  static _openConfirmation() {
    const confirmationMenu = document.createElement("div");
    confirmationMenu.classList.add("ext__sidebar-root-generic-modal");
    confirmationMenu.style.width = "320px";

    const confirmationMenuHeader = document.createElement("div");
    confirmationMenuHeader.classList.add(
      "ext__sidebar-root-generic-modal-header"
    );
    confirmationMenuHeader.textContent = `${LOCALE.unsubscribeConfirmation}`;

    const confirmationText = document.createElement("div");
    confirmationText.style.textAlign = "center";
    confirmationText.style.borderBottom = "0.5px solid #c4c4c4";
    confirmationText.classList.add("ext__sidebar-root-generic-modal-body");
    confirmationText.innerHTML = `<span style="border-bottom: 0.5px solid #6f6c6c;
    padding-bottom: 20px;">${LOCALE.areYouSureYouWantTo} <b>${
      LOCALE.unsubscribeLowerCase
    }</b> ${LOCALE.fromTheSelected} <b>(${
      Object.values(UNSUBSCRIBE_LIST_MAP).length
    })</b> ${LOCALE.mailingList}?</span>`;

    const deleteSpan = document.createElement("span");
    deleteSpan.style.display = "flex";
    deleteSpan.style.justifyContent = "center";
    deleteSpan.style.fontSize = "0.75rem";
    deleteSpan.style.alignItems = "center";
    deleteSpan.style.gap = "8px";

    // NEW DELETE IMPLEMENTATION
    const deleteCheckBox = document.createElement("label");
    deleteCheckBox.className = "ext-delete_sub_switch";
    const deleteCheckBoxInput = document.createElement("input");
    deleteCheckBoxInput.id = "delete-emails-checkbox";
    deleteCheckBoxInput.type = "checkbox";
    deleteCheckBoxInput.checked = SUB_DELETE_CHECKED;
    const deleteCheckBoxSpan = document.createElement("span");
    deleteCheckBoxSpan.className = "ext-delete_sub_slider";
    deleteCheckBox.appendChild(deleteCheckBoxInput);
    deleteCheckBox.appendChild(deleteCheckBoxSpan);

    deleteCheckBoxInput.addEventListener("change", function (event) {
      SUB_DELETE_CHECKED = event.target.checked;
      SubscriptionView.handleDeleteOptionsSwitch();
    });

    const deleteText = document.createElement("label");
    deleteText.style.cursor = "pointer";
    deleteText.style.fontWeight = "600";
    deleteText.setAttribute("for", "delete-emails-checkbox");

    deleteText.innerHTML = `${
      LOCALE.delete
    } ${SubscriptionView._getSumOfSelectedEmails()} ${
      LOCALE.emailsFromSelected
    }`;

    deleteSpan.appendChild(deleteCheckBox);
    deleteSpan.appendChild(deleteText);

    confirmationText.appendChild(deleteSpan);

    confirmationText.appendChild(
      SubscriptionView.getAdvancedDeletionOptions({
        showOptions: SUB_DELETE_CHECKED,
      })
    ); // "Exclude options"

    const confirmButton = document.createElement("div");
    confirmButton.classList.add("ext__sidebar-root-sort-modal-btn");

    const confirmButtonAnchor = document.createElement("a");
    confirmButtonAnchor.classList.add("button");

    confirmButtonAnchor.textContent = `${LOCALE.confirm}`;

    confirmButtonAnchor.addEventListener(
      "click",
      SubscriptionView._sendUnsubscribeMessage
    );

    confirmButton.appendChild(confirmButtonAnchor);

    confirmationMenu.appendChild(confirmationMenuHeader);
    confirmationMenu.appendChild(confirmationText);
    confirmationMenu.appendChild(confirmButton);

    Utils.triggerModal(confirmationMenu);
  }

  static _openDeleteConfirmation() {
    const confirmationMenu = document.createElement("div");
    confirmationMenu.classList.add("ext__sidebar-root-generic-modal");
    confirmationMenu.style.width = "320px";

    const confirmationMenuHeader = document.createElement("div");
    confirmationMenuHeader.classList.add(
      "ext__sidebar-root-generic-modal-header"
    );
    confirmationMenuHeader.textContent = "Delete Confirmation";

    const confirmationText = document.createElement("div");
    confirmationText.style.textAlign = "center";
    confirmationText.style.borderBottom = "0.5px solid #c4c4c4";
    confirmationText.classList.add("ext__sidebar-root-generic-modal-body");
    confirmationText.innerHTML = `<span 
   >${LOCALE.areYouSureYouWantTo} <b>${
      LOCALE.delete
    } ${SubscriptionView._getSumOfSelectedEmails()} ${LOCALE.emails}</b> ${
      LOCALE.fromTheSelected
    } <b>(${Object.values(UNSUBSCRIBE_LIST_MAP).length})</b> ${
      LOCALE.mailingList
    }?</span><span>${LOCALE.noteThisWillNotUnsubscribe}</span>`;

    confirmationText.appendChild(
      SubscriptionView.getAdvancedDeletionOptions({ showOptions: true })
    ); // Exlusion options

    const confirmButton = document.createElement("div");
    confirmButton.classList.add("ext__sidebar-root-sort-modal-btn");

    const confirmButtonAnchor = document.createElement("a");
    confirmButtonAnchor.classList.add("button");

    confirmButtonAnchor.textContent = `${LOCALE.confirm}`;

    confirmButtonAnchor.addEventListener(
      "click",
      SubscriptionView._sendDeleteMessage
    );

    confirmButton.appendChild(confirmButtonAnchor);

    confirmationMenu.appendChild(confirmationMenuHeader);
    confirmationMenu.appendChild(confirmationText);
    confirmationMenu.appendChild(confirmButton);

    Utils.triggerModal(confirmationMenu);
  }

  static async _sendUnsubscribeMessage() {
    const checkbox = document.getElementById("delete-emails-checkbox");
    Utils.closeModal();
    Utils.launchGlobalLoadingModal(
      `${LOCALE.unsubscribing}${
        checkbox.checked ? ` & ${LOCALE.deleting}` : ""
      }, ${LOCALE.thisMightTakeSomeTime}`
    );

    await MessageService.send("unsubscribe", {
      email: UserService.getCurrentEmail(),
      unsubscribeList: Object.values(UNSUBSCRIBE_LIST_MAP),
      deleteEmails: checkbox.checked,
      ...(checkbox.checked && { deleteFilters: DELETION_FILTERS_MAP }),
    });
  }

  static async _sendDeleteMessage() {
    Utils.closeModal();
    Utils.launchGlobalLoadingModal(
      `${LOCALE.deleting}, ${LOCALE.thisMightTakeSomeTime}`
    );

    await MessageService.send("delete", {
      email: UserService.getCurrentEmail(),
      deleteList: Object.values(UNSUBSCRIBE_LIST_MAP),
      deleteFilters: DELETION_FILTERS_MAP,
    });
  }

  static openGenericModal(text, height, buttonText, onClick, gifSrc) {
    const warningMenu = document.createElement("div");
    // warningMenu.style.height = height || "175px";
    warningMenu.style.width = "320px";
    warningMenu.style.fontStyle = "13px";
    warningMenu.classList.add("ext__sidebar-root-generic-modal");

    const header = document.createElement("div");
    header.classList.add("ext__sidebar-root-generic-modal-header");
    header.textContent = `${LOCALE.oops} 👀`;

    const warningText = document.createElement("div");
    warningText.style.textAlign = "center";
    warningText.classList.add("ext__sidebar-root-generic-modal-body");
    warningText.innerHTML = text;

    const goBack = document.createElement("div");
    goBack.classList.add("ext__sidebar-root-sort-modal-btn");

    const goBackAnchor = document.createElement("a");
    goBackAnchor.style.cursor = "pointer";
    goBackAnchor.classList.add("button");

    goBackAnchor.textContent = buttonText || `${LOCALE.goBack}`;

    goBackAnchor.addEventListener("click", onClick || Utils.closeModal);

    goBack.appendChild(goBackAnchor);

    warningMenu.appendChild(header);
    warningMenu.appendChild(warningText);
    if (gifSrc) {
      const imgGif = document.createElement("img");
      imgGif.src = gifSrc;
      imgGif.style.height = "300px";
      imgGif.style.width = "100%";
      warningMenu.appendChild(imgGif);
      warningText.style.fontWeight = "500";
    }
    warningMenu.appendChild(goBack);

    Utils.triggerModal(warningMenu);
  }

  static _upgradePlan() {
    Utils.closeModal();
    GmailNativeView.closeNativeModal();
    window.open(
      "http://inboxpurge.com/pricing?ref=upgrade_plan",
      "_blank",
      "noopener,noreferrer"
    );
  }

  static async _unsubscribe() {
    const unsubscribeListArr = Object.values(UNSUBSCRIBE_LIST_MAP);
    if (unsubscribeListArr.length > 0) {
      if (
        INBOX_PURGE_PLAN == "FREE" &&
        unsubscribeListArr.length > UNSUBSCRIBES_LEFT
      ) {
        const textContent = `<span>${
          LOCALE.youHaveSelectedMoreThan
        } <b>${UNSUBSCRIBES_LEFT} ${
          LOCALE.freeUnsubscribesThisMonth
        }</b>.</span> <span>${LOCALE.toUnsubscribeAndDelete} <b>${
          Object.values(UNSUBSCRIBE_LIST_MAP).length
        } ${LOCALE.mailingList}</b> ${LOCALE.considerUpgrading} 🚀</span>`;

        SubscriptionView.openGenericModal(
          textContent,
          "340px",
          `${LOCALE.unlockUnlimitedAccessNow} 🔓`,
          SubscriptionView._upgradePlan
        );
      } else {
        SubscriptionView._openConfirmation();
      }
    } else {
      SubscriptionView.openGenericModal(
        `${LOCALE.pleaseSelectOneSub}`,
        null,
        null,
        null,
        `${BASE_URL}/images/gif/unsubscribe-warning.gif`
      );
    }
  }

  static async _delete() {
    const unsubscribeListArr = Object.values(UNSUBSCRIBE_LIST_MAP);
    if (unsubscribeListArr.length > 0) {
      if (
        INBOX_PURGE_PLAN == "FREE" &&
        unsubscribeListArr.length > UNSUBSCRIBES_LEFT
      ) {
        const textContent = `<span>${
          LOCALE.youHaveSelectedMoreThan
        } <b>${UNSUBSCRIBES_LEFT} ${
          LOCALE.freeMailingListDeletes
        }</b>.</span> <span>${
          LOCALE.toDelete
        } <b>${SubscriptionView._getSumOfSelectedEmails()} ${
          LOCALE.emails
        }</b> ${LOCALE.fromYourSelected} <b>${
          Object.values(UNSUBSCRIBE_LIST_MAP).length
        } ${LOCALE.mailingList}</b> ${LOCALE.considerUpgrading} 🚀</span>`;
        SubscriptionView.openGenericModal(
          textContent,
          "340px",
          `${LOCALE.unlockUnlimitedAccessNow} 🔓`,
          SubscriptionView._upgradePlan
        );
      } else {
        SubscriptionView._openDeleteConfirmation();
      }
    } else {
      SubscriptionView.openGenericModal(
        `${LOCALE.pleaseSelectOneDelete}`,
        null,
        null,
        null,
        `${BASE_URL}/images/gif/delete-warning.gif`
      );
    }
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

    helpDiv.addEventListener("click", Utils.triggerProductTour);

    return helpDiv;
  }

  static _createMenuSortBtn() {
    const sortDiv = document.createElement("div");
    sortDiv.title = `${LOCALE.sort}`;

    const sortLink = document.createElement("a");
    sortLink.href = "#";

    const sortIcon = document.createElement("i");
    sortIcon.style.display = "flex";
    sortIcon.style.alignItems = "center";
    sortIcon.className = "material-icons sort";
    // sortIcon.textContent = "sort";
    sortIcon.innerHTML =
      '<svg width="25px" height="25px" viewBox="0 0 24 24" stroke-width="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M10 14H2M8 10H2M6 6H2M12 18H2M19 20V4m0 16l3-3m-3 3l-3-3m3-13l3 3m-3-3l-3 3" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
    sortLink.appendChild(sortIcon);

    sortDiv.appendChild(sortLink);

    sortDiv.addEventListener("click", SubscriptionView._openSortMenu);

    return sortDiv;
  }

  static _createMenuRescanBtn() {
    const rescan = document.createElement("div");
    rescan.title = `${LOCALE.rescan}`;

    const rescanLink = document.createElement("a");
    rescanLink.href = "#";
    rescan.appendChild(rescanLink);

    const rescanIcon = document.createElement("i");
    rescanIcon.style.display = "flex";
    rescanIcon.style.alignItems = "center";
    rescanIcon.className = "material-icons sort";
    // rescanIcon.textContent = "refresh";
    rescanIcon.innerHTML =
      '<svg width="20px" height="20px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M21.888 13.5C21.164 18.311 17.013 22 12 22 6.477 22 2 17.523 2 12S6.477 2 12 2c4.1 0 7.625 2.468 9.168 6" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M17 8h4.4a.6.6 0 00.6-.6V3" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
    rescanLink.appendChild(rescanIcon);

    rescan.addEventListener("click", SubscriptionView.rescanMailingList);

    return rescan;
  }

  // This ignore cache and pulls directly
  static async rescanMailingList() {
    await SubscriptionView.getMailingList(true);
  }

  static async refreshMailingList() {
    await SubscriptionView.getMailingList();
  }

  static _createSubscriptionList(customList) {
    const listDiv = document.createElement("div");
    listDiv.id = "subscription-list";

    const list = document.createElement("ul");
    list.className = "ext__sidebar-root-sub-list";

    const subList = (customList || MAILING_LIST)
      .map((mailingList) => ({
        ...(mailingList.logoUrl && { logo: mailingList.logoUrl }),
        labelName: mailingList.senderName,
        labelEmail: Utils.shortenText(mailingList.senderEmail),
        labelEmailFull: mailingList.senderEmail,
        noOfEmailsRecieved:
          mailingList.totalCount !== undefined ? mailingList.totalCount : 1,
        // noOfOpenedEmails: mailingList.openedCount,
        unsubscribeURL: mailingList.unsubscribeURL,
        messageIds: mailingList.messageIds,
      }))
      .sort(SubscriptionView._sortSubscription);

    for (let item of subList) {
      const listItem = SubscriptionView._createListItem(item);
      list.appendChild(listItem);
    }

    listDiv.appendChild(list);

    return listDiv;
  }

  // static _createEmptyList(text) {
  //   const listDiv = document.createElement("div");
  //   listDiv.id = "subscription-list";

  //   const list = document.createElement("div");
  //   list.className = "ext__sidebar-root-sub-list-empty-state";
  //   // list.textContent = text; Error and No Subs found

  //   list.innerHTML = `
  //       <div style="padding: 16px; text-align: center;">
  //         <h2 style="margin: 0 0 8px; font-size: 16px; font-weight: bold;">
  //          ${text}
  //         </h2>
  //         <p style="margin: 0 0 12px; font-size: 14px; color: #666;">
  //          ${LOCALE.stillSeeingUnwantedEmails}
  //         </p>
  //         <a
  //          href="#"
  //       id="start-tour-link"
  //           style="display: inline-block; font-size: 14px; color: #0073e6; text-decoration: underline;"
  //         >
  //           ${LOCALE.learnHow} »
  //         </a>
  //       </div>
  //     `;

  //   listDiv.appendChild(list);

  //   const tourLink = listDiv.querySelector("#start-tour-link");
  //   if (tourLink) {
  //     tourLink.addEventListener("click", (e) => {
  //       e.preventDefault();
  //       Utils.triggerProductTourV2(2);
  //     });
  //   }

  //   return listDiv;
  // }

  static _createEmptyList(text) {
    const listDiv = document.createElement("div");
    listDiv.id = "subscription-list";

    const list = document.createElement("div");
    list.className = "ext__sidebar-root-sub-list-empty-state";

    const wrapper = document.createElement("div");
    wrapper.style.padding = "16px";
    wrapper.style.textAlign = "center";

    const h2 = document.createElement("h2");
    h2.style.margin = "0 0 8px";
    h2.style.fontSize = "16px";
    h2.style.fontWeight = "bold";
    h2.textContent = text;
    wrapper.appendChild(h2);

    const p = document.createElement("p");
    p.style.margin = "0 0 12px";
    p.style.fontSize = "14px";
    p.style.color = "#666";
    p.textContent = LOCALE.stillSeeingUnwantedEmails;
    wrapper.appendChild(p);

    const link = document.createElement("a");
    link.href = "#";
    link.textContent = `${LOCALE.learnHow} »`;
    link.style.display = "inline-block";
    link.style.fontSize = "14px";
    link.style.color = "#0073e6";
    link.style.textDecoration = "underline";
    link.style.cursor = "pointer";

    link.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopImmediatePropagation(); // prevent Gmail from catching it
      Utils.triggerProductTourV2(2); 
    });

    wrapper.appendChild(link);

    list.appendChild(wrapper);
    listDiv.appendChild(list);
    return listDiv;
  }

  static _createLoadingList() {
    const listDiv = document.createElement("div");

    const loadingText = document.createElement("div");
    loadingText.id = "subscriptions-loading";
    loadingText.style.color = "black";
    loadingText.style.fontSize = "15px";
    loadingText.style.textAlign = "center";
    loadingText.style.marginBottom = "30px";
    loadingText.textContent = `${LOCALE.loading}`;

    const list = document.createElement("ul");
    list.className = "ext__sidebar-root-sub-list";
    list.style.overflowY = "hidden";

    for (let i = 0; i < 6; i++) {
      const listItem = SubscriptionView._createSkeletonListItem();
      list.appendChild(listItem);
    }

    listDiv.appendChild(loadingText);
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
    listItemCheckbox.checked =
      UNSUBSCRIBE_LIST_MAP[item.labelEmailFull] != undefined;

    listItemCheckDiv.appendChild(listItemCheckbox);

    listItemCheckbox.addEventListener("change", (event) => {
      if (event.target.checked) {
        UNSUBSCRIBE_LIST_MAP[item.labelEmailFull] = item;
        listItem.classList.add("ext__active-list-item");
      } else {
        delete UNSUBSCRIBE_LIST_MAP[item.labelEmailFull];
        listItem.classList.remove("ext__active-list-item");
      }
      SubscriptionView._setSelectCount();
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
      // item.labelName[0] === `"` ? item.labelName[1] : item.labelName[0];
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
    listItemEmailDiv.style.cursor = "pointer";
    listItemEmailDiv.addEventListener("click", () => {
      Utils.getEmails(item.labelEmailFull);
    });
    listItemEmailDiv.className = "ext__label-email";
    listItemEmailDiv.textContent = item.labelEmail;
    listItemLabelDiv.appendChild(listItemEmailDiv);

    const listItemButtonsDiv = document.createElement("div");
    listItemButtonsDiv.className = "ext__sidebar-root-sub-buttons";
    listItemButtonsDiv.style.display = "flex";
    // listItemButtonsDiv.style.gap = "15px";
    listItemButtonsDiv.style.margin = "0px 15px";
    listItemButtonsDiv.style.fontSize = "14px";

    // const openRate = document.createElement("span");
    // openRate.title = "Opening rate";
    // openRate.style.cursor = "help";
    // openRate.style.color = "rgb(94, 93, 240)";
    // openRate.innerHTML = `20%`;

    const noOfEmailsRecieved = document.createElement("span");
    noOfEmailsRecieved.title = `${LOCALE.noEmailsRecieved}`;
    noOfEmailsRecieved.style.cursor = "help";
    // noOfEmailsRecieved.style.color = "rgb(94, 93, 240)";
    noOfEmailsRecieved.style.padding = "5px";
    noOfEmailsRecieved.style.fontWeight = "600";
    noOfEmailsRecieved.innerHTML = `${item.noOfEmailsRecieved}`;

    // listItemButtonsDiv.appendChild(openRate);
    listItemButtonsDiv.appendChild(noOfEmailsRecieved);

    listItemDiv.appendChild(listItemButtonsDiv);

    return listItem;
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

    return listItem;
  }

  static _openSortMenu() {
    //   The most opened emails
    //   The least opened emails
    //  Number of emails recieved
    //  From the highest to the lowest
    //  From the lowest to the lowest
    const sortMenu = document.createElement("div");
    sortMenu.classList.add("ext__sidebar-root-sort-modal");
    sortMenu.style.width = "300px";

    const sortMenuHeader = document.createElement("div");
    sortMenuHeader.classList.add("ext__sidebar-root-sort-modal-header");
    sortMenuHeader.textContent = `${LOCALE.sortBy}`;

    const openingRate = document.createElement("div");
    openingRate.classList.add("ext__sidebar-root-sort-modal-option");

    const openingRateHeader = document.createElement("span");
    openingRateHeader.classList.add(
      "ext__sidebar-root-sort-modal-option-header"
    );
    openingRateHeader.textContent = "Opening Rate";

    const openingRateOption1 = document.createElement("span");
    openingRateOption1.innerHTML =
      '<label><input type="radio"  class="sort-radio-margin" name="sort" id="open-rate-asc"> The most opened emails</label>';

    const openingRateOption2 = document.createElement("span");
    openingRateOption2.innerHTML =
      '<label><input type="radio"  class="sort-radio-margin" name="sort" id="open-rate-desc"> The least opened emails</label>';

    // openingRate.appendChild(openingRateHeader);
    // openingRate.appendChild(openingRateOption1);
    // openingRate.appendChild(openingRateOption2);

    const noOfEmailsRecieved = document.createElement("div");
    noOfEmailsRecieved.classList.add("ext__sidebar-root-sort-modal-option");

    const noOfEmailsHeader = document.createElement("span");
    noOfEmailsHeader.classList.add(
      "ext__sidebar-root-sort-modal-option-header"
    );
    noOfEmailsHeader.textContent = `${LOCALE.noEmailsRecieved}`;

    const noOfEmailsOption1 = document.createElement("span");
    // TODO: THIS WILL BE BASED unON SETTINGS INSTEAD - MAYBE LOCAL STORAGE
    noOfEmailsOption1.innerHTML = `<label style="
      display: flex;
      align-items: center;
  "><input type="radio" class="sort-radio-margin" name="sort" id="num-emails-asc"  ${
    SUB_SORT_ALGO === "num-emails-asc" ? "checked" : ""
  }>${LOCALE.fromHighToLow}</label>`;

    const noOfEmailsOption2 = document.createElement("span");
    noOfEmailsOption2.innerHTML = `<label style="
      display: flex;
      align-items: center;
  "><input type="radio"  class="sort-radio-margin" name="sort" id="num-emails-desc" ${
    SUB_SORT_ALGO === "num-emails-desc" ? "checked" : ""
  }>${LOCALE.fromLowToHigh}</label>`;

    noOfEmailsRecieved.appendChild(noOfEmailsHeader);
    noOfEmailsRecieved.appendChild(noOfEmailsOption1);
    noOfEmailsRecieved.appendChild(noOfEmailsOption2);

    const confirmButton = document.createElement("div");
    confirmButton.classList.add("ext__sidebar-root-sort-modal-btn");

    const confirmButtonAnchor = document.createElement("a");
    confirmButtonAnchor.style.cursor = "pointer";
    confirmButtonAnchor.classList.add("button");
    confirmButtonAnchor.textContent = `${LOCALE.confirm}`;

    confirmButtonAnchor.addEventListener("click", () => {
      const selectedRadio = document.querySelector(
        'input[name="sort"]:checked'
      );
      if (selectedRadio) {
        // Set in local storage
        SUB_SORT_ALGO = selectedRadio.id;
        // trigger sort change
        const currentList = document.getElementById("subscription-list");
        if (currentList) {
          const originalList =
            SubscriptionView._createSubscriptionList(MAILING_LIST);
          currentList.replaceWith(originalList);
        }
      }
      Utils.closeModal();
    });

    confirmButton.appendChild(confirmButtonAnchor);

    sortMenu.appendChild(sortMenuHeader);
    // sortMenu.appendChild(openingRate);
    sortMenu.appendChild(noOfEmailsRecieved);
    sortMenu.appendChild(confirmButton);

    Utils.triggerModal(sortMenu);
  }

  static _sortSubscription(a, b) {
    // BASED ON SORT TYPE - num-emails-asc, num-emails-desc
    return SUB_SORT_ALGO == "num-emails-asc"
      ? b.noOfEmailsRecieved - a.noOfEmailsRecieved
      : a.noOfEmailsRecieved - b.noOfEmailsRecieved;
  }

  static _getSumOfSelectedEmails() {
    return Object.values(UNSUBSCRIBE_LIST_MAP).reduce((acc, curr) => {
      return (
        acc +
        (curr.noOfEmailsRecieved !== undefined ? curr.noOfEmailsRecieved : 1)
      );
    }, 0);
  }

  static getAdvancedDeletionOptions({ showOptions = true }) {
    const excludeOptionsAccordion = document.createElement("div");
    excludeOptionsAccordion.classList.add("ext__accordion");
    if (!showOptions) {
      excludeOptionsAccordion.style.display = "none";
      excludeOptionsAccordion.style.maxHeight = "0px";
      excludeOptionsAccordion.style.opacity = "0";
    }

    const accordionHeader = document.createElement("div");
    accordionHeader.classList.add("ext__accordion-header");
    accordionHeader.appendChild(SubscriptionView._getAccordionIcon());

    const accordionLabel = document.createElement("span");
    accordionLabel.style.display = "flex";
    accordionLabel.style.alignItems = "center";
    accordionLabel.innerHTML = LOCALE.advancedDeletionOption;
    accordionHeader.appendChild(accordionLabel);

    // TO BE USED WHEN A CERTAIN ELEMENT IS CHECKED
    const badge = document.createElement("span");
    badge.classList.add("ext__accordion_badge");

    const arrow = document.createElement("span");
    arrow.style.display = "flex";
    arrow.style.alignItems = "center";
    arrow.innerHTML = `<svg width="20px" height="20px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
    accordionHeader.appendChild(arrow);

    accordionHeader.addEventListener("click", function () {
      const content = excludeOptionsAccordion.querySelector(
        ".ext__accordion-content"
      );
      const isVisible = content.style.maxHeight !== "0px";
      if (isVisible) {
        content.style.maxHeight = "0px";
        content.style.opacity = "0";
        content.style.overflow = "hidden"; // Hide overflow when collapsed
        arrow.innerHTML = `<svg width="20px" height="20px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
      } else {
        content.style.maxHeight = content.scrollHeight + "px"; // Dynamically set the height based on content
        content.style.opacity = "1";
        content.style.overflow = "visible"; // Show overflow when expanded
        arrow.innerHTML = `<svg width="20px" height="20px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor"><path d="M6 15L12 9L18 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
      }
    });

    const accordionContent = document.createElement("div");
    accordionContent.classList.add("ext__accordion-content");
    accordionContent.style.maxHeight = "0px"; // Initially collapsed
    accordionContent.style.overflow = "hidden"; // Prevent content overflow
    accordionContent.style.opacity = "0"; // Start invisible

    function createCheckBoxLabel({
      id,
      isChecked,
      labelText,
      tooltipText,
      onChange,
    }) {
      const checkBoxLabel = document.createElement("label");
      checkBoxLabel.classList.add("ext__checkbox-label");

      const checkBox = document.createElement("input");
      checkBox.type = "checkbox";
      checkBox.id = id;
      checkBox.checked = isChecked;

      checkBox.addEventListener("change", onChange);

      const checkBoxText = document.createElement("span");
      checkBoxText.textContent = labelText;

      const checkBoxTooltipIcon = document.createElement("span");
      checkBoxTooltipIcon.classList.add("ext_accordion_tooltip");
      checkBoxTooltipIcon.dataset.tooltipText = tooltipText;
      checkBoxTooltipIcon.style.display = "inline-flex";
      checkBoxTooltipIcon.style.cursor = "help";
      checkBoxTooltipIcon.style.alignItems = "center";
      checkBoxTooltipIcon.style.marginLeft = "10px";
      checkBoxTooltipIcon.innerHTML = `<svg width="15px" height="15px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M9 9C9 5.49997 14.5 5.5 14.5 9C14.5 11.5 12 10.9999 12 13.9999" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M12 18.01L12.01 17.9989" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`;

      checkBoxLabel.appendChild(checkBox);
      checkBoxLabel.appendChild(checkBoxText);
      checkBoxLabel.appendChild(checkBoxTooltipIcon);

      return checkBoxLabel;
    }

    const exclusions = [
      {
        id: "exclude-important-emails",
        isChecked: DELETION_FILTERS_MAP.excludeImportantEmails,
        labelText: LOCALE.excludeImportantEmails,
        tooltipText: LOCALE.excludeImportantTooltipText,
        onChange: (event) => {
          DELETION_FILTERS_MAP.excludeImportantEmails = event.target.checked;
          const icon = document.getElementById("ext-accordion-icon");
          if (icon) {
            icon.replaceWith(SubscriptionView._getAccordionIcon());
          }
        },
      },
      {
        id: "exclude-starred-emails",
        isChecked: DELETION_FILTERS_MAP.excludeStarredEmails,
        labelText: LOCALE.excludeStarredEmails,
        tooltipText: LOCALE.excludeStarredTooltipText,
        onChange: (event) => {
          DELETION_FILTERS_MAP.excludeStarredEmails = event.target.checked;
          const icon = document.getElementById("ext-accordion-icon");
          if (icon) {
            icon.replaceWith(SubscriptionView._getAccordionIcon());
          }
        },
      },
    ];

    exclusions.forEach((exclusion) => {
      const exclusionCheckbox = createCheckBoxLabel(exclusion);
      accordionContent.appendChild(exclusionCheckbox);
    });

    excludeOptionsAccordion.appendChild(accordionHeader);
    excludeOptionsAccordion.appendChild(accordionContent);

    return excludeOptionsAccordion;
  }

  static handleDeleteOptionsSwitch() {
    const deleteOptions = document.querySelector(".ext__accordion");
    if (!deleteOptions) return;

    const updatedOptions = SubscriptionView.getAdvancedDeletionOptions({
      showOptions: SUB_DELETE_CHECKED,
    });

    deleteOptions.replaceWith(updatedOptions);
  }

  static _getAccordionIcon() {
    const exclusions = ["excludeImportantEmails", "excludeStarredEmails"];
    const exclusionCount = exclusions.reduce(
      (count, key) => count + (DELETION_FILTERS_MAP[key] ? 1 : 0),
      0
    );

    const accordionIcon = document.createElement("span");
    accordionIcon.id = "ext-accordion-icon";

    const svgIcon = `
      <svg width="20px" height="20px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor">
        <path d="M12 2V6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="M12 18V22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="M22 12H18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="M6 12H2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="M4.92896 4.92896L7.75738 7.75738" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="M16.2427 16.2427L19.0711 19.0711" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="M19.071 4.92896L16.2426 7.75738" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="M7.75732 16.2427L4.9289 19.0711" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
    `;

    if (exclusionCount > 0) {
      accordionIcon.textContent = exclusionCount;
      accordionIcon.classList.add("ext__accordion_badge");
    } else {
      accordionIcon.style.display = "flex";
      accordionIcon.style.alignItems = "center";
      accordionIcon.innerHTML = svgIcon;
    }

    return accordionIcon;
  }
}
