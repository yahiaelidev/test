import { Config } from "../config.js";
import { LicenseService } from "./license.service.js";
import { StorageService, prefixTag } from "./storage.service.js";
import { AuthService } from "./auth.service.js";
import { GoogleClient } from "../client/google.client.js";

export class UserService {
  constructor(uniqueId, tabId) {
    this.uniqueId = uniqueId;
    this.tabId = tabId;
  }

  async getUser() {
    try {
      const headers = new Headers();
      headers.append("x-api-key", `${await LicenseService.getAPIKey()}`);

      const response = await fetch(
        `${Config.INBOX_PURGE_URL}/user/${this.uniqueId}?_=`,
        {
          headers,
        }
      );

      if (!response.ok) {
        if (response.status == 401) {
          await this.handle401Error(async () => await this.getUser());
          return;
        }

        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();

      await StorageService.saveWithPrefix(
        prefixTag.USER_DETAILS,
        this.uniqueId,
        data
      );

      return data;
    } catch (err) {
      console.log("Error occured while getting user: ", err);
    }
  }

  async checkUserPermissions() {
    try {
      const token = await new AuthService(
        this.uniqueId,
        this.tabId
      ).getProviderToken();

      const googleClient = new GoogleClient(token, this.uniqueId);
      const data = await googleClient.getUserProfile();

      if (!data) {
        throw new Error("User profile not found");
      }
    } catch (err) {
      await AuthService.signOut({ email: this.uniqueId }, this.tabId);
      console.log("Error occured while checking user permission: ", err);
    }
  }

  async updateUserUsageCount(usageCount) {
    try {
      const headers = new Headers();
      headers.append("x-api-key", `${await LicenseService.getAPIKey()}`);
      headers.append("Content-Type", "application/json");

      const response = await fetch(
        `${Config.INBOX_PURGE_URL}/user/${this.uniqueId}/count?_=`,
        {
          method: "PUT",
          body: JSON.stringify(usageCount),
          headers: headers,
        }
      );

      if (!response.ok) {
        if (response.status == 401) {
          await this.handle401Error(
            async () => await this.updateUserUsageCount(usageCount)
          );
          return;
        }

        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();

      await StorageService.saveWithPrefix(
        prefixTag.USER_DETAILS,
        this.uniqueId,
        data
      );

      return data;
    } catch (err) {
      console.log("Error occured while updating count: ", err);
    }
  }

  async handle401Error(func) {
    // await StorageService.deleteWithPrefix(prefixTag.LICENSE_KEY, "INBOX_PURGE");

    // We simply update instead of deleting
    const license = await StorageService.getWithPrefix(
      prefixTag.LICENSE_KEY,
      "INBOX_PURGE"
    );

    await StorageService.saveWithPrefix(prefixTag.LICENSE_KEY, "INBOX_PURGE", {
      ...license,
      valid: false,
    });

    if (func) {
      await func();
    }
  }
}
