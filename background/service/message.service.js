import { Utils } from "../utils.js";
export class MessageService {
  static sendMessageAsync(message) {
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            Utils.handleError(
              "Error sending message async",
              chrome.runtime.lastError
            );
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        });
      } catch (error) {
        Utils.handleError("Error sending message async", error);
      }
    });
  }

  static async sendTabMessage(tabId, message) {
    try {
      await chrome.tabs.sendMessage(tabId, message);
    } catch (error) {
      Utils.handleError("Error sending tab message", error);
    }
  }
}
