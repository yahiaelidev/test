import { Config } from "../config.js";
import { LicenseService } from "./license.service.js";
import { MessageService } from "./message.service.js";
import { GoogleClient } from "../client/google.client.js";
import { AuthService } from "./auth.service.js";
import { SubscriptionService } from "./subscription.service.js";
import { UserService } from "./user.service.js";

export class UserDigestService {
  constructor(uniqueId, tabId) {
    this.uniqueId = uniqueId;
    this.tabId = tabId;
  }

  async getUserDigests() {
    try {
      const headers = new Headers();
      headers.append("x-api-key", `${await LicenseService.getAPIKey()}`);

      const response = await fetch(
        `${Config.INBOX_PURGE_URL}/user/${this.uniqueId}/digests`,
        {
          headers,
        }
      );

      if (!response.ok) {
        if (response.status == 401) {
          await new UserService(this.uniqueId, this.tabId).handle401Error(
            async () => await this.getUserDigests()
          );
          return;
        }

        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const digests = await response.json();

      await MessageService.sendTabMessage(this.tabId, {
        action: "get-user-digests-success",
        request: { digests },
      });
    } catch (error) {
      console.log("Error occured while getting user: ", error);

      await MessageService.sendTabMessage(this.tabId, {
        action: "get-user-digests-error",
        request: { error, digests: [] },
      });
    }
  }

  async createUserDigest({ digest }) {
    try {
      const headers = new Headers();
      headers.append("x-api-key", `${await LicenseService.getAPIKey()}`);
      headers.append("Content-Type", "application/json");

      const response = await fetch(
        `${Config.INBOX_PURGE_URL}/user/${this.uniqueId}/digests`,
        {
          method: "POST",
          body: JSON.stringify(digest),
          headers: headers,
        }
      );

      if (!response.ok) {
        if (response.status == 401) {
          await new UserService(this.uniqueId, this.tabId).handle401Error(
            async () => await this.createUserDigest({ digest })
          );
          return;
        }

        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      await MessageService.sendTabMessage(this.tabId, {
        action: "create-user-digest-success",
        request: { digest: data },
      });
    } catch (error) {
      console.log("Error occured while creating user digest: ", error);

      await MessageService.sendTabMessage(this.tabId, {
        action: "create-user-digest-error",
        request: { error },
      });
    }
  }

  async updateUserDigest({ digest }) {
    try {
      const headers = new Headers();
      headers.append("x-api-key", `${await LicenseService.getAPIKey()}`);
      headers.append("Content-Type", "application/json");

      const response = await fetch(
        `${Config.INBOX_PURGE_URL}/user/${this.uniqueId}/digests`,
        {
          method: "PUT",
          body: JSON.stringify(digest),
          headers: headers,
        }
      );

      if (!response.ok) {
        if (response.status == 401) {
          await new UserService(this.uniqueId, this.tabId).handle401Error(
            async () => await this.updateUserDigest({ digest })
          );
          return;
        }

        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();

      await MessageService.sendTabMessage(this.tabId, {
        action: "update-user-digest-success",
        request: { digest: data },
      });
    } catch (error) {
      console.log("Error occured while updating user digest: ", error);

      await MessageService.sendTabMessage(this.tabId, {
        action: "update-user-digest-error",
        request: { error },
      });
    }
  }

  async curateUserDigest({ digest, dateFrom }) {
    try {
      const token = await new AuthService(
        this.uniqueId,
        this.tabId
      ).getProviderToken();
      const googleClient = new GoogleClient(token, this.uniqueId);

      const senderEmails = digest.sources.map((source) => source.senderEmail);
      const messages = await googleClient.getMessagesFromSenders(
        senderEmails,
        dateFrom
      );

      const curatedDigest = this._groupDigest(digest.sources, messages);

      await MessageService.sendTabMessage(this.tabId, {
        action: "curate-user-digest-success",
        request: { curatedDigest },
      });
    } catch (error) {
      await MessageService.sendTabMessage(this.tabId, {
        action: "curate-user-digest-error",
        request: { error },
      });

      console.log("Error occured while curating user digest: ", error);
    }
  }

  _groupDigest(sources, messages) {
    const sendersMap = {};

    for (const message of messages) {
      try {
        const headers = message.payload.headers;
        const subject = headers.find(
          (header) => header.name === "Subject"
        ).value;
        const sender = headers.find((header) => header.name === "From").value;
        if (!sender) {
          continue;
        }

        const { senderEmail } = SubscriptionService.parseSenderInfo(sender);

        if (!senderEmail) {
          continue;
        }

        const parts = message.payload.parts;
        let body = "";

        if (!parts) {
          continue;
        }

        const htmlPart = parts.find((part) => part.mimeType === "text/html");

        if (htmlPart) {
          body = htmlPart.body.data;
        } else {
          // Todo: Investigate potential issues with this
          continue;
          //   const plainTextPart = parts.find(
          //     (part) => part.mimeType === "text/plain"
          //   );

          //   body = plainTextPart.body.data;
        }

        if (!sendersMap[senderEmail]) {
          sendersMap[senderEmail] = {
            // TODO: Order emails from latest to oldest
            emails: [],
          };
        }

        sendersMap[senderEmail].emails.push({
          id: message.id,
          date: message.internalDate,
          subject,
          body,
        });
      } catch (error) {
        console.error(
          "Error occurred while grouping message for digest: ",
          error
        );
        continue;
      }
    }

    return sources
      .filter((source) => sendersMap[source.senderEmail])
      .map((source) => {
        source.emails = sendersMap[source.senderEmail].emails;
        return source;
      });
  }
}
