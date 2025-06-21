window.addEventListener("load", onPageLoad);

document.addEventListener("DOMContentLoaded", function () {
  const LOCALE = {
    dontHaveALicenseKey: chrome.i18n.getMessage("dontHaveALicenseKey"),
    pleaseEnterYourLicenseKey: chrome.i18n.getMessage(
      "pleaseEnterYourLicenseKey"
    ),
    youCanBuyOneHere: chrome.i18n.getMessage("youCanBuyOneHere"),
    license: chrome.i18n.getMessage("license"),
    inactive: chrome.i18n.getMessage("inactive"),
    active: chrome.i18n.getMessage("active"),
    activate: chrome.i18n.getMessage("activate"),
    faq: chrome.i18n.getMessage("faq"),
    pricing: chrome.i18n.getMessage("pricing"),
    billing: chrome.i18n.getMessage("billing"),
    cantFindYourLicense: chrome.i18n.getMessage("cantFindYourLicense"),
    retrieveItHere: chrome.i18n.getMessage("retrieveItHere"),
  };

  const cantFindLicenseEle = document.getElementById("cant-find-license");
  cantFindLicenseEle.innerHTML = `${LOCALE.cantFindYourLicense} <a href="http://inboxpurge.com/billing?ref=retrieve_license_key" target="_blank">${LOCALE.retrieveItHere} </a>`;

  const dontHaveLicenseEle = document.getElementById("dont-have-license");
  dontHaveLicenseEle.innerHTML = `${LOCALE.dontHaveALicenseKey}
  <a href="http://inboxpurge.com/pricing?ref=get_license_key" target="_blank">
    ${LOCALE.youCanBuyOneHere}
    <svg
      width="15px"
      height="15px"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      color="#000000"
    >
      <path
        d="M21 3h-6m6 0l-9 9m9-9v6"
        stroke="#000000"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></path>
      <path
        d="M21 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h6"
        stroke="#000000"
        stroke-width="1.5"
        stroke-linecap="round"
      ></path>
    </svg>
  </a>`;

  const headline = document.getElementById("headline");
  headline.innerHTML = `${LOCALE.license}`;

  const activateLicense = document.getElementById("activate-license");
  activateLicense.innerHTML = `${LOCALE.activate}`;

  const pleaseEnterLicense = document.getElementById("please-enter-license");
  pleaseEnterLicense.innerHTML = `${LOCALE.pleaseEnterYourLicenseKey}`;

  const inactiveBadge = document.getElementById("inactive-badge");
  inactiveBadge.innerHTML = `${LOCALE.inactive}`;

  const activeBadge = document.getElementById("active-badge");
  activeBadge.innerHTML = `${LOCALE.active}`;

  const faqMenu = document.getElementById("faq-menu");
  faqMenu.innerHTML = `${LOCALE.faq} <svg width="15px" height="15px" viewBox="0 0 24 24" stroke-width="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M21 3h-6m6 0l-9 9m9-9v6" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M21 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h6" stroke="#000000" stroke-width="1.5" stroke-linecap="round"></path></svg>`;

  const billingMenu = document.getElementById("billing-menu");
  billingMenu.innerHTML = `${LOCALE.billing} <svg width="15px" height="15px" viewBox="0 0 24 24" stroke-width="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M21 3h-6m6 0l-9 9m9-9v6" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M21 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h6" stroke="#000000" stroke-width="1.5" stroke-linecap="round"></path></svg>`;

  const pricingMenu = document.getElementById("pricing-menu");
  pricingMenu.innerHTML = `${LOCALE.pricing} <svg width="15px" height="15px" viewBox="0 0 24 24" stroke-width="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M21 3h-6m6 0l-9 9m9-9v6" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M21 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h6" stroke="#000000" stroke-width="1.5" stroke-linecap="round"></path></svg>`;
});

const activateLicense = document.getElementById("activate-license");

activateLicense.addEventListener("click", async (e) => {
  e.preventDefault();
  await validateLicense();
});

async function onPageLoad() {
  const activeBadge = document.getElementById("active-badge");
  const inactiveBadge = document.getElementById("inactive-badge");

  const data = await new Promise((resolve, reject) => {
    chrome.storage.sync.get(["LICENSE_KEY/INBOX_PURGE"], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result["LICENSE_KEY/INBOX_PURGE"]);
      }
    });
  });

  if (data && data.valid) {
    document.getElementById("license-key").value = data.licenseKey;
    inactiveBadge.classList.remove("hidden");
    activeBadge.classList.add("hidden");
    await validateLicense();
  } else {
    if (data && data.licenseKey) {
      document.getElementById("license-key").value = data.licenseKey;
    }
    inactiveBadge.classList.remove("hidden");
    activeBadge.classList.add("hidden");
  }
}

async function validateLicense() {
  const licenseKey = document.getElementById("license-key").value;
  const loading = document.getElementById("loading");
  loading.classList.remove("hidden");

  if (licenseKey) {
    await chrome.runtime.sendMessage({
      action: "activate-license",

      request: { licenseKey },
    });
  }
}

function handleActivateLicense(request) {
  const message = document.getElementById("message");
  const activeBadge = document.getElementById("active-badge");
  const inactiveBadge = document.getElementById("inactive-badge");
  const loading = document.getElementById("loading");

  if (request.error) {
    message.style.color = "red";
    message.textContent = `Invalid license key: ${request.error}`;
    inactiveBadge.classList.remove("hidden");
    activeBadge.classList.add("hidden");
  } else {
    message.style.color = "green";
    message.innerHTML = `Valid license key for the <b>${request.data.meta.product_name}</b> plan, enjoy!`;
    inactiveBadge.classList.add("hidden");
    activeBadge.classList.remove("hidden");
  }

  loading.classList.add("hidden");
  message.classList.remove("hidden");
}

chrome.runtime.onMessage.addListener(async (message) => {
  switch (message.action) {
    case "activate-license-success":
    case "activate-license-failed":
      handleActivateLicense(message.request);
      break;
  }
});
