const MAIN_VIEW_NAV_BODY = {
  BLOCK_LIST_VIEW: "Block List",
  SUBSCRIPTION_VIEW: "Subscriptions",
};

let CURRENT_VIEW = MAIN_VIEW_NAV_BODY.SUBSCRIPTION_VIEW;

let IS_INBOX_PURGE_PRO = false;

let INBOX_PURGE_PLAN = "FREE";
let UNSUBSCRIBES_LEFT = "20";

class MainView {
  static render(useCurrentView) {
    const root = document.createElement("div");
    root.classList.add("ext__sidebar-root-sub");

    const header = MainView._createHeader();

    root.appendChild(header);

    if (useCurrentView) {
      root.appendChild(MainView._getNavBody(CURRENT_VIEW));
    } else {
      root.appendChild(SubscriptionView.render());
    }

    return root;
  }

  static _createHeader() {
    const headerContentDiv = document.createElement("div");

    const profileDiv = document.createElement("div");
    profileDiv.style.display = "flex";
    profileDiv.style.marginBottom = "30px";
    profileDiv.style.flexDirection = "column";
    profileDiv.style.justifyContent = "center";
    profileDiv.style.alignItems = "center";

    const profileIcon = document.createElement("i");
    profileIcon.className = "material-icons sort";
    profileIcon.style.marginBottom = "10px";
    // profileIcon.textContent = "account_circle";
    profileIcon.addEventListener("click", Utils.refreshEmail);
    profileIcon.innerHTML =
      '<svg width="30px" height="30px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M4.271 18.346S6.5 15.5 12 15.5s7.73 2.846 7.73 2.846M12 12a3 3 0 100-6 3 3 0 000 6z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>';

    profileDiv.appendChild(profileIcon);

    const email = document.createElement("span");
    email.style.fontWeight = "600px";
    email.textContent = UserService.getCurrentEmail();
    profileDiv.appendChild(email);

    profileDiv.appendChild(MainView._createInboxPurgeStatus());

    const menuDiv = document.createElement("div");
    menuDiv.style.display = "flex";
    menuDiv.style.alignItems = "center";
    menuDiv.style.justifyContent = "space-between";
    menuDiv.style.marginBottom = "10px";

    const navHeader = document.createElement("div");
    navHeader.classList.add("ext__sidebar-root-nav-header");

    navHeader.appendChild(MainView._createNavMenu());

    navHeader.addEventListener("click", MainView._toggleNavMenu);

    const getLocaleText = (navType) => {
      switch (navType) {
        case MAIN_VIEW_NAV_BODY.SUBSCRIPTION_VIEW:
          return LOCALE.subscriptions;
        case MAIN_VIEW_NAV_BODY.BLOCK_LIST_VIEW:
          return LOCALE.blockList;
        default:
          return LOCALE.subscriptions;
      }
    };

    const navHeaderTitle = document.createElement("h3");
    navHeaderTitle.style.marginLeft = "10px";
    navHeaderTitle.textContent = getLocaleText(CURRENT_VIEW);

    const navIconContainer = document.createElement("div");
    navIconContainer.style.display = "flex";
    navIconContainer.style.alignItems = "center";
    navIconContainer.style.justifyContent = "center";

    const navIcon = document.createElement("i");
    navIcon.className = "material-icons expand_more";
    navIcon.style.fontSize = "35px";
    navIcon.style.marginTop = "10px";
    // navIcon.textContent = "expand_more";
    navIcon.innerHTML =
      '<svg width="35px" height="35px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M6 9l6 6 6-6" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>';

    navIconContainer.appendChild(navIcon);

    navHeader.appendChild(navHeaderTitle);
    navHeader.appendChild(navIconContainer);

    const digestIcon = MainView.createDigestIcon();

    digestIcon.addEventListener("click", _openInboxDigest);

    menuDiv.appendChild(navHeader);
    menuDiv.appendChild(digestIcon);

    headerContentDiv.appendChild(profileDiv);
    headerContentDiv.appendChild(menuDiv);

    return headerContentDiv;
  }

  static createDigestIcon() {
    const container = document.createElement("div");
    container.classList.add("digest-main-view-icon");
    container.innerHTML = `
    <span title="Inbox Digest" class="material-icons" style="filter: brightness(90%);padding: 4px;">📰</span>
    <span style="font-size: 13px; font-weight: 500;">Inbox Digest</span>`;

    return container;
  }

  static _createInboxPurgeStatus() {
    const plan = MainView._getPlan();
    const statusDiv = document.createElement("div");

    statusDiv.textContent = `${plan.statusText} (${
      plan.unlimited
        ? `${LOCALE.unlimited}`
        : `${UNSUBSCRIBES_LEFT} ${LOCALE.left}`
    })`;

    statusDiv.style.fontSize = "12px";
    statusDiv.style.fontWeight = "700";
    statusDiv.style.background = plan.bg;
    statusDiv.style.textAlign = "center";
    statusDiv.style.color = "white";
    statusDiv.style.padding = "4px 8px";
    statusDiv.style.cursor = "pointer";
    statusDiv.style.marginTop = "10px";
    statusDiv.style.borderRadius = "25px";

    statusDiv.title = "Click me!";

    statusDiv.addEventListener("click", MainView._openStatusMenu);

    return statusDiv;
  }

  static _openStatusMenu() {
    const plan = MainView._getPlan();
    const statusMenu = document.createElement("div");
    statusMenu.classList.add("ext__sidebar-root-generic-modal");
    statusMenu.style.width = "320px";

    const divContainer = document.createElement("div");
    divContainer.style.display = "flex";
    divContainer.style.flexDirection = "column";
    divContainer.style.alignItems = "center";
    divContainer.style.textAlign = "center";
    divContainer.style.padding = "20px";

    // Create paragraph 1
    const p1 = document.createElement("p");
    p1.textContent = `${LOCALE.thankYouForUsingInboxPurge} ❤️`;

    // Create paragraph 2
    const p2 = document.createElement("p");
    p2.innerHTML = `${LOCALE.youAreOnThe} <span id="plan" style="font-weight: bold;">${INBOX_PURGE_PLAN}</span> ${LOCALE.plan}.`;

    const p3 = document.createElement("p");
    p3.innerHTML = plan.description;

    // Create Upgrade Button
    const divButton = document.createElement("div");
    divButton.className = "ext__sidebar-root-sort-modal-btn";
    divButton.style.width = "100%";

    const aButton = document.createElement("a");
    aButton.className = "button";
    aButton.textContent = plan.buttonText;
    aButton.addEventListener("click", plan.buttonFn);

    // Append elements
    divButton.appendChild(aButton);
    divContainer.appendChild(p1);
    divContainer.appendChild(p2);
    divContainer.appendChild(p3);
    divContainer.appendChild(divButton);

    statusMenu.append(divContainer);

    Utils.triggerModal(statusMenu);
  }

  static _createFooter() {
    const footer = document.createElement("div");
    footer.id = "main-footer";
    footer.style.display = "flex";
    footer.style.justifyContent = "center";
    footer.style.alignItems = "center";
    footer.style.marginTop = "10px";
    footer.style.cursor = "pointer";

    const footerContent = document.createElement("div");
    footerContent.style.fontSize = "13px";
    footerContent.style.fontWeight = "700";
    footerContent.style.backgroundColor = IS_INBOX_PURGE_PRO
      ? "#36b882"
      : "grey";
    footerContent.style.textAlign = "center";
    footerContent.style.color = "white";
    footerContent.style.padding = "4px 8px";
    footerContent.textContent = IS_INBOX_PURGE_PRO
      ? "InboxPurge: PRO"
      : "InboxPurge: FREE";

    footer.appendChild(footerContent);

    footer.addEventListener("click", _openOptionsPage);

    return footer;
  }

  static _createNavMenu() {
    const navMenu = document.createElement("div");
    navMenu.classList.add("ext__sidebar-root-nav-menu");

    const subscriptions = MainView._createNavItem(
      `${LOCALE.subscriptions}`,
      MAIN_VIEW_NAV_BODY.SUBSCRIPTION_VIEW,
      CURRENT_VIEW == MAIN_VIEW_NAV_BODY.SUBSCRIPTION_VIEW
    );
    const blockList = MainView._createNavItem(
      `${LOCALE.blockList}`,
      MAIN_VIEW_NAV_BODY.BLOCK_LIST_VIEW,
      CURRENT_VIEW == MAIN_VIEW_NAV_BODY.BLOCK_LIST_VIEW
    );
    // const emailHealth = MainView._createNavItem("Email Health");

    navMenu.appendChild(subscriptions);
    navMenu.appendChild(blockList);
    // navMenu.appendChild(emailHealth);

    return navMenu;
  }

  static _toggleNavMenu() {
    const navMenu = document.querySelector(".ext__sidebar-root-nav-menu");
    if (navMenu.classList.contains("show-hidden-block")) {
      navMenu.classList.remove("show-hidden-block");
    } else {
      navMenu.classList.add("show-hidden-block");
    }
  }

  static _createNavItem(text, navType, isActive) {
    const item = document.createElement("span");
    item.classList.add("nav-menu-item");
    item.textContent = text;
    if (isActive) {
      item.appendChild(MainView._createCheckIcon());
    }

    item.addEventListener("click", () =>
      MainView._onNavItemClick(text, navType)
    );
    return item;
  }

  static _onNavItemClick(text, navItemName) {
    const main = document.querySelector(".ext__sidebar-root-sub");
    const currentNavBody = document.querySelector(
      ".ext__sidebar-root-sub-block"
    );

    const h3 = document.querySelector(".ext__sidebar-root-nav-header > h3");
    h3.textContent = text;

    const previousActiveNavItem = document.querySelector(
      ".nav-menu-item-active"
    );
    previousActiveNavItem.remove();

    const navItems = Array.from(document.querySelectorAll(".nav-menu-item"));

    const activeNavItem = navItems.find((ele) =>
      ele.textContent.includes(text)
    );

    activeNavItem.appendChild(MainView._createCheckIcon());

    main.removeChild(currentNavBody);
    main.appendChild(MainView._getNavBody(navItemName));

    // document
    //   .getElementById("main-footer")
    //   .insertAdjacentElement("beforebegin", MainView._getNavBody(navItemName));

    // main.appendChild(MainView._getNavBody(navItemName));
  }

  static _getNavBody(navItemName) {
    switch (navItemName) {
      case "Block List":
        CURRENT_VIEW = MAIN_VIEW_NAV_BODY.BLOCK_LIST_VIEW;
        return BlockListView.render();
      case "Email Health":
        return EmailHealthView.render();
      case "Subscriptions":
        CURRENT_VIEW = MAIN_VIEW_NAV_BODY.SUBSCRIPTION_VIEW;
        return SubscriptionView.render();
    }
  }

  static _createCheckIcon() {
    const checkIcon = document.createElement("span");
    checkIcon.classList.add("nav-menu-item-active");
    checkIcon.innerHTML = "  ✔️";
    return checkIcon;
  }

  static _getPlan() {
    const properties = {
      FREE: {
        bg: "linear-gradient(to right, #94999e, #9a9999)",
        statusText: "InboxPurge FREE",
        description: `${LOCALE.youHave} <span style="font-weight: bold;">(${UNSUBSCRIBES_LEFT}) ${LOCALE.unsubscribesAndDeletionsLeft}</span>, ${LOCALE.purchaseForUnlimited}`,
        unlimited: false,
        buttonText: `${LOCALE.purchaseLicense}`,
        buttonFn: () => {
          Utils.closeModalAndOpen(
            "http://inboxpurge.com/pricing?ref=purchase_license"
          );
        },
      },
      BASIC: {
        bg: "linear-gradient(to right, #f3ab77, #4672bb)",
        statusText: "InboxPurge BASIC",
        description: `${LOCALE.enjoy7Days}`,
        unlimited: true,
        buttonText: `${LOCALE.manageBilling}`,
        buttonFn: () => {
          Utils.closeModalAndOpen(
            "http://inboxpurge.com/billing?ref=manage_billing"
          );
        },
      },
      PRO: {
        bg: "linear-gradient(to right, #8ab4f8, #46bb95)",
        statusText: "InboxPurge PRO",
        description: `${LOCALE.enjoyUnlimitedDecluttering}`,
        unlimited: true,
        buttonText: `${LOCALE.manageSubscription}`,
        buttonFn: () => {
          Utils.closeModalAndOpen(
            "http://inboxpurge.com/billing?ref=manage_subscription"
          );
        },
      },
    };

    return properties[INBOX_PURGE_PLAN];
  }
}
