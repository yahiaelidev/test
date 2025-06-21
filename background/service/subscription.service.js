import { GoogleClient } from "../client/google.client.js";
import { Utils } from "../utils.js";
import { AuthService } from "./auth.service.js";
import { MessageService } from "./message.service.js";
import { UserService } from "./user.service.js";
import { BlockService } from "./block.service.js";
import { prefixTag, StorageService } from "./storage.service.js";
import { DeleteService } from "./delete.service.js";
import { Config } from "../config.js";
import { LOCALE } from "../messages.js";

export class SubscriptionService {
  static async getMailingList(request, tabId) {
    try {
      let mailingList = [];

      const token = await new AuthService(
        request.email,
        tabId
      ).getProviderToken();

      const googleClient = new GoogleClient(token, request.email);

      const cachedList = await SubscriptionService.getCachedSubscriptions(
        request.email
      );

      if (
        !request.ignoreCache &&
        cachedList.mailingList.length > 0 &&
        cachedList.lastChecked
      ) {
        const messages = await googleClient.getAllMessages(
          cachedList.lastChecked
        );

        const newMailingList = SubscriptionService.groupMailingList(messages);

        const combinedList = SubscriptionService.combineMailingList(
          cachedList.mailingList,
          newMailingList
        );

        if (newMailingList.length > 0) {
          await SubscriptionService.cacheSubscriptions(
            request.email,
            combinedList
          );
        }

        const groupedList = await SubscriptionService.applyFiltersToList(
          request.email,
          combinedList
        );

        mailingList = await Utils.resolveSenderLogos(groupedList);

        // Get number of emails recieved for new mailing list
        const senderEmails = mailingList
          .filter(
            (list) =>
              !list.totalCount ||
              list.totalCount === 0 ||
              isNaN(list.totalCount)
          )
          .map((list) => list.senderEmail);
        const totalCountPerEmail = await googleClient.getExactCountForSendersV2(
          senderEmails
        );

        SubscriptionService.setCountMetrics(totalCountPerEmail, mailingList);
      } else {
        const messages = await googleClient.getAllMessages();
        const groupMailingList = SubscriptionService.groupMailingList(messages);

        await SubscriptionService.cacheSubscriptions(
          request.email,
          groupMailingList
        );

        const groupedList = await SubscriptionService.applyFiltersToList(
          request.email,
          groupMailingList
        );

        mailingList = await Utils.resolveSenderLogos(groupedList);

        // Get number of emails recieved
        const senderEmails = mailingList.map((list) => list.senderEmail);
        const totalCountPerEmail = await googleClient.getExactCountForSendersV2(
          senderEmails
        );

        SubscriptionService.setCountMetrics(totalCountPerEmail, mailingList);
      }

      await MessageService.sendTabMessage(tabId, {
        action: "get-mailing-list-success",
        request: { mailingList },
      });

      // FINAL CACHE FOR MAILING LIST
      await SubscriptionService.cacheMailingListWithMetrics(
        request.email,
        mailingList
      );
    } catch (error) {
      console.log("Error getting mailing list: ", error);

      await MessageService.sendTabMessage(tabId, {
        action: "get-mailing-list-error",
        toast: Utils.generateErrorToast(`${LOCALE.errorOccurred}`),
        request: { error, mailingList: [] },
      });
    }
  }

  static async unsubscribeInBulk(request, tabId) {
    // const isUserWithinLimits = await SubscriptionService.isUserWithinLimits(
    //   request.email
    // );

    // if (!isUserWithinLimits) {
    //   await MessageService.sendTabMessage(tabId, {
    //     action: "unsubscribe-quota-exhausted",
    //     request: { message: "Quota exceeded" },
    //     toast: Utils.generateErrorToast("Free usage quota exceeded"),
    //   });
    //   return;
    // }

    try {
      const unsubscribeLinks = request.unsubscribeList.map(
        (obj) => obj.unsubscribeURL
      );

      await SubscriptionService.unsubscribeAll(request.email, unsubscribeLinks);

      const userStats = await SubscriptionService.onSubscriptionSuccess(
        request.email,
        tabId,
        request.unsubscribeList,
        request.deleteEmails,
        request.deleteFilters
      );

      await MessageService.sendTabMessage(tabId, {
        action: "unsubscribe-success",
        request: { ...request, userStats, deletionCountIncrement: userStats.deletionCountIncrement },
        toast: Utils.generateSuccessToast(
          `${LOCALE.unsubscribedFromSelectedList}`
        ),
      });
    } catch (error) {
      console.log("ERROR UNSUBSCRIBING: ", error);
      await MessageService.sendTabMessage(tabId, {
        action: "unsubscribe-error",
        request: { error },
        toast: Utils.generateSuccessToast(`${LOCALE.errorOccurred}`),
      });
    }
  }

  static async unsubscribeInBulkNative(request, tabId) {
    try {
      const token = await new AuthService(
        request.email,
        tabId
      ).getProviderToken();

      const googleClient = new GoogleClient(token, request.email);
      const messages = await googleClient._batchGetMessages(
        request.selectedList.map((e) => e.messageId)
      );

      request.unsubscribeList =
        await SubscriptionService.convertToUnsubscribeList(
          request.selectedList,
          messages
        );

      const unsubscribeLinks = request.unsubscribeList.map(
        (obj) => obj.unsubscribeURL
      );

      await SubscriptionService.unsubscribeAll(request.email, unsubscribeLinks);

      const userStats = await SubscriptionService.onSubscriptionSuccess(
        request.email,
        tabId,
        request.unsubscribeList,
        request.deleteEmails,
        request.deleteFilters
      );

      await MessageService.sendTabMessage(tabId, {
        action: "native-unsubscribe-success",
        request: { ...request, userStats, deletionCountIncrement: userStats.deletionCountIncrement },
      });
    } catch (error) {
      console.log("ERROR UNSUBSCRIBING: ", error);
      await MessageService.sendTabMessage(tabId, {
        action: "native-unsubscribe-error",
        request: { error },
        toast: Utils.generateSuccessToast(`${LOCALE.errorOccurred}`),
      });
    }
  }

  static async unsubscribeAll(email, unsubscribeLinks) {
    try {
      const headers = new Headers();
      headers.append("Content-Type", "application/json");

      const response = await fetch(`${Config.INBOX_PURGE_URL}/unsubscribe?_=`, {
        method: "POST",
        body: JSON.stringify({ email, unsubscribeLinks }),
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (err) {
      console.log("Error occured while unsubscribing: ", err);
    }
  }

  static groupMailingList(messages) {
    const mailingListGroups = {};
    const sendersMap = {};

    for (const message of messages) {
      try {
        // Sometimes errors: {"errors":{}}
        if (!message.payload) {
          continue;
        }
        const headers = message.payload.headers;

        const sender = headers.find((header) => header.name === "From").value;
        if (sendersMap[sender]) {
          continue;
        } else {
          if (sender) {
            sendersMap[sender] = message;
          } else {
            continue;
          }
        }
        let defaultUnsubscribeLink = headers.find(
          (header) => header.name === "List-Unsubscribe"
        )?.value;

        if (defaultUnsubscribeLink) {
          const urls = defaultUnsubscribeLink.match(/https?:\/\/[^\s<>]+/gi);

          if (urls && !urls[0].includes("mailto:")) {
            defaultUnsubscribeLink = urls[0];
          } else {
            defaultUnsubscribeLink = undefined;
          }
        }

        const opened = message.labelIds.includes("UNREAD") ? false : true;
        let content = "";
        const parts = message.payload.parts;

        if (parts) {
          const htmlPart = parts.find((part) => part.mimeType === "text/html");
          const plainTextPart = parts.find(
            (part) => part.mimeType === "text/plain"
          );

          if (htmlPart) {
            content = Utils.decodeBase64Url(htmlPart.body.data);
          } else if (plainTextPart) {
            content = Utils.decodeBase64Url(plainTextPart.body.data);
          }
        } else {
          content = Utils.decodeBase64Url(message.payload.body.data);
        }

        const { senderName, senderEmail } =
          SubscriptionService.parseSenderInfo(sender);

        if (!mailingListGroups[senderEmail]) {
          let logoUrl;
          let unsubscribeURL;

          mailingListGroups[senderEmail] = {
            unsubscribeURL,
            logoUrl,
            senderName,
            senderEmail,
            openedCount: 0,
            totalCount: 0,
          };
        }

        if (!mailingListGroups[senderEmail].unsubscribeURL) {
          mailingListGroups[senderEmail].unsubscribeURL =
            defaultUnsubscribeLink ||
            SubscriptionService.extractUnsubscribeURL({
              sender,
              opened,
              content,
            });
        }

        // THIS BIT WILL HAVE TO BE IMPLEMENTED DIFFERENTLY???
        // if (opened) mailingListGroups[senderEmail].openedCount += 1; // Alternative (Count): I could make another call to get all emails attached to all emails in the list ????
        // mailingListGroups[senderEmail].totalCount += 1; // // Alternative (Count): I could make another call to get all emails with UNREAD label on the list (This way we calculate the number of open)
      } catch (error) {
        console.error(
          "Error occurred while retrieving subscription list for this message: ",
          error
        );
        continue;
      }
    }
    return Object.values(mailingListGroups);
  }

  static async applyFiltersToList(uniqueId, subscriptionList) {
    const blocklist = await new BlockService(uniqueId).getBlockList();
    const blockedSenders = blocklist.map((list) => list.senderEmail);

    return subscriptionList.filter(
      (list) =>
        list.unsubscribeURL && !blockedSenders.includes(list.senderEmail)
    );
  }

  static async setCountMetrics(result, mailingList) {
    if (result.length < 1) {
      return;
    }

    for (let i = 0; i < mailingList.length; i++) {
      if (result[mailingList[i].senderEmail]) {
        mailingList[i].totalCount = result[mailingList[i].senderEmail];
      }
    }
  }

  static async cacheMailingListWithMetrics(email, mailingList) {
    if (mailingList.length < 1) {
      return;
    }

    const cachedList = await SubscriptionService.getCachedSubscriptions(email);

    if (
      !cachedList ||
      !cachedList.mailingList ||
      cachedList.mailingList.length < 1
    ) {
      return;
    }

    // Create a map of mailingList using senderEmail as the key
    const mailingListMap = {};
    for (let item of mailingList) {
      mailingListMap[item.senderEmail] = item;
    }

    // Combine the lists
    const combinedList = cachedList.mailingList.map((item) => {
      if (mailingListMap[item.senderEmail]) {
        const { logoUrl, ...otherProperties } =
          mailingListMap[item.senderEmail];
        return otherProperties;
      }
      return item;
    });

    // Append any items from mailingList that don't exist in cachedList.mailingList
    for (let item of mailingList) {
      if (
        !combinedList.some(
          (combinedItem) => combinedItem.senderEmail === item.senderEmail
        )
      ) {
        combinedList.push(item);
      }
    }

    await SubscriptionService.cacheSubscriptions(email, combinedList);
  }

  static parseSenderInfo(input) {
    const senderRegex = /^(.*?)(?:\s*<([^>]+)>)?$/;
    const match = input.match(senderRegex);

    if (match) {
      const email = (
        match[2] ? match[2].trim() : match[1].trim()
      ).toLowerCase();
      return {
        senderName: match[1].trim() || email,
        senderEmail: email,
      };
    } else {
      return {
        senderName: null,
        senderEmail: null,
      };
    }
  }

  static async fetchSenderLogo(senderEmail) {
    const domain = senderEmail.split("@")[1];

    try {
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

  static async resolveSenderLogos(mailingList) {
    return Promise.all(
      mailingList.map(async (list) => {
        const logoUrl = await SubscriptionService.fetchSenderLogo(
          list.senderEmail
        );
        list.logoUrl = logoUrl ? logoUrl : undefined;
        return list;
      })
    );
  }

  static extractUnsubscribeURL(message) {
    const unsubscribeKeywords = [
      "unsubscribe",
      "optout",
      "opt-out",
      "opt out",
      "don’t want to receive",
      "do not want to receive",
    ];
    const extractLinks = (html) => {
      const linkRegex =
        /<a\s+(?:(?!href)[^>])*href\s*=\s*["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
      const links = [];
      let match;

      while ((match = linkRegex.exec(html))) {
        links.push({ url: match[1], text: match[2] });
      }

      return links;
    };

    const links = extractLinks(message.content);
    const lowerCaseKeywords = unsubscribeKeywords.map((keyword) =>
      keyword.toLowerCase()
    );

    for (const link of links) {
      const lowerCaseLinkText = link.text.toLowerCase();

      for (const keyword of lowerCaseKeywords) {
        if (lowerCaseLinkText.includes(keyword)) {
          return link.url;
        }
      }
    }

    return null;
  }

  static async isUserWithinLimits(uniqueId) {
    const userService = new UserService(uniqueId);
    const user = await userService.getUser();
    return user.isWithinLimit;
  }

  static async onSubscriptionSuccess(
    uniqueId,
    tabId,
    unsubscribeList,
    deleteEmails,
    deleteFilters
  ) {
    const userService = new UserService(uniqueId);
    const usageStats = {
      unsubscriptionClickCountIncrement: 1,
      unsubscriptionCountIncrement: unsubscribeList.length,
    };

    await new BlockService(uniqueId, tabId).addToBlockList(unsubscribeList);

    if (deleteEmails) {
      usageStats.deletionCountIncrement = await new DeleteService(
        uniqueId,
        tabId
      ).deleteEmails(unsubscribeList, deleteFilters);
    }

    // update user usage count
    const userStats = await userService.updateUserUsageCount(usageStats);

    // added this info for the UI
    userStats.deletionCountIncrement = usageStats.deletionCountIncrement; 

    return userStats;
  }

  static async getCachedSubscriptions(uniqueId) {
    return (
      (await StorageService.getWithPrefix(
        prefixTag.SUBSCRIPTIONS,
        uniqueId,
        "local"
      )) || { mailingList: [], lastChecked: null }
    );
  }

  static async cacheSubscriptions(uniqueId, mailingList, lastChecked) {
    await StorageService.saveWithPrefix(
      prefixTag.SUBSCRIPTIONS,
      uniqueId,
      { mailingList, lastChecked: lastChecked || new Date().getTime() },
      "local"
    );
  }

  static combineMailingList(mailingList1, mailingList2) {
    let mailingListDict = {};
    let combinedArray = [];

    for (let item of mailingList1.concat(mailingList2)) {
      if (mailingListDict[item.senderEmail]) {
        const openedCount = mailingListDict[item.senderEmail].openedCount;
        const totalCount = mailingListDict[item.senderEmail].totalCount;

        mailingListDict[item.senderEmail].openedCount = openedCount
          ? openedCount + item.openedCount
          : 0;
        mailingListDict[item.senderEmail].totalCount = totalCount
          ? totalCount + item.totalCount
          : 0;
      } else {
        mailingListDict[item.senderEmail] = item;
        combinedArray.push(item);
      }
    }

    return combinedArray;
  }

  static async convertToUnsubscribeList(selectedList, messages) {
    if (messages) {
      const mailingList = SubscriptionService.groupMailingList(messages);

      return mailingList.map((list) => ({
        labelName: list.senderName,
        labelEmail: list.senderEmail,
        labelEmailFull: list.senderEmail,
        unsubscribeURL: list.unsubscribeURL,
      }));
    }

    return selectedList.map((e) => {
      return {
        labelName: e.name,
        labelEmail: e.email,
        labelEmailFull: e.email,
        unsubscribeURL: "", // Delete only so no need for subscription url
      };
    });
  }
}
