import { MessageService } from "./message.service.js";
import { StorageService, prefixTag } from "./storage.service.js";
import { Utils } from "../utils.js";
import { Config } from "../config.js";
import { LOCALE } from "../messages.js";
import { Sentry } from "../sentry.js";

export class AuthService {
  static ORIGINAL_TAB_ID;

  constructor(uniqueId, tabId) {
    this.uniqueId = uniqueId;
    this.tabId = tabId;
  }

  static setOriginalTabId(tabId) {
    AuthService.ORIGINAL_TAB_ID = tabId;
  }

  static getOriginalTabId() {
    return AuthService.ORIGINAL_TAB_ID;
  }

  static signIn(request, tabId) {
    const width = 500;
    const height = 800;
    const uniqueId = request.email;

    AuthService.setOriginalTabId(tabId);
    // const left = Math.round((request.screen.width - width) / 2);
    // const top = Math.round((request.screen.height - height) / 2);

    const screenWidth = request.screen.width;
    const screenHeight = request.screen.height;

    const left = Math.round(
      Math.max(0, Math.min(screenWidth - width, (screenWidth - width) / 2))
    );
    const top = Math.round(
      Math.max(0, Math.min(screenHeight - height, (screenHeight - height) / 2))
    );

    const scope = Config.GOOGLE_TOKEN_SCOPE;

    const signInUrl = `https://api.inboxpurge.com/auth/v1/authorize?email=${uniqueId}`;

    chrome.windows.create(
      {
        url: signInUrl,
        type: "popup",
        left,
        top,
        width,
        height,
        focused: true,
      },
      (window) => {
        if (chrome.runtime.lastError) {
          Sentry.captureMessage("Auth Service - Sign In Error", {
            level: "error",
            extra: {
              details: chrome.runtime.lastError,
            },
          });

          // return;
        }

        if (window?.tabs && window.tabs.length) {
          const onSignInTabUpdated = AuthService._createOnSignInTabUpdated(
            tabId,
            window,
            uniqueId
          );
          chrome.tabs.onUpdated.addListener(onSignInTabUpdated);

          //  TO HANDLE WHAT HAPPENS WHEN LOGIN TAB IS CLOSED
          chrome.tabs.onRemoved.addListener(
            AuthService._createOnSingInTabRemoved(tabId, uniqueId)
          );
        } else {
          chrome.tabs.query(
            {
              active: true,
              currentWindow: true,
            },
            (tabs) => {
              let index = tabs[0].index;
              chrome.tabs.create(
                { url: signInUrl, index: index + 1 },
                (tab) => {
                  if (tab) {
                    const onSignInTabUpdated =
                      AuthService._createOnSignInTabUpdatedV2(tabId, uniqueId);
                    chrome.tabs.onUpdated.addListener(onSignInTabUpdated);

                    chrome.tabs.onRemoved.addListener(
                      AuthService._createOnSingInTabRemoved(tabId, uniqueId)
                    );
                  }
                }
              );
            }
          );
        }
      }
    );
  }

  static async signOut(request, tabId) {
    await AuthService.clearUserData(request.email);

    await MessageService.sendTabMessage(tabId, {
      action: "sign-out-success",
      toast: Utils.generateSuccessToast(`${LOCALE.signedOutSuccessfully}`),
    });
  }

  static async clearUserData(uniqueId) {
    await StorageService.deleteWithPrefix(
      prefixTag.SUBSCRIPTIONS,
      uniqueId,
      "local"
    );
    // await StorageService.deleteWithPrefix(
    //   prefixTag.BLOCKLIST_KEY,
    //   uniqueId,
    //   "local"
    // );
    await StorageService.deleteWithPrefix(prefixTag.CREDENTIALS, uniqueId);
    await StorageService.deleteWithPrefix(prefixTag.USER_DETAILS, uniqueId);
  }

  static async isTokenWithNecessaryScopes(token) {
    try {
      let response = await fetch(
        `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`
      );

      let data = await response.json();

      return Config.GOOGLE_TOKEN_SCOPE.split(" ").every((scope) =>
        data.scope.includes(scope)
      );
    } catch (error) {
      console.error(`Error fetching token information: `, error);
    }
  }

  async getProviderToken() {
    const credentials = await StorageService.getWithPrefix(
      prefixTag.CREDENTIALS,
      this.uniqueId
    );

    if (AuthService._tokenIsExpired(credentials.expiry_time)) {
      const providerToken = await this._refreshAuth();
      return providerToken;
    }

    return credentials.provider_token;
  }

  async _refreshAuth() {
    try {
      const credentials = await StorageService.getWithPrefix(
        prefixTag.CREDENTIALS,
        this.uniqueId
      );

      const headers = new Headers();
      headers.append(
        "Authorization",
        `Bearer ${credentials.provider_refresh_token}`
      );

      const response = await fetch(
        `${Config.INBOX_PURGE_URL}/refresh/token?_=`,
        {
          headers,
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = (await response.json()).data;

      if (!data) {
        AuthService.signOut({ email: this.uniqueId }, this.tabId);
        return;
      }

      await AuthService._updateCredentials({
        ...credentials,
        provider_token: data.accessToken,
        expires_in: data.expiresIn,
        expiry_time: Utils.getTime(data.expiresIn),
      });

      return data.accessToken;
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }

  //FIX SIGN IN BUG
  static _createOnSingInTabRemoved(originalTabId, uniqueId) {
    return async function (tabId, info) {
      //  WAIT FOR 2 SECONDS THEN CLOSE
      setTimeout(async () => {
        const credentials = await StorageService.getWithPrefix(
          prefixTag.CREDENTIALS,
          uniqueId
        );

        if (!credentials) {
          await MessageService.sendTabMessage(originalTabId, {
            action: "sign-in-failed",
          });
        }
      }, 2000);
    };
  }

  static _createOnSignInTabUpdated(originalTabId, window, uniqueId) {
    return async function onSignInTabUpdated(tabId, changeInfo, tab) {
      const urlString = changeInfo.url || tab.url;
      if (!urlString) return;
      const url = new URL(urlString);

      // console.log("Tab Updated:", { tabId, changeInfo, tab });
      // console.log("Parsed URL:", url.href);
      if (
        url.hostname.endsWith("inboxpurge.com") &&
        url.pathname === "/login"
      ) {
        if (url.hash.startsWith("#provider_token=")) {
          const credentials = url.hash
            .split("#")[1]
            .split("&")
            .reduce((result, cr) => {
              const objArr = cr.split("=");
              result[objArr[0]] = objArr[1];
              return result;
            }, {});

          chrome.windows.remove(window.id);
          chrome.tabs.onUpdated.removeListener(onSignInTabUpdated);

          if (
            await AuthService.isTokenWithNecessaryScopes(
              credentials.provider_token
            )
          ) {
            await AuthService._updateCredentials({
              ...credentials,
              uniqueId,
              expiry_time: Utils.getTime(credentials.expires_in),
            });

            await MessageService.sendTabMessage(originalTabId, {
              action: "sign-in-success",
              email: uniqueId,
              toast: Utils.generateSuccessToast(`${LOCALE.loginSuccessful}`),
            });
          } else {
            await MessageService.sendTabMessage(originalTabId, {
              action: "sign-in-failed",
              toast: Utils.generateErrorToast(
                `${LOCALE.missingRequiredPermission}`
              ),
            });
          }
        } else if (url.hash.startsWith("#error=")) {
          console.error("ERROR: Server Error", url.href);
          chrome.windows.remove(window.id);
          chrome.tabs.onUpdated.removeListener(onSignInTabUpdated);
          await MessageService.sendTabMessage(originalTabId, {
            action: "sign-in-failed",
            toast: Utils.generateErrorToast(`${LOCALE.errorWileSigningIn}`),
          });
        }
      }
    };
  }

  static _createOnSignInTabUpdatedV2(originalTabId, uniqueId) {
    return async function onSignInTabUpdated(tabId, changeInfo, tab) {
      if (tab.url.includes("inboxpurge.com/login#provider_token=")) {
        const credentials = tab.url
          .split("#")[1]
          .split("&")
          .reduce((result, cr) => {
            const objArr = cr.split("=");
            result[objArr[0]] = objArr[1];
            return result;
          }, {});

        chrome.tabs.remove(tab.id);
        chrome.tabs.onUpdated.removeListener(onSignInTabUpdated);
        chrome.tabs.update(originalTabId, { active: true });

        if (
          await AuthService.isTokenWithNecessaryScopes(
            credentials.provider_token
          )
        ) {
          await AuthService._updateCredentials({
            ...credentials,
            uniqueId,
            expiry_time: Utils.getTime(credentials.expires_in),
          });

          await MessageService.sendTabMessage(originalTabId, {
            action: "sign-in-success",
            email: uniqueId,
            toast: Utils.generateSuccessToast(`${LOCALE.loginSuccessful}`),
          });
        } else {
          await MessageService.sendTabMessage(originalTabId, {
            action: "sign-in-failed",
            toast: Utils.generateErrorToast(
              `${LOCALE.missingRequiredPermission}`
            ),
          });
        }
      }

      if (tab.url.includes("inboxpurge.com/login#error=")) {
        console.log("ERROR: Server Error", tab.url);
        chrome.tabs.remove(tab.id);
        chrome.tabs.onUpdated.removeListener(onSignInTabUpdated);
        chrome.tabs.update(originalTabId, { active: true });
        await MessageService.sendTabMessage(originalTabId, {
          action: "sign-in-failed",
          toast: Utils.generateErrorToast(`${LOCALE.errorWileSigningIn}`),
        });
      }
    };
  }

  static _getActiveTabInWindow(windowId) {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, windowId: windowId }, (tabs) => {
        if (tabs.length === 0) {
          reject(new Error("No active tab found in the specified window."));
          return;
        }

        resolve(tabs[0]);
      });
    });
  }

  static async handleManualSignIn(authUrl) {
    if (!authUrl) return;
    const url = new URL(authUrl);
    const originalTabId = AuthService.getOriginalTabId();
    if (!originalTabId) return;

    if (url.hostname.endsWith("inboxpurge.com") && url.pathname === "/login") {
      if (url.hash.startsWith("#provider_token=")) {
        const credentials = url.hash
          .split("#")[1]
          .split("&")
          .reduce((result, cr) => {
            const objArr = cr.split("=");
            result[objArr[0]] = objArr[1];
            return result;
          }, {});

        const uniqueId = credentials.email;

        if (
          await AuthService.isTokenWithNecessaryScopes(
            credentials.provider_token
          )
        ) {
          await AuthService._updateCredentials({
            ...credentials,
            uniqueId,
            expiry_time: Utils.getTime(credentials.expires_in),
          });

          await MessageService.sendTabMessage(originalTabId, {
            action: "sign-in-success",
            email: uniqueId,
            toast: Utils.generateSuccessToast(`${LOCALE.loginSuccessful}`),
          });
        } else {
          await MessageService.sendTabMessage(originalTabId, {
            action: "sign-in-failed",
            toast: Utils.generateErrorToast(
              `${LOCALE.missingRequiredPermission}`
            ),
          });
        }
      } else if (url.hash.startsWith("#error=")) {
        console.error("ERROR: Server Error", url.href);
        await MessageService.sendTabMessage(originalTabId, {
          action: "sign-in-failed",
          toast: Utils.generateErrorToast(`${LOCALE.errorWileSigningIn}`),
        });
      }
    }
  }

  static async _updateCredentials(credentials) {
    await StorageService.saveWithPrefix(
      prefixTag.CREDENTIALS,
      credentials.uniqueId,
      credentials
    );
  }

  static _tokenIsExpired(expiryTime) {
    return Date.now() >= expiryTime;
  }
}
