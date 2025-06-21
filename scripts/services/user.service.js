let emailPattern =
  /(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

class UserService {
  static getCurrentEmail() {
    const accountTag = document.querySelector("a.gb_B.gb_Za.gb_0");
    

    if (accountTag) {
      return accountTag.getAttribute("aria-label").match(emailPattern)[0];
    }

    const title = document.querySelector("head > title");
    const matches = title.textContent.match(emailPattern);

    if (matches && matches.length > 0) {
      return matches[0];
    }

    const emailDiv = document.querySelector(
      "div.gb_Bc div:last-child"
    )?.textContent;
    return emailDiv?.match(emailPattern)[0];
  }

  static async isLoggedIn(email) {
    const credentials = await StorageService.getWithPrefix(
      prefixTag.CREDENTIALS_KEY,
      email
    );

    return !!credentials;
  }

  static async isPaidUser() {
    const credentials = await StorageService.getWithPrefix(
      prefixTag.CREDENTIALS_KEY,
      "INBOX_PURGE"
    );

    return !!credentials;
  }

  static async getCurrentUserDetails() {
    const email = UserService.getCurrentEmail();
    const userDetails = await StorageService.getWithPrefix(
      prefixTag.USER_DETAILS,
      email
    );

    return userDetails;
  }

  static async isCurrentEmailLoggedIn() {
    const email = UserService.getCurrentEmail();
    const result = await UserService.isLoggedIn(email);
    if (!result) {
      Utils.switchViewTo(LoginView.render());
    }
    return result;
  }
}
