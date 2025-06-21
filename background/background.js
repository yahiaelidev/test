import { AuthService } from "./service/auth.service.js";
import { BlockService } from "./service/block.service.js";
import { SubscriptionService } from "./service/subscription.service.js";
import { LicenseService } from "./service/license.service.js";
import { UserService } from "./service/user.service.js";
import { UserDigestService } from "./service/user-digest.service.js";
import { Sentry } from "./sentry.js";
import { Config } from "./config.js";
import { DeleteService } from "./service/delete.service.js";
import { Utils } from "./utils.js";

Sentry.init({
  dsn: Config.SENTRY_DSN,
  tracesSampleRate: 1.0,
  release: "inboxpurge@1.7.1",
  beforeSend(event, hint) {
    const errorOrigin = hint?.originalException?.filename || "";
    if (errorOrigin.startsWith(Utils.getBaseUrl())) {
      return event;
    }
    return null;
  },
});

// handles background messages
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  Sentry.wrap(function () {
    switch (message.action) {
      case "sign-in":
        AuthService.signIn(message.request, sender.tab.id);
        sendResponse({ messages: "Recieved" });
        break;
      case "sign-out":
        AuthService.signOut(message.request, sender.tab.id);
        sendResponse({ messages: "Recieved" });
        break;
      case "get-mailing-list":
        SubscriptionService.getMailingList(message.request, sender.tab.id);
        sendResponse({ messages: "Recieved" });
        break;
      case "activate-license":
        LicenseService.activateLicense(message.request, sender.tab.id);
        sendResponse({ messages: "Recieved" });
        break;
      case "get-block-list":
        new BlockService(
          message.request.email,
          sender.tab.id
        ).getEnrichedBlockList(message.request.sync);
        sendResponse({ messages: "Recieved" });
        break;
      case "unsubscribe":
        SubscriptionService.unsubscribeInBulk(message.request, sender.tab.id);
        sendResponse({ messages: "Recieved" });
        break;
      case "native-unsubscribe":
        SubscriptionService.unsubscribeInBulkNative(
          message.request,
          sender.tab.id
        );
        sendResponse({ messages: "Recieved" });
        break;
      case "delete":
        new DeleteService(
          message.request.email,
          sender.tab.id
        ).handleDeleteRequest(
          message.request.deleteList,
          message.request.deleteFilters
        );
        sendResponse({ messages: "Recieved" });
        break;
      case "native-delete":
        new DeleteService(
          message.request.email,
          sender.tab.id
        ).handleDeleteRequestNative(
          message.request.selectedList,
          message.request.deleteFilters
        );
        sendResponse({ messages: "Recieved" });
        break;
      case "unblock":
        new BlockService(
          message.request.email,
          sender.tab.id
        ).removeFromBlockList(message.request.blockList);
        sendResponse({ messages: "Recieved" });
        break;
      case "get-user-details":
        const userService = new UserService(
          message.request.email,
          sender.tab.id
        );
        userService.getUser();
        userService.checkUserPermissions();
        sendResponse({ messages: "Recieved" });
        break;
      case "get-user-digests":
        new UserDigestService(
          message.request.email,
          sender.tab.id
        ).getUserDigests();
        sendResponse({ messages: "Recieved" });
        break;
      case "create-user-digest":
        new UserDigestService(
          message.request.email,
          sender.tab.id
        ).createUserDigest(message.request);
        sendResponse({ messages: "Recieved" });
        break;
      case "update-user-digest":
        new UserDigestService(
          message.request.email,
          sender.tab.id
        ).updateUserDigest(message.request);
        sendResponse({ messages: "Recieved" });
        break;
      case "curate-user-digest":
        new UserDigestService(
          message.request.email,
          sender.tab.id
        ).curateUserDigest(message.request);
        sendResponse({ messages: "Recieved" });
        break;
    }
  });

  return true;
});

// To handle chrome storage calls
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.method == "getStorage") {
    chrome.storage.sync.get([request.key], function (result) {
      if (chrome.runtime.lastError) {
        sendResponse({ error: chrome.runtime.lastError });
      } else {
        sendResponse(result[request.key]);
      }
    });
  } else if (request.method == "setStorage") {
    chrome.storage.sync.set({ [request.key]: request.value }, function () {
      if (chrome.runtime.lastError) {
        sendResponse({ error: chrome.runtime.lastError });
      } else {
        sendResponse({});
      }
    });
  } else if (request.method == "removeStorage") {
    chrome.storage.sync.remove(request.key, function () {
      if (chrome.runtime.lastError) {
        sendResponse({ error: chrome.runtime.lastError });
      } else {
        sendResponse({});
      }
    });
  }
  return true;
});

// manually sign in
chrome.runtime.onMessageExternal.addListener(
  async (message, sender, sendResponse) => {
    Sentry.wrap(function () {
      const senderURL = new URL(sender.url);

      const allowedHostnames = ["www.inboxpurge.com", "inboxpurge.com"];

      if (!allowedHostnames.includes(senderURL.hostname)) {
        console.error("Unauthorized sender:", sender.url);
        sendResponse({ status: "Unauthorized sender" });
        return;
      }

      if (message.action === "manual-sign-in") {
        AuthService.handleManualSignIn(sender.url);

        if (sender?.tab?.windowId) {
          chrome.windows.remove(sender.tab.windowId, function () {
            console.log("Sender window closed: ", sender.tab.windowId);
          });
        }

        sendResponse({ messages: "Recieved" });
      }

      return true;
    });
  }
);

// To auto-reload when update is available
chrome.runtime.onUpdateAvailable.addListener(function (details) {
  console.log("updating to version " + details.version);
  chrome.runtime.reload();
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    // Get user's started faster
    chrome.tabs.create({ url: `https://mail.google.com/mail/` });

    // Gather feedback from users
    chrome.runtime.setUninstallURL("https://tally.so/r/31djWb");
  }
});
