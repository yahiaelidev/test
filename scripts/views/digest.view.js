let DIGEST_AVAILABLE_SUB_LIST_MAP = {};
let DIGEST_SELECTED_SUB_LIST_MAP = {};
let SEARCH_TEXT;
let DIGEST_DISCOUNT = null;

// let SUB_LIST_FILTER = [];
const DATE_RANGE = {
  TODAY: "TODAY",
  LAST_24_HOURS: "LAST_24_HOURS",
  LAST_7_DAYS: "LAST_7_DAYS",
  LAST_30_DAYS: "LAST_30_DAYS",
};
const DIGEST_VIEW = {
  FREE_PLAN_DIGEST_VIEW: "FREE_PLAN_DIGEST_VIEW",
  ONBOARDING_VIEW: "ONBOARDING_VIEW",
  MAIN_DIGEST_VIEW: "MAIN_DIGEST_VIEW",
  EXPANDED_DIGEST_VIEW: "EXPANDED_DIGEST_VIEW",
  MAIN_DIGEST_VIEW_SKELETON: "MAIN_DIGEST_VIEW_SKELETON",
  UPDATE_DIGEST_VIEW: "UPDATE_DIGEST_VIEW",
  CREATE_DIGEST_VIEW: "CREATE_DIGEST_VIEW",
  ERROR_DIGEST_VIEW: "ERROR_DIGEST_VIEW",
  LOADER: "LOADER",
};

// default view
let CURRENT_DIGEST_VIEW = "ONBOARDING_VIEW";

const DIGEST_STATE = {
  CURRENT_RANGE_INDEX: 0,
  CURRENT_DIGEST_INDEX: 0,
  CURRENT_RANGE: DATE_RANGE.LAST_7_DAYS,
  CURRENT_DIGEST: {},
  CURATED_DIGEST: [],
  DIGEST_LIST: [],
  EXPANDED_EMAIL: null,
};

class DigestView {
  static render() {
    const root = document.createElement("div");
    root.classList.add("ext__digest-modal-content");

    const header = DigestView._createHeader();

    // For reduced screens
    const screenSizeWarning = document.createElement("div");
    screenSizeWarning.textContent = `${LOCALE.forTheBestExperienceExpand}`;
    screenSizeWarning.id = "digest-size-warning";

    const body = document.createElement("div");
    body.id = "digest-body";

    body.appendChild(DigestView._createLoader());

    root.appendChild(header);
    root.appendChild(body);
    root.appendChild(screenSizeWarning);

    const modal = document.querySelector(".ext__digest-modal");
    modal.classList.add("display-modal");
    modal.appendChild(root);

    // Replace loader with current view if exist
    if (
      DIGEST_STATE.DIGEST_LIST.length > 0 &&
      DIGEST_STATE.CURRENT_DIGEST.name
    ) {
      DigestView._setBody(CURRENT_DIGEST_VIEW);
    }

    // if (INBOX_PURGE_PLAN == "FREE") {
    //   DigestView._setBody(DIGEST_VIEW.ONBOARDING_VIEW);
    // }

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

  static _setBody(digestView) {
    const bodyDiv = document.querySelector("#digest-body");

    if (!bodyDiv) {
      return;
    }

    if (
      ![
        DIGEST_VIEW.LOADER,
        DIGEST_VIEW.MAIN_DIGEST_VIEW_SKELETON,
        DIGEST_VIEW.ERROR_DIGEST_VIEW,
      ].includes(digestView)
    ) {
      CURRENT_DIGEST_VIEW = digestView;
    }

    switch (digestView) {
      case DIGEST_VIEW.CREATE_DIGEST_VIEW:
        if (bodyDiv.firstChild) {
          bodyDiv.replaceChild(
            DigestView._createCRUDBody(),
            bodyDiv.firstChild
          );
        }
        break;
      case DIGEST_VIEW.UPDATE_DIGEST_VIEW:
        if (bodyDiv.firstChild) {
          bodyDiv.replaceChild(
            DigestView._createCRUDBody(),
            bodyDiv.firstChild
          );
        }
        break;
      case DIGEST_VIEW.MAIN_DIGEST_VIEW:
        if (bodyDiv.firstChild) {
          bodyDiv.replaceChild(
            DigestView._createMainBody(),
            bodyDiv.firstChild
          );
        }
        break;
      case DIGEST_VIEW.MAIN_DIGEST_VIEW_SKELETON:
        if (bodyDiv.firstChild) {
          bodyDiv.replaceChild(
            DigestView._createMainBodySkeleton(),
            bodyDiv.firstChild
          );
        }
        break;
      case DIGEST_VIEW.EXPANDED_DIGEST_VIEW:
        if (bodyDiv.firstChild) {
          bodyDiv.replaceChild(
            DigestView._createExpandedDigest(),
            bodyDiv.firstChild
          );
        }
        break;
      case DIGEST_VIEW.ERROR_DIGEST_VIEW:
        if (bodyDiv.firstChild) {
          bodyDiv.replaceChild(
            DigestView._createErrorDigestBody(),
            bodyDiv.firstChild
          );
        }
        break;
      case DIGEST_VIEW.FREE_PLAN_DIGEST_VIEW:
        DigestView._setupFreePlanView();
        break;
      case DIGEST_VIEW.ONBOARDING_VIEW:
        if (bodyDiv.firstChild) {
          bodyDiv.replaceChild(
            DigestView._createOnBoardingView(),
            bodyDiv.firstChild
          );
        }
        break;
      case DIGEST_VIEW.LOADER:
        if (bodyDiv.firstChild) {
          bodyDiv.replaceChild(DigestView._createLoader(), bodyDiv.firstChild);
        }
        break;
    }
  }

  static _startLoader(loadingText) {
    const bodyDiv = document.querySelector("#digest-body");
    if (bodyDiv.firstChild) {
      bodyDiv.replaceChild(
        DigestView._createLoader(loadingText),
        bodyDiv.firstChild
      );
    }
  }

  static _createLoader(loadingText) {
    const div = document.createElement("div");
    div.style.height = "80%";
    div.style.display = "flex";
    div.style.justifyContent = "center";
    div.style.alignItems = "center";
    div.style.flexDirection = "column";

    const loader = document.createElement("div");
    loader.classList.add("digest-loader");

    const loadingTextParagraph = document.createElement("p");
    loadingTextParagraph.style.fontSize = "18px";
    loadingTextParagraph.textContent = loadingText || `${LOCALE.loading}`;

    div.appendChild(loader);
    div.appendChild(loadingTextParagraph);

    return div;
  }

  static _createHeader() {
    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.style.alignItems = "center";

    const h2 = document.createElement("h2");
    // h2.innerHTML = `Inbox Digest <span style="font-size: 12px;color: cornflowerblue;">BETA</span>`;
    h2.innerHTML = `Inbox Digest`;

    const errorContainer = DigestView._createErrorContainer();

    const closeIcon = document.createElement("i");
    closeIcon.style.cursor = "pointer";
    closeIcon.innerHTML =
      '<svg width="36px" height="36px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M6.758 17.243L12.001 12m5.243-5.243L12 12m0 0L6.758 6.757M12.001 12l5.243 5.243" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>';

    closeIcon.addEventListener("click", () => {
      const mainModal = document.querySelector(".ext__digest-modal");
      mainModal.classList.remove("display-modal");
      if (mainModal.firstChild) {
        mainModal.removeChild(mainModal.firstChild);
      }
      return;
    });

    header.appendChild(h2);
    header.appendChild(errorContainer);
    header.appendChild(closeIcon);

    return header;
  }

  static closeDigestModal() {
    const mainModal = document.querySelector(".ext__digest-modal");
    if (mainModal) {
      mainModal.classList.remove("display-modal");
      if (mainModal.firstChild) {
        mainModal.removeChild(mainModal.firstChild);
      }
    }
  }

  static _createErrorContainer() {
    const errorContainer = document.createElement("div");
    errorContainer.classList.add("digest-error-container");

    const errorIcon = document.createElement("i");
    errorIcon.style.display = "flex";
    errorIcon.innerHTML = `<svg width="20px" height="20px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path
      fill="currentColor"
      d="M12 2L1 21h22M12 6l7.53 13H4.47M11 10v4h2v-4m-2 6v2h2v-2"
    ></path>
  </svg>`;

    const errorText = document.createElement("span");
    errorText.id = "digest-error-text";

    const errorContainerClose = document.createElement("i");
    errorContainerClose.style.display = "flex";
    errorContainerClose.style.cursor = "pointer";
    errorContainerClose.innerHTML = ` <svg width="25px" height="25px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor"><path d="M6.758 17.243L12.001 12m5.243-5.243L12 12m0 0L6.758 6.757M12.001 12l5.243 5.243" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;

    errorContainerClose.addEventListener("click", DigestView._hideErrorMessage);

    errorContainer.appendChild(errorIcon);
    errorContainer.appendChild(errorText);
    errorContainer.appendChild(errorContainerClose);

    return errorContainer;
  }

  static _showErrorMessage(error) {
    const errorContainer = document.querySelector(".digest-error-container");
    errorContainer.classList.add("display-modal");

    const errorText = document.getElementById("digest-error-text");
    errorText.textContent = error || `${LOCALE.somethingWentWrong}`;
  }

  static _hideErrorMessage() {
    const errorContainer = document.querySelector(".digest-error-container");
    errorContainer.classList.remove("display-modal");
  }

  static _createMainBody() {
    const body = document.createElement("div");
    body.style.display = "flex";
    body.style.flexDirection = "column";
    body.style.gap = "10px";

    // header
    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.justifyContent = "space-around";
    header.style.alignItems = "center";

    const nameContainer = document.createElement("div");
    nameContainer.style.display = "flex";
    nameContainer.style.justifyContent = "center";
    nameContainer.style.alignItems = "center";
    nameContainer.style.gap = "5px";

    const digestName = document.createElement("h1");
    digestName.textContent = DIGEST_STATE.CURRENT_DIGEST.name;
    // digestName.textContent = "My First Digest";

    nameContainer.appendChild(digestName);

    header.append(nameContainer);

    // dropdown
    const dropdown = document.createElement("div");
    dropdown.style.display = "flex";
    dropdown.style.justifyContent = "space-around";
    dropdown.style.alignItems = "center";

    const digestDropdown = document.createElement("div");
    digestDropdown.appendChild(
      DigestView._createDropdownMenu(
        [
          { name: `${LOCALE.selectADigest}`, value: "select-digest" },
          ...DIGEST_STATE.DIGEST_LIST.map((digest) => ({
            name: digest.name,
            value: digest.id,
          })),
        ],
        DIGEST_STATE.CURRENT_DIGEST.id
      )
    );

    const currentDate = document.createElement("div");
    currentDate.style.fontWeight = "500";
    currentDate.style.fontSize = "13px";
    // currentDate.style.marginBottom = "15px";
    currentDate.innerHTML = DigestView._getDateForRange(
      DIGEST_STATE.CURRENT_RANGE
    );

    const dateDropdown = document.createElement("div");
    dateDropdown.appendChild(
      DigestView._createDropdownMenu(
        [
          { name: `${LOCALE.selectARange}`, value: "select-range" },
          { name: `${LOCALE.today}`, value: 0 },
          { name: `${LOCALE.last24Hours}`, value: 1 },
          { name: `${LOCALE.last7Days}`, value: 2 },
          { name: `${LOCALE.last30Days}`, value: 3 },
        ],
        DIGEST_STATE.CURRENT_RANGE_INDEX
      )
    );

    dropdown.appendChild(digestDropdown);
    dropdown.appendChild(currentDate);
    dropdown.appendChild(dateDropdown);

    const menu = DigestView._createMainBodyMenu();
    const digest = DigestView._createMainBodyDigest();

    // combined
    body.appendChild(header);
    body.appendChild(dropdown);
    body.appendChild(menu);
    body.appendChild(digest);

    return body;
  }

  static _createMainBodySkeleton() {
    const body = document.createElement("div");
    body.style.display = "flex";
    body.style.flexDirection = "column";
    body.style.gap = "10px";

    // header
    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.justifyContent = "space-around";
    header.style.alignItems = "center";

    const nameContainer = document.createElement("div");
    nameContainer.style.display = "flex";
    nameContainer.style.justifyContent = "center";
    nameContainer.style.alignItems = "center";
    nameContainer.style.gap = "5px";

    const digestName = document.createElement("h1");
    digestName.textContent = DIGEST_STATE.CURRENT_DIGEST.name;

    nameContainer.appendChild(digestName);

    header.append(nameContainer);

    // dropdown
    const dropdown = document.createElement("div");
    dropdown.style.display = "flex";
    dropdown.style.justifyContent = "space-around";
    dropdown.style.alignItems = "center";
    dropdown.style.marginBottom = "30px";

    const digestDropdown = document.createElement("div");

    digestDropdown.appendChild(
      DigestView._createDropdownMenu(
        [
          { name: `${LOCALE.selectADigest}`, value: "select-digest" },
          ...DIGEST_STATE.DIGEST_LIST.map((digest) => ({
            name: digest.name,
            value: digest.id,
          })),
        ],
        DIGEST_STATE.CURRENT_DIGEST.id,
        true
      )
    );

    const currentDate = document.createElement("div");
    currentDate.style.fontWeight = "500";
    currentDate.style.fontSize = "13px";
    // currentDate.style.marginBottom = "15px";
    // currentDate.innerHTML = "23rd August 2023 - 24th August 2023";
    currentDate.innerHTML = DigestView._getDateForRange(
      DIGEST_STATE.CURRENT_RANGE
    );

    const dateDropdown = document.createElement("div");
    dateDropdown.appendChild(
      DigestView._createDropdownMenu(
        [
          { name: `${LOCALE.selectARange}`, value: "select-range" },
          { name: `${LOCALE.today}`, value: 0 },
          { name: `${LOCALE.last24Hours}`, value: 1 },
          { name: `${LOCALE.last7Days}`, value: 2 },
          { name: `${LOCALE.last30Days}`, value: 3 },
        ],
        DIGEST_STATE.CURRENT_RANGE_INDEX,
        true
      )
    );

    dropdown.appendChild(digestDropdown);
    dropdown.appendChild(currentDate);
    dropdown.appendChild(dateDropdown);

    // DIGEST SKELETON
    const digest = document.createElement("div");
    digest.classList.add("main-digest");
    digest.innerHTML = `<div class="main-digest-body"><div style="display: flex; justify-content: center; align-items: center;"><div style="margin-right: 10px;"><div class="skeleton" style="
    height: 50px;
    width: 50px;
"></div></div><div style="
    width: 250px;
"><div class="skeleton skeleton-text" style="
"></div><div class="skeleton skeleton-text"></div></div></div><div class="digest-email-list"><div><div class="skeleton skeleton-text" style="flex: 1 1 0%;"></div></div><div><div class="skeleton skeleton-text" style="flex: 1 1 0%;"></div></div></div></div><div class="main-digest-body"><div style="display: flex; justify-content: center; align-items: center;"><div style="margin-right: 10px;"><div class="skeleton" style="
    height: 50px;
    width: 50px;
"></div></div><div style="
    width: 250px;
"><div class="skeleton skeleton-text" style="
"></div><div class="skeleton skeleton-text"></div></div></div><div class="digest-email-list"><div><div class="skeleton skeleton-text" style="flex: 1 1 0%;"></div></div><div><div class="skeleton skeleton-text" style="flex: 1 1 0%;"></div></div></div></div>`;

    // combined
    body.appendChild(header);
    body.appendChild(dropdown);
    body.appendChild(digest);

    return body;
  }

  static _createMainBodyMenu() {
    const menu = document.createElement("div");
    menu.style.display = "flex";
    menu.style.justifyContent = "center";
    menu.style.gap = "20px";

    const edit = document.createElement("div");
    edit.classList.add("digest-icon");
    const editIcon = document.createElement("span");
    editIcon.classList.add("digest-edit");
    editIcon.innerHTML = `<svg width="20px" height="20px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M7 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-1"/><path d="M20.385 6.585a2.1 2.1 0 0 0-2.97-2.97L9 12v3h3l8.385-8.415zM16 5l3 3"/></g></svg>`;
    const editIconText = document.createElement("span");
    editIconText.textContent = `${LOCALE.editDigest}`;
    edit.appendChild(editIcon);
    edit.appendChild(editIconText);

    edit.addEventListener("click", () => {
      DigestView._setupCrud(true);
    });

    const create = document.createElement("div");
    create.classList.add("digest-icon");
    const createIcon = document.createElement("span");
    createIcon.innerHTML = `<svg width="18px" height="18px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5v2H5v14h14v-5h2z"/>
    <path fill="currentColor" d="M21 7h-4V3h-2v4h-4v2h4v4h2V9h4z"/>
</svg>`;
    const createIconText = document.createElement("span");
    createIconText.textContent = `${LOCALE.createDigest}`;
    create.appendChild(createIcon);
    create.appendChild(createIconText);

    create.addEventListener("click", () => {
      DigestView._setupCrud(false);
    });

    const refresh = document.createElement("div");
    refresh.classList.add("digest-icon");
    const refreshIcon = document.createElement("span");
    refreshIcon.innerHTML = `<svg width="18px" height="18px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M12 20q-3.35 0-5.675-2.325T4 12q0-3.35 2.325-5.675T12 4q1.725 0 3.3.712T18 6.75V4h2v7h-7V9h4.2q-.8-1.4-2.188-2.2T12 6Q9.5 6 7.75 7.75T6 12q0 2.5 1.75 4.25T12 18q1.925 0 3.475-1.1T17.65 14h2.1q-.7 2.65-2.85 4.325T12 20Z"/>
</svg>`;
    const refreshIconText = document.createElement("span");
    refreshIconText.textContent = `${LOCALE.refreshDigest}`;

    refresh.appendChild(refreshIcon);
    refresh.appendChild(refreshIconText);

    refresh.addEventListener("click", async () => {
      await DigestView._setDigestState({ range: DIGEST_STATE.CURRENT_RANGE });
    });

    menu.appendChild(refresh);
    menu.appendChild(edit);
    menu.appendChild(create);

    return menu;
  }

  static _createDigestIcon({ svg, label }) {
    const iconContainer = document.createElement("div");
    iconContainer.classList.add("digest-icon");
    const icon = document.createElement("span");
    icon.innerHTML = svg;
    const iconText = document.createElement("span");
    iconText.textContent = label;
    iconContainer.appendChild(icon);
    iconContainer.appendChild(iconText);
    return iconContainer;
  }

  static _createDropdownMenu(options, selectedIdentifier, disabled) {
    const customSelectWrapper = document.createElement("div");
    customSelectWrapper.className = "custom-select-div";

    const select = document.createElement("select");
    select.id = options[0].value;
    select.classList.add("custom-select");

    if (disabled) {
      select.disabled = true;
    }

    // Code will be different when it's a DIGEST CHANGE or when it's a CHANGE change
    select.addEventListener("change", async function () {
      if (select.id == "select-digest") {
        const selectedDigest = DIGEST_STATE.DIGEST_LIST.find(
          (d) => d.id == this.value
        );
        await DigestView._setDigestState({ digest: selectedDigest });
      }

      if (select.id == "select-range") {
        await DigestView._setDigestState({
          range: Object.values(DATE_RANGE)[this.value],
        });
      }
    });

    options.forEach((option, i) => {
      const optionEle = document.createElement("option");
      if (i === 0) {
        optionEle.disabled = true;
      }
      if (option.value === selectedIdentifier) {
        optionEle.selected = true;
      }
      optionEle.innerText = option.name;
      optionEle.value = option.value;

      select.appendChild(optionEle);
    });

    customSelectWrapper.appendChild(select);

    return customSelectWrapper;
  }

  static _createMainBodyDigest() {
    const mainBody = document.createElement("div");
    mainBody.classList.add("main-digest");

    if (DIGEST_STATE.CURATED_DIGEST.length > 0) {
      DIGEST_STATE.CURATED_DIGEST.forEach((digest) => {
        const senderDigest = DigestView._createSenderDigest(digest);
        mainBody.appendChild(senderDigest);
      });
    } else {
      mainBody.innerHTML = `<div style="margin-top: 40px;text-align: center;align-items: center;justify-content: center;gap: 20px;display: flex;flex-direction: column;font-size: 16px;width: 100%;"><div style="
      font-size: 50px;
  ">🔍 </div><span>${LOCALE.noEmailsFoundInRange}</span></div>`;
    }

    return mainBody;
  }

  static _createSenderDigest(digest) {
    const senderDigest = document.createElement("div");
    senderDigest.classList.add("main-digest-body");

    const senderHeader = document.createElement("div");
    senderHeader.style.display = "flex";
    senderHeader.style.justifyContent = "center";
    senderHeader.style.alignItems = "center";

    const senderLogo = document.createElement("div");
    senderLogo.style.marginRight = "10px";

    if (digest.senderLogo) {
      const img = document.createElement("img");
      img.src = digest.senderLogo;
      img.alt = "logo";
      img.style.width = "50px";
      img.style.height = "50px";
      senderLogo.appendChild(img);
    } else {
      const altLogo = document.createElement("span");
      altLogo.className = "digest-img-alt";
      altLogo.textContent = Utils.getFirstLetter(digest.senderName);
      senderLogo.appendChild(altLogo);
    }

    const senderLabel = document.createElement("div");

    const senderLabelName = document.createElement("div");
    senderLabelName.style.fontSize = "18px";
    senderLabelName.textContent = digest.senderName;

    const senderLabelEmail = document.createElement("div");
    senderLabelEmail.style.color = "grey";
    senderLabelEmail.textContent = digest.senderEmail;

    senderLabel.appendChild(senderLabelName);
    senderLabel.appendChild(senderLabelEmail);

    senderHeader.appendChild(senderLogo);
    senderHeader.appendChild(senderLabel);

    // email list
    const senderEmailList = DigestView._createEmailList(digest.emails);

    senderDigest.appendChild(senderHeader);
    senderDigest.appendChild(senderEmailList);
    return senderDigest;
  }

  static _createEmailList(emails) {
    const senderEmailList = document.createElement("div");
    senderEmailList.classList.add("digest-email-list");

    // TODO: SORT EMAILS BY DATE BEFORE redering them
    emails.forEach((email) => {
      const emailListItem = document.createElement("div");

      const emailTitle = document.createElement("div");
      emailTitle.style.flex = "1";
      emailTitle.textContent = email.subject;

      const emailActions = document.createElement("div");
      emailActions.style.display = "flex";
      emailActions.style.gap = "20px";

      const openInGmail = DigestView._createDigestIcon({
        label: `${LOCALE.openInGmail}`,
        svg: `<svg width="18px" height="18px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
          <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M384 224v184a40 40 0 0 1-40 40H104a40 40 0 0 1-40-40V168a40 40 0 0 1 40-40h167.48M336 64h112v112M224 288L440 72"/>
      </svg>`,
      });

      openInGmail.addEventListener("click", () => {
        DigestView._openInGmail(email.id);
      });

      const expand = DigestView._createDigestIcon({
        label: `${LOCALE.expand}`,
        svg: `<svg width="18px" height="18px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M432 320v112H320m101.8-10.23L304 304M80 192V80h112M90.2 90.23L208 208M320 80h112v112M421.77 90.2L304 208M192 432H80V320m10.23 101.8L208 304"/>
    </svg>`,
      });
      expand.addEventListener("click", () => {
        DIGEST_STATE.EXPANDED_EMAIL = email;
        DigestView._setBody(DIGEST_VIEW.EXPANDED_DIGEST_VIEW);
      });

      emailActions.appendChild(openInGmail);
      emailActions.appendChild(expand);

      emailListItem.appendChild(emailTitle);
      emailListItem.appendChild(emailActions);

      senderEmailList.appendChild(emailListItem);
    });

    return senderEmailList;
  }

  static _createExpandedDigest() {
    const body = document.createElement("div");
    body.style.display = "flex";
    body.style.flexDirection = "column";
    body.style.gap = "20px";

    const menu = document.createElement("div");
    menu.style.display = "flex";
    menu.style.justifyContent = "end";
    menu.style.paddingRight = "50px";

    const openInGmail = DigestView._createDigestIcon({
      label: `${LOCALE.openInGmail}`,
      svg: `<svg width="18px" height="18px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M384 224v184a40 40 0 0 1-40 40H104a40 40 0 0 1-40-40V168a40 40 0 0 1 40-40h167.48M336 64h112v112M224 288L440 72"/>
    </svg>`,
    });

    openInGmail.addEventListener("click", () => {
      DigestView._openInGmail(DIGEST_STATE.EXPANDED_EMAIL.id);
    });

    const goBack = DigestView._createDigestIcon({
      label: `${LOCALE.goBack}`,
      svg: `<svg width="18px" height="18px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M8 7v4L2 6l6-5v4h5a8 8 0 1 1 0 16H4v-2h9a6 6 0 0 0 0-12H8Z"/>
  </svg>`,
    });

    goBack.addEventListener("click", () => {
      const emailDigestFrame = document.getElementById("email-digest-frame");
      if (emailDigestFrame) {
        URL.revokeObjectURL(emailDigestFrame.src);
      }
      DigestView._setBody(DIGEST_VIEW.MAIN_DIGEST_VIEW);
    });

    menu.appendChild(openInGmail);
    menu.appendChild(goBack);

    const emailContent = document.createElement("div");
    emailContent.style.display = "flex";
    emailContent.style.justifyContent = "center";

    const iframe = DigestView._createDigestFrame();

    emailContent.appendChild(iframe);

    body.appendChild(menu);
    body.appendChild(emailContent);

    return body;
  }

  static _createDigestFrame() {
    const iframe = document.createElement("iframe");
    iframe.style.border = "1px solid gainsboro";
    iframe.style.padding = "20px";
    iframe.style.borderRadius = "25px";
    iframe.style.height = "65vh";
    iframe.id = "email-digest-frame";
    iframe.width = "90%";

    const htmlString = Utils.decodeBase64Url(DIGEST_STATE.EXPANDED_EMAIL?.body);
    const blob = new Blob([htmlString], { type: "text/html" });
    const blobURL = URL.createObjectURL(blob);
    iframe.src = blobURL;

    iframe.onload = function () {
      try {
        const iframeDocument =
          iframe.contentDocument || iframe.contentWindow.document;

        const styleTag = iframeDocument.createElement("style");

        const scrollbarStyles = `    
                ::-webkit-scrollbar {
                    width: 8px;
                  }
                 ::-webkit-scrollbar-track {
                    box-shadow: inset 0 0 8px grey;
                    border-radius: 8px;
                  }
                  ::-webkit-scrollbar-thumb {
                    background: grey;
                    border-radius: 8px;
                  }
                  ::-webkit-scrollbar-thumb:hover {
                    background: rgb(106, 106, 106);
                  }
            `;

        styleTag.textContent = scrollbarStyles;

        iframeDocument.head.appendChild(styleTag);

        const links = iframeDocument.querySelectorAll("a");
        if (links && links.length > 0) {
          links.forEach((link) => {
            link.setAttribute("target", "_blank");
          });
        }
      } catch (error) {
        console.error(error);
      }
    };

    return iframe;
  }

  static _setupFreePlanView() {
    // Use create view for upgrade blur
    DigestView._setupCrud(false);

    const leftCard = document.querySelector(".available-subscription-list");
    leftCard.classList.add("upgrade-blur");

    const customInputs = document.querySelectorAll(".custom-input-wrapper");

    Array.from(customInputs).forEach((input) => {
      input.classList.add("upgrade-blur");
    });

    const customLabels = document.querySelectorAll(".custom-label");

    Array.from(customLabels).forEach((label) => {
      label.classList.add("upgrade-blur");
    });

    const emptyDiv = document.getElementById("empty-selected-sub");
    emptyDiv.style.height = "400px";

    const upgradeDiv = document.createElement("div");
    upgradeDiv.style.display = "flex";
    upgradeDiv.style.flexDirection = "column";
    upgradeDiv.style.gap = "30px";

    const upgradeText = document.createElement("div");
    upgradeText.style.fontWeight = "bold";
    upgradeText.style.fontSize = "16px";
    upgradeText.textContent = `🚀 ${LOCALE.newsletterDigestOnDemand}`;

    // const upgradeParagraph = document.createElement("div");
    // upgradeParagraph.style.lineHeight = "23px";
    // upgradeParagraph.style.color = "blue";
    // upgradeParagraph.innerHTML =
    //   "Craft multiple, personalized digests from your favorite newsletters.";

    const benefitList = document.createElement("div");
    benefitList.innerHTML = `<div style="
    display: flex;
    flex-direction: column;
    gap: 10px;
    line-height: 23px;
    font-size:13px;
"><div>💌 <b>${LOCALE.craftedByYou}:</b> ${LOCALE.groupYourFavNewsletters}
</div><div>🔍 <b>${LOCALE.personalizedControl}:</b> ${LOCALE.customizeDigest}
</div><div>⏳ <b>${LOCALE.onDemandAccess}:</b> ${LOCALE.viewTailoredDigest}
</div></div>`;

    const ctaTrigger = document.createElement("div");
    ctaTrigger.style.fontSize = "13px";
    // TODO: Decide on approach for discount, ideally should be able to control this externally: I'm thinking the whole html should come from backend
    // Sample value for DIGEST_DISCOUNT: `Enjoy a <b>25%</b> discount on the <b>Annual PRO plan</b> using discount code: <b>DIGEST123</b>`;

    ctaTrigger.innerHTML = `${LOCALE.readyForAMorePersonalized} ${
      DIGEST_DISCOUNT ? DIGEST_DISCOUNT : ""
    }`;

    const upgradeBtn = document.createElement("a");
    upgradeBtn.classList.add("button");
    upgradeBtn.textContent = `${LOCALE.getALicenseNow}`;

    upgradeBtn.addEventListener("click", () => {
      window.open("https://www.inboxpurge.com/pricing", "_blank", "noopener,noreferrer");
    });

    upgradeDiv.appendChild(upgradeText);
    // upgradeDiv.appendChild(upgradeParagraph);
    upgradeDiv.appendChild(benefitList);
    upgradeDiv.appendChild(ctaTrigger);
    upgradeDiv.appendChild(upgradeBtn);

    emptyDiv.replaceChild(upgradeDiv, emptyDiv.firstChild);

    const digestBtn = document.getElementById("digest-button");
    digestBtn.classList.add("upgrade-blur");

    const newDigestBtn = digestBtn.cloneNode(true);
    digestBtn.parentNode.replaceChild(newDigestBtn, digestBtn);
    newDigestBtn.addEventListener("click", (e) => e.preventDefault());
  }

  static _createOnBoardingView() {
    const onboardingDiv = document.createElement("div");
    onboardingDiv.style.display = "flex";
    onboardingDiv.style.flexDirection = "column";
    onboardingDiv.style.gap = "30px";
    onboardingDiv.style.height = "80%";
    onboardingDiv.style.justifyContent = "center";
    onboardingDiv.style.alignItems = "center";

    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "30px";
    container.style.width = "50%";

    const upgradeText = document.createElement("div");
    upgradeText.style.fontWeight = "bold";
    upgradeText.style.fontSize = "26px";
    upgradeText.style.textAlign = "center";
    upgradeText.textContent = `🚀 ${LOCALE.newsletterDigestOnDemand}`;

    const benefitList = document.createElement("div");
    benefitList.innerHTML = `<div style="
    display: flex;
    flex-direction: column;
    gap: 10px;
    line-height: 23px;
    "><div>💌 <b>${LOCALE.craftedByYou}:</b> ${LOCALE.groupYourFavNewsletters}
    </div><div>🔍 <b>${LOCALE.personalizedControl}:</b> ${LOCALE.customizeDigest}
    </div><div>⏳ <b>${LOCALE.onDemandAccess}:</b> ${LOCALE.viewTailoredDigest}
</div></div>`;

    const ctaTrigger = document.createElement("div");
    // TODO: Decide on approach for discount, ideally should be able to control this externally: I'm thinking the whole html should come from backend
    // Sample value for DIGEST_DISCOUNT: `Enjoy a <b>25%</b> discount on the <b>Annual PRO plan</b> using discount code: <b>DIGEST123</b>`;

    ctaTrigger.innerHTML = `${LOCALE.readyForAMorePersonalized} ${
      DIGEST_DISCOUNT ? DIGEST_DISCOUNT : ""
    }`;

    const actionButtons = document.createElement("div");
    actionButtons.style.display = "flex";
    actionButtons.style.flexDirection = "column";
    actionButtons.style.gap = "10px";

    const mainBtn = document.createElement("a");
    mainBtn.classList.add("button");
    mainBtn.textContent = `${LOCALE.createYourFirstDigest}`;

    mainBtn.addEventListener("click", () => {
      DigestView._setupCrud(false);
    });

    const learnMoreBtn = document.createElement("a");
    learnMoreBtn.classList.add("button", "secondary-btn");
    learnMoreBtn.textContent = `${LOCALE.learnMore}`;

    learnMoreBtn.addEventListener("click", () => {
      window.open("https://www.inboxpurge.com/digest", "_blank", "noopener,noreferrer");
    });

    actionButtons.appendChild(mainBtn);
    actionButtons.appendChild(learnMoreBtn);

    container.appendChild(upgradeText);
    container.appendChild(benefitList);
    container.appendChild(ctaTrigger);
    container.appendChild(actionButtons);

    onboardingDiv.appendChild(container);

    return onboardingDiv;
  }

  static _createErrorDigestBody() {
    const body = document.createElement("div");
    body.style.display = "flex";
    body.style.flexDirection = "column";
    body.style.justifyContent = "center";
    body.style.alignItems = "center";
    body.style.height = "80%";
    body.style.gap = "20px";

    const icon = document.createElement("div");
    icon.innerHTML = `<svg width="100px" height="100px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="#000000" d="M12 17q.425 0 .713-.288T13 16q0-.425-.288-.713T12 15q-.425 0-.713.288T11 16q0 .425.288.713T12 17Zm-1-4h2V7h-2v6Zm1 9q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22Z"/>
</svg>`;

    const errorText = document.createElement("div");
    errorText.style.fontSize = "20px";
    errorText.textContent = `${LOCALE.oops} ${LOCALE.somethingWentWrong}...`;

    body.appendChild(icon);
    body.appendChild(errorText);

    return body;
  }

  // Will implement navigation based on this body
  static _createCRUDBody() {
    const body = document.createElement("div");
    body.style.display = "flex";
    body.style.flexDirection = "column";
    body.style.marginTop = "10px";

    const menu = document.createElement("div");
    menu.style.display = "flex";
    menu.style.justifyContent = "end";
    menu.style.paddingRight = "50px";

    const goBack = DigestView._createDigestIcon({
      label: "Go Back",
      svg: `<svg width="18px" height="18px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M8 7v4L2 6l6-5v4h5a8 8 0 1 1 0 16H4v-2h9a6 6 0 0 0 0-12H8Z"/>
  </svg>`,
    });

    goBack.addEventListener("click", () => {
      DigestView._setBody(DIGEST_VIEW.MAIN_DIGEST_VIEW);
    });

    menu.appendChild(goBack);

    const leftCard = DigestView._createLeftCard();
    const rightCard = DigestView.createRightCard();

    const buttonDiv = document.createElement("div");
    buttonDiv.classList.add("ext__sidebar-root-sort-modal-btn");

    const buttonAnchor = document.createElement("a");
    buttonAnchor.id = "digest-button";
    buttonAnchor.style.width = "50%";
    buttonAnchor.classList.add("button");
    buttonAnchor.textContent =
      CURRENT_DIGEST_VIEW == DIGEST_VIEW.CREATE_DIGEST_VIEW
        ? `${LOCALE.createDigest}`
        : `${LOCALE.editDigest}`;

    buttonAnchor.addEventListener("click", DigestView._createOrUpdateDigest);

    buttonDiv.appendChild(buttonAnchor);

    const cardContainer = document.createElement("div");
    cardContainer.style.display = "flex";
    cardContainer.style.justifyContent = "space-between";
    cardContainer.style.alignItems = "center";

    cardContainer.appendChild(leftCard);
    cardContainer.appendChild(rightCard);

    if (DIGEST_STATE.DIGEST_LIST.length > 0) {
      body.appendChild(menu);
    }

    body.appendChild(cardContainer);
    body.appendChild(buttonDiv);

    return body;
  }

  static _createLeftCard() {
    const leftCard = document.createElement("div");
    leftCard.classList.add(
      "ext__digest-modal-content-card",
      "available-subscription-list"
    );

    const searchInputWrapper = document.createElement("div");
    searchInputWrapper.className = "custom-input-wrapper";

    const searchLabel = document.createElement("label");
    searchLabel.style.fontWeight = "100";
    searchLabel.setAttribute("for", "search-input");
    searchLabel.className = "custom-label";
    searchLabel.textContent = `${LOCALE.selectFaveNewsletters}`;
    searchInputWrapper.appendChild(searchLabel);

    // Create the input
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.id = "search-input";
    searchInput.className = "custom-input";
    searchInput.setAttribute("placeholder", `${LOCALE.search}`);
    searchInputWrapper.appendChild(searchInput);

    searchInput.addEventListener("input", DigestView._onSearch);

    leftCard.appendChild(searchInputWrapper);

    const subListDiv = document.createElement("div");

    const labelForSubList = document.createElement("label");
    labelForSubList.style.fontWeight = "100";
    labelForSubList.setAttribute("for", "digest-subscription-list");
    labelForSubList.className = "custom-label";
    labelForSubList.textContent = `${LOCALE.availableNewsletters}`;
    subListDiv.appendChild(labelForSubList);
    subListDiv.appendChild(
      DigestView._createSubscriptionList(undefined, false, "available-subs")
    );
    leftCard.appendChild(subListDiv);

    return leftCard;
  }

  static createRightCard() {
    const rightCard = document.createElement("div");
    rightCard.classList.add("ext__digest-modal-content-card");

    rightCard.style.boxShadow = `rgba(0, 0, 0, 0) 0px 0px 2px`;

    const inputWrapper = document.createElement("div");
    inputWrapper.className = "custom-input-wrapper";

    const label = document.createElement("label");
    label.setAttribute("for", "custom-digest-name");
    label.className = "custom-label";
    label.textContent = `${LOCALE.digestName}`;
    inputWrapper.appendChild(label);

    // Create the input
    const input = document.createElement("input");
    input.type = "text";
    input.id = "custom-digest-name";
    input.className = "custom-input"; // Custom class for the input
    input.setAttribute("placeholder", `${LOCALE.digestNamePlaceholder}`);

    if (CURRENT_DIGEST_VIEW == DIGEST_VIEW.UPDATE_DIGEST_VIEW) {
      input.value = DIGEST_STATE.CURRENT_DIGEST.name;
    }

    inputWrapper.appendChild(input);

    const selectedSourcesDiv = document.createElement("div");
    const labelForSelected = document.createElement("label");
    labelForSelected.setAttribute("for", "digest-subscription-list");
    labelForSelected.className = "custom-label"; // Custom class for the label
    labelForSelected.textContent = `${LOCALE.yourSelectedNewsletters}`;
    selectedSourcesDiv.appendChild(labelForSelected);

    const emptySelectedSourcesDiv = DigestView._createEmptySelectedSources();

    const selectedSubList = Object.values(DIGEST_SELECTED_SUB_LIST_MAP);
    if (selectedSubList.length > 0) {
      selectedSourcesDiv.appendChild(
        DigestView._createSubscriptionList(
          selectedSubList,
          true,
          "selected-subs"
        )
      );
    } else {
      selectedSourcesDiv.appendChild(emptySelectedSourcesDiv);
    }

    rightCard.appendChild(inputWrapper);
    rightCard.appendChild(selectedSourcesDiv);

    return rightCard;
  }

  static _createEmptySelectedSources() {
    const emptySelectedSourcesDiv = document.createElement("div");
    emptySelectedSourcesDiv.id = "empty-selected-sub";
    emptySelectedSourcesDiv.style.display = "flex";
    emptySelectedSourcesDiv.style.justifyContent = "center";
    emptySelectedSourcesDiv.style.alignItems = "center";
    emptySelectedSourcesDiv.style.height = "43vh";

    emptySelectedSourcesDiv.innerHTML = `<p style="font-style: italic;">${LOCALE.selectedNewslettersDisplayed}</p>`;
    return emptySelectedSourcesDiv;
  }

  static _createSubscriptionList(customList, addedToDigest, identifier) {
    const listDiv = document.createElement("div");
    listDiv.id = identifier;

    const list = document.createElement("ul");
    list.className = "ext__sidebar-root-sub-list";
    list.style.maxHeight = "43vh";

    const subList = (customList || Object.values(DIGEST_AVAILABLE_SUB_LIST_MAP))
      .map((mailingList) => ({
        ...(mailingList.logoUrl && { logo: mailingList.logoUrl }),
        labelName: (mailingList.senderName || "").replace(/"/g, ""),
        labelEmail: Utils.shortenText(mailingList.senderEmail),
        labelEmailFull: mailingList.senderEmail,
        data: mailingList,
      }))
      .sort(DigestView.sortSubscriptions);

    for (let item of subList) {
      const listItem = DigestView._createListItem(item, addedToDigest);
      list.appendChild(listItem);
    }

    listDiv.appendChild(list);

    return listDiv;
  }

  static _createListItem(item, addedToDigest) {
    const listItem = document.createElement("li");
    const listItemDiv = document.createElement("div");
    listItemDiv.className = "ext__sidebar-root-sub-list-item";
    listItem.appendChild(listItemDiv);

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
    listItemLabelDiv.appendChild(listItemEmailDiv);

    const actionIcon = document.createElement("i");
    actionIcon.style.marginRight = "20px";
    actionIcon.style.cursor = "pointer";

    const plusIcon = `<svg width="36px" height="36px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path opacity="0.5" d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" fill="#1C274C"></path> <path d="M12.75 9C12.75 8.58579 12.4142 8.25 12 8.25C11.5858 8.25 11.25 8.58579 11.25 9L11.25 11.25H9C8.58579 11.25 8.25 11.5858 8.25 12C8.25 12.4142 8.58579 12.75 9 12.75H11.25V15C11.25 15.4142 11.5858 15.75 12 15.75C12.4142 15.75 12.75 15.4142 12.75 15L12.75 12.75H15C15.4142 12.75 15.75 12.4142 15.75 12C15.75 11.5858 15.4142 11.25 15 11.25H12.75V9Z" fill="#1C274C"></path> </g></svg>`;
    const minusIcon = `<svg width="36px" height="36px"  viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="12" cy="12" r="9" fill="#2A4157" fill-opacity="0.24"></circle> <path d="M8 12H16" stroke="#222222" stroke-width="1.2"></path> </g></svg>`;
    actionIcon.innerHTML = addedToDigest ? minusIcon : plusIcon;

    actionIcon.addEventListener("click", () => {
      if (addedToDigest) {
        DigestView._removeFromDigest(item.data);
      } else {
        DigestView._addedToDigest(item.data);
      }
    });

    listItemDiv.appendChild(actionIcon);

    return listItem;
  }

  static _onSearch(event) {
    const currentList = document.getElementById("available-subs");

    if (currentList) {
      SEARCH_TEXT = event.target.value;
      if (SEARCH_TEXT && SEARCH_TEXT.length > 0) {
        const regex = new RegExp(Utils.escapeRegex(SEARCH_TEXT), "i");
        const results = Object.values(DIGEST_AVAILABLE_SUB_LIST_MAP).filter(
          (list) => regex.test(list.senderName) || regex.test(list.senderEmail)
        );
        const newList = DigestView._createSubscriptionList(
          results,
          false,
          "available-subs"
        );
        currentList.replaceWith(newList);
      } else {
        const originalList = DigestView._createSubscriptionList(
          Object.values(DIGEST_AVAILABLE_SUB_LIST_MAP),
          false,
          "available-subs"
        );
        currentList.replaceWith(originalList);
      }
    }
  }

  static _addedToDigest(data) {
    delete DIGEST_AVAILABLE_SUB_LIST_MAP[data.senderEmail];
    DIGEST_SELECTED_SUB_LIST_MAP[data.senderEmail] = data;

    DigestView._replaceSubList();
  }

  static _removeFromDigest(data) {
    delete DIGEST_SELECTED_SUB_LIST_MAP[data.senderEmail];
    DIGEST_AVAILABLE_SUB_LIST_MAP[data.senderEmail] = data;

    DigestView._replaceSubList();
  }

  static _replaceSubList() {
    const availableList = document.getElementById("available-subs");
    const selectedSubs = document.getElementById("selected-subs");
    const emptySelectedSubs = document.getElementById("empty-selected-sub");

    // Selected view is either empty or selected
    const selectedNode = selectedSubs || emptySelectedSubs;

    if (availableList) {
      let latestList = Object.values(DIGEST_AVAILABLE_SUB_LIST_MAP);

      // This handles search
      if (SEARCH_TEXT && SEARCH_TEXT.length > 0) {
        const regex = new RegExp(SEARCH_TEXT, "i");
        latestList = Object.values(DIGEST_AVAILABLE_SUB_LIST_MAP).filter(
          (list) => regex.test(list.senderName) || regex.test(list.senderEmail)
        );
      }

      const newList = DigestView._createSubscriptionList(
        latestList,
        false,
        "available-subs"
      );

      availableList.replaceWith(newList);
    }

    if (selectedNode) {
      const latestList = Object.values(DIGEST_SELECTED_SUB_LIST_MAP);
      let selectedDiv = DigestView._createSubscriptionList(
        latestList,
        true,
        "selected-subs"
      );

      if (latestList.length < 1) {
        selectedDiv = DigestView._createEmptySelectedSources();
      }

      selectedNode.replaceWith(selectedDiv);
    }
  }

  static async handleDigests(request) {
    if (request.error) {
      DigestView._setBody(DIGEST_VIEW.ERROR_DIGEST_VIEW);
      return;
    }

    if (request.digests.length > 0) {
      DIGEST_STATE.DIGEST_LIST = request.digests;

      //TODO: We should get this from local storage - possibly
      DIGEST_STATE.CURRENT_RANGE = DATE_RANGE.LAST_7_DAYS;
      DIGEST_STATE.CURRENT_DIGEST = request.digests[0];
      DIGEST_STATE.CURRENT_RANGE_INDEX = 2;

      await DigestView._setDigestState({
        range: DATE_RANGE.LAST_7_DAYS,
        digest: request.digests[0],
      });
    } else {
      DigestView._setBody(DIGEST_VIEW.ONBOARDING_VIEW);
    }
  }

  static async _setDigestState({ range, digest }) {
    DIGEST_STATE.CURRENT_RANGE = range || DIGEST_STATE.CURRENT_RANGE;
    DIGEST_STATE.CURRENT_DIGEST = digest || DIGEST_STATE.CURRENT_DIGEST;
    DIGEST_STATE.CURRENT_RANGE_INDEX = Object.values(DATE_RANGE).indexOf(
      range || DIGEST_STATE.CURRENT_RANGE
    );

    DigestView._setBody(DIGEST_VIEW.MAIN_DIGEST_VIEW_SKELETON);

    await MessageService.send("curate-user-digest", {
      email: UserService.getCurrentEmail(),
      digest: DIGEST_STATE.CURRENT_DIGEST,
      dateFrom: DigestView._getStartTimestampForRange(
        DIGEST_STATE.CURRENT_RANGE
      ),
    });
  }

  static _getValidatedDigest() {
    const name = document.getElementById("custom-digest-name");
    const sources = Object.values(DIGEST_SELECTED_SUB_LIST_MAP);

    // hide error if existing
    DigestView._hideErrorMessage();

    if (!name || !name.value) {
      DigestView._showErrorMessage(`${LOCALE.pleaseProvideANameForDigest}`);
      return;
    }

    if (sources.length < 1) {
      DigestView._showErrorMessage(`${LOCALE.pleaseSelectOneNewsletter}`);
      return;
    }

    // hide error if existing
    DigestView._hideErrorMessage();

    return { name: name.value, sources };
  }

  static _transformSources(sources) {
    return sources.map((source) => ({
      senderName: source.senderName,
      senderEmail: source.senderEmail,
      ...(source.logoUrl && { senderLogo: source.logoUrl }),
    }));
  }

  static async _createOrUpdateDigest() {
    const data = DigestView._getValidatedDigest();

    if (!data) {
      return;
    }

    const digest = {
      name: data.name,
      sources: DigestView._transformSources(data.sources),
    };

    let action = "create-user-digest";
    let loaderText = `${LOCALE.creatingDigest}`;

    if (CURRENT_DIGEST_VIEW == DIGEST_VIEW.UPDATE_DIGEST_VIEW) {
      digest.id = DIGEST_STATE.CURRENT_DIGEST.id;
      action = "update-user-digest";
      loaderText = `${LOCALE.updatingDigest}`;
    }

    DigestView._startLoader(loaderText);

    await MessageService.send(action, {
      email: UserService.getCurrentEmail(),
      digest,
    });
  }

  static handleCurateDigestResponse(request) {
    if (request.error) {
      DigestView._setBody(DIGEST_VIEW.ERROR_DIGEST_VIEW);
      return;
    }

    if (request.curatedDigest) {
      DIGEST_STATE.CURATED_DIGEST = request.curatedDigest;
      DigestView._setBody(DIGEST_VIEW.MAIN_DIGEST_VIEW);
    }
  }

  static handleCreateOrUpdateDigestResponse(request) {
    if (request.error) {
      DigestView._showErrorMessage();
      DigestView._setBody(CURRENT_DIGEST_VIEW);
      return;
    }

    if (CURRENT_DIGEST_VIEW == DIGEST_VIEW.CREATE_DIGEST_VIEW) {
      DIGEST_STATE.DIGEST_LIST.push(request.digest);
    } else {
      let index = DIGEST_STATE.DIGEST_LIST.findIndex(
        (digest) => digest.id === request.digest.id
      );

      if (index !== -1) {
        DIGEST_STATE.DIGEST_LIST[index] = request.digest;
      }
    }

    DigestView._setDigestState({ digest: request.digest });
  }

  static sortSubscriptions(a, b) {
    return a.labelName < b.labelName ? -1 : 1;
  }

  static _getStartTimestampForRange(range) {
    const now = new Date();

    switch (range) {
      case DATE_RANGE.TODAY:
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);
        return Math.floor(startOfToday.getTime() / 1000);

      case DATE_RANGE.LAST_24_HOURS:
        const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        return Math.floor(last24Hours.getTime() / 1000);

      case DATE_RANGE.LAST_7_DAYS:
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return Math.floor(last7Days.getTime() / 1000);

      case DATE_RANGE.LAST_30_DAYS:
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return Math.floor(last30Days.getTime() / 1000);

      default:
        throw new Error("Invalid range provided.");
    }
  }

  static _getDateForRange(range) {
    const now = new Date();

    switch (range) {
      case DATE_RANGE.TODAY:
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);
        return Utils.formatDate(startOfToday);

      case DATE_RANGE.LAST_24_HOURS:
        const startOfLast24Hours = new Date(
          now.getTime() - 24 * 60 * 60 * 1000
        );
        return `${Utils.formatDate(startOfLast24Hours)} - ${Utils.formatDate(
          now
        )}`;

      case DATE_RANGE.LAST_7_DAYS:
        const startOfLast7Days = new Date(
          now.getTime() - 7 * 24 * 60 * 60 * 1000
        );
        return `${Utils.formatDate(startOfLast7Days)} - ${Utils.formatDate(
          now
        )}`;

      case DATE_RANGE.LAST_30_DAYS:
        const startOfLast30Days = new Date(
          now.getTime() - 30 * 24 * 60 * 60 * 1000
        );
        return `${Utils.formatDate(startOfLast30Days)} - ${Utils.formatDate(
          now
        )}`;

      default:
        throw new Error("Invalid range provided.");
    }
  }

  static _openInGmail(emailId) {
    const currentEmail = UserService.getCurrentEmail();
    window.open(
      `https://mail.google.com/mail/u/${currentEmail}/#inbox/${emailId}`
    );
  }

  static _setupCrud(update) {
    // reset state
    DIGEST_AVAILABLE_SUB_LIST_MAP = {};
    DIGEST_SELECTED_SUB_LIST_MAP = {};

    if (MAILING_LIST.length > 0) {
      DIGEST_AVAILABLE_SUB_LIST_MAP = MAILING_LIST.reduce((obj, data) => {
        obj[data.senderEmail] = data;
        return obj;
      }, {});

      if (update) {
      }
    }

    if (update) {
      DIGEST_STATE.CURRENT_DIGEST.sources.forEach((source) => {
        if (DIGEST_AVAILABLE_SUB_LIST_MAP[source.senderEmail]) {
          DIGEST_SELECTED_SUB_LIST_MAP[source.senderEmail] =
            DIGEST_AVAILABLE_SUB_LIST_MAP[source.senderEmail];
          delete DIGEST_AVAILABLE_SUB_LIST_MAP[source.senderEmail];
        }
      });

      DigestView._setBody(DIGEST_VIEW.UPDATE_DIGEST_VIEW);

      return;
    }

    DigestView._setBody(DIGEST_VIEW.CREATE_DIGEST_VIEW);
  }

  static async getUserDigests() {
    if (
      DIGEST_STATE.DIGEST_LIST.length > 0 &&
      DIGEST_STATE.CURRENT_DIGEST.name
    ) {
      // maintain state
      return;
    }

    await MessageService.send("get-user-digests", {
      email: UserService.getCurrentEmail(),
    });
  }
}
