class LoginView {
  static render() {
    const rootDiv = document.createElement("div");
    rootDiv.classList.add("ext__sidebar-root-login");

    const logoContainer = LoginView._createLogoContainer();
    const logoHeader = LoginView._createLogoHeader();
    const loginButton = LoginView._createLoginButton();
    const infoDiv = LoginView._createInfoDiv();

    rootDiv.appendChild(logoContainer);
    rootDiv.appendChild(logoHeader);
    rootDiv.appendChild(loginButton);
    rootDiv.appendChild(infoDiv);

    return rootDiv;
  }

  static _createLogoContainer() {
    const container = document.createElement("div");

    const logoImg = document.createElement("img");
    logoImg.src = `${BASE_URL}/images/email.png`;
    logoImg.alt = "inbox-purge-logo";
    logoImg.style.height = "128px";
    logoImg.style.width = "128px";

    container.appendChild(logoImg);

    return container;
  }

  static _createLogoHeader() {
    const header = document.createElement("div");
    header.innerHTML = `${LOCALE.signInToUse} <b style='margin-left: 5px; font-size: 18px'> Inbox<span style='color: #df2a2a'>Purge</span></b>`;
    return header;
  }

  static _createLoginButton() {
    const loginButton = document.createElement("div");
    loginButton.style.display = "flex";
    loginButton.style.flexDirection = "column";
    loginButton.style.gap = "3px";

    const googleLoginIcon = document.createElement("img");
    googleLoginIcon.src = `${BASE_URL}/images/google/btn_google_signin_dark_normal_web@2x.png`;
    googleLoginIcon.alt = "google-login-icon";
    googleLoginIcon.style.height = "50px";
    googleLoginIcon.style.width = "200px";
    googleLoginIcon.style.cursor = "pointer";
    googleLoginIcon.addEventListener("click", LoginView._onLoginClick);
 
    const currentEmail = document.createElement("div");
    currentEmail.style.fontSize = "13px";
    currentEmail.style.color = "#7369ff";
    currentEmail.innerHTML = UserService.getCurrentEmail();

    loginButton.appendChild(googleLoginIcon);
    loginButton.appendChild(currentEmail);

    return loginButton;
  }

  static _createInfoDiv() {
    const infoDiv = document.createElement("div");
    infoDiv.style.color = "#4f3b22";
    infoDiv.style.textAlign = "center";
    infoDiv.style.fontSize = "13px";
    infoDiv.style.display = "flex";
    infoDiv.style.display = "flex";
    infoDiv.style.flexDirection = "column";

    const paragraph = document.createElement("p");
    paragraph.textContent = `${LOCALE.plsProvidePermissions}`;

    const whyAnchor = document.createElement("a");
    whyAnchor.href = "http://inboxpurge.com/permissions";
    whyAnchor.target = "_blank";
    whyAnchor.textContent = `${LOCALE.whyGivePermissions}`;
    whyAnchor.style.cursor = "pointer";

    infoDiv.appendChild(paragraph);
    infoDiv.appendChild(whyAnchor);

    return infoDiv;
  }

  static async _onLoginClick() {
    try {
      const request = {
        email: UserService.getCurrentEmail(),
        screen: { width: window.screen.width, height: window.screen.height },
      };

      Utils.launchGlobalLoadingModal(`${LOCALE.waitingForYouToSignIn}`);

      await MessageService.send("sign-in", request);
    } catch (error) {
      Utils.handleError("Error while trying to login", error);
    }
  }
}
