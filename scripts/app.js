setInterval(setCurrentVersion, 5000);
window.addEventListener("load", setupInboxPurge);

const BASE_URL = getBaseUrl();

const LOGO_URL = `${BASE_URL}/images/email.png`;
const SETTINGS_URL = `${BASE_URL}/option/options.html`;

window.addEventListener("load", function () {
  // Setup sentry
  Sentry.init({
    dsn: "https://11d4af1f68a1421bbe3d830b980176c6@o4504521903046656.ingest.sentry.io/4505525505425408",
    tracesSampleRate: 1.0,
    release: "inboxpurge@1.7.1",
    // Filtering out the errors not related to this extension
    beforeSend(event, hint) {
      const errorOrigin = hint?.originalException?.filename || "";
      if (errorOrigin.startsWith(getBaseUrl())) {
        return event;
      }
      return null;
    },
  });
});

async function setCurrentVersion() {
  try {
    if (chrome.runtime) {
      const license = await StorageService.getWithPrefix(
        prefixTag.LICENSE_KEY,
        "INBOX_PURGE"
      );

      if (license && license.valid) {
        if (INBOX_PURGE_PLAN != license.plan) {
          INBOX_PURGE_PLAN = license.plan;
          if (await UserService.isCurrentEmailLoggedIn()) {
            Utils.switchViewTo(MainView.render(true));
          }
        }
      } else {
        if (
          INBOX_PURGE_PLAN != "FREE" &&
          (await UserService.isCurrentEmailLoggedIn())
        ) {
          INBOX_PURGE_PLAN = "FREE";
          // CURRENT_DIGEST_VIEW = DIGEST_VIEW.FREE_PLAN_DIGEST_VIEW;
          Utils.switchViewTo(MainView.render(true));
        }
      }

      const userDetails = await UserService.getCurrentUserDetails();

      // Calculate unsubscribes left only for free users
      if (userDetails && INBOX_PURGE_PLAN == "FREE") {
        const currentUserUnsubscribesLeft = userDetails.unsubscribesLeft;

        if (UNSUBSCRIBES_LEFT != currentUserUnsubscribesLeft) {
          UNSUBSCRIBES_LEFT = currentUserUnsubscribesLeft;
          if (await UserService.isCurrentEmailLoggedIn()) {
            Utils.switchViewTo(MainView.render(true));
          }
        }
      }
    }
  } catch (error) {
    Utils.handleError("Error when setting version: ", error);
  }
}

async function setupInboxPurge() {
  try {
    const supportButton = await getSettingsOrSupportIcon();

    // no need to setup if button already exist
    const existingButton = document.querySelector(".ext__gmail-navbar-button");
    if (existingButton) {
      return;
    }

    // supportButton.insertAdjacentElement("afterend", _createCustomButton());

    const body = document.querySelector("body");

    const globalModal = _createGlobalModal();

    const sidebar = document.createElement("div");
    sidebar.classList.add("ext__sidebar-root");

    const container = document.createElement("div");
    container.classList.add("ext__sidebar-root-parent");

    const appRoot = document.createElement("div");
    appRoot.classList.add("ext__sidebar-root-container");

    container.appendChild(appRoot);

    sidebar.appendChild(createToastDiv());
    sidebar.appendChild(globalModal);
    sidebar.appendChild(_createGlobalLoadingModal());
    sidebar.appendChild(_createNav());
    sidebar.appendChild(container);

    if (await UserService.isCurrentEmailLoggedIn()) {
      appRoot.appendChild(MainView.render());
    } else {
      appRoot.appendChild(LoginView.render());
    }

    sidebar.addEventListener("click", (event) =>
      _handleOutsideClickEvents(event)
    );

    body.appendChild(sidebar);
    body.appendChild(_createDigestModal());
    body.appendChild(_createGmailNativeModal());

    await getUserStats();
    await SubscriptionView.getMailingList();
    await BlockListView.getBlockList();
    await GmailNativeView.setupGmailNativeIcons();
    await QuickFilterView.getQuickFilters();

    // Show Icon when all initialization is complete
    supportButton.insertAdjacentElement("afterend", _createCustomButton());
    if (!(await UserService.isCurrentEmailLoggedIn())) {
      // Point user to the Icon
      Utils.pointToInboxPurgeIcon();
    }
  } catch (error) {
    Utils.handleError("Error occured while setting up inbox purge", error);
    console.error("[inboxpurge setup error] - ", error.stack);
  }
}

function getSettingsOrSupportIcon() {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 10;

    const attemptToFind = () => {
      const supportButton =
        document.querySelector('div[data-tooltip="Settings"]') ||
        document.querySelector("div.FI") ||
        document.querySelector('div[data-tooltip="Support"]') ||
        document.querySelector("div.zo");

      if (supportButton) {
        resolve(supportButton);
      } else {
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(attemptToFind, 2000);
        } else {
          resolve(null);
        }
      }
    };

    attemptToFind();
  });
}

async function getUserStats() {
  if (!(await UserService.isCurrentEmailLoggedIn())) {
    return;
  }

  // Handle failure
  await MessageService.send("get-user-details", {
    email: UserService.getCurrentEmail(),
  });
}

async function currentEmailIsLoggedIn() {
  const email = UserService.getCurrentEmail();
  const credentials = await StorageService.getWithPrefix(
    prefixTag.CREDENTIALS_KEY,
    email
  );

  return !!credentials;
}

function injectStylesheet() {
  Utils.addStylesheet(
    "https://unicons.iconscout.com/release/v4.0.0/css/line.css"
  );
}

function _openSideBar() {
  const sideBar = document.querySelector(".ext__sidebar-root");
  if (sideBar) {
    sideBar.classList.add("ext__sidebar-root-close");
  }
}

function _onCloseSideBar() {
  const sideBar = document.querySelector(".ext__sidebar-root");
  if (sideBar) {
    sideBar.classList.remove("ext__sidebar-root-close");
  }
}

function _createNav() {
  const nav = document.createElement("div");

  nav.appendChild(_createCloseButton());
  nav.appendChild(_createMenuButton());
  return nav;
}

function _createCustomButton() {
  const appCustomButtonDiv = document.createElement("div");
  appCustomButtonDiv.classList.add("ext__gmail-navbar-button");

  const buttonImage = document.createElement("div");
  buttonImage.style.backgroundImage = `url("${LOGO_URL}")`;

  appCustomButtonDiv.appendChild(buttonImage);

  appCustomButtonDiv.addEventListener("click", _openSideBar);

  return appCustomButtonDiv;
}

function _createMenuButton() {
  const menu = document.createElement("div");
  menu.classList.add("ext__sidebar-root-menu-btn");

  const menuLink = document.createElement("a");
  menuLink.href = "#";

  const menuIcon = document.createElement("i");
  menuIcon.className = "material-icons menu menu-icon";
  // menuIcon.textContent = "menu";
  menuIcon.innerHTML =
    '<svg width="26px" height="26px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M3 5h18M3 12h18M3 19h18" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
  menuLink.appendChild(menuIcon);

  const menuItems = _createMenuItems();

  menu.appendChild(menuLink);
  menu.appendChild(menuItems);

  return menu;
}

function _createMenuItems() {
  const menuItems = document.createElement("div");
  menuItems.classList.add("ext__sidebar-root-menu-items");

  const options = _createItem(`${LOCALE.settingsMenuTxt} ⚙️`);
  const openDigest = _createItem("Inbox Digest 📰");
  const productTour = _createItem(`${LOCALE.productTourMenuTxt}  🧭`);
  const writeReviews = _createItem(`${LOCALE.writeReviewsMenuTxt}  ❤️`);
  const sendFeedback = _createItem(`${LOCALE.sendFeebackMenuTxt}  📝`);
  const needHelp = _createItem(`${LOCALE.needHelpMenuTxt}  🆘`);
  const signOut = _createItem(`${LOCALE.signOutMenuTxt}  ✌️`);

  options.addEventListener("click", _openOptionsPage);
  openDigest.addEventListener("click", _openInboxDigest);
  productTour.addEventListener("click", () => Utils.triggerProductTourV2(1));
  writeReviews.addEventListener("click", _openWriteReviewPage);
  sendFeedback.addEventListener("click", _openFeedbackPage);
  needHelp.addEventListener("click", _openSupportPage);
  signOut.addEventListener("click", _signOut);

  menuItems.appendChild(options);
  menuItems.appendChild(openDigest);
  menuItems.appendChild(productTour);
  menuItems.appendChild(writeReviews);
  menuItems.appendChild(sendFeedback);
  menuItems.appendChild(needHelp);
  menuItems.appendChild(signOut);

  return menuItems;
}

async function _openOptionsPage() {
  window.open(SETTINGS_URL, "_blank", "noopener,noreferrer");
}

async function _openInboxDigest() {
  if (!(await UserService.isCurrentEmailLoggedIn())) {
    return;
  }

  if (MAILING_LIST && MAILING_LIST.length < 1) {
    SubscriptionView.openGenericModal(
      `${LOCALE.atmYouHaveNoSub}`,
      "215px",
      "Go Back",
      Utils.closeModal
    );

    return;
  }

  DigestView.render();

  await DigestView.getUserDigests();
}

async function _openSupportPage() {
  window.open("https://www.inboxpurge.com/help", "_blank", "noopener,noreferrer");
}

async function _openFeedbackPage() {
  window.open("https://tally.so/r/3j61MY", "_blank", "noopener,noreferrer");
}

async function _openWriteReviewPage() {
  window.open(
    "https://chrome.google.com/webstore/detail/mogabgmejhmicinppdfeoaokolphbgcd/reviews",
    "_blank",
    "noopener,noreferrer"
  );
}

async function _signOut() {
  const email = UserService.getCurrentEmail();
  const credentials = await StorageService.getWithPrefix(
    prefixTag.CREDENTIALS_KEY,
    email
  );
  if (!credentials) {
    return;
  }
  Utils.launchGlobalLoadingModal();
  await MessageService.send("sign-out", { email });
}

function _createItem(text) {
  const item = document.createElement("span");
  item.classList.add("menu-item");
  item.innerHTML = text;
  return item;
}

function _createCloseButton() {
  const close = document.createElement("div");
  close.title = `${LOCALE.closeSidebar}`;
  close.classList.add("ext__sidebar-root-close-btn");

  const closeLink = document.createElement("a");
  closeLink.href = "#";

  const closeIcon = document.createElement("i");
  closeIcon.className = "material-icons close";
  closeIcon.innerHTML =
    '<svg width="36px" height="36px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M6.758 17.243L12.001 12m5.243-5.243L12 12m0 0L6.758 6.757M12.001 12l5.243 5.243" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
  closeLink.appendChild(closeIcon);

  close.appendChild(closeLink);

  close.addEventListener("click", _onCloseSideBar);

  return close;
}

function _createDigestModal() {
  const modal = document.createElement("div");
  modal.classList.add("ext__digest-modal");

  return modal;
}

function _createGmailNativeModal() {
  const modal = document.createElement("div");
  modal.classList.add("ext__native-modal");

  return modal;
}

function _createGlobalModal() {
  const modal = document.createElement("div");
  modal.classList.add("ext__sidebar-global-modal");

  return modal;
}

function _createGlobalLoadingModal() {
  const modal = document.createElement("div");
  modal.classList.add("ext__sidebar-global-loading-modal");

  return modal;
}

function _handleOutsideClickEvents(event) {
  const globalModal = document.querySelector(".ext__sidebar-global-modal");
  if (event.target == globalModal) {
    globalModal.classList.remove("display-modal");
    globalModal.removeChild(globalModal.firstChild);
    return;
  }

  if (
    event.target.closest(".ext__sidebar-root-nav-menu") === null &&
    event.target.closest(".ext__sidebar-root-nav-header") === null
  ) {
    const navMenu = document.querySelector(".ext__sidebar-root-nav-menu");
    if (navMenu) {
      navMenu.classList.remove("show-hidden-block");
    }
  }
}

// default to prod url
function getBaseUrl() {
  try {
    const url = chrome.runtime.getURL("");
    if (url && url[url.length - 1] == "/") {
      return url.slice(0, -1);
    } else {
      return url;
    }
  } catch (e) {
    Utils.handleError("Error when getting extension base url", e);
    return "chrome-extension://mogabgmejhmicinppdfeoaokolphbgcd";
  }
}
