import { MessageService } from "./message.service.js";
import { prefixTag, StorageService } from "./storage.service.js";
import { Config } from "../config.js";

export class LicenseService {
  static async activateLicense(request, tabId) {
    try {
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("x-api-key", `${Config.FREE_LICENSE_API_KEY}`);

      const response = await fetch(
        `${Config.INBOX_PURGE_URL}/license/validate?_=`,
        {
          method: "POST",
          body: JSON.stringify({ licenseKey: request.licenseKey }),
          headers: headers,
        }
      );

      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(errorData.error);
        }
        console.log(`HTTP error! Status: ${response.status}`);
        throw new Error("Invalid key (if this is a mistake contact support)");
      }
      const data = await response.json();

      if (data.valid) {
        await StorageService.saveWithPrefix(
          prefixTag.LICENSE_KEY,
          "INBOX_PURGE",
          {
            licenseKey: request.licenseKey,
            valid: true,
            plan: LicenseService.getPlan(data.meta.product_name),
          }
        );

        await MessageService.sendTabMessage(tabId, {
          action: "activate-license-success",
          request: { data },
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      await StorageService.saveWithPrefix(
        prefixTag.LICENSE_KEY,
        "INBOX_PURGE",
        {
          licenseKey: request.licenseKey,
          valid: false,
          plan: "FREE",
        }
      );

      await MessageService.sendTabMessage(tabId, {
        action: "activate-license-failed",
        request: { error: error.message },
      });

      console.log("Error occured while validating license: ", error);
    }
  }

  static async getAPIKey() {
    const license = await StorageService.getWithPrefix(
      prefixTag.LICENSE_KEY,
      "INBOX_PURGE"
    );

    if (license && license.valid) {
      return license.licenseKey;
    }

    return Config.FREE_LICENSE_API_KEY;
  }

  static getPlan(productName) {
    if (productName.includes("Pro")) {
      return "PRO";
    } else if (productName.includes("Basic")) {
      return "BASIC";
    }
    return "FREE";
  }
}
