/* =========================================================
   NEATGARMS — GLOBAL CURRENCY ENGINE
   Supported currencies: KES / USD
   Base currency: KES
========================================================= */

(() => {
  "use strict";

  /* =======================================================
     CONFIGURATION
  ======================================================= */

  const BASE_CURRENCY = "KES";

  const STORAGE_KEY = "neatCurrency";
  const RATE_CACHE_KEY = "neatCurrencyRates";
  const RATE_CACHE_TIME_KEY = "neatCurrencyRatesTime";

  const CACHE_DURATION = 24 * 60 * 60 * 1000;

  const currencies = {
    KES: {
      symbol: "KSh",
      locale: "en-KE",
      decimals: 0
    },

    USD: {
      symbol: "$",
      locale: "en-US",
      decimals: 2
    }
  };

  /* =======================================================
     STORAGE HELPERS
  ======================================================= */

  function readStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn("NeatCurrency: Could not save data.", error);
    }
  }

  /* =======================================================
     SELECTED CURRENCY
  ======================================================= */

  function getSelectedCurrency() {
    const saved = readStorage(STORAGE_KEY);

    return Object.prototype.hasOwnProperty.call(
      currencies,
      saved
    )
      ? saved
      : BASE_CURRENCY;
  }

  function setCurrency(currency) {
    if (!Object.prototype.hasOwnProperty.call(
      currencies,
      currency
    )) {
      return false;
    }

    writeStorage(STORAGE_KEY, currency);

    refreshPagePrices();

    document.dispatchEvent(
      new CustomEvent("neatcurrencychange", {
        detail: { currency }
      })
    );

    return true;
  }

  /* =======================================================
     PARSE ORIGINAL KES PRICES
  ======================================================= */

  function parseKESPrice(value) {
    if (value === null || value === undefined) {
      return 0;
    }

    const cleaned = String(value)
      .replace(/KShs?|KES/gi, "")
      .replace(/,/g, "")
      .trim();

    const amount = Number(cleaned);

    return Number.isFinite(amount) ? amount : 0;
  }

  /* =======================================================
     GET EXCHANGE RATES

     API rates are based on 1 KES.
     Example:
     rates.USD = number of USD per KES.
  ======================================================= */

  let ratesRequest = null;

  async function getRates() {
    if (getSelectedCurrency() === BASE_CURRENCY) {
      return { KES: 1 };
    }

    const cachedRatesText = readStorage(RATE_CACHE_KEY);
    const cachedTime = Number(
      readStorage(RATE_CACHE_TIME_KEY)
    );

    if (cachedRatesText && cachedTime) {
      try {
        const cachedRates = JSON.parse(cachedRatesText);

        if (
          cachedRates &&
          Number(cachedRates.USD) > 0 &&
          Date.now() - cachedTime < CACHE_DURATION
        ) {
          return cachedRates;
        }
      } catch (error) {
        console.warn(
          "NeatCurrency: Invalid cached rates.",
          error
        );
      }
    }

    // Avoid duplicate requests when several prices need conversion.
    if (ratesRequest) {
      return ratesRequest;
    }

    ratesRequest = (async () => {
      try {
        const response = await fetch(
          "https://open.er-api.com/v6/latest/KES"
        );

        if (!response.ok) {
          throw new Error(
            `Exchange-rate API returned ${response.status}`
          );
        }

        const data = await response.json();

        if (
          data.result !== "success" ||
          !data.rates ||
          !(Number(data.rates.USD) > 0)
        ) {
          throw new Error("Invalid exchange-rate response.");
        }

        writeStorage(
          RATE_CACHE_KEY,
          JSON.stringify(data.rates)
        );

        writeStorage(
          RATE_CACHE_TIME_KEY,
          String(Date.now())
        );

        return data.rates;
      } catch (error) {
        console.error(
          "NeatCurrency: Could not fetch exchange rates.",
          error
        );

        // Use expired cached rates if available.
        if (cachedRatesText) {
          try {
            const oldRates = JSON.parse(cachedRatesText);

            if (Number(oldRates.USD) > 0) {
              return oldRates;
            }
          } catch (_) {
            // Continue to fallback.
          }
        }

        // Prevent the page from breaking if the API is unavailable.
        return { KES: 1 };
      } finally {
        ratesRequest = null;
      }
    })();

    return ratesRequest;
  }

  /* =======================================================
     CONVERT KES TO SELECTED CURRENCY
  ======================================================= */

  async function convertFromKES(kesAmount) {
    const amount = Number(kesAmount) || 0;
    const currency = getSelectedCurrency();

    if (currency === BASE_CURRENCY) {
      return amount;
    }

    const rates = await getRates();
    const rate = Number(rates[currency]);

    if (!(rate > 0)) {
      return amount;
    }

    return amount * rate;
  }

  /* =======================================================
     FORMAT NUMBERS
  ======================================================= */

  function formatNumber(
    value,
    currency = getSelectedCurrency()
  ) {
    const settings = currencies[currency] || currencies.KES;

    return new Intl.NumberFormat(settings.locale, {
      minimumFractionDigits: settings.decimals,
      maximumFractionDigits: settings.decimals
    }).format(value);
  }

  /* =======================================================
     FORMAT COMPLETE PRICE
  ======================================================= */

  async function formatKES(kesAmount, options = {}) {
    const currency = getSelectedCurrency();
    const settings = currencies[currency] || currencies.KES;

    const converted = await convertFromKES(kesAmount);
    const amount = formatNumber(converted, currency);

    if (options.codeOnly) {
      return {
        currency,
        symbol: settings.symbol,
        amount,
        rawAmount: converted
      };
    }

    return {
      currency,
      symbol: settings.symbol,
      amount,
      rawAmount: converted,
      formatted: `${settings.symbol} ${amount}`
    };
  }

  /* =======================================================
     PRESERVE ORIGINAL PRICES

     Use data-kes-price to store the original KES amount.

     Never calculate a new price from an already-converted
     displayed amount.
  ======================================================= */

  function getBasePrice(element) {
    if (!element) {
      return 0;
    }

    const stored = element.dataset.kesPrice;

    if (
      stored !== undefined &&
      stored !== "" &&
      Number.isFinite(Number(stored))
    ) {
      return Number(stored);
    }

    const parsed = parseKESPrice(element.textContent);

    element.dataset.kesPrice = String(parsed);

    return parsed;
  }

  /* =======================================================
     CONVERT PRICE ELEMENT

     .new-price and .old-price show the numeric amount.
     Currency symbols are updated separately where marked.
  ======================================================= */

  async function convertPriceElement(element) {
    if (!element) {
      return;
    }

    const basePrice = getBasePrice(element);
    const currencyAtStart = getSelectedCurrency();

    const result = await formatKES(basePrice);

    // Ignore stale results if the customer switched currencies
    // while an exchange-rate request was in progress.
    if (currencyAtStart !== getSelectedCurrency()) {
      return;
    }

    element.textContent = result.amount;
    element.dataset.currency = result.currency;
  }


function refreshCurrencyLabels(currency) {
  const settings = currencies[currency] || currencies.KES;

  document
    .querySelectorAll(".object-price__currency, [data-currency-symbol]")
    .forEach((element) => {
      element.textContent = settings.symbol;
    });

  document
    .querySelectorAll("[data-currency-code]")
    .forEach((element) => {
      element.textContent = currency;
    });

  document
    .querySelectorAll(".product-price__label")
    .forEach((element) => {
      element.textContent =
        currency === "USD" ? "Price in USD" : "Price in KSh";
    });
}

  /* =======================================================
     REFRESH PAGE PRICES
  ======================================================= */

  let refreshVersion = 0;

  async function refreshPagePrices() {
    const version = ++refreshVersion;
    const currency = getSelectedCurrency();

    // Update labels immediately.
    refreshCurrencyLabels(currency);

    const priceElements = document.querySelectorAll(
      ".new-price, .old-price"
    );

    await Promise.all(
      Array.from(priceElements).map((element) =>
        convertPriceElement(element)
      )
    );

    // A newer refresh may have started while awaiting rates.
    if (
      version !== refreshVersion ||
      currency !== getSelectedCurrency()
    ) {
      return;
    }

    document.dispatchEvent(
      new CustomEvent("neatcurrencyready", {
        detail: { currency }
      })
    );
  }

  /* =======================================================
     DYNAMIC PRODUCT OBSERVER
  ======================================================= */

  let refreshTimer = null;
  let observer = null;

  function startObserver() {
    if (!document.body || observer) {
      return;
    }

    observer = new MutationObserver((mutations) => {
      const hasAddedNodes = mutations.some((mutation) =>
        Array.from(mutation.addedNodes).some((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) {
            return false;
          }

          // Ignore changes inside the currency selector.
          if (
            node.id === "currencyGate" ||
            node.closest?.("#currencyGate")
          ) {
            return false;
          }

          return true;
        })
      );

      if (!hasAddedNodes) {
        return;
      }

      clearTimeout(refreshTimer);

      refreshTimer = setTimeout(() => {
        refreshPagePrices();
      }, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /* =======================================================
     INITIALIZE
  ======================================================= */

  function init() {
    refreshPagePrices();
    startObserver();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );
  } else {
    init();
  }

  /* =======================================================
     PUBLIC API

     Examples:

     NeatCurrency.getCurrency()
     NeatCurrency.setCurrency("USD")
     NeatCurrency.formatKES(3000)
     NeatCurrency.convertFromKES(3000)
     NeatCurrency.refresh()
  ======================================================= */

  window.NeatCurrency = {
    getCurrency: getSelectedCurrency,
    setCurrency,
    getRates,
    parseKESPrice,
    convertFromKES,
    formatNumber,
    formatKES,
    convertPriceElement,
    refresh: refreshPagePrices,
    currencies
  };
})();