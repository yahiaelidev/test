import { AuthService } from "./service/auth.service.js";
import { LOCALE } from "./messages.js";

export class Utils {
  static getTime(seconds) {
    return new Date(Date.now() + 1000 * seconds).getTime();
  }

  static splitArrayIntoChunks(array, chunkSize) {
    if (chunkSize <= 0) {
      throw new Error("Chunk size must be greater than 0");
    }

    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      const chunk = array.slice(i, i + chunkSize);
      chunks.push(chunk);
    }

    return chunks;
  }

  static decodeBase64Url(encodedData) {
    const base64Data = encodedData.replace(/-/g, "+").replace(/_/g, "/");
    const binaryData = atob(base64Data);
    const decodedData = decodeURIComponent(
      binaryData
        .split("")
        .map((char) => {
          return "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return decodedData;
  }

  static async fetchSenderLogo(senderEmail) {
    try {
      const domain = senderEmail.split("@")[1];
      const response = await fetch(`https://logo.clearbit.com/${domain}`);

      if (response.ok) {
        return `https://logo.clearbit.com/${domain}`;
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Failed to fetch logo from Clearbit API:`, error.message);
      return null;
    }
  }

  static async resolveSenderLogos(senderList) {
    return Promise.all(
      senderList.map(async (list) => {
        if (list.logoUrl) {
          return list;
        }
        const logoUrl = await Utils.fetchSenderLogo(list.senderEmail);
        list.logoUrl = logoUrl ? logoUrl : undefined;
        return list;
      })
    );
  }

  static async fetchWithRetry(url, options = {}, retries = 5, backoff = 300) {
    try {
      const response = await fetch(url, options);

      if (response.status === 429 || response.status === 500) {
        console.log("Rate limited or server error ", response.status);
        throw new Error("Rate limited or server error");
      }

      if (response.status === 401) {
        console.log("Unauthorized: ", response.status);
        return response;
      }

      if (response.status === 403) {
        console.log("Forbidden: ", response.status);
        const uniqueId = Utils.extractEmailFromUrl(url);
        if (uniqueId) {
          await AuthService.clearUserData(uniqueId);
        }
        return response;
      }

      if (!response.ok) {
        console.log("Network response was not ok");
        throw new Error("Network response was not ok");
      }

      return response;
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, backoff));
        return Utils.fetchWithRetry(url, options, retries - 1, backoff * 2);
      } else {
        throw new Error("Max retries exceeded");
      }
    }
  }

  static extractEmailFromUrl(url) {
    let emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    let match = url.match(emailRegex);
    return match ? match[0] : undefined;
  }

  static getBaseUrl() {
    try {
      const url = chrome.runtime.getURL("");
      if (url[url.length - 1] == "/") {
        return url.slice(0, -1);
      } else {
        return url;
      }
    } catch (e) {
      Utils.handleError("Error when getting extension base url", e);
      return "chrome-extension://mogabgmejhmicinppdfeoaokolphbgcd";
    }
  }

  static generateErrorToast(message) {
    return Utils.generateToast(`${LOCALE.error}`, message, "error");
  }

  static generateSuccessToast(message) {
    return Utils.generateToast(`${LOCALE.success}`, message, "success");
  }

  static generateToast(header, message, status) {
    return {
      header: header,
      message: message,
      status: status,
    };
  }

  static handleError(customMessage, error) {
    if (error && error.message) {
      if (
        error.message?.toLowerCase().includes("receiving end does not exist")
      ) {
        // do nothing
      } else {
        // Consider sending these errors to sentry
        console.error(customMessage, error.message);
      }
    }
  }
}
