let timer1, timer2;
let toastCount = 0;

function showToast(header, message, status) {
  const toast = document.querySelector(".toast");
  const progress = document.querySelector(".toast-progress");
  const toastHeader = document.querySelector(".text-1");
  const toastMessage = document.querySelector(".text-2");

  toastHeader.textContent = header || `${LOCALE.success}`;
  toastMessage.textContent = message || `${LOCALE.yourChangesMade}`;

  // set status
  toast.classList.add(status || "error");

  toast.classList.add("active");
  progress.classList.add("active");

  timer1 = setTimeout(() => {
    toast.classList.remove("active");
    toast.classList.remove(status);
  }, 3000);

  timer2 = setTimeout(() => {
    progress.classList.remove("active");
    progress.classList.remove(status);
  }, 3300);
}

function showProcessingToast() {
  if (document.querySelector(".refresh-toast")) return;

  const processingToast = document.createElement("div");
  processingToast.innerHTML = `⏳ ${LOCALE.stillProcessing}`;

  processingToast.style.position = "fixed";
  processingToast.style.top = "20px";
  processingToast.style.left = "20px";
  processingToast.style.backgroundColor = "#333";
  processingToast.style.color = "#fff";
  processingToast.style.padding = "12px 16px";
  processingToast.style.borderRadius = "5px";
  processingToast.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
  processingToast.style.fontSize = "14px";
  processingToast.style.display = "flex";
  processingToast.style.gap = "10px";
  processingToast.style.alignItems = "center";
  processingToast.style.zIndex = "800";
  processingToast.style.opacity = "0";
  processingToast.style.transition = "opacity 0.3s ease-in-out";
  processingToast.classList.add("processing-toast");

  const toastLoader = document.createElement("span");
  toastLoader.classList.add("toast-loader");

  processingToast.appendChild(toastLoader);

  document.body.appendChild(processingToast);

  setTimeout(() => {
    processingToast.style.opacity = "1";
  }, 500);
}

function updateToastDeletionCount(deletedCount) {
  const toast = document.querySelector(".processing-toast");
  if (!toast) return;

  let countSpan = document.getElementById("emails-deleted-count");
  if (!countSpan) {
    toast.innerHTML = `<span>
      ⏳ ${
        LOCALE.deletingEmails
      } <span id="emails-deleted-count">${deletedCount.toLocaleString()}</span> ${
      LOCALE.removedSoFar
    }  <span class="toast-loader"></span></span>`;
  } else {
    countSpan.textContent = deletedCount.toLocaleString();
  }
}

function closeToast() {
  const toast = document.querySelector(".toast");
  const progress = document.querySelector(".toast-progress");

  if (toast && progress) {
    toast.classList.remove("active");
    progress.classList.remove("active");

    // Also remove any status class (e.g., "error", "success") dynamically
    ["error", "success", "warning", "info"].forEach((status) => {
      toast.classList.remove(status);
      progress.classList.remove(status);
    });

    // If animation still causes delays, forcibly hide the toast
    setTimeout(() => {
      toast.style.display = "none";
    }, 300); // Allow for a short transition
  }
}

function createToastDiv() {
  const toast = document.createElement("div");
  toast.classList.add("toast");
  toast.innerHTML = `<div class="toast-content"><i class="fas fa-solid fa-check check"></i><div class="message"><span class="text text-1">${LOCALE.success}</span><span class="text text-2">${LOCALE.yourChangesMade}</span></div></div>`;

  const closeIcon = document.createElement("i");
  closeIcon.classList.add("fa-solid", "fa-xmark", "toast-close");
  closeIcon.addEventListener("click", () => {
    toast.classList.remove("active");

    setTimeout(() => {
      progress.classList.remove("active");
    }, 300);

    clearTimeout(timer1);
    clearTimeout(timer2);
  });

  const progress = document.createElement("div");
  progress.classList.add("toast-progress");

  toast.appendChild(closeIcon);
  toast.appendChild(progress);

  return toast;
}

function createNativeToastDiv() {
  const toast = document.createElement("div");
  toast.id = Utils.generateId();
  toast.classList.add("native-toast");
  toast.innerHTML = `<div class="toast-content"><span class="toast-icon"></span><div class="message"><span class="text text-1">${LOCALE.success}</span><span class="text text-2">${LOCALE.yourChangesMade}</span></div></div>`;

  const closeIcon = document.createElement("i");
  closeIcon.classList.add("fa-solid", "fa-xmark", "toast-close");
  closeIcon.addEventListener("click", () => {
    toast.classList.remove("active");

    setTimeout(() => {
      progress.classList.remove("active");
    }, 300);

    clearTimeout(timer1);
    clearTimeout(timer2);
  });

  const progress = document.createElement("div");
  progress.classList.add("native-toast-progress");

  toast.appendChild(closeIcon);
  toast.appendChild(progress);

  return toast;
}

// function closeNativeToast() {
//   const progress = document.querySelector(".native-toast-progress");
//   const toast = document.querySelector(".native-toast");
//   const processingToast = document.querySelector(".processing-toast");

//   if (!progress || !toast) {
//     return;
//   }

//   toast.classList.remove("active");

//   setTimeout(() => {
//     progress.classList.remove("active");
//     progress.classList.remove("error");
//     progress.classList.remove("success");
//   }, 300);

//   if (processingToast) {
//     processingToast.style.opacity = "0";
//     setTimeout(() => {
//       processingToast.remove();
//     }, 300);
//   }

//   clearTimeout(timer1);
//   clearTimeout(timer2);
// }

function closeNativeToast() {
  const toasts = Array.from(document.querySelectorAll(".native-toast")); // Convert NodeList to Array
  const progressBars = Array.from(
    document.querySelectorAll(".native-toast-progress")
  ); // Convert to Array
  const processingToast = document.querySelector(".processing-toast"); // Single element

  if (toasts.length === 0) return; // No toasts to close

  // ✅ Remove all native toasts
  toasts.forEach((toast) => {
    toast.classList.remove("active");

    setTimeout(() => {
      toast.remove();
    }, 300);
  });

  // ✅ Remove all progress bars
  progressBars.forEach((progress) => {
    setTimeout(() => {
      progress.classList.remove("active");
      progress.classList.remove("error");
      progress.classList.remove("success");
    }, 300);
  });

  // ✅ Close processing toast if visible
  if (processingToast) {
    processingToast.style.opacity = "0";
    setTimeout(() => {
      processingToast.remove();
    }, 300);
  }

  // Reset global states
  toastActive = false;
  processingToastVisible = false;
  deletionInProgress = false;

  clearTimeout(timer1);
  clearTimeout(timer2);
}

// Ideally should be able to handle multiple toasts
function showNativeToast(header, message, status, isDeleting) {
  const toast = createNativeToastDiv();
  document.body.appendChild(toast);

  // Increment toastCount and set the bottom property of the toast
  // if (toastCount > 0) {
  //   toastCount += 1;
  //   const toastHeight = 45;
  //   const spacing = 10;
  //   toast.style.bottom = `${toastCount * (toastHeight + spacing)}px`;
  // } else {
  //   toastCount += 1;
  // }

  const progress = toast.querySelector(".native-toast-progress");
  const toastHeader = toast.querySelector(".text-1");
  const toastMessage = toast.querySelector(".text-2");
  const toastIcon = toast.querySelector(".toast-icon");

  toastHeader.textContent = header || `${LOCALE.success}`;
  toastMessage.textContent = message || `${LOCALE.yourChangesMade}`;

  // set status
  toast.classList.add(status || "error");

  toastIcon.innerHTML =
    status == "success"
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" fill="none" stroke-width="1.5" viewBox="0 0 24 24" color="currentColor"><path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="m7 12.5 3 3 7-7"></path><path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"></path></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="30px" height="30px"  fill="none" stroke-width="1.5" viewBox="0 0 24 24" color="currentColor"><path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M12 7v6M12 17.01l.01-.011M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"></path></svg>`;

  toast.classList.add("active");
  progress.classList.add("active");

  // If deletion is in progress, don't remove the toast until `showRefreshToast()` is called
  if (!isDeleting) {
    setTimeout(() => closeNativeToast(), 8000);
  } else {
    // If toast is still active after 8 seconds, show processing message
    setTimeout(() => {
      showProcessingToast();
    }, 8000);
  }
}
