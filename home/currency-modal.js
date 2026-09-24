/* =========================================================
   NEATGARMS — CURRENCY SELECTOR
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  const currencyGate =
    document.getElementById("currencyGate");

  const currencySearch =
    document.getElementById("currencySearch");

  const currencyList =
    document.getElementById("currencyList");

  const currencyOptions =
    document.querySelectorAll(".currency-option");

  const noResults =
    document.getElementById("currencyNoResults");


  if (!currencyGate) return;


  /* =======================================================
     STORAGE KEYS
  ======================================================= */

  const STORAGE_KEYS = {
    currency: "neatCurrency",
    country: "neatCountry",
    symbol: "neatCurrencySymbol"
  };


  /* =======================================================
     CHECK SAVED CURRENCY
  ======================================================= */

  const savedCurrency =
    localStorage.getItem(STORAGE_KEYS.currency);


  /*
    Only show the selector if the customer
    has never selected a currency.
  */

  if (!savedCurrency) {

    requestAnimationFrame(() => {

      currencyGate.classList.add("is-active");

      currencyGate.setAttribute(
        "aria-hidden",
        "false"
      );

      document.documentElement.style.overflow =
        "hidden";

      document.body.style.overflow =
        "hidden";

    });

  }


  /* =======================================================
     SELECT CURRENCY
  ======================================================= */

  currencyOptions.forEach((option) => {

    option.addEventListener("click", () => {

      const currency =
        option.dataset.currency;

      const country =
        option.dataset.country;

      const symbol =
        option.dataset.symbol;


      if (!currency) return;


      /* SAVE */

      localStorage.setItem(
        STORAGE_KEYS.currency,
        currency
      );

      localStorage.setItem(
        STORAGE_KEYS.country,
        country || ""
      );

      localStorage.setItem(
        STORAGE_KEYS.symbol,
        symbol || currency
      );


      /* VISUAL SELECT STATE */

      currencyOptions.forEach((item) => {
        item.classList.remove("is-selected");
      });

      option.classList.add("is-selected");


      /* CLOSE AFTER SMALL DELAY */

      setTimeout(() => {

        closeCurrencyGate();

      }, 180);

    });

  });


  /* =======================================================
     SEARCH
  ======================================================= */

  if (currencySearch) {

    currencySearch.addEventListener(
      "input",
      () => {

        const query =
          currencySearch.value
            .toLowerCase()
            .trim();

        let visibleCount = 0;


        currencyOptions.forEach((option) => {

          const searchText =
            (
              option.dataset.search ||
              option.textContent
            )
              .toLowerCase();


          const matches =
            searchText.includes(query);


          option.style.display =
            matches
              ? "grid"
              : "none";


          if (matches) {
            visibleCount++;
          }

        });


        /* NO RESULTS */

        if (noResults) {

          noResults.classList.toggle(
            "is-visible",
            visibleCount === 0
          );

        }

      }
    );

  }


  /* =======================================================
     CLOSE
  ======================================================= */

  function closeCurrencyGate() {

    currencyGate.classList.remove(
      "is-active"
    );

    currencyGate.setAttribute(
      "aria-hidden",
      "true"
    );


    document.documentElement.style.overflow =
      "";

    document.body.style.overflow =
      "";

  }


  /* =======================================================
     PUBLIC REOPEN FUNCTION

     Later the navbar/footer currency button can simply call:

     window.openNeatCurrencySelector();
  ======================================================= */

  window.openNeatCurrencySelector = () => {

    currencyGate.classList.add(
      "is-active"
    );

    currencyGate.setAttribute(
      "aria-hidden",
      "false"
    );


    document.documentElement.style.overflow =
      "hidden";

    document.body.style.overflow =
      "hidden";


    /*
      Reset search whenever manually reopened.
    */

    if (currencySearch) {

      currencySearch.value = "";

    }


    currencyOptions.forEach((option) => {

      option.style.display = "grid";

    });


    if (noResults) {

      noResults.classList.remove(
        "is-visible"
      );

    }

  };


});