class MessageService {
  static async send(action, request) {
    try {
      await chrome.runtime.sendMessage({ action, request });
    } catch (error) {
      Utils.handleError("Error trying to send a message", error);
    }
  }
}

chrome.runtime.onMessage.addListener((message) => {
  Sentry.wrap(function () {
    switch (message.action) {
      case "sign-in-success":
        Utils.removeLoaderAndSwitch(MainView.render());
        getUserStats();
        SubscriptionView.getMailingList();
        BlockListView.getBlockList();
        QuickFilterView.getQuickFilters();
        setTimeout(() => Utils.triggerProductTourV2(1), 3000);
        break;
      case "sign-in-failed":
        Utils.removeLoaderAndSwitch(LoginView.render());
        break;
      case "sign-out-success":
        Utils.removeLoaderAndSwitch(LoginView.render());
        // Utils.switchViewTo(LoginView.render());
        break;
      case "get-mailing-list-success":
        SubscriptionView.handleMailingList(message.request);
        Utils.switchViewTo(MainView.render(true));
        break;
      case "get-mailing-list-error":
        SubscriptionView.handleMailingList(message.request);
        Utils.switchViewTo(MainView.render(true));
        break;
      case "get-block-list-success":
        BlockListView.handleBlockList(message.request);
        Utils.switchViewTo(MainView.render(true));
        break;
      case "get-block-list-error":
        BlockListView.handleBlockList(message.request);
        Utils.switchViewTo(MainView.render(true));
        break;
      case "unsubscribe-quota-exhausted":
        Utils.removeLoaderAndSwitch(MainView.render(true));
        SubscriptionView.openGenericModal(
          `${LOCALE.sorryYouHaveExhausted}`,
          "215px",
          `${LOCALE.purchaseLicense}`,
          SubscriptionView._upgradePlan
        );
        break;
      case "unsubscribe-success":
        Utils.removeLoaderAndSwitch(MainView.render(true));
        SubscriptionView.refreshMailingList();
        BlockListView.refreshBlockList();
        if (message.request && message.request.deleteEmails) {
          Utils.showRefreshToast(message.request.deletionCountIncrement);
        }
        setTimeout(
          () => Utils.triggerMilestoneCelebration(message.request.userStats),
          3400
        );
        break;
      case "native-unsubscribe-success":
        if (message.request && message.request.deleteEmails) {
          Utils.showRefreshToast(message.request.deletionCountIncrement);
        }
        setTimeout(
          () => Utils.triggerMilestoneCelebration(message.request.userStats),
          3400
        );
        break;
      case "native-delete-success":
        Utils.showRefreshToast(message.request.deletionCountIncrement);

        setTimeout(
          () => Utils.triggerMilestoneCelebration(message.request.userStats),
          3400
        );
        break;
      case "unblock-success":
        Utils.removeLoaderAndSwitch(MainView.render(true));
        BlockListView.refreshBlockList();
        SubscriptionView.refreshMailingList();
        break;
      case "delete-success":
        Utils.removeLoaderAndSwitch(MainView.render(true));
        SubscriptionView.refreshMailingList();
        Utils.showRefreshToast(message.request.deletionCountIncrement);
        setTimeout(
          () => Utils.triggerMilestoneCelebration(message.request.userStats),
          3400
        );
        break;
      case "get-user-digests-success":
      case "get-user-digests-error":
        DigestView.handleDigests(message.request);
        break;
      case "create-user-digest-success":
      case "create-user-digest-error":
        DigestView.handleCreateOrUpdateDigestResponse(message.request);
        break;
      case "update-user-digest-success":
      case "update-user-digest-error":
        DigestView.handleCreateOrUpdateDigestResponse(message.request);
        break;
      case "curate-user-digest-success":
      case "curate-user-digest-error":
        DigestView.handleCurateDigestResponse(message.request);
        break;
      // Handles deletion status
      case "delete-status":
        updateToastDeletionCount(message.request.totalDeleted);
        break;
    }

    if (message.toast) {
      showToast(
        message.toast.header,
        message.toast.message,
        message.toast.status
      );
    }
  });
});
