const GMAIL_SELECT_SELECTOR = 'span[role="checkbox"]'; //TODO: This maybe seems to generic and might fail if a user has other extensions
const GMAIL_CHECKBOX_SELECTOR =
  'tr div[aria-checked="true"].oZ-jc.T-Jo.J-J5-Ji.T-Jo-Jp';

let SELECTED_THREADS = [];

class GmailNativeView {
  static async setupGmailNativeIcons() {
    const observer = new MutationObserver(
      GmailNativeView.handleGmailSelectMutations
    );

    observer.observe(document.body, { attributes: true, subtree: true });
  }

  static handleGmailSelectMutations(mutationsList, observer) {
    for (let mutation of mutationsList) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "aria-checked" &&
        mutation.target.matches(GMAIL_SELECT_SELECTOR)
      ) {
        const target = mutation.target;

        if (target.getAttribute("aria-checked") !== "false") {
          GmailNativeView.appendCustomIcon();
        }
      }
    }
  }

  static appendCustomIcon() {
    // append custom icon
    let customContainer = document.getElementById(
      "ext__native-toolbar-container"
    );

    if (customContainer) {
      customContainer.remove();
    }

    customContainer = document.createElement("div");
    customContainer.id = "ext__native-toolbar-container";

    customContainer.appendChild(GmailNativeView.createUnsubscribeBtn());
    customContainer.appendChild(GmailNativeView.createDeleteBtn());

    const nativeIcon =
      GmailNativeView.getNativeDeleteIcon() ||
      GmailNativeView.getNativeTaskIcon();

    if (nativeIcon) {
      nativeIcon.insertAdjacentElement("afterend", customContainer);
    } else {
      console.log("We can't find any native icon!");
    }
  }

  static createUnsubscribeBtn() {
    const unsubscribeBtn = document.createElement("div");
    unsubscribeBtn.classList.add("ext__native-toolbar-btn");
    unsubscribeBtn.setAttribute("data-tooltip", `${LOCALE.superUnsubscribe}`);
    unsubscribeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12px" height="12px" fill="none" stroke-width="1.5" viewBox="0 0 24 24" color="currentColor"><path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M7.143 16.995c-.393 0-.775-.043-1.143-.123-2.29-.506-4-2.496-4-4.874 0-2.714 2.226-4.923 5-4.996M13.318 9.634A5.517 5.517 0 0 0 11 7.5"></path><path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M16.857 7c.393 0 .775.043 1.143.124 2.29.505 4 2.495 4 4.874 0 2.76-2.302 4.997-5.143 4.997h-1.714c-2.826 0-5.143-2.506-5.143-4.997 0 0 0-.998.5-1.498M3 3l18 18"></path></svg>`;

    unsubscribeBtn.addEventListener("click", async () => {
      if (EXTENSION_VALIDATION_ERROR) {
        GmailNativeView.openInvalidContextErrorModal();
        return;
      }

      if (!(await UserService.isCurrentEmailLoggedIn())) {
        _openSideBar();
        return;
      }
      GmailNativeView.openUnsubscribeConfirmationModal();
    });

    return unsubscribeBtn;
  }

  static createDeleteBtn() {
    const deleteBtn = document.createElement("div");
    deleteBtn.classList.add("ext__native-toolbar-btn");
    deleteBtn.setAttribute("data-tooltip", `${LOCALE.superDelete}`);
    deleteBtn.style.background = "#F36360";
    deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12px" height="12px" fill="none" stroke-width="1.5" viewBox="0 0 24 24" color="currentColor"><path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="m20 9-1.995 11.346A2 2 0 0 1 16.035 22h-8.07a2 2 0 0 1-1.97-1.654L4 9M21 6h-5.625M3 6h5.625m0 0V4a2 2 0 0 1 2-2h2.75a2 2 0 0 1 2 2v2m-6.75 0h6.75"></path></svg>`;

    deleteBtn.addEventListener("click", async () => {
      if (EXTENSION_VALIDATION_ERROR) {
        GmailNativeView.openInvalidContextErrorModal();
        return;
      }

      if (!(await UserService.isCurrentEmailLoggedIn())) {
        _openSideBar();
        return;
      }
      GmailNativeView.openDeleteConfirmationModal();
    });

    return deleteBtn;
  }

  static getNativeDeleteIcon() {
    // delete icon
    let deleteIcons = document.querySelectorAll('div[act="10"]');
    if (!deleteIcons) {
      deleteIcons = document.querySelectorAll("div.nX");
    }

    return Array.from(deleteIcons).find((icon) => Utils.isElementVisible(icon));
  }

  static getNativeTaskIcon() {
    // task icon
    let taskIcons = document.querySelectorAll('div[act="95"]');
    if (!taskIcons) {
      taskIcons = document.querySelectorAll(".T-I.J-J5-Ji.VJ.T-I-ax7.L3");
    }

    return Array.from(taskIcons).find((icon) => Utils.isElementVisible(icon));
  }

  static createNativeList() {
    const container = document.createElement("div");
    container.classList.add("ext_gmail-native-list");

    // Everthing below would happen in a function more likely (function that collects email)
    function createItem(sender) {
      const item = document.createElement("span");

      const email = document.createElement("span");
      email.style.marginRight = "5px";
      email.textContent = sender;

      const deleteIcon = document.createElement("span");
      deleteIcon.style.display = "flex";
      deleteIcon.style.cursor = "pointer";
      deleteIcon.innerHTML = `<svg width="15px" height="15px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000" stroke-width="1.5"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 1.25C6.06294 1.25 1.25 6.06294 1.25 12C1.25 17.9371 6.06294 22.75 12 22.75C17.9371 22.75 22.75 17.9371 22.75 12C22.75 6.06294 17.9371 1.25 12 1.25ZM9.70164 8.64124C9.40875 8.34835 8.93388 8.34835 8.64098 8.64124C8.34809 8.93414 8.34809 9.40901 8.64098 9.7019L10.9391 12L8.64098 14.2981C8.34809 14.591 8.34809 15.0659 8.64098 15.3588C8.93388 15.6517 9.40875 15.6517 9.70164 15.3588L11.9997 13.0607L14.2978 15.3588C14.5907 15.6517 15.0656 15.6517 15.3585 15.3588C15.6514 15.0659 15.6514 14.591 15.3585 14.2981L13.0604 12L15.3585 9.7019C15.6514 9.40901 15.6514 8.93414 15.3585 8.64124C15.0656 8.34835 14.5907 8.34835 14.2978 8.64124L11.9997 10.9393L9.70164 8.64124Z" fill="#000000"></path></svg>`;

      deleteIcon.addEventListener("click", () => {
        GmailNativeView.setSelectedThreads(
          SELECTED_THREADS.filter((item) => item.email !== sender)
        );
        item.remove();
        const ele = document.getElementById("ext-total-count");
        ele.innerHTML = `(${SELECTED_THREADS.length})`;

        // If the last email is deselected
        if (SELECTED_THREADS.length < 1) {
          GmailNativeView.closeNativeModal();
        }

        // TODO: Implement - Deselect Row
        // GmailNativeView.removeThreadRowById(sender);
      });

      item.appendChild(email);
      item.appendChild(deleteIcon);

      return item;
    }

    SELECTED_THREADS.forEach((thread) => {
      container.appendChild(createItem(thread.email));
    });

    // return container.outerHTML;
    return container;
  }

  static openUnsubscribeConfirmationModal() {
    const totalCount = GmailNativeView.compileSelectedThreads();
    if (!totalCount) {
      // This means there's something wrong
      return;
    }

    if (INBOX_PURGE_PLAN == "FREE" && totalCount > UNSUBSCRIBES_LEFT) {
      GmailNativeView.openPaywallModal(
        `<span>${LOCALE.youHaveSelectedMoreThan} <b>${UNSUBSCRIBES_LEFT} ${LOCALE.freeUnsubscribesThisMonth}</b>.</span> <span>${LOCALE.toUnsubscribeAndDelete} <b>${totalCount} ${LOCALE.uniqueSenders}</b> ${LOCALE.considerUpgrading} 🚀</span>`
      );

      return;
    }

    const confirmationMenu = document.createElement("div");
    confirmationMenu.classList.add("ext__sidebar-root-generic-modal");
    confirmationMenu.style.width = "400px";

    const confirmationMenuHeader = document.createElement("div");
    confirmationMenuHeader.classList.add(
      "ext__sidebar-root-generic-modal-header"
    );

    confirmationMenuHeader.innerHTML = `<span>${LOCALE.unsubscribeConfirmation}</span>`;
    confirmationMenuHeader.appendChild(
      GmailNativeView.createHelpIcon(LOCALE.superUnsubscribeTooltipText)
    );
    confirmationMenuHeader.style.display = "flex";
    confirmationMenuHeader.style.justifyContent = "center";

    const confirmationContainer = document.createElement("div");
    confirmationContainer.style.textAlign = "center";
    confirmationContainer.style.borderBottom = "0.5px solid #c4c4c4";
    confirmationContainer.classList.add("ext__sidebar-root-generic-modal-body");
    // confirmationContainer.innerHTML = `${GmailNativeView.createNativeList()}<span style="border-bottom: 0.5px solid #6f6c6c;
    //     padding-bottom: 20px;">Are you sure you want to <b>unsubscribe</b> from the selected <b>(${totalCount})</b> unique sender(s)?</span>`;

    confirmationContainer.appendChild(GmailNativeView.createNativeList());
    const confirmationText = Utils.createSpan(
      `${LOCALE.areYouSureYouWantTo} <b> ${LOCALE.unsubscribeLowerCase}</b>  ${LOCALE.fromTheSelected} <b id="ext-total-count">(${totalCount})</b> ${LOCALE.uniqueSenders}?`
    );
    confirmationText.style.borderBottom = "0.5px solid #6f6c6c";
    confirmationText.style.paddingBottom = "20px";

    confirmationContainer.appendChild(confirmationText);

    const deleteSpan = document.createElement("span");
    deleteSpan.style.display = "flex";
    deleteSpan.style.justifyContent = "center";
    deleteSpan.style.fontSize = "0.75rem";
    deleteSpan.style.alignItems = "center";
    deleteSpan.style.gap = "8px";

    const deleteCheckBox = document.createElement("label");
    deleteCheckBox.className = "ext-delete_sub_switch";
    const deleteCheckBoxInput = document.createElement("input");
    deleteCheckBoxInput.id = "native-delete-emails-checkbox";
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
    deleteText.setAttribute("for", "native-delete-emails-checkbox");

    deleteText.innerHTML = `${LOCALE.deleteAllEmailsFromSelected}`;

    deleteSpan.appendChild(deleteCheckBox);
    deleteSpan.appendChild(deleteText);

    confirmationContainer.appendChild(deleteSpan);
    confirmationContainer.appendChild(
      SubscriptionView.getAdvancedDeletionOptions({
        showOptions: SUB_DELETE_CHECKED,
      })
    );

    const confirmButton = document.createElement("div");
    confirmButton.classList.add("ext__sidebar-root-sort-modal-btn");

    const confirmButtonAnchor = document.createElement("a");
    confirmButtonAnchor.classList.add("button");

    confirmButtonAnchor.textContent = `${LOCALE.confirm}`;

    confirmButtonAnchor.addEventListener("click", GmailNativeView.unsubscribe);

    confirmButton.appendChild(confirmButtonAnchor);

    confirmationMenu.appendChild(confirmationMenuHeader);
    confirmationMenu.appendChild(confirmationContainer);
    confirmationMenu.appendChild(confirmButton);

    GmailNativeView.openNativeModal(confirmationMenu);
  }

  // Ideally we should know number of unique senders(email senders) selected
  static openDeleteConfirmationModal() {
    const totalCount = GmailNativeView.compileSelectedThreads();
    if (!totalCount) {
      // This means there's something wrong
      return;
    }

    if (INBOX_PURGE_PLAN == "FREE" && totalCount > UNSUBSCRIBES_LEFT) {
      GmailNativeView.openPaywallModal(
        `<span>${LOCALE.youHaveSelectedMoreThan} <b>${UNSUBSCRIBES_LEFT} ${LOCALE.freeMailingListDeletes}</b>.</span> <span>${LOCALE.toDeleteAllEmails}</b> ${LOCALE.fromYourSelected} <b>${totalCount} ${LOCALE.senders}</b> ${LOCALE.considerUpgrading} 🚀</span>`
      );

      return;
    }

    const confirmationMenu = document.createElement("div");
    confirmationMenu.classList.add("ext__sidebar-root-generic-modal");
    confirmationMenu.style.width = "400px";

    const confirmationMenuHeader = document.createElement("div");
    confirmationMenuHeader.classList.add(
      "ext__sidebar-root-generic-modal-header"
    );
    confirmationMenuHeader.innerHTML = `<span>${LOCALE.deleteConfirmation}</span>`;
    confirmationMenuHeader.appendChild(
      GmailNativeView.createHelpIcon(LOCALE.superDeleteTooltipText)
    );
    confirmationMenuHeader.style.display = "flex";
    confirmationMenuHeader.style.justifyContent = "center";

    const confirmationContainer = document.createElement("div");
    confirmationContainer.style.textAlign = "center";
    confirmationContainer.style.borderBottom = "0.5px solid #c4c4c4";
    confirmationContainer.classList.add("ext__sidebar-root-generic-modal-body");
    // confirmationContainer.innerHTML = `${GmailNativeView.createNativeList()}<span
    //    >Are you sure you want to <b>delete ALL email(s)</b> from the selected <b>(${totalCount})</b> unique sender(s)?</span><span>Note: This will not unsubscribe or block</span>`;

    confirmationContainer.appendChild(GmailNativeView.createNativeList());
    confirmationContainer.appendChild(
      Utils.createSpan(
        `${LOCALE.areYouSureYouWantTo} <b>${LOCALE.deleteAllEmails}</b> ${LOCALE.fromTheSelected} <b id="ext-total-count">(${totalCount})</b> ${LOCALE.uniqueSenders}?`
      )
    );
    confirmationContainer.appendChild(
      Utils.createSpan(`${LOCALE.noteThisWillNotUnsubscribe}`)
    );

    confirmationContainer.appendChild(
      SubscriptionView.getAdvancedDeletionOptions({ showOptions: true })
    );

    const confirmButton = document.createElement("div");
    confirmButton.classList.add("ext__sidebar-root-sort-modal-btn");

    const confirmButtonAnchor = document.createElement("a");
    confirmButtonAnchor.classList.add("button");

    confirmButtonAnchor.textContent = `${LOCALE.confirm}`;

    confirmButtonAnchor.addEventListener("click", GmailNativeView.delete);

    confirmButton.appendChild(confirmButtonAnchor);

    confirmationMenu.appendChild(confirmationMenuHeader);
    confirmationMenu.appendChild(confirmationContainer);
    confirmationMenu.appendChild(confirmButton);

    GmailNativeView.openNativeModal(confirmationMenu);
  }

  static openPaywallModal(message) {
    const warningMenu = document.createElement("div");
    warningMenu.style.width = "400px";
    warningMenu.style.fontStyle = "13px";
    warningMenu.classList.add("ext__sidebar-root-generic-modal");

    const header = document.createElement("div");
    header.classList.add("ext__sidebar-root-generic-modal-header");
    header.textContent = `${LOCALE.oops} 👀`;

    const warningText = document.createElement("div");
    warningText.style.textAlign = "center";
    warningText.classList.add("ext__sidebar-root-generic-modal-body");
    warningText.innerHTML = message;
    const upgradeDiv = document.createElement("div");
    upgradeDiv.classList.add("ext__sidebar-root-sort-modal-btn");

    const upgradePlan = document.createElement("a");
    upgradePlan.style.cursor = "pointer";
    upgradePlan.classList.add("button");

    upgradePlan.textContent = `${LOCALE.unlockUnlimitedAccessNow} 🔓`;

    upgradePlan.addEventListener("click", SubscriptionView._upgradePlan);

    upgradeDiv.appendChild(upgradePlan);

    warningMenu.appendChild(header);
    warningMenu.appendChild(warningText);
    warningMenu.appendChild(upgradeDiv);

    GmailNativeView.openNativeModal(warningMenu);
  }

  static openInvalidContextErrorModal() {
    const warningMenu = document.createElement("div");
    warningMenu.style.width = "400px";
    warningMenu.style.fontStyle = "13px";
    warningMenu.classList.add("ext__sidebar-root-generic-modal");

    const header = document.createElement("div");
    header.classList.add("ext__sidebar-root-generic-modal-header");
    header.textContent = `${LOCALE.oops} 👀`;

    const warningText = document.createElement("div");
    warningText.style.textAlign = "center";
    warningText.classList.add("ext__sidebar-root-generic-modal-body");
    warningText.innerHTML = `${LOCALE.pleaseRefreshTab}`;
    const upgradeDiv = document.createElement("div");
    upgradeDiv.classList.add("ext__sidebar-root-sort-modal-btn");

    const refreshBtn = document.createElement("a");
    refreshBtn.style.cursor = "pointer";
    refreshBtn.classList.add("button");

    refreshBtn.textContent = `${LOCALE.refresh}`;

    refreshBtn.addEventListener("click", () => {
      location.reload();
    });

    upgradeDiv.appendChild(refreshBtn);

    warningMenu.appendChild(header);
    warningMenu.appendChild(warningText);
    warningMenu.appendChild(upgradeDiv);

    GmailNativeView.openNativeModal(warningMenu);
  }

  static async unsubscribe() {
    const checkbox = document.getElementById("native-delete-emails-checkbox");

    await MessageService.send("native-unsubscribe", {
      email: UserService.getCurrentEmail(),
      selectedList: SELECTED_THREADS,
      deleteEmails: checkbox.checked,
      ...(checkbox.checked && { deleteFilters: DELETION_FILTERS_MAP }),
    });

    if (
      checkbox.checked &&
      !DELETION_FILTERS_MAP.excludeImportantEmails &&
      !DELETION_FILTERS_MAP.excludeStarredEmails
    ) {
      SELECTED_THREADS.forEach((thread) => {
        GmailNativeView.removeThreadRowById(thread.email);
      });
    }

    GmailNativeView.unSelectAll();

    GmailNativeView.closeNativeModal();
    showNativeToast(
      `${LOCALE.unsubscribing}${
        checkbox.checked ? ` & ${LOCALE.deleting}` : ""
      }`,
      `${LOCALE.thisMightTakeSomeTime}`,
      "success",
      checkbox.checked 
    );
  }

  static async delete() {
    await MessageService.send("native-delete", {
      email: UserService.getCurrentEmail(),
      selectedList: SELECTED_THREADS,
      deleteFilters: DELETION_FILTERS_MAP,
    });

    if (
      !DELETION_FILTERS_MAP.excludeImportantEmails &&
      !DELETION_FILTERS_MAP.excludeStarredEmails
    ) {
      SELECTED_THREADS.forEach((thread) => {
        GmailNativeView.removeThreadRowById(thread.email);
      });
    }
    GmailNativeView.unSelectAll();

    GmailNativeView.closeNativeModal();
    showNativeToast(
      `${LOCALE.deleting}`,
      `${LOCALE.thisMightTakeSomeTime}`,
      "success",
      true
    );
  }

  static unSelectAll() {
    const gmailSelects = document.querySelectorAll('span[role="checkbox"]');

    if (gmailSelects) {
      Array.from(gmailSelects).forEach((gmailSelect) => {
        if (gmailSelect.getAttribute("aria-checked") !== "false") {
          gmailSelect.click();
        }
      });
    }
  }

  static removeThreadRow() {
    Array.from(document.querySelectorAll(GMAIL_CHECKBOX_SELECTOR)).forEach(
      (e) => {
        if (e.parentNode && e.parentNode.parentNode) {
          e.parentNode.parentNode.remove();
        }
      }
    );
    // Remove from thread, if exist in unsubscribe list, remove as well??
  }

  static removeThreadRowById(id) {
    const THREAD_SELECTOR = "tr div[aria-checked].oZ-jc.T-Jo.J-J5-Ji";
    Array.from(document.querySelectorAll(THREAD_SELECTOR)).forEach((e) => {
      if (e.parentNode && e.parentNode.parentNode) {
        const email = e.parentNode.parentNode
          .querySelector("span[email]")
          ?.getAttribute("email");
        if (email === id) {
          e.parentNode.parentNode.remove();
        }
      }
    });
  }

  static getEmailAndMessageId(thread) {
    const name = thread.querySelector("span[name]").getAttribute("name");

    const email = thread.querySelector("span[email]").getAttribute("email");

    const messageId = thread
      .querySelector("span[data-legacy-last-message-id]")
      .getAttribute("data-legacy-last-message-id");

    return {
      name,
      email,
      messageId,
    };
  }

  static compileSelectedThreads() {
    const threads = Array.from(
      document.querySelectorAll(GMAIL_CHECKBOX_SELECTOR)
    ).map((e) => {
      if (e.parentNode && e.parentNode.parentNode) {
        return GmailNativeView.getEmailAndMessageId(e.parentNode.parentNode);
      }
    });

    if (threads) {
      const uniqueThreads = Object.values(
        threads.reduce((acc, item) => {
          acc[item.email] = acc[item.email] ? acc[item.email] : item;
          return acc;
        }, {})
      );

      GmailNativeView.setSelectedThreads(uniqueThreads);
      return uniqueThreads.length;
    }
  }

  static compileAllThreads() {
    const threads = Array.from(
      document.querySelectorAll("tr div[aria-checked]")
    ).map((e) => {
      if (e.parentNode && e.parentNode.parentNode) {
        return GmailNativeView.getEmailAndMessageId(e.parentNode.parentNode);
      }
    });

    const uniqueThreads = Object.values(
      threads.reduce((acc, item) => {
        acc[item.email] = acc[item.email] ? acc[item.email] : item;
        return acc;
      }, {})
    );
  }

  static setSelectedThreads(threads) {
    SELECTED_THREADS = threads;
  }

  static openNativeModal(content) {
    const modal = document.querySelector(".ext__native-modal");
    if (modal && !modal.classList.contains("display-modal")) {
      modal.classList.add("display-modal");
      modal.appendChild(content);

      // Close modal on outside click
      modal.addEventListener("click", (event) => {
        if (event.target == modal) {
          modal.classList.remove("display-modal");
          if (modal.firstChild) {
            modal.removeChild(modal.firstChild);
          }
          return;
        }
      });
    }
  }

  static closeNativeModal() {
    const mainModal = document.querySelector(".ext__native-modal");
    if (mainModal) {
      mainModal.classList.remove("display-modal");
      if (mainModal.firstChild) {
        mainModal.removeChild(mainModal.firstChild);
      }
    }
  }

  static createHelpIcon(tooltipText) {
    const checkBoxTooltipIcon = document.createElement("span");
    checkBoxTooltipIcon.classList.add("ext_heading_tooltip");
    checkBoxTooltipIcon.dataset.tooltipText = tooltipText;
    checkBoxTooltipIcon.style.display = "inline-flex";
    checkBoxTooltipIcon.style.cursor = "help";
    checkBoxTooltipIcon.style.alignItems = "center";
    checkBoxTooltipIcon.style.marginLeft = "10px";
    checkBoxTooltipIcon.innerHTML = `<svg width="15px" height="15px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M9 9C9 5.49997 14.5 5.5 14.5 9C14.5 11.5 12 10.9999 12 13.9999" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M12 18.01L12.01 17.9989" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`;
    return checkBoxTooltipIcon;
  }
}
