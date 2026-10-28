/* =========================================================
   NEATGARMS — CURRENCY SELECTOR
   Options: KES / USD
========================================================= */

(() => {
  "use strict";

  const STORAGE_KEY = "neatCurrency";

  function initCurrencySelector() {
    const gate = document.getElementById("currencyGate");

    // The selector exists on the homepage only.
    if (!gate) return;

    const options = gate.querySelectorAll("[data-currency]");

    const validCurrencies = ["KES", "USD"];

    function getSavedCurrency() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);

        return validCurrencies.includes(saved) ? saved : null;
      } catch (error) {
        return null;
      }
    }

    function openGate() {
      gate.classList.add("is-active");
      gate.setAttribute("aria-hidden", "false");

      document.documentElement.classList.add("currency-gate-open");
      document.body.classList.add("currency-gate-open");

      const selected = getSavedCurrency();

      options.forEach((option) => {
        const isSelected = option.dataset.currency === selected;

        option.classList.toggle("is-selected", isSelected);

        option.setAttribute(
          "aria-pressed",
          String(isSelected)
        );
      });

      const firstOption = gate.querySelector(
        ".currency-gate__option"
      );

      if (firstOption) {
        firstOption.focus({ preventScroll: true });
      }
    }

    function closeGate() {
      gate.classList.remove("is-active");
      gate.setAttribute("aria-hidden", "true");

      document.documentElement.classList.remove("currency-gate-open");
      document.body.classList.remove("currency-gate-open");
    }

    function selectCurrency(currency) {
      if (!validCurrencies.includes(currency)) return;

      try {
        localStorage.setItem(STORAGE_KEY, currency);
      } catch (error) {
        console.warn("Could not save currency preference.", error);
      }

      options.forEach((option) => {
        const isSelected = option.dataset.currency === currency;

        option.classList.toggle("is-selected", isSelected);

        option.setAttribute(
          "aria-pressed",
          String(isSelected)
        );
      });

      closeGate();

      // Update the current page immediately.
      if (
        window.NeatCurrency &&
        typeof window.NeatCurrency.refresh === "function"
      ) {
        window.NeatCurrency.refresh();
      }

      document.dispatchEvent(
        new CustomEvent("neatcurrencychange", {
          detail: { currency }
        })
      );
    }

    options.forEach((option) => {
      option.addEventListener("click", () => {
        selectCurrency(option.dataset.currency);
      });
    });

    // Public function for navbar/footer currency controls.
    window.openNeatCurrencySelector = openGate;

    // Show only if the visitor hasn't made a valid selection.
    if (!getSavedCurrency()) {
      openGate();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initCurrencySelector,
      { once: true }
    );
  } else {
    initCurrencySelector();
  }
})();



/* =========================================================
   NEATGARMS — NAVBAR CURRENCY SWITCHER
========================================================= */

(() => {
  "use strict";

  const desktopButton =
    document.getElementById("navCurrency");

  const mobileButton =
    document.getElementById("mobileMenuCurrency");

  const desktopCode =
    document.getElementById("navCurrencyCode");

  const mobileCode =
    document.getElementById("mobileCurrencyCode");

  const mobileMenu =
    document.getElementById("mobileMenu");


  /* -----------------------------------------
     UPDATE THE CURRENCY LABELS
  ----------------------------------------- */

  function updateCurrencyLabels() {
    let currency = "KES";

    try {
      const saved = localStorage.getItem("neatCurrency");

      if (saved === "KES" || saved === "USD") {
        currency = saved;
      }
    } catch (error) {
      console.warn("Could not read currency preference.", error);
    }

    if (desktopCode) {
      desktopCode.textContent = currency;
    }

    if (mobileCode) {
      mobileCode.textContent = currency;
    }
  }


  /* -----------------------------------------
     OPEN THE EXISTING CURRENCY MODAL
  ----------------------------------------- */

  function openCurrencySelector() {
    if (
      typeof window.openNeatCurrencySelector === "function"
    ) {
      window.openNeatCurrencySelector();
    } else {
      console.warn(
        "Neatgarms currency selector is not ready yet."
      );
    }
  }


  /* -----------------------------------------
     DESKTOP NAVBAR BUTTON
  ----------------------------------------- */

  desktopButton?.addEventListener("click", () => {
    openCurrencySelector();
  });


  /* -----------------------------------------
     MOBILE MENU BUTTON
  ----------------------------------------- */

  mobileButton?.addEventListener("click", () => {
    /*
      Move focus away from the currency button before
      the mobile menu is hidden.
    */

    document.getElementById("menuTrigger")?.focus({
      preventScroll: true
    });

    /*
      Close the mobile menu using its existing control.
    */

    document.getElementById("menuClose")?.click();

    /*
      Wait for the menu to close, then open the modal.
      This prevents the mobile menu from retaining focus.
    */

    requestAnimationFrame(() => {
      openCurrencySelector();
    });
  });


  /* -----------------------------------------
     KEEP LABELS SYNCHRONIZED
  ----------------------------------------- */

  updateCurrencyLabels();

  document.addEventListener(
    "neatcurrencychange",
    updateCurrencyLabels
  );

  window.addEventListener(
    "storage",
    updateCurrencyLabels
  );

  document.addEventListener(
    "DOMContentLoaded",
    updateCurrencyLabels,
    { once: true }
  );
})();
