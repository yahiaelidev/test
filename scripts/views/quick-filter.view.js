class QuickFilterView {
  static render() {
    const root = document.createElement("div");
    root.id = "quick-filter-container";
    root.style.marginTop = "20px";
    root.className = "wT";

    root.appendChild(QuickFilterView._createHeader());
    root.appendChild(QuickFilterView._createBody());
    return root;
  }

  static async getQuickFilters() {
    if (!(await UserService.isCurrentEmailLoggedIn())) {
      return;
    }

    const gmailLabel = document.querySelector("div.yJ:last-child");
    if (gmailLabel) {
      gmailLabel.insertAdjacentElement("afterend", QuickFilterView.render());
    }
  }

  static _createHeader() {
    const header = document.createElement("div");
    header.className = "aAw";

    const span = document.createElement("span");
    span.className = "aAv";
    span.textContent = "InboxPurge";

    const showIcon = `<svg class="inboxpurge-filter-show" xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="0 0 24 24">
    <g fill="none">
        <path stroke="currentColor" stroke-width="2" d="M12 5c-5.444 0-8.469 4.234-9.544 6.116c-.221.386-.331.58-.32.868c.013.288.143.476.402.852C3.818 14.694 7.294 19 12 19c4.706 0 8.182-4.306 9.462-6.164c.26-.376.39-.564.401-.852c.012-.288-.098-.482-.319-.868C20.47 9.234 17.444 5 12 5Z"></path>
        <circle cx="12" cy="12" r="4" fill="currentColor"></circle>
    </g>
</svg>`;
    const hideIcon = `<svg class="inboxpurge-filter-hide" xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="0 0 36 36">
    <path fill="currentColor" d="M18.37 11.17a6.79 6.79 0 0 0-2.37.43l8.8 8.8a6.78 6.78 0 0 0 .43-2.4a6.86 6.86 0 0 0-6.86-6.83Z" class="clr-i-solid clr-i-solid-path-1"/>
    <path fill="currentColor" d="M34.29 17.53c-3.37-6.23-9.28-10-15.82-10a16.82 16.82 0 0 0-5.24.85L14.84 10a14.78 14.78 0 0 1 3.63-.47c5.63 0 10.75 3.14 13.8 8.43a17.75 17.75 0 0 1-4.37 5.1l1.42 1.42a19.93 19.93 0 0 0 5-6l.26-.48Z" class="clr-i-solid clr-i-solid-path-2"/>
    <path fill="currentColor" d="m4.87 5.78l4.46 4.46a19.52 19.52 0 0 0-6.69 7.29l-.26.47l.26.48c3.37 6.23 9.28 10 15.82 10a16.93 16.93 0 0 0 7.37-1.69l5 5l1.75-1.5l-26-26Zm8.3 8.3a6.85 6.85 0 0 0 9.55 9.55l1.6 1.6a14.91 14.91 0 0 1-5.86 1.2c-5.63 0-10.75-3.14-13.8-8.43a17.29 17.29 0 0 1 6.12-6.3Z" class="clr-i-solid clr-i-solid-path-3"/>
    <path fill="none" d="M0 0h36v36H0z"/>
</svg>`;

    const eyeIcon = document.createElement("div");

    eyeIcon.style.display = "flex";
    eyeIcon.style.cursor = "pointer";
    eyeIcon.setAttribute("data-tooltip", "Hide");

    // Should store preference in local storage (maybe)
    eyeIcon.innerHTML = showIcon;
    eyeIcon.onclick = () => {
      const eyeSVG = eyeIcon.querySelector("svg");
      const filterContainer = document.getElementById("inboxpurge-filter-body");

      if (eyeSVG.classList.contains("inboxpurge-filter-show")) {
        eyeSVG.classList.remove("inboxpurge-filter-show");
        eyeSVG.classList.add("inboxpurge-filter-hide");
        eyeIcon.innerHTML = hideIcon;
        eyeIcon.setAttribute("data-tooltip", "Show");
        filterContainer.classList.add("inboxpurge-filter-hidden");

        // filterContainer.addEventListener(
        //   "transitionend",
        //   function () {
        //     element.style.display = "none";
        //     element.remove();
        //   },
        //   { once: true }
        // );
      } else {
        eyeSVG.classList.remove("inboxpurge-filter-hide");
        eyeSVG.classList.add("inboxpurge-filter-show");
        eyeIcon.innerHTML = showIcon;
        eyeIcon.setAttribute("data-tooltip", "Hide");
        filterContainer.classList.remove("inboxpurge-filter-hidden");
      }
    };

    header.appendChild(span);
    header.appendChild(eyeIcon);

    return header;
  }

  static _createBody() {
    const body = document.createElement("div");
    body.id = "inboxpurge-filter-body";
    body.style.marginTop = "10px";

    const filters = [
      {
        label: LOCALE.largeFilesFilterLabel,
        searchPath: "#search/larger%3A15M",
        icon: `<svg width="24px" height="24px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"> <path fill="currentColor" d="M13.5 5.88c-.28 0-.5-.22-.5-.5V1.5c0-.28-.22-.5-.5-.5h-9c-.28 0-.5.22-.5.5v2c0 .28-.22.5-.5.5S2 3.78 2 3.5v-2C2 .67 2.67 0 3.5 0h9c.83 0 1.5.67 1.5 1.5v3.88c0 .28-.22.5-.5.5Z"></path> <path fill="currentColor" d="M14.5 16h-13C.67 16 0 15.33 0 14.5v-10C0 3.67.67 3 1.5 3h4.75c.16 0 .31.07.4.2L8 5h6.5c.83 0 1.5.67 1.5 1.5v8c0 .83-.67 1.5-1.5 1.5ZM1.5 4c-.28 0-.5.22-.5.5v10c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5v-8c0-.28-.22-.5-.5-.5H7.75a.48.48 0 0 1-.4-.2L6 4H1.5Z"></path> <path fill="currentColor" d="M5.5 13h-2c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h2c.28 0 .5.22.5.5s-.22.5-.5.5Z"></path> </svg>`,
      },
      {
        label: LOCALE.oldJunkFilterLabel,
        searchPath:
          "#search/older_than%3A6m+%7Bcategory%3Apromotions+category%3Asocial%7D",
        icon: `<svg width="24px" height="24px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M2 11V4.6C2 4.26863 2.26863 4 2.6 4H8.77805C8.92127 4 9.05977 4.05124 9.16852 4.14445L12.3315 6.85555C12.4402 6.94876 12.5787 7 12.722 7H21.4C21.7314 7 22 7.26863 22 7.6V11M2 11V19.4C2 19.7314 2.26863 20 2.6 20H21.4C21.7314 20 22 19.7314 22 19.4V11M2 11H22" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
      },
      {
        label: LOCALE.subscriptionsFilterLabel,
        searchPath: "#search/label%3A%5Eunsub",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 26 26">
        <path fill="currentColor" d="M4 0v19c0 .555-.445 1-1 1c-.555 0-1-.445-1-1V7h1V5H0v14c0 1.645 1.355 3 3 3h10c-.2-.6-.313-1.3-.313-2H5.814c.114-.316.187-.647.187-1V2h16v11c.7.2 1.4.5 2 1V0H4zm4 4v4h12V4H8zm0 6v2h5v-2H8zm7 0v2h5v-2h-5zm-7 3v2h5v-2H8zm12 1c-3.324 0-6 2.676-6 6s2.676 6 6 6v-2c-2.276 0-4-1.724-4-4s1.724-4 4-4s4 1.724 4 4c0 .868-.247 1.67-.688 2.313L22 21l-.5 4.5L26 25l-1.25-1.25C25.581 22.706 26 21.377 26 20c0-3.324-2.676-6-6-6zM8 16v2h5v-2H8z"></path>
    </svg>`,
      },
    ];

    filters.forEach((filter) => {
      body.appendChild(
        QuickFilterView._createFilter(
          filter.label,
          filter.icon,
          filter.searchPath
        )
      );
    });

    return body;
  }

  static _createFilter(label, icon, searchPath) {
    const filter = document.createElement("div");
    filter.style.cursor = "pointer";

    filter.innerHTML = `
    <div class="TO"  data-tooltip="${label}">
      <div class="TN inboxpurge-filter" style="margin-left: 0px;">
        <div class="qj">${icon}</div>
        <div>
          <span class="nU">
            <a
              href="${searchPath}"
              target="_top"
              class="J-Ke n0"
            >
              ${label}
            </a>
          </span>
        </div>
      </div>
    </div>
  </div>
    `;

    filter.onclick = () => {
      window.location.href = searchPath;

      // Remove any active class existing
      const allFilters = Array.from(
        document.querySelectorAll(".inboxpurge-filter-active")
      );

      if (allFilters) {
        allFilters.forEach((item) => {
          item.classList.remove("inboxpurge-filter-active");
        });
      }

      filter.classList.add("inboxpurge-filter-active");

      // Remove active class from filter
      const otherBtns = Array.from(document.querySelectorAll(".yJ"));
      otherBtns.forEach((btn) => {
        btn.onclick = () => {
          filter.classList.remove("inboxpurge-filter-active");
        };
      });
    };

    return filter;
  }
}
