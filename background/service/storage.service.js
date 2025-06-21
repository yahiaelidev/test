export class StorageService {
  static save(key, value, type) {
    if (!type) {
      type = "sync";
    }
    return new Promise((resolve, reject) => {
      chrome.storage[type].set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  static saveWithPrefix(prefixTag, uniqueId, value, type) {
    const key = StorageService.getKey(prefixTag, uniqueId);
    return StorageService.save(key, value, type);
  }

  static get(key, type) {
    if (!type) {
      type = "sync";
    }
    return new Promise((resolve, reject) => {
      chrome.storage[type].get([key], (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result[key]);
        }
      });
    });
  }

  static getWithPrefix(prefixTag, uniqueId, type) {
    const key = StorageService.getKey(prefixTag, uniqueId);
    return StorageService.get(key, type);
  }

  static delete(key, type) {
    if (!type) {
      type = "sync";
    }
    return new Promise((resolve, reject) => {
      chrome.storage[type].remove(key, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  static deleteWithPrefix(prefixTag, uniqueId, type) {
    const key = StorageService.getKey(prefixTag, uniqueId);
    return StorageService.delete(key, type);
  }

  static getKey(prefixTag, uniqueId) {
    return prefixTag + "/" + uniqueId;
  }
}

export const prefixTag = {
  CREDENTIALS: "CREDENTIALS",
  BLOCKLIST_KEY: "BLOCKLIST",
  LICENSE_KEY: "LICENSE_KEY",
  SUBSCRIPTIONS: "SUBSCRIPTIONS",
  USER_DETAILS: "USER_DETAILS",
};
