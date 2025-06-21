class StorageService {
  static save(key, value) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { method: "setStorage", key: key, value: value },
        function (response) {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        }
      );
    });
  }

  static saveWithPrefix(prefixTag, uniqueId, value) {
    const key = StorageService.getKey(prefixTag, uniqueId);
    return StorageService.save(key, value);
  }

  static get(key) {
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage(
          { method: "getStorage", key: key },
          function (response) {
            if (chrome.runtime.lastError) {
              Utils.handleError(
                "Error when getting item from storage",
                chrome.runtime.lastError
              );
            } else {
              resolve(response);
            }
          }
        );
      } catch (error) {
        Utils.handleError("Error when getting item from storage", error);
      }
    });
  }

  static getWithPrefix(prefixTag, uniqueId) {
    const key = StorageService.getKey(prefixTag, uniqueId);
    return StorageService.get(key);
  }

  static delete(key) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { method: "removeStorage", key: key },
        function (response) {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        }
      );
    });
  }

  static deleteWithPrefix(prefixTag, uniqueId) {
    const key = StorageService.getKey(prefixTag, uniqueId);
    return StorageService.delete(key);
  }

  static getKey(prefixTag, uniqueId) {
    return prefixTag + "/" + uniqueId;
  }
}

const prefixTag = {
  CREDENTIALS_KEY: "CREDENTIALS",
  BLOCKLIST_KEY: "BLOCKLIST",
  SUBSCRIPTIONS: "SUBSCRIPTIONS",
  LICENSE_KEY: "LICENSE_KEY",
  USER_DETAILS: "USER_DETAILS",
};
