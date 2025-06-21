const LOCALE = {
  // Extension details
  extName: chrome.i18n.getMessage("extName"),
  extDesc: chrome.i18n.getMessage("extDesc"),

  // Login view
  signInToUse: chrome.i18n.getMessage("signInToUse"),
  plsProvidePermissions: chrome.i18n.getMessage("plsProvidePermissions"),
  whyGivePermissions: chrome.i18n.getMessage("whyGivePermissions"),
  waitingForYouToSignIn: chrome.i18n.getMessage("waitingForYouToSignIn"),

  // Sidebar Menu
  settingsMenuTxt: chrome.i18n.getMessage("settingsMenuTxt"),
  productTourMenuTxt: chrome.i18n.getMessage("productTourMenuTxt"),
  writeReviewsMenuTxt: chrome.i18n.getMessage("writeReviewsMenuTxt"),
  sendFeebackMenuTxt: chrome.i18n.getMessage("sendFeebackMenuTxt"),
  needHelpMenuTxt: chrome.i18n.getMessage("needHelpMenuTxt"),
  signOutMenuTxt: chrome.i18n.getMessage("signOutMenuTxt"),

  // Product Tour
  productTourSlide1: chrome.i18n.getMessage("productTourSlide1"),
  productTourSlide2: chrome.i18n.getMessage("productTourSlide2"),
  productTourSlide3: chrome.i18n.getMessage("productTourSlide3"),
  productTourSlide4: chrome.i18n.getMessage("productTourSlide4"),
  productTourSlide5: chrome.i18n.getMessage("productTourSlide5"),
  productTourSlide6: chrome.i18n.getMessage("productTourSlide6"),
  beginCleaning: chrome.i18n.getMessage("beginCleaning"),
  welcomeTo: chrome.i18n.getMessage("welcomeTo"),
  next: chrome.i18n.getMessage("next"),
  back: chrome.i18n.getMessage("back"),

  // Error handling - Refresh
  pleaseRefreshTab: chrome.i18n.getMessage("pleaseRefreshTab"),
  refresh: chrome.i18n.getMessage("refresh"),

  // Milestone view
  milestoneMessage1: chrome.i18n.getMessage("milestoneMessage1"),
  milestoneMessage2: chrome.i18n.getMessage("milestoneMessage2"),
  milestoneMessage3: chrome.i18n.getMessage("milestoneMessage3"),
  milestoneMessage4: chrome.i18n.getMessage("milestoneMessage4"),
  milestoneMessage5: chrome.i18n.getMessage("milestoneMessage5"),
  milestoneMessageX: chrome.i18n.getMessage("milestoneMessageX"),
  milestoneAchieved: chrome.i18n.getMessage("milestoneAchieved"),
  leaveAReview: chrome.i18n.getMessage("leaveAReview"),
  maybeLater: chrome.i18n.getMessage("maybeLater"),
  unsubscribes: chrome.i18n.getMessage("unsubscribes"),
  emailsDeleted: chrome.i18n.getMessage("emailsDeleted"),

  // Status view
  thankYouForUsingInboxPurge: chrome.i18n.getMessage(
    "thankYouForUsingInboxPurge"
  ),
  manageSubscription: chrome.i18n.getMessage("manageSubscription"),
  enjoyUnlimitedDecluttering: chrome.i18n.getMessage(
    "enjoyUnlimitedDecluttering"
  ),
  manageBilling: chrome.i18n.getMessage("manageBilling"),
  enjoy7Days: chrome.i18n.getMessage("enjoy7Days"),
  purchaseLicense: chrome.i18n.getMessage("purchaseLicense"),
  youHave: chrome.i18n.getMessage("youHave"),
  unsubscribesAndDeletionsLeft: chrome.i18n.getMessage(
    "unsubscribesAndDeletionsLeft"
  ),
  purchaseForUnlimited: chrome.i18n.getMessage("purchaseForUnlimited"),
  youAreOnThe: chrome.i18n.getMessage("youAreOnThe"),
  plan: chrome.i18n.getMessage("plan"),

  // Subscription loading text
  subscriptionLoadingTxt1: chrome.i18n.getMessage("subscriptionLoadingTxt1"),
  subscriptionLoadingTxt2: chrome.i18n.getMessage("subscriptionLoadingTxt2"),
  subscriptionLoadingTxt3: chrome.i18n.getMessage("subscriptionLoadingTxt3"),
  subscriptionLoadingTxt4: chrome.i18n.getMessage("subscriptionLoadingTxt4"),
  subscriptionLoadingTxt5: chrome.i18n.getMessage("subscriptionLoadingTxt5"),
  subscriptionLoadingTxt6: chrome.i18n.getMessage("subscriptionLoadingTxt6"),
  subscriptionLoadingTxt7: chrome.i18n.getMessage("subscriptionLoadingTxt7"),
  subscriptionLoadingTxt8: chrome.i18n.getMessage("subscriptionLoadingTxt8"),
  subscriptionLoadingTxt9: chrome.i18n.getMessage("subscriptionLoadingTxt9"),
  subscriptionLoadingTxt10: chrome.i18n.getMessage("subscriptionLoadingTxt10"),
  subscriptionLoadingTxt11: chrome.i18n.getMessage("subscriptionLoadingTxt11"),

  // Subscription view
  noSubscriptionFound: chrome.i18n.getMessage("noSubscriptionFound"),
  errorFetchingMailingList: chrome.i18n.getMessage("errorFetchingMailingList"),
  searchYourSubscriptions: chrome.i18n.getMessage("searchYourSubscriptions"),
  unsubscribe: chrome.i18n.getMessage("unsubscribe"),
  delete: chrome.i18n.getMessage("delete"),
  unsubscribeConfirmation: chrome.i18n.getMessage("unsubscribeConfirmation"),
  areYouSureYouWantTo: chrome.i18n.getMessage("areYouSureYouWantTo"),
  unsubscribeLowerCase: chrome.i18n.getMessage("unsubscribeLowerCase"),
  mailingList: chrome.i18n.getMessage("mailingList"),
  fromTheSelected: chrome.i18n.getMessage("fromTheSelected"),
  emailsFromSelected: chrome.i18n.getMessage("emailsFromSelected"),
  confirm: chrome.i18n.getMessage("confirm"),
  deleteConfirmation: chrome.i18n.getMessage("deleteConfirmation"),
  deleteLowerCase: chrome.i18n.getMessage("deleteLowerCase"),
  noteThisWillNotUnsubscribe: chrome.i18n.getMessage(
    "noteThisWillNotUnsubscribe"
  ),
  emails: chrome.i18n.getMessage("emails"),
  unsubscribing: chrome.i18n.getMessage("unsubscribing"),
  deleting: chrome.i18n.getMessage("deleting"),
  thisMightTakeSomeTime: chrome.i18n.getMessage("thisMightTakeSomeTime"),
  oops: chrome.i18n.getMessage("oops"),
  goBack: chrome.i18n.getMessage("goBack"),
  youHaveSelectedMoreThan: chrome.i18n.getMessage("youHaveSelectedMoreThan"),
  freeUnsubscribesThisMonth: chrome.i18n.getMessage(
    "freeUnsubscribesThisMonth"
  ),
  toUnsubscribeAndDelete: chrome.i18n.getMessage("toUnsubscribeAndDelete"),
  considerUpgrading: chrome.i18n.getMessage("considerUpgrading"),
  pleaseSelectOneSub: chrome.i18n.getMessage("pleaseSelectOneSub"),
  fromYourSelected: chrome.i18n.getMessage("fromYourSelected"),
  toDelete: chrome.i18n.getMessage("toDelete"),
  freeMailingListDeletes: chrome.i18n.getMessage("freeMailingListDeletes"),
  pleaseSelectOneDelete: chrome.i18n.getMessage("pleaseSelectOneDelete"),
  sort: chrome.i18n.getMessage("sort"),
  rescan: chrome.i18n.getMessage("rescan"),
  loading: chrome.i18n.getMessage("loading"),
  noEmailsRecieved: chrome.i18n.getMessage("noEmailsRecieved"),
  fromHighToLow: chrome.i18n.getMessage("fromHighToLow"),
  fromLowToHigh: chrome.i18n.getMessage("fromLowToHigh"),

  // Components view
  selectAll: chrome.i18n.getMessage("selectAll"),
  deselect: chrome.i18n.getMessage("deselect"),
  selected: chrome.i18n.getMessage("selected"),

  // Blocklist view
  yourBlockListIsEmpty: chrome.i18n.getMessage("yourBlockListIsEmpty"),
  errorFetchingBlockList: chrome.i18n.getMessage("errorFetchingBlockList"),
  searchYourBlockList: chrome.i18n.getMessage("searchYourBlockList"),
  unblock: chrome.i18n.getMessage("unblock"),
  pleaseSelectOneUnblock: chrome.i18n.getMessage("pleaseSelectOneUnblock"),
  unblockConfirmation: chrome.i18n.getMessage("unblockConfirmation"),
  theSelected: chrome.i18n.getMessage("theSelected"),
  unblockLowerCase: chrome.i18n.getMessage("unblockLowerCase"),
  sender: chrome.i18n.getMessage("sender"),
  senders: chrome.i18n.getMessage("senders"),
  unblocking: chrome.i18n.getMessage("unblocking"),

  //Digest view
  forTheBestExperienceExpand: chrome.i18n.getMessage(
    "forTheBestExperienceExpand"
  ),
  somethingWentWrong: chrome.i18n.getMessage("somethingWentWrong"),
  selectADigest: chrome.i18n.getMessage("selectADigest"),
  selectARange: chrome.i18n.getMessage("selectARange"),
  today: chrome.i18n.getMessage("today"),
  last24Hours: chrome.i18n.getMessage("last24Hours"),
  last7Days: chrome.i18n.getMessage("last7Days"),
  last30Days: chrome.i18n.getMessage("last30Days"),
  openInGmail: chrome.i18n.getMessage("openInGmail"),
  expand: chrome.i18n.getMessage("expand"),

  newsletterDigestOnDemand: chrome.i18n.getMessage("newsletterDigestOnDemand"),
  readyForAMorePersonalized: chrome.i18n.getMessage(
    "readyForAMorePersonalized"
  ),
  getALicenseNow: chrome.i18n.getMessage("getALicenseNow"),
  craftedByYou: chrome.i18n.getMessage("craftedByYou"),
  personalizedControl: chrome.i18n.getMessage("personalizedControl"),
  onDemandAccess: chrome.i18n.getMessage("onDemandAccess"),
  groupYourFavNewsletters: chrome.i18n.getMessage("groupYourFavNewsletters"),
  customizeDigest: chrome.i18n.getMessage("customizeDigest"),
  viewTailoredDigest: chrome.i18n.getMessage("viewTailoredDigest"),
  createYourFirstDigest: chrome.i18n.getMessage("createYourFirstDigest"),
  learnMore: chrome.i18n.getMessage("learnMore"),
  createDigest: chrome.i18n.getMessage("createDigest"),
  editDigest: chrome.i18n.getMessage("editDigest"),
  selectFaveNewsletters: chrome.i18n.getMessage("selectFaveNewsletters"),
  search: chrome.i18n.getMessage("search"),
  availableNewsletters: chrome.i18n.getMessage("availableNewsletters"),
  digestName: chrome.i18n.getMessage("digestName"),
  digestNamePlaceholder: chrome.i18n.getMessage("digestNamePlaceholder"),
  yourSelectedNewsletters: chrome.i18n.getMessage("yourSelectedNewsletters"),
  creatingDigest: chrome.i18n.getMessage("creatingDigest"),
  updatingDigest: chrome.i18n.getMessage("updatingDigest"),
  pleaseProvideANameForDigest: chrome.i18n.getMessage(
    "pleaseProvideANameForDigest"
  ),
  pleaseSelectOneNewsletter: chrome.i18n.getMessage(
    "pleaseSelectOneNewsletter"
  ),
  selectedNewslettersDisplayed: chrome.i18n.getMessage(
    "pleaseSelectOneNewsletter"
  ),
  refreshDigest: chrome.i18n.getMessage("refreshDigest"),

  // Gmail native view
  superUnsubscribe: chrome.i18n.getMessage("superUnsubscribe"),
  superDelete: chrome.i18n.getMessage("superDelete"),
  uniqueSenders: chrome.i18n.getMessage("uniqueSenders"),
  deleteAllEmails: chrome.i18n.getMessage("deleteAllEmails"),
  deleteAllEmailsFromSelected: chrome.i18n.getMessage(
    "deleteAllEmailsFromSelected"
  ),
  toDeleteAllEmails: chrome.i18n.getMessage("toDeleteAllEmails"),

  //App view
  atmYouHaveNoSub: chrome.i18n.getMessage("atmYouHaveNoSub"),
  closeSidebar: chrome.i18n.getMessage("closeSidebar"),
  refreshToSeeChanges: chrome.i18n.getMessage("refreshToSeeChanges"),
  sorryYouHaveExhausted: chrome.i18n.getMessage("sorryYouHaveExhausted"),

  success: chrome.i18n.getMessage("success"),
  yourChangesMade: chrome.i18n.getMessage("yourChangesMade"),
  sortBy: chrome.i18n.getMessage("sortBy"),
  noEmailsFoundInRange: chrome.i18n.getMessage("noEmailsFoundInRange"),
  subscriptions: chrome.i18n.getMessage("subscriptions"),
  blockList: chrome.i18n.getMessage("blockList"),
  unlimited: chrome.i18n.getMessage("unlimited"),
  left: chrome.i18n.getMessage("left"),

  // Post-install Login Nudger
  clickTheIconToStartClean: chrome.i18n.getMessage("clickTheIconToStartClean"),
  withInboxPurge: chrome.i18n.getMessage("withInboxPurge"),
  unlockUnlimitedAccessNow: chrome.i18n.getMessage("unlockUnlimitedAccessNow"),

  // Advanced deletion options
  advancedDeletionOption: chrome.i18n.getMessage("advancedDeletionOption"),
  excludeImportantEmails: chrome.i18n.getMessage("excludeImportantEmails"),
  excludeStarredEmails: chrome.i18n.getMessage("excludeStarredEmails"),
  excludeImportantTooltipText: chrome.i18n.getMessage(
    "excludeImportantTooltipText"
  ),
  excludeStarredTooltipText: chrome.i18n.getMessage(
    "excludeStarredTooltipText"
  ),

  // Quick filters
  largeFilesFilterLabel: chrome.i18n.getMessage("largeFilesFilterLabel"),
  oldJunkFilterLabel: chrome.i18n.getMessage("oldJunkFilterLabel"),
  subscriptionsFilterLabel: chrome.i18n.getMessage("subscriptionsFilterLabel"),

  // TooltipText
  superDeleteTooltipText: chrome.i18n.getMessage("superDeleteTooltipText"),
  superUnsubscribeTooltipText: chrome.i18n.getMessage(
    "superUnsubscribeTooltipText"
  ),

  // Refresh browser after deletion
  refreshBrowserTab: chrome.i18n.getMessage("refreshBrowserTab"),
  stillProcessing: chrome.i18n.getMessage("stillProcessing"),

  // No subscription found message
  stillSeeingUnwantedEmails: chrome.i18n.getMessage(
    "stillSeeingUnwantedEmails"
  ),
  learnHow: chrome.i18n.getMessage("learnHow"),

  // Processing toast
  deletingEmails: chrome.i18n.getMessage("deletingEmails"),
  removedSoFar: chrome.i18n.getMessage("removedSoFar"),
  allDone: chrome.i18n.getMessage("allDone"),
};
