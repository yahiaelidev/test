import { Utils } from "../utils.js";

const BASE_URL = "https://gmail.googleapis.com/gmail";
const PAGE_SIZE = 500;

export class GoogleClient {
  constructor(accessToken, uniqueId) {
    this.accessToken = accessToken;
    this.uniqueId = uniqueId;
  }

  async getAllMessages(dateFrom) {
    let nextPageToken = null;
    let totalMessages = 0;
    let resultSizeEstimate = 0;
    const allMessageIds = [];

    do {
      try {
        // let url = `${BASE_URL}/v1/users/${this.uniqueId}/messages?q=unsubscribe${dateFilter}&maxResults=${PAGE_SIZE}`;
        let url = `${BASE_URL}/v1/users/${this.uniqueId}/messages?labelIds=CATEGORY_PROMOTIONS&maxResults=${PAGE_SIZE}`;

        if (dateFrom) {
          url += `&q=after:${dateFrom}`;
        }

        if (nextPageToken) {
          url += `&pageToken=${nextPageToken}`;
        }

        const headers = new Headers();
        headers.append("Authorization", `Bearer ${this.accessToken}`);

        // const response = await fetch(url, { headers });
        const response = await Utils.fetchWithRetry(url, { headers });
        const data = await response.json();

        const messages = data.messages || [];
        nextPageToken = data.nextPageToken;
        totalMessages += messages.length;
        resultSizeEstimate = data.resultSizeEstimate;

        // Process the messages in this batch
        const messageIds = messages.map((message) => message.id);
        allMessageIds.push(...messageIds);
      } catch (error) {
        // Handle any errors that occur during the fetch request
        console.error(error);
        break;
      }
    } while (nextPageToken && totalMessages < resultSizeEstimate);

    const allMessages = await this._batchGetMessages(allMessageIds);

    return allMessages;
  }

  async getAllMessagesV2(dateFrom) {
    let nextPageToken = null;
    const allMessageIds = [];

    do {
      try {
        let url = `${BASE_URL}/v1/users/${this.uniqueId}/messages?labelIds=CATEGORY_PROMOTIONS&maxResults=${PAGE_SIZE}`;
        //  let url = `${BASE_URL}/v1/users/${this.uniqueId}/messages?q=unsubscribe&maxResults=${PAGE_SIZE}`;
        if (dateFrom) {
          url += `&after:${dateFrom}`;
        }

        if (nextPageToken) {
          url += `&pageToken=${nextPageToken}`;
        }

        const headers = new Headers();
        headers.append("Authorization", `Bearer ${this.accessToken}`);

        const response = await Utils.fetchWithRetry(url, { headers });
        const data = await response.json();

        const messages = data.messages || [];
        nextPageToken = data.nextPageToken;

        // Process the messages in this batch
        const messageIds = messages.map((message) => message.id);
        allMessageIds.push(...messageIds);
      } catch (error) {
        // Handle any errors that occur during the fetch request
        console.error(error);
        break;
      }
    } while (nextPageToken);

    const allMessages = await this._batchGetMessages(allMessageIds);

    return allMessages;
  }

  async getMessageIdsFromSenders(senderEmails, dateFrom) {
    const allMessageIds = [];

    for (let senderEmail of senderEmails) {
      let nextPageToken = null;

      do {
        try {
          let query = `from:${senderEmail}`;
          if (dateFrom) {
            query += ` after:${dateFrom}`;
          }

          let url = `${BASE_URL}/v1/users/${
            this.uniqueId
          }/messages?q=${encodeURIComponent(query)}&maxResults=${500}`;
          if (nextPageToken) {
            url += `&pageToken=${nextPageToken}`;
          }

          const headers = new Headers();
          headers.append("Authorization", `Bearer ${this.accessToken}`);

          const response = await Utils.fetchWithRetry(url, { headers });
          const data = await response.json();

          const messages = data.messages || [];
          nextPageToken = data.nextPageToken;

          const messageIds = messages.map((message) => message.id);
          allMessageIds.push(...messageIds);
        } catch (error) {
          console.error(error);
          break;
        }
      } while (nextPageToken);
    }

    return allMessageIds;
  }

  async _getMessageIdsForOneSender(senderEmail, dateFrom) {
    let allMessageIdsForSender = [];
    let nextPageToken = null;

    do {
      try {
        let query = `from:${senderEmail}`;
        if (dateFrom) {
          query += ` after:${dateFrom}`;
        }

        let url = `${BASE_URL}/v1/users/${
          this.uniqueId
        }/messages?q=${encodeURIComponent(query)}&maxResults=${500}`;
        if (nextPageToken) {
          url += `&pageToken=${nextPageToken}`;
        }

        const headers = new Headers();
        headers.append("Authorization", `Bearer ${this.accessToken}`);

        const response = await Utils.fetchWithRetry(url, { headers });
        const data = await response.json();

        const messages = data.messages || [];
        nextPageToken = data.nextPageToken;

        const messageIds = messages.map((message) => message.id);
        allMessageIdsForSender.push(...messageIds);
      } catch (error) {
        console.error(error);
        break;
      }
    } while (nextPageToken);

    return allMessageIdsForSender;
  }

  async _getMessageIdsForOneSenderV0(senderEmail, filters) {
    let allMessageIdsForSender = [];
    let nextPageToken = null;
    const { excludeImportantEmails, excludeStarredEmails } = filters;

    do {
      try {
        let query = `from:${senderEmail}`;
        if (excludeImportantEmails) {
          query += ` -is:important`;
        }
        if (excludeStarredEmails) {
          query += ` -is:starred`;
        }

        let url = `${BASE_URL}/v1/users/${
          this.uniqueId
        }/messages?q=${encodeURIComponent(query)}&maxResults=${500}`;
        if (nextPageToken) {
          url += `&pageToken=${nextPageToken}`;
        }

        const headers = new Headers();
        headers.append("Authorization", `Bearer ${this.accessToken}`);

        const response = await Utils.fetchWithRetry(url, { headers });
        const data = await response.json();

        const messages = data.messages || [];
        nextPageToken = data.nextPageToken;

        const messageIds = messages.map((message) => message.id);
        allMessageIdsForSender.push(...messageIds);
      } catch (error) {
        console.error(error);
        break;
      }
    } while (nextPageToken);

    return allMessageIdsForSender;
  }

  async getMessageIdsFromSendersV2(senderEmails, dateFrom) {
    const allPromises = senderEmails.map((senderEmail) =>
      this._getMessageIdsForOneSender(senderEmail, dateFrom)
    );
    const allResults = await Promise.all(allPromises);
    return allResults.flat();
  }

  async getMessageIdsFromSendersV3(senderEmails, dateFrom) {
    const allPromises = senderEmails.map((senderEmail) =>
      this._getMessageIdsForOneSender(senderEmail, dateFrom)
    );
    const allSettledResults = await Promise.allSettled(allPromises);

    // Filter out the fulfilled promises and extract their values
    const fulfilledResults = allSettledResults
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);

    return fulfilledResults.flat();
  }

  async getMessageIdsFromSendersV0(senderEmails, filters) {
    const allPromises = senderEmails.map((senderEmail) =>
      this._getMessageIdsForOneSenderV0(senderEmail, filters)
    );
    const allSettledResults = await Promise.allSettled(allPromises);

    // Filter out the fulfilled promises and extract their values
    const fulfilledResults = allSettledResults
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);

    return fulfilledResults.flat();
  }

  async getMessagesFromSenders(senderEmails, dateFrom) {
    const allMessageIds = await this.getMessageIdsFromSenders(
      senderEmails,
      dateFrom
    );

    const messages = await this._batchGetMessages(allMessageIds);
    return messages;
  }

  async getUserProfile() {
    const response = await Utils.fetchWithRetry(
      `${BASE_URL}/v1/users/${this.uniqueId}/profile`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      }
    );

    const data = await response.json();
    return data;
  }

  async getFilters() {
    const response = await Utils.fetchWithRetry(
      `${BASE_URL}/v1/users/${this.uniqueId}/settings/filters`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      }
    );

    try {
      const data = await response.json();
      return data.filter;
    } catch (error) {
      return [];
    }
  }

  async createFilter(filter) {
    const response = await Utils.fetchWithRetry(
      `${BASE_URL}/v1/users/${this.uniqueId}/settings/filters`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filter),
      }
    );
    const data = await response.json();
    return data;
  }

  async deleteFilter(filterId) {
    const response = await Utils.fetchWithRetry(
      `${BASE_URL}/v1/users/${this.uniqueId}/settings/filters/${filterId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${this.accessToken}` },
      }
    );
    return response.status;
  }

  async batchDeleteMessages(messageIds) {
    const chunks = Utils.splitArrayIntoChunks(messageIds, 1000);

    for await (let chunk of chunks) {
      try {
        await this._deleteMessagesV2(chunk);
      } catch (error) {
        console.error("Error occured while processing chunk: ", error);
      }
    }
  }

  async _batchGetMessages(messageIds) {
    const chunks = Utils.splitArrayIntoChunks(messageIds, 100);
    const result = [];

    for await (let chunk of chunks) {
      try {
        const messageDetails = await this._getMessageDetails(chunk);
        result.push(...messageDetails);
      } catch (error) {
        console.error("Error occured while processing chunk: ", error);
      }
    }

    return result;
  }

  async _getMessageDetails(messageIds) {
    const boundary = "batch_boundary_" + new Date().getTime();
    const url = "https://www.googleapis.com/batch/gmail/v1";

    // Build the batch request body
    let requestBody = "";
    messageIds.forEach((messageId) => {
      requestBody += `--${boundary}\r\n`;
      requestBody += "Content-Type: application/http\r\n";
      requestBody += "Content-Transfer-Encoding: binary\r\n";
      requestBody += "\r\n";
      requestBody += `GET /gmail/v1/users/me/messages/${messageId}\r\n`;
      requestBody += "\r\n";
    });
    requestBody += `--${boundary}--`;

    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": `multipart/mixed; boundary=${boundary}`,
      },
      body: requestBody,
    };

    // const response = await fetch(url, options);
    const response = await Utils.fetchWithRetry(url, options);
    if (!response.ok) {
      throw new Error("Error sending batch request");
    }

    const contentType = response.headers.get("content-type");
    const responseData = await response.text();
    const responseBoundary = contentType.split(";")[1].trim().split("=")[1];

    const responseParts = responseData
      .split(`--${responseBoundary}`)
      .filter((part) => part.trim() !== "" && part.trim() !== "--");
    return responseParts.map((responsePart) => {
      const responseBody = responsePart.split("\r\n\r\n")[2];

      return JSON.parse(responseBody);
    });
  }

  async _deleteMessages(messageIds) {
    const boundary = "batch_boundary_" + new Date().getTime();
    const url = "https://www.googleapis.com/batch/gmail/v1";

    // Build the batch request body
    let requestBody = "";
    messageIds.forEach((messageId) => {
      requestBody += `--${boundary}\r\n`;
      requestBody += "Content-Type: application/http\r\n";
      requestBody += "Content-Transfer-Encoding: binary\r\n";
      requestBody += "\r\n";
      requestBody += `POST /gmail/v1/users/me/messages/${messageId}/trash\r\n`;
      requestBody += "\r\n";
    });
    requestBody += `--${boundary}--`;

    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": `multipart/mixed; boundary=${boundary}`,
      },
      body: requestBody,
    };

    const response = await Utils.fetchWithRetry(url, options);
    if (!response.ok) {
      throw new Error("Error sending batch request");
    }
  }

  async _deleteMessagesV2(messageIds) {
    const url = `https://www.googleapis.com/gmail/v1/users/${this.uniqueId}/messages/batchModify`;

    const requestBody = {
      ids: messageIds,
      addLabelIds: ["TRASH"],
    };

    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    };

    const response = await Utils.fetchWithRetry(url, options);
    if (!response.ok) {
      throw new Error("Error sending batch request");
    }
  }

  async getExactCountForSenders(senderEmails) {
    const promises = senderEmails.map((email) =>
      this.getExactCountForSender(email)
    );
    const countsArray = await Promise.all(promises);

    let counts = {};
    for (let i = 0; i < senderEmails.length; i++) {
      counts[senderEmails[i]] = countsArray[i];
    }

    return counts;
  }

  async getExactCountForSendersV2(senderEmails) {
    const promises = senderEmails.map((email) =>
      this.getExactCountForSender(email)
    );
    const countsArray = await Promise.allSettled(promises);

    let counts = {};
    for (let i = 0; i < senderEmails.length; i++) {
      if (countsArray[i].status === "fulfilled") {
        counts[senderEmails[i]] = countsArray[i].value;
      } else {
        console.error(
          `Failed to get count for ${senderEmails[i]}: ${countsArray[i].reason}`
        );
      }
    }

    return counts;
  }

  async getExactCountForSender(senderEmail) {
    let count = 0;
    let nextPageToken;

    do {
      const response = await this.fetchEmailsForSender(
        senderEmail,
        nextPageToken
      );
      count += response.messages ? response.messages.length : 0;
      nextPageToken = response.nextPageToken;
    } while (nextPageToken);

    return count;
  }

  async fetchEmailsForSender(senderEmail, pageToken) {
    const url = `https://www.googleapis.com/gmail/v1/users/me/messages?q=from:${encodeURIComponent(
      senderEmail
    )}&maxResults=500${pageToken ? `&pageToken=${pageToken}` : ""}`;

    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    };

    const response = await Utils.fetchWithRetry(url, options);
    if (!response.ok) {
      throw new Error(`Error fetching emails for sender: ${senderEmail}`);
    }

    return await response.json();
  }

  async _deleteEmailsForSender(senderEmail, filters) {
    let nextPageToken = null;
    let totalDeleted = 0;
    let messageBuffer = [];
    let quotaUsed = 0;

    do {
      try {
        let query = `from:${senderEmail}`;
        if (filters.excludeImportantEmails) query += ` -is:important`;
        if (filters.excludeStarredEmails) query += ` -is:starred`;

        let url = `${BASE_URL}/v1/users/${
          this.uniqueId
        }/messages?q=${encodeURIComponent(query)}&maxResults=500`;
        if (nextPageToken) url += `&pageToken=${nextPageToken}`;

        const headers = new Headers();
        headers.append("Authorization", `Bearer ${this.accessToken}`);

        const response = await Utils.fetchWithRetry(url, { headers });
        const data = await response.json();

        const messages = data.messages || [];
        nextPageToken = data.nextPageToken;

        const messageIds = messages.map((message) => message.id);
        messageBuffer.push(...messageIds);

        quotaUsed += 5; // messages.list = 5 quota units per request

        if (messageBuffer.length >= 5000) {
          await this.batchDeleteMessages(messageBuffer);
          totalDeleted += messageBuffer.length;
          messageBuffer = [];
          quotaUsed += 50; // messages.batchDelete = 50 quota units per request
        }
      } catch (error) {
        console.error(error);
        break;
      }
    } while (nextPageToken);

    if (messageBuffer.length > 0) {
      await this.batchDeleteMessages(messageBuffer);
      totalDeleted += messageBuffer.length;
      quotaUsed += 50;
    }

    return { deletedCount: totalDeleted, quotaUsedBySender: quotaUsed };
  }

  async _deleteEmailsForSenderV2(
    senderEmail,
    filters,
    onProgress = async () => {}
  ) {
    let nextPageToken = null;
    let totalDeleted = 0;
    let messageBuffer = [];

    do {
      try {
        let query = `from:${senderEmail}`;
        if (filters.excludeImportantEmails) query += ` -is:important`;
        if (filters.excludeStarredEmails) query += ` -is:starred`;

        let url =
          `${BASE_URL}/v1/users/${this.uniqueId}/messages` +
          `?q=${encodeURIComponent(query)}&maxResults=500`;
        if (nextPageToken) url += `&pageToken=${nextPageToken}`;

        const headers = new Headers();
        headers.append("Authorization", `Bearer ${this.accessToken}`);

        const resp = await Utils.fetchWithRetry(url, { headers });
        const data = await resp.json();

        const messages = data.messages || [];
        nextPageToken = data.nextPageToken || null;
        messageBuffer.push(...messages.map((m) => m.id));

        await onProgress(0, 5);
      } catch (err) {
        console.error("Fetch page error:", err);
        break;
      }

      if (messageBuffer.length >= 5000) {
        const batchSize = messageBuffer.length;
        try {
          await this.batchDeleteMessages(messageBuffer);
          totalDeleted += batchSize;
          await onProgress(batchSize, 50);
        } catch (err) {
          console.error("Batch delete error:", err);
          break;
        }
        messageBuffer = [];
      }
    } while (nextPageToken);

    if (messageBuffer.length > 0) {
      const batchSize = messageBuffer.length;
      try {
        await this.batchDeleteMessages(messageBuffer);
        totalDeleted += batchSize;
        await onProgress(batchSize, 50);
      } catch (err) {
        console.error("Final batch delete error:", err);
      }
    }

    return totalDeleted;
  }
}
