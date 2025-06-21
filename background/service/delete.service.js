import { GoogleClient } from "../client/google.client.js";
import { AuthService } from "./auth.service.js";
import { SubscriptionService } from "./subscription.service.js";
import { UserService } from "./user.service.js";
import { Utils } from "../utils.js";
import { MessageService } from "./message.service.js";
import { LOCALE } from "../messages.js";

export class DeleteService {
  constructor(uniqueId, tabId) {
    this.uniqueId = uniqueId;
    this.tabId = tabId;
  }

  async handleDeleteRequest(deleteList, deleteFilters) {
    const deletionCountIncrement = await this.deleteEmails(
      deleteList,
      deleteFilters
    );

    // update user usage count
    const userService = new UserService(this.uniqueId);
    const userStats = await userService.updateUserUsageCount({
      deletionCountIncrement,
      uniqueEmailCount: deleteList.length,
    });

    // send message
    await MessageService.sendTabMessage(this.tabId, {
      action: "delete-success",
      request: { deleteList, userStats, deletionCountIncrement },
      toast: Utils.generateSuccessToast(`${LOCALE.deletedSelectedList}`),
    });
  }

  async handleDeleteRequestNative(selectedList, deleteFilters) {
    const deleteList = await SubscriptionService.convertToUnsubscribeList(
      selectedList
    );
    const deletionCountIncrement = await this.deleteEmails(
      deleteList,
      deleteFilters
    );

    // update user usage count
    const userService = new UserService(this.uniqueId);
    const userStats = await userService.updateUserUsageCount({
      deletionCountIncrement,
      uniqueEmailCount: deleteList.length,
    });

    // NOT IN USE ATM
    await MessageService.sendTabMessage(this.tabId, {
      action: "native-delete-success",
      request: { deleteList, userStats, deletionCountIncrement },
    });
  }

  // async deleteEmails(unsubscribeList, deleteFilters) {
  //   const senderEmails = unsubscribeList.map(
  //     (list) => list.labelEmailFull || list.labelEmail
  //   );

  //   const token = await new AuthService(
  //     this.uniqueId,
  //     this.tabId
  //   ).getProviderToken();
  //   const googleClient = new GoogleClient(token, this.uniqueId);

  //   const chunkSize = 8;
  //   let totalDeleted = 0;
  //   let quotaUsed = 0;

  //   let lastStatusSent = 0;
  //   const STATUS_INTERVAL = 5000; // 5 seconds

  //   // helper to fire status updates (non-blocking)
  //   function pushStatus() {
  //     if (Date.now() - lastStatusSent > STATUS_INTERVAL) {
  //       MessageService.sendTabMessage(this.tabId, {
  //         action: "delete-status",
  //         request: { totalDeleted },
  //       }).catch((e) => console.error(e));
  //       lastStatusSent = Date.now();
  //     }
  //   }

  //   for (let i = 0; i < senderEmails.length; i += chunkSize) {
  //     const chunk = senderEmails.slice(i, i + chunkSize);

  //     const deletePromises = chunk.map(async (senderEmail) => {
  //       const { deletedCount, quotaUsedBySender } =
  //         await googleClient._deleteEmailsForSender(senderEmail, deleteFilters);

  //       quotaUsed += quotaUsedBySender;
  //       return deletedCount;
  //     });

  //     const results = await Promise.allSettled(deletePromises);

  //     totalDeleted += results
  //       .filter((result) => result.status === "fulfilled")
  //       .reduce((sum, result) => sum + result.value, 0);

  //     // making sure to only send messages after 5 seonds of the last status sent
  //     if (Date.now() - lastStatusSent > STATUS_INTERVAL) {
  //       MessageService.sendTabMessage(this.tabId, {
  //         action: "delete-status",
  //         request: { totalDeleted },
  //       }).catch(console.error); // fire-and-forget
  //       lastStatusSent = Date.now();
  //     }

  //     if (quotaUsed > 10_000) {
  //       console.log("Approaching Gmail API quota, pausing for 30 seconds...");
  //       await new Promise((resolve) => setTimeout(resolve, 30 * 1000));
  //       quotaUsed = 0;
  //     }
  //   }

  //   const cachedSubscriptions =
  //     await SubscriptionService.getCachedSubscriptions(this.uniqueId);

  //   if (cachedSubscriptions.mailingList.length > 0) {
  //     const newSubscriptionList = cachedSubscriptions.mailingList.filter(
  //       (list) => !senderEmails.includes(list.senderEmail)
  //     );

  //     SubscriptionService.cacheSubscriptions(
  //       this.uniqueId,
  //       newSubscriptionList,
  //       cachedSubscriptions.lastChecked
  //     );
  //   }

  //   return totalDeleted;
  // }

  async deleteEmails(unsubscribeList, deleteFilters) {
    const senderEmails = unsubscribeList.map(
      (list) => list.labelEmailFull || list.labelEmail
    );

    const token = await new AuthService(
      this.uniqueId,
      this.tabId
    ).getProviderToken();
    const googleClient = new GoogleClient(token, this.uniqueId);

    const chunkSize = 8;
    let totalDeleted = 0;
    let quotaUsed = 0;

    let lastStatusSent = 0;
    const STATUS_INTERVAL = 5000; // 5 seconds
    const QUOTA_LIMIT = 10000;
    const TAB_ID = this.tabId;

    // helper to fire status updates (non-blocking)
    function pushStatus() {
      if (Date.now() - lastStatusSent > STATUS_INTERVAL) {
        MessageService.sendTabMessage(TAB_ID, {
          action: "delete-status",
          request: { totalDeleted },
        }).catch((e) => console.error(e));
        lastStatusSent = Date.now();
      }
    }

    // Called after each 5k‐batch delete inside _deleteEmailsForSenderV2
    const onBatchDeleted = async (batchSize, quotaBatch) => {
      totalDeleted += batchSize;
      quotaUsed += quotaBatch;

      if (batchSize > 0) {
        pushStatus();
      }

      // pause immediately if we exceed quota
      if (quotaUsed > QUOTA_LIMIT) {
        console.log("Approaching Gmail API quota, pausing for 30 seconds...");
        await new Promise((resolve) => setTimeout(resolve, 30 * 1000));
        quotaUsed = 0;
      }
    };

    for (let i = 0; i < senderEmails.length; i += chunkSize) {
      const chunk = senderEmails.slice(i, i + chunkSize);

      await Promise.all(
        chunk.map((senderEmail) =>
          googleClient._deleteEmailsForSenderV2(
            senderEmail,
            deleteFilters,
            onBatchDeleted
          )
        )
      );

      pushStatus();
    }

    const cachedSubscriptions =
      await SubscriptionService.getCachedSubscriptions(this.uniqueId);

    if (cachedSubscriptions.mailingList.length > 0) {
      const newSubscriptionList = cachedSubscriptions.mailingList.filter(
        (list) => !senderEmails.includes(list.senderEmail)
      );

      SubscriptionService.cacheSubscriptions(
        this.uniqueId,
        newSubscriptionList,
        cachedSubscriptions.lastChecked
      );
    }

    return totalDeleted;
  }
}
