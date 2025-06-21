import { MessageService } from "./message.service.js";
import { prefixTag, StorageService } from "./storage.service.js";
import { Utils } from "../utils.js";
import { GoogleClient } from "../client/google.client.js";
import { AuthService } from "./auth.service.js";
import { UserService } from "./user.service.js";
import { LOCALE } from "../messages.js";

const FILTER_IDENTIFIER = "filter@inboxpurge.com";
const MAX_FILTER_CHARS = 1490; // actual limit is 1500

export class BlockService {
  constructor(uniqueId, tabId) {
    this.uniqueId = uniqueId;
    this.tabId = tabId;
  }

  async addToBlockList(unsubscribeList) {
    const formatedList = unsubscribeList.map((item) => ({
      senderEmail: item.labelEmailFull || item.labelEmail,
      senderName: item.labelName,
    }));

    const blocklist = await this.getBlockList();
    const existingEmails = new Set(blocklist.map((item) => item.senderEmail));
    const uniqueFormattedList = formatedList.filter(
      (item) => !existingEmails.has(item.senderEmail)
    );
    blocklist.push(...uniqueFormattedList);

    await StorageService.saveWithPrefix(
      prefixTag.BLOCKLIST_KEY,
      this.uniqueId,
      blocklist,
      "local"
    );

    const senderEmails = blocklist.map((list) => list.senderEmail);
    await this._updateFilter(senderEmails);
  }

  async getEnrichedBlockList(sync = false) {
    try {
      const cachedList = await this.getBlockList();
      let combinedList = cachedList;

      let blockedSenders = [];
      if (sync || cachedList.length === 0) {
        blockedSenders = await this._getBlockedSenderEmails();

        if (blockedSenders.length > 0) {
          const cachedMap = new Map(
            cachedList.map(item => [item.senderEmail, item.senderName])
          );

          combinedList = [
            ...cachedList,
            ...blockedSenders
              .filter(email => !cachedMap.has(email))
              .map(email => ({ senderName: email, senderEmail: email })),
          ];

          await StorageService.saveWithPrefix(
            prefixTag.BLOCKLIST_KEY,
            this.uniqueId,
            combinedList,
            "local"
          );
        }
      }

      if (sync) {
        // rebuild *all* filters from the combined list
        const allEmails = combinedList.map(item => item.senderEmail);
        await this._updateFilter(allEmails);
      }

      const blockList = await Utils.resolveSenderLogos(combinedList);
      await MessageService.sendTabMessage(this.tabId, {
        action: "get-block-list-success",
        request: { blockList },
      });
    } catch (error) {
      console.error("ERROR BLOCK LIST: ", error);
      await MessageService.sendTabMessage(this.tabId, {
        action: "get-block-list-error",
        request: { error, blockList: [] },
        toast: Utils.generateErrorToast(`${LOCALE.errorOccurred}`),
      });
    }
  }


  async getBlockList() {
    return (
      (await StorageService.getWithPrefix(
        prefixTag.BLOCKLIST_KEY,
        this.uniqueId,
        "local"
      )) || []
    );
  }

  async removeFromBlockList(listToRemove) {
    const senderEmails = listToRemove.map(
      (list) => list.labelEmailFull || list.labelEmail
    );

    const blockList = await this.getBlockList();
    const newBlockList = blockList.filter(
      (blockList) => !senderEmails.includes(blockList.senderEmail)
    );

    await StorageService.saveWithPrefix(
      prefixTag.BLOCKLIST_KEY,
      this.uniqueId,
      newBlockList,
      "local"
    );

    await this.onUnBlockSuccess(newBlockList, listToRemove);

    await MessageService.sendTabMessage(this.tabId, {
      action: "unblock-success",
      request: { blockList },
      toast: Utils.generateSuccessToast(`${LOCALE.unblockedFromSelectedList}`),
    });
  }

  async _getBlockedSenderEmails() {
    const token = await new AuthService(
      this.uniqueId,
      this.tabId
    ).getProviderToken();
    const googleClient = new GoogleClient(token, this.uniqueId);
    const filters = (await googleClient.getFilters()) || [];

    const inboxPurgeFilters = filters.filter(
      (f) => f.criteria.from && f.criteria.from.includes(FILTER_IDENTIFIER)
    );

    const allEmails = inboxPurgeFilters.flatMap((f) =>
      f.criteria.from
        .replace(new RegExp(`^${FILTER_IDENTIFIER}\\s+OR\\s+`), "")
        .split(/\s+OR\s+/)
    );

    return Array.from(new Set(allEmails));
  }

  async _updateFilter(senderEmails) {
    try {
      const token = await new AuthService(
        this.uniqueId,
        this.tabId
      ).getProviderToken();
      const googleClient = new GoogleClient(token, this.uniqueId);

      // delete all existing InboxPurge filters
      const existing = (await googleClient.getFilters()) || [];
      for (const f of existing) {
        if (f.criteria.from && f.criteria.from.includes(FILTER_IDENTIFIER)) {
          await googleClient.deleteFilter(f.id);
        }
      }

      if (!senderEmails.length) return;

      // chunk senders so each filter.criteria.from stays ≤ MAX_FILTER_CHARS
      const chunks = [];
      let current = [];
      let currentLen = FILTER_IDENTIFIER.length;

      for (const email of senderEmails) {
        const addedLen = 4 + email.length;
        if (currentLen + addedLen > MAX_FILTER_CHARS && current.length) {
          chunks.push(current);
          current = [];
          currentLen = FILTER_IDENTIFIER.length;
        }
        current.push(email);
        currentLen += addedLen;
      }
      if (current.length) chunks.push(current);

      // create a filter per chunk
      for (const chunk of chunks) {
        await googleClient.createFilter({
          action: { addLabelIds: ["TRASH"] },
          criteria: {
            from: FILTER_IDENTIFIER + " OR " + chunk.join(" OR "),
          },
        });
      }
    } catch (err) {
      console.error("Error updating filters:", err);
    }
  }

  async onUnBlockSuccess(blockList, unblockList) {
    // update usage count
    const userService = new UserService(this.uniqueId);
    await userService.updateUserUsageCount({
      unblockClickCountIncrement: 1,
      unblockCountIncrement: unblockList.length,
    });

    await this._updateFilter(blockList.map((list) => list.senderEmail));
  }
}
