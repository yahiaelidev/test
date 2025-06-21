let EXTENSION_VALIDATION_ERROR = false;

class Utils {
  static waitForElm(selector) {
    return new Promise((resolve) => {
      if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver((mutations) => {
        if (document.querySelector(selector)) {
          resolve(document.querySelector(selector));
          observer.disconnect();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  }

  static addStylesheet(fileName) {
    const head = document.head;
    const link = document.createElement("link");

    link.rel = "stylesheet";
    link.href = fileName;

    head.appendChild(link);
  }

  static switchViewTo(node) {
    const appRoot = document.querySelector("div.ext__sidebar-root-container");
    if (appRoot) {
      // remove current view
      appRoot.removeChild(appRoot.firstChild);
      // append new view
      appRoot.appendChild(node);
    }
  }

  static triggerModal(modalContent) {
    const modal = document.querySelector(".ext__sidebar-global-modal");
    // TEST THIS
    if (modal && modalContent) {
      modal.classList.add("display-modal");

      modalContent.classList.add("ext__sidebar-global-modal-content");

      modal.appendChild(modalContent);
    }
  }

  static closeModal() {
    const globalModal = document.querySelector(".ext__sidebar-global-modal");
    if (globalModal) {
      globalModal.classList.remove("display-modal");
      if (globalModal.firstChild) {
        globalModal.removeChild(globalModal.firstChild);
      }
    }
  }

  static launchGlobalLoadingModal(loadingText) {
    const modal = document.querySelector(".ext__sidebar-global-loading-modal");
    modal.classList.add("display-loading-modal");

    const loader = document.createElement("div");
    loader.classList.add("ext__sidebar-global-modal-content", "lds-hourglass");

    modal.appendChild(loader);

    if (loadingText) {
      const loadingTextDiv = document.createElement("div");
      loadingTextDiv.classList.add("ext__sidebar-loading-text");
      loadingTextDiv.style.paddingTop = "10px";
      loadingTextDiv.style.color = "white";
      loadingTextDiv.textContent = loadingText;
      modal.appendChild(loadingTextDiv);
    }
  }

  static removeLoaderAndSwitch(viewAfterLoader) {
    Utils.removeLoader();
    Utils.switchViewTo(viewAfterLoader);
  }

  static removeLoader() {
    const modal = document.querySelector(".ext__sidebar-global-loading-modal");
    if (modal) {
      modal.classList.remove("display-loading-modal");

      const loader = document.querySelector(".lds-hourglass");
      if (loader) {
        modal.removeChild(loader);
      }

      const loadingText = document.querySelector(".ext__sidebar-loading-text");
      if (loadingText) {
        modal.removeChild(loadingText);
      }
    }
  }

  static async sendMessageAsync(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  }

  static async getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  }

  static closeModalAndOpen(url) {
    Utils.closeModal();
    window.open(url, "_blank", "noopener,noreferrer");
  }

  static shortenText(text) {
    if (text.length >= 27) {
      return text.substring(0, 24) + "...";
    }

    return text;
  }

  static debounce(func, delay) {
    let debounceTimer;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
  }

  static getEmails(senderEmail) {
    const searchQuery = `from:(${senderEmail})`;
    window.location.hash = `#search/${encodeURIComponent(searchQuery)}`;
  }

  // TODO: Change color to blue
  static refreshEmail() {
    const refreshBtns = document.querySelectorAll(
      "div.T-I.J-J5-Ji.nu.T-I-ax7.L3"
    );

    if (refreshBtns) {
      Array.from(refreshBtns).forEach((refreshBtn) => {
        if (refreshBtn) {
          let customTooltip = refreshBtn.querySelector(
            ".gmail-refresh-tooltip"
          );
          if (!customTooltip) {
            customTooltip = document.createElement("span");
            customTooltip.classList.add("gmail-refresh-tooltip");
            customTooltip.innerHTML = `${LOCALE.refreshToSeeChanges}`;
            refreshBtn.appendChild(customTooltip);
          }

          customTooltip.classList.add("show-refresh-tooltip");

          const hideTooltip = (e) => {
            if (customTooltip.classList.contains("show-refresh-tooltip")) {
              customTooltip.classList.remove("show-refresh-tooltip");
              document.body.removeEventListener("click", hideTooltip);
            }
          };

          refreshBtn.addEventListener("mouseover", hideTooltip);
          document.body.addEventListener("click", hideTooltip);
          // Hide after 8 seconds
          setTimeout(hideTooltip, 8000);
        }
      });
    }
  }

  static showRefreshToast(deletionCountIncrement) {
    const toast = document.createElement("div");
    toast.classList.add("refresh-toast");

    if (deletionCountIncrement) {
      const countStr = deletionCountIncrement.toLocaleString();
      toast.innerText = `⚡ ${LOCALE.allDone} ${countStr} ${LOCALE.emailsDeleted}. ${LOCALE.refreshToSeeChanges}.`;
    } else {
      toast.innerText = `⚡ ${LOCALE.refreshBrowserTab}`;
    }

    toast.style.position = "fixed";
    toast.style.top = "20px";
    toast.style.left = "20px";
    toast.style.backgroundColor = "#333";
    toast.style.color = "#fff";
    toast.style.padding = "12px 16px";
    toast.style.borderRadius = "5px";
    toast.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
    toast.style.fontSize = "14px";
    toast.style.zIndex = "1000";
    toast.style.display = "flex";
    toast.style.alignItems = "center";
    toast.style.gap = "10px";
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s ease-in-out";

    const refreshButton = document.createElement("button");
    refreshButton.innerText = `${LOCALE.refresh}`;
    refreshButton.style.backgroundColor = "#fff";
    refreshButton.style.color = "#333";
    refreshButton.style.border = "1px solid #ccc";
    refreshButton.style.padding = "6px 12px";
    refreshButton.style.cursor = "pointer";
    refreshButton.style.borderRadius = "3px";
    refreshButton.style.fontSize = "14px";

    refreshButton.addEventListener("click", () => {
      location.reload();
    });

    toast.appendChild(refreshButton);

    // close native toast
    closeNativeToast();
    // Append toast to body
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "1";
    }, 100);

    // Hide toast after 8 seconds
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => {
        toast.remove();
      }, 300); // Fade-out time
    }, 8000);
  }

  static pointToInboxPurgeIcon() {
    const inboxPurgeButton = document.querySelector(
      ".ext__gmail-navbar-button"
    );

    if (inboxPurgeButton) {
      let customTooltip = inboxPurgeButton.querySelector(
        ".inbox-purge-tooltip"
      );
      if (!customTooltip) {
        customTooltip = document.createElement("span");
        customTooltip.classList.add("inbox-purge-tooltip");
        customTooltip.innerHTML = `${
          LOCALE.clickTheIconToStartClean
        } <b>${Utils.truncateEmail(UserService.getCurrentEmail(), 35)}</b> ${
          LOCALE.withInboxPurge
        }`;
        inboxPurgeButton.appendChild(customTooltip);
      }

      customTooltip.classList.add("show-refresh-tooltip");

      const hideTooltip = (e) => {
        if (customTooltip.classList.contains("show-refresh-tooltip")) {
          customTooltip.classList.remove("show-refresh-tooltip");
          document.body.removeEventListener("click", hideTooltip);
        }
      };

      inboxPurgeButton.addEventListener("mouseover", hideTooltip);
      document.body.addEventListener("click", hideTooltip);
      // Hide after 10 seconds
      setTimeout(hideTooltip, 10000);
    }
  }

  static truncateEmail(email, maxLength) {
    if (email.length > maxLength) {
      return email.substring(0, maxLength - 3) + "...";
    }
    return email;
  }

  static getFirstLetter(str) {
    const match = str.match(/[a-zA-Z]/);
    return match ? match[0] : "N";
  }

  static setToolTip(element, tooltipText) {
    element.classList.add("inbox-purge-tool");
    element.setAttribute("data-tip", tooltipText);
  }

  static handleError(customMessage, error) {
    if (error && error.message) {
      if (error.message.includes("context invalidated")) {
        Utils.handleExtensionInValidationError();
      } else {
        // Consider sending these errors to sentry
        console.error(customMessage, error.message);
      }
    }
  }

  static handleExtensionInValidationError() {
    EXTENSION_VALIDATION_ERROR = true;
    // Fail safely for now
    const globalModal = document.querySelector(
      ".ext__sidebar-global-modal.display-modal"
    );
    // TODO: Should maybe also handle digest modal
    if (!globalModal) {
      Utils.removeLoader();
      DigestView.closeDigestModal();
      SubscriptionView.openGenericModal(
        `${LOCALE.pleaseRefreshTab}`,
        "175px",
        `${LOCALE.refresh}`,
        () => {
          location.reload();
        }
      );
    }
  }

  static triggerProductTourV2(startSlide = 1) {
    GmailNativeView.closeNativeModal();
    // let slideIndex = startSlide;

    const menu = document.createElement("div");
    menu.style.width = "600px";
    menu.classList.add("ext__sidebar-root-generic-modal");

    const header = document.createElement("div");
    header.style.fontSize = "20px";
    header.classList.add("ext__sidebar-root-generic-modal-header");
    header.textContent = `${LOCALE.welcomeTo} InboxPurge! 🎉`;

    const bodyDiv = document.createElement("div");
    bodyDiv.style.textAlign = "center";
    bodyDiv.classList.add("ext__sidebar-root-generic-modal-body");

    const slideLabels = [
      {
        description: `${LOCALE.productTourSlide1}`,
        gif: `${BASE_URL}/images/tour/slide-1.gif`,
      },
      {
        description: `${LOCALE.productTourSlide2}`,
        gif: `${BASE_URL}/images/tour/slide-2.gif`,
      },
      {
        description: `${LOCALE.productTourSlide3}`,
        gif: `${BASE_URL}/images/tour/slide-3.gif`,
      },
      {
        description: `${LOCALE.productTourSlide4}`,
        gif: `${BASE_URL}/images/tour/slide-4.gif`,
      },
      {
        description: `${LOCALE.productTourSlide5}`,
        gif: `${BASE_URL}/images/tour/slide-5.gif`,
      },
      {
        description: `${LOCALE.productTourSlide6}`,
        gif: `${BASE_URL}/images/tour/slide-6.gif`,
      },
    ];

    const dots = document.createElement("div");
    dots.style.textAlign = "center";

    slideLabels.forEach((slideLabel, index) => {
      const slideShow = document.createElement("div");
      slideShow.classList.add("mySlides", "fade");

      const description = document.createElement("div");
      description.classList.add("tour-description");
      description.innerHTML = `<span>${slideLabel.description}</span>`;

      const productGif = document.createElement("img");
      productGif.style.width = "100%";
      productGif.src = slideLabel.gif;

      slideShow.appendChild(productGif);
      slideShow.appendChild(description);

      bodyDiv.appendChild(slideShow);

      const span = document.createElement("span");
      span.classList.add("dot");
      span.onclick = () => {
        currentSlide(index + 1);
      };

      dots.appendChild(span);
    });

    bodyDiv.appendChild(dots);

    const count = document.createElement("div");
    count.id = "slide-count";
    count.style.textAlign = "center";
    // count.innerHTML = `1/${slideLabels.length}`;
    count.innerHTML = `${startSlide}/${slideLabels.length}`;

    bodyDiv.appendChild(count);

    // let slideIndex = 1;
    let slideIndex = startSlide;

    function plusSlides(n) {
      showSlides((slideIndex += n));
    }

    function currentSlide(n) {
      showSlides((slideIndex = n));
    }

    function showSlides(n) {
      let i;
      let slides = document.getElementsByClassName("mySlides");
      let dots = document.getElementsByClassName("dot");
      const count = document.getElementById("slide-count");
      const nextBtn = document.getElementById("next-button");
      const backBtn = document.getElementById("back-button");
      if (n > slides.length) {
        slideIndex = 1;
      }
      if (n < 1) {
        slideIndex = slides.length;
      }
      for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
      }
      for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
      }
      slides[slideIndex - 1].style.display = "block";
      dots[slideIndex - 1].className += " active";

      count.innerHTML = `${slideIndex}/${slideLabels.length}`;

      if (n === slides.length) {
        // last slide
        nextBtn.textContent = `${LOCALE.beginCleaning}`;
        nextBtn.onclick = (event) => {
          event.stopImmediatePropagation();
          GmailNativeView.closeNativeModal();
        };
        backBtn.classList.remove("disable-btn");
        backBtn.onclick = (event) => {
          event.stopImmediatePropagation();
          plusSlides(-1);
        };
      } else if (n === 1) {
        nextBtn.onclick = (event) => {
          event.stopImmediatePropagation();
          plusSlides(1);
        };

        backBtn.classList.add("disable-btn");
        backBtn.onclick = (event) => {
          event.stopImmediatePropagation();
        };
      } else {
        nextBtn.textContent = `${LOCALE.next}`;
        nextBtn.onclick = (event) => {
          event.stopImmediatePropagation();
          plusSlides(1);
        };

        backBtn.classList.remove("disable-btn");
        backBtn.onclick = (event) => {
          event.stopImmediatePropagation();
          plusSlides(-1);
        };
      }
    }

    const buttonDiv = document.createElement("div");
    buttonDiv.classList.add("ext__sidebar-root-sort-modal-btn");
    buttonDiv.style.gap = "20px";

    const backBtn = document.createElement("a");
    backBtn.id = "back-button";
    backBtn.style.cursor = "pointer";
    backBtn.classList.add("button", "secondary-btn");
    backBtn.textContent = `${LOCALE.back}`;

    backBtn.onclick = () => {
      plusSlides(-1);
    };

    const nextBtn = document.createElement("a");
    nextBtn.id = "next-button";
    nextBtn.style.cursor = "pointer";
    nextBtn.classList.add("button");
    nextBtn.textContent = "Next";

    nextBtn.onclick = () => {
      plusSlides(1);
    };

    // buttonAnchor.addEventListener("click", GmailNativeView.closeNativeModal);

    buttonDiv.appendChild(backBtn);
    buttonDiv.appendChild(nextBtn);

    menu.appendChild(header);
    menu.appendChild(bodyDiv);
    menu.appendChild(buttonDiv);

    GmailNativeView.openNativeModal(menu);
    showSlides(slideIndex);
  }

  static triggerProductTourV3() {
    GmailNativeView.closeNativeModal();

    const slideLabels = [
      {
        description: `${LOCALE.productTourSlide1}`,
        gif: `${BASE_URL}/images/tour/slide-1.gif`,
      },
      {
        description: `${LOCALE.productTourSlide2}`,
        gif: `${BASE_URL}/images/tour/slide-2.gif`,
      },
      {
        description: `${LOCALE.productTourSlide3}`,
        gif: `${BASE_URL}/images/tour/slide-3.gif`,
      },
      {
        description: `${LOCALE.productTourSlide4}`,
        gif: `${BASE_URL}/images/tour/slide-4.gif`,
      },
      {
        description: `${LOCALE.productTourSlide5}`,
        gif: `${BASE_URL}/images/tour/slide-5.gif`,
      },
      {
        description: `${LOCALE.productTourSlide6}`,
        gif: `${BASE_URL}/images/tour/slide-6.gif`,
      },
    ];

    const menuHtml = `
    <div class="ext__sidebar-root-generic-modal">
      <div class="ext__sidebar-root-generic-modal-header" style="font-size: 20px;">Welcome to InboxPurge! 🎉</div>
      <div class="ext__sidebar-root-generic-modal-body" style="text-align: center;">
        ${slideLabels
          .map(
            (slide, index) =>
              `<div class="mySlides fade" style="${
                index === 0 ? "" : "display: none;"
              }">
            <img src="${slide.gif}" style="width: 100%;">
            <div class="tour-description"><span>${
              slide.description
            }</span></div>
          </div>`
          )
          .join("")}
        <div style="text-align: center;">
          ${slideLabels
            .map(
              (_, index) =>
                `<span class="dot" data-slide="${index + 1}"></span>`
            )
            .join("")}
        </div>
        <div id="slide-count" style="text-align: center;">1/${
          slideLabels.length
        }</div>
      </div>
      <div class="ext__sidebar-root-sort-modal-btn" style="gap: 20px;">
        <a id="back-button" class="button secondary-btn" style="cursor: pointer;">${
          LOCALE.back
        }</a>
        <a id="next-button" class="button" style="cursor: pointer;">Next</a>
      </div>
    </div>`;

    const menu = document.createElement("div");
    menu.innerHTML = menuHtml;
    GmailNativeView.openNativeModal(menu);

    const slides = menu.querySelectorAll(".mySlides");
    const dots = menu.querySelectorAll(".dot");
    let slideIndex = 1;

    menu
      .querySelector(".ext__sidebar-root-sort-modal-btn")
      .addEventListener("click", (event) => {
        if (
          event.target.id === "next-button" ||
          event.target.id === "back-button"
        ) {
          const increment = event.target.id === "next-button" ? 1 : -1;
          showSlides((slideIndex += increment));
        }
      });

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        showSlides((slideIndex = parseInt(dot.getAttribute("data-slide"))));
      });
    });

    function showSlides(n) {
      if (n > slides.length) slideIndex = 1;
      if (n < 1) slideIndex = slides.length;
      slides.forEach((slide, i) => {
        slide.style.display = i + 1 === slideIndex ? "block" : "none";
      });
      dots.forEach((dot, i) => {
        dot.className = i + 1 === slideIndex ? "dot active" : "dot";
      });
      document.getElementById(
        "slide-count"
      ).textContent = `${slideIndex}/${slideLabels.length}`;
    }
  }

  static formatNumber(number) {
    return new Intl.NumberFormat("en", {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1,
    }).format(number);
  }

  // Make sure we are not triggering this multiple times in the same range
  static triggerMilestoneCelebration(userStats) {
    if (!userStats || !userStats.triggerMilestoneCelebration) {
      return;
    }

    let congratulationsHtml = `${LOCALE.milestoneMessage1}`;

    switch (userStats.milestoneTier) {
      case 0:
        // Do nothing - Would not get here anyways
        break;
      case 1:
        // Between 10 and 49 unsubscribes;
        congratulationsHtml = `${LOCALE.milestoneMessage1}`;
        break;
      case 2:
        // Between 50 and 99 unsubscribes;
        congratulationsHtml = `${LOCALE.milestoneMessage2}`;
        break;
      case 3:
        // Between 100 and 249 unsubscribes;
        congratulationsHtml = `${LOCALE.milestoneMessage3}`;
        break;
      case 4:
        // Between 250 and 499 unsubscribes;
        congratulationsHtml = `${LOCALE.milestoneMessage4}`;
        break;
      case 5:
        // Between 500 and 1000 unsubscribes;
        congratulationsHtml = `${LOCALE.milestoneMessage5}`;
        break;
      default:
        // 1000 and above
        congratulationsHtml = `${LOCALE.milestoneMessageX}`;
        break;
    }

    const menu = document.createElement("div");
    menu.style.width = "450px";
    menu.classList.add("ext__sidebar-root-generic-modal");

    const header = document.createElement("div");
    header.style.fontSize = "20px";
    header.classList.add("ext__sidebar-root-generic-modal-header");
    header.textContent = `🎉 ${LOCALE.milestoneAchieved} 🎉`;

    const bodyDiv = document.createElement("div");
    bodyDiv.style.textAlign = "center";
    bodyDiv.classList.add("ext__sidebar-root-generic-modal-body");

    const metrics = document.createElement("div");
    metrics.style.display = "flex";
    metrics.style.justifyContent = "space-around";
    metrics.style.margin = "20px 0";

    metrics.innerHTML = `<div class="ext__metric">
            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="none" stroke-width="1.5" viewBox="0 0 24 24" color="currentColor" style="
    color: #5e5df0;
">
              <path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M7.143 16.995c-.393 0-.775-.043-1.143-.123-2.29-.506-4-2.496-4-4.874 0-2.714 2.226-4.923 5-4.996M13.318 9.634A5.517 5.517 0 0 0 11 7.5"></path>
              <path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M16.857 7c.393 0 .775.043 1.143.124 2.29.505 4 2.495 4 4.874 0 2.76-2.302 4.997-5.143 4.997h-1.714c-2.826 0-5.143-2.506-5.143-4.997 0 0 0-.998.5-1.498M3 3l18 18"></path>
            </svg>
            <div class="ext__metric-value">${Utils.formatNumber(
              userStats.unsubscriptionCount || 0
            )}</div>
    <div class="ext__metric-label">${LOCALE.unsubscribes}</div>
          </div > <div class="ext__metric">
  <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="none" stroke-width="1.5" viewBox="0 0 24 24" color="currentColor" style="
    color: #F36360;
">
    <path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="m20 9-1.995 11.346A2 2 0 0 1 16.035 22h-8.07a2 2 0 0 1-1.97-1.654L4 9M21 6h-5.625M3 6h5.625m0 0V4a2 2 0 0 1 2-2h2.75a2 2 0 0 1 2 2v2m-6.75 0h6.75"></path>
  </svg>
  <div class="ext__metric-value">${Utils.formatNumber(
    userStats.deletionCount || 0
  )}</div>
  <div class="ext__metric-label">${LOCALE.emailsDeleted}</div>
</div>`;

    const spanText = document.createElement("span");
    spanText.style.display = "flex";
    spanText.style.flexDirection = "column";
    spanText.style.gap = "10px";
    spanText.style.fontSize = "14px";
    spanText.innerHTML = congratulationsHtml;

    // const anchor = document.createElement("a");
    // anchor.style.color = "blue";
    // anchor.style.cursor = "pointer";
    // anchor.style.textDecoration = "underline";
    // anchor.style.textUnderlinePosition = "from-font";
    // anchor.textContent = `Please leave a review ❤️`;
    // anchor.onclick = () => {
    //   _openWriteReviewPage();
    //   GmailNativeView.closeNativeModal();
    // };

    bodyDiv.appendChild(metrics);
    bodyDiv.appendChild(spanText);
    // bodyDiv.appendChild(anchor);

    const buttonDiv = document.createElement("div");
    buttonDiv.style.gap = "20px";
    buttonDiv.classList.add("ext__sidebar-root-sort-modal-btn");

    const buttonAnchor1 = document.createElement("a");
    buttonAnchor1.style.cursor = "pointer";
    buttonAnchor1.classList.add("button");

    buttonAnchor1.textContent = `${LOCALE.leaveAReview} ❤️`;

    // buttonAnchor.addEventListener("click", Utils.closeModal);
    buttonAnchor1.addEventListener("click", () => {
      _openWriteReviewPage();
      GmailNativeView.closeNativeModal();
    });

    const buttonAnchor2 = document.createElement("a");
    buttonAnchor2.style.cursor = "pointer";
    buttonAnchor2.classList.add("button", "secondary-btn");

    buttonAnchor2.textContent = `${LOCALE.maybeLater}`;

    // buttonAnchor.addEventListener("click", Utils.closeModal);
    buttonAnchor2.addEventListener("click", GmailNativeView.closeNativeModal);

    buttonDiv.appendChild(buttonAnchor1);
    buttonDiv.appendChild(buttonAnchor2);

    menu.appendChild(header);
    menu.appendChild(bodyDiv);
    menu.appendChild(buttonDiv);

    startConfetti();

    GmailNativeView.openNativeModal(menu);
    // Utils.triggerModal(menu);
  }

  static decodeBase64Url(encodedData) {
    const base64Data = encodedData.replace(/-/g, "+").replace(/_/g, "/");
    const binaryData = atob(base64Data);
    const decodedData = decodeURIComponent(
      binaryData
        .split("")
        .map((char) => {
          return "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return decodedData;
  }

  static formatDate(date) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  }

  static escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  static generateId() {
    return (
      Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
    ).toUpperCase();
  }

  static isElementVisible(element) {
    if (!element) return false;

    let currentElement = element;
    while (currentElement) {
      const style = window.getComputedStyle(currentElement);
      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        style.opacity === "0"
      ) {
        return false;
      }
      currentElement = currentElement.parentElement;
    }

    return true;
  }

  // TODO: Need to somehow make sure span is not deleted
  static createSpan(html) {
    const span = document.querySelector("span");
    span.style.all = "unset";
    // span.classList.add("inbox-purge-span");
    span.innerHTML = html;

    return span;
  }
}
