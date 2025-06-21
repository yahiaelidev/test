document.addEventListener("DOMContentLoaded", function () {
  const LOCALE = {
    ifYouNeedHelpPls: chrome.i18n.getMessage("ifYouNeedHelpPls"),
    getStartedInASnap: chrome.i18n.getMessage("getStartedInASnap"),
    contactSupport: chrome.i18n.getMessage("contactSupport"),
    ifYouLovedUsingThisTool: chrome.i18n.getMessage("ifYouLovedUsingThisTool"),
    openGmail: chrome.i18n.getMessage("openGmail"),
    clickOnThe: chrome.i18n.getMessage("clickOnThe"),
    inGmailLookFor: chrome.i18n.getMessage("inGmailLookFor"),
    headOverToThe: chrome.i18n.getMessage("headOverToThe"),
    youWantToTidyUpWith: chrome.i18n.getMessage("youWantToTidyUpWith"),
    atTheTopRight: chrome.i18n.getMessage("atTheTopRight"),
    toBeginOrganizing: chrome.i18n.getMessage("toBeginOrganizing"),
    retrieveItHere: chrome.i18n.getMessage("retrieveItHere"),
    pleaseLeaveAReview: chrome.i18n.getMessage("pleaseLeaveAReview"),
    gmailAccount: chrome.i18n.getMessage("gmailAccount"),
    icon: chrome.i18n.getMessage("icon"),
  };

  const openGmail = document.getElementById("open-gmail");
  openGmail.innerHTML = `${LOCALE.openGmail}`;

  const getStarted = document.getElementById("get-started");
  getStarted.innerHTML = `${LOCALE.getStartedInASnap} &#128171;`;

  const step1 = document.getElementById("step-1");
  step1.innerHTML = `${LOCALE.headOverToThe} <strong>${LOCALE.gmailAccount}</strong> ${LOCALE.youWantToTidyUpWith} InboxPurge`;

  const step2 = document.getElementById("step-2");
  step2.innerHTML = `${LOCALE.inGmailLookFor} <strong>InboxPurge ${LOCALE.icon}</strong> ${LOCALE.atTheTopRight}`;

  const step3 = document.getElementById("step-3");
  step3.innerHTML = `${LOCALE.clickOnThe} <strong>InboxPurge ${LOCALE.icon}</strong> ${LOCALE.toBeginOrganizing}`;

  const needHelp = document.getElementById("need-help");
  needHelp.innerHTML = `${LOCALE.ifYouNeedHelpPls} <a href="http://inboxpurge.com/help" target="_blank"
  >${LOCALE.contactSupport}</a>`;

  const pleaseReview = document.getElementById("please-review");
  pleaseReview.innerHTML = `${LOCALE.ifYouLovedUsingThisTool}, <a href="https://chrome.google.com/webstore/detail/mogabgmejhmicinppdfeoaokolphbgcd/reviews" target="_blank">${LOCALE.pleaseLeaveAReview}</a> <span style="color: red;">&#10084;</span>`;
});
