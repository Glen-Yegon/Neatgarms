/* =========================================================
   NEATGARMS — GLOBAL CURRENCY ENGINE
   Base currency: KES
========================================================= */

(() => {

  const BASE_CURRENCY = "KES";

  const RATE_CACHE_KEY = "neatCurrencyRates";
  const RATE_CACHE_TIME_KEY = "neatCurrencyRatesTime";

  /*
    ExchangeRate-API open endpoint updates approximately
    once every 24 hours, so we cache the result.
  */
  const CACHE_DURATION = 24 * 60 * 60 * 1000;


  /* =======================================================
     CURRENCY INFORMATION
  ======================================================= */

  const currencies = {

    KES: {
      symbol: "KSh",
      locale: "en-KE",
      decimals: 0
    },

    UGX: {
      symbol: "USh",
      locale: "en-UG",
      decimals: 0
    },

    TZS: {
      symbol: "TSh",
      locale: "en-TZ",
      decimals: 0
    },

    RWF: {
      symbol: "FRw",
      locale: "en-RW",
      decimals: 0
    },

    NGN: {
      symbol: "₦",
      locale: "en-NG",
      decimals: 0
    },

    GHS: {
      symbol: "GH₵",
      locale: "en-GH",
      decimals: 2
    },

    ZAR: {
      symbol: "R",
      locale: "en-ZA",
      decimals: 2
    },

    ZMW: {
      symbol: "ZK",
      locale: "en-ZM",
      decimals: 2
    },

    ETB: {
      symbol: "Br",
      locale: "en-ET",
      decimals: 2
    },

    USD: {
      symbol: "$",
      locale: "en-US",
      decimals: 2
    },

    GBP: {
      symbol: "£",
      locale: "en-GB",
      decimals: 2
    },

    EUR: {
      symbol: "€",
      locale: "en-IE",
      decimals: 2
    },

    CAD: {
      symbol: "C$",
      locale: "en-CA",
      decimals: 2
    },

    AUD: {
      symbol: "A$",
      locale: "en-AU",
      decimals: 2
    },

    AED: {
      symbol: "AED",
      locale: "en-AE",
      decimals: 2
    }

  };


  /* =======================================================
     SELECTED CURRENCY
  ======================================================= */

  function getSelectedCurrency() {

    const saved =
      localStorage.getItem("neatCurrency");

    if (
      saved &&
      currencies[saved]
    ) {
      return saved;
    }

    return BASE_CURRENCY;

  }


  /* =======================================================
     PARSE ORIGINAL KES PRICE
  ======================================================= */

  function parseKESPrice(value) {

    if (
      value === null ||
      value === undefined
    ) {
      return 0;
    }

    const cleaned =
      String(value)
        .replace(
          /KShs?|KES|,/gi,
          ""
        )
        .trim();

    return parseFloat(cleaned) || 0;

  }


  /* =======================================================
     GET EXCHANGE RATES
  ======================================================= */

  async function getRates() {

    /*
      KES doesn't need a conversion.
    */

    const selectedCurrency =
      getSelectedCurrency();

    if (selectedCurrency === BASE_CURRENCY) {

      return {
        KES: 1
      };

    }


    /*
      Check cached rates first.
    */

    try {

      const cachedRates =
        JSON.parse(
          localStorage.getItem(
            RATE_CACHE_KEY
          )
        );

      const cachedTime =
        Number(
          localStorage.getItem(
            RATE_CACHE_TIME_KEY
          )
        );


      if (
        cachedRates &&
        cachedTime &&
        Date.now() - cachedTime <
          CACHE_DURATION
      ) {

        return cachedRates;

      }

    } catch (error) {

      console.warn(
        "Could not read cached currency rates.",
        error
      );

    }


    /*
      Fetch fresh rates using KES as base.
    */

    try {

      const response =
        await fetch(
          "https://open.er-api.com/v6/latest/KES"
        );


      if (!response.ok) {

        throw new Error(
          `Currency API returned ${response.status}`
        );

      }


      const data =
        await response.json();


      if (
        data.result !== "success" ||
        !data.rates
      ) {

        throw new Error(
          "Invalid currency API response."
        );

      }


      localStorage.setItem(
        RATE_CACHE_KEY,
        JSON.stringify(data.rates)
      );


      localStorage.setItem(
        RATE_CACHE_TIME_KEY,
        String(Date.now())
      );


      return data.rates;

    } catch (error) {

      console.error(
        "Currency conversion unavailable:",
        error
      );


      /*
        If fetching fails but old cached rates
        exist, use them rather than breaking prices.
      */

      try {

        const oldRates =
          JSON.parse(
            localStorage.getItem(
              RATE_CACHE_KEY
            )
          );

        if (oldRates) {
          return oldRates;
        }

      } catch (_) {}


      /*
        Final fallback = KES.
      */

      return {
        KES: 1
      };

    }

  }


  /* =======================================================
     CONVERT KES → SELECTED CURRENCY
  ======================================================= */

  async function convertFromKES(
    kesAmount
  ) {

    const amount =
      Number(kesAmount) || 0;

    const currency =
      getSelectedCurrency();


    if (currency === BASE_CURRENCY) {

      return amount;

    }


    const rates =
      await getRates();


    const rate =
      Number(rates[currency]);


    if (!rate) {

      console.warn(
        `No exchange rate available for ${currency}`
      );

      return amount;

    }


    return amount * rate;

  }


  /* =======================================================
     FORMAT NUMBER
  ======================================================= */

  function formatNumber(
    value,
    currency = getSelectedCurrency()
  ) {

    const settings =
      currencies[currency] ||
      currencies.KES;


    return new Intl.NumberFormat(
      settings.locale,
      {
        minimumFractionDigits:
          settings.decimals,

        maximumFractionDigits:
          settings.decimals
      }
    ).format(value);

  }


  /* =======================================================
     FORMAT COMPLETE PRICE
  ======================================================= */

  async function formatKES(
    kesAmount,
    options = {}
  ) {

    const currency =
      getSelectedCurrency();

    const settings =
      currencies[currency] ||
      currencies.KES;


    const converted =
      await convertFromKES(
        kesAmount
      );


    const number =
      formatNumber(
        converted,
        currency
      );


    if (options.codeOnly) {

      return {
        currency,
        amount: number,
        rawAmount: converted
      };

    }


    return {
      currency,
      symbol: settings.symbol,
      amount: number,
      rawAmount: converted,
      formatted:
        `${settings.symbol} ${number}`
    };

  }


  /* =======================================================
     CONVERT A DOM PRICE ELEMENT

     IMPORTANT:
     The first time an element is converted,
     its original KES value is stored permanently
     in data-kes-price.
  ======================================================= */

  async function convertPriceElement(
    element
  ) {

    if (!element) return;


    let basePrice =
      element.dataset.kesPrice;


    if (!basePrice) {

      basePrice =
        parseKESPrice(
          element.textContent
        );


      element.dataset.kesPrice =
        String(basePrice);

    }


    const result =
      await formatKES(
        Number(basePrice)
      );


    element.textContent =
      result.amount;


    element.dataset.currency =
      result.currency;

  }


  /* =======================================================
     CONVERT COMMON PRICE ELEMENTS
  ======================================================= */

  async function refreshPagePrices() {

    const currency =
      getSelectedCurrency();


    /*
      PRODUCT / SHOP PRICES
    */

    const priceElements =
      document.querySelectorAll(
        ".new-price, .old-price"
      );


    for (
      const element of priceElements
    ) {

      if (
        !element.textContent.trim()
      ) {
        continue;
      }


      await convertPriceElement(
        element
      );

    }


    /*
      Update explicit currency labels.
    */

    document
      .querySelectorAll(
        ".object-price__currency"
      )
      .forEach(element => {

        element.textContent =
          currency;

      });


    /*
      Update any elements we explicitly mark
      with data-currency-code.
    */

    document
      .querySelectorAll(
        "[data-currency-code]"
      )
      .forEach(element => {

        element.textContent =
          currency;

      });


    /*
      Older shop cards may contain:
      "Price in Kshs."
    */

    document
      .querySelectorAll(
        ".product-price"
      )
      .forEach(element => {

        for (
          const node of element.childNodes
        ) {

          if (
            node.nodeType ===
              Node.TEXT_NODE &&
            /Price in Kshs?/i.test(
              node.textContent
            )
          ) {

            node.textContent =
              `Price in ${currency} `;

          }

        }

      });


    document.dispatchEvent(
      new CustomEvent(
        "neatcurrencyready",
        {
          detail: {
            currency
          }
        }
      )
    );

  }


  /* =======================================================
     OBSERVE DYNAMIC PRODUCTS

     main.html imports products dynamically.
     product.js also inserts prices dynamically.

     This observer lets currency.js notice them
     after they appear.
  ======================================================= */

  let refreshTimer = null;


  const observer =
    new MutationObserver(
      mutations => {

        const hasRelevantChange =
          mutations.some(
            mutation => {

              if (
                mutation.type ===
                "childList" &&
                mutation.addedNodes.length
              ) {
                return true;
              }

              return false;

            }
          );


        if (!hasRelevantChange) {
          return;
        }


        clearTimeout(
          refreshTimer
        );


        refreshTimer =
          setTimeout(
            () => {

              refreshPagePrices();

            },
            60
          );

      }
    );


  /* =======================================================
     INITIALIZE
  ======================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    () => {

      refreshPagePrices();


      observer.observe(
        document.body,
        {
          childList: true,
          subtree: true
        }
      );

    }
  );


  /* =======================================================
     PUBLIC API

     Other files such as cart.js can now use:

     window.NeatCurrency.getCurrency()
     window.NeatCurrency.formatKES(3000)
     etc.
  ======================================================= */

  window.NeatCurrency = {

    getCurrency:
      getSelectedCurrency,

    getRates,

    parseKESPrice,

    convertFromKES,

    formatNumber,

    formatKES,

    convertPriceElement,

    refresh:
      refreshPagePrices,

    currencies

  };

})();