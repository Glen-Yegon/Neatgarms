/* =========================================================
   NEATGARMS — CART CHECKOUT
   DISPLAY CURRENCY + KES PAYMENT BASE
========================================================= */


/* =========================================================
   STATE
========================================================= */

let cartBaseTotalKES = 0;
let cartDiscountPercent = 0;


/* =========================================================
   DROPDOWN
========================================================= */

const toggleDropdown =
  document.getElementById(
    'toggle-dropdown'
  );

const orderSummaryDropdown =
  document.getElementById(
    'order-summary-dropdown'
  );


toggleDropdown?.addEventListener(
  'click',
  () => {

    orderSummaryDropdown.style.display =
      orderSummaryDropdown.style.display ===
      'block'
        ? 'none'
        : 'block';

  }
);


/* =========================================================
   PRICE PARSER
========================================================= */

function getKESPrice(value) {

  if (
    window.NeatCurrency &&
    window.NeatCurrency.parseKESPrice
  ) {

    return window.NeatCurrency
      .parseKESPrice(value);

  }


  return (
    parseFloat(
      String(value || 0)
        .replace(
          /KShs?|KES|,/gi,
          ''
        )
        .trim()
    ) || 0
  );

}


/* =========================================================
   DISPLAY FORMATTER
========================================================= */

async function formatDisplayPrice(
  kesAmount
) {

  if (
    window.NeatCurrency
  ) {

    return await window.NeatCurrency
      .formatKES(
        kesAmount
      );

  }


  return {

    currency:
      'KES',

    symbol:
      'KSh',

    amount:
      Number(
        kesAmount
      ).toLocaleString(
        'en-KE',
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }
      ),

    formatted:
      `KSh ${Number(kesAmount).toLocaleString()}`

  };

}


/* =========================================================
   CART
========================================================= */

function getCart() {

  try {

    return JSON.parse(
      localStorage.getItem(
        'cartItems'
      )
    ) || [];

  } catch (error) {

    console.error(
      'Could not read cart:',
      error
    );

    return [];

  }

}


/* =========================================================
   CALCULATE ORIGINAL KES TOTAL
========================================================= */

function calculateCartKES() {

  const cart =
    getCart();


  return cart.reduce(
    (
      total,
      item
    ) => {

      const unitPrice =
        getKESPrice(
          item.newPrice
        );


      const quantity =
        parseInt(
          item.quantity
        ) || 1;


      return (
        total +
        unitPrice *
        quantity
      );

    },
    0
  );

}


/* =========================================================
   RENDER CART
========================================================= */

async function renderCartFromLocalStorage() {

  const cartItemsContainer =
    document.getElementById(
      'cart-items-container'
    );

  const combinedPriceElement =
    document.getElementById(
      'combined-price'
    );

  const currencyElement =
    document.getElementById(
      'checkout-currency'
    );

  const kesNote =
    document.getElementById(
      'checkout-kes-note'
    );


  if (
    !cartItemsContainer ||
    !combinedPriceElement
  ) {
    return;
  }


  const cart =
    getCart();


  /* =====================================================
     EMPTY CART
  ===================================================== */

  if (
    cart.length === 0
  ) {

    cartItemsContainer.innerHTML = `

      <p class="empty-order-message">
        Your cart is empty.
      </p>

    `;


    combinedPriceElement.textContent =
      '0.00';


    window.neatCheckoutKES =
      0;


    return;

  }


  cartItemsContainer.innerHTML =
    '';


  let combinedKES = 0;


  /* =====================================================
     ITEMS
  ===================================================== */

  for (
    const item of cart
  ) {

    const unitPriceKES =
      getKESPrice(
        item.newPrice
      );


    const quantity =
      parseInt(
        item.quantity
      ) || 1;


    const subtotalKES =
      unitPriceKES *
      quantity;


    combinedKES +=
      subtotalKES;


    /* -----------------------------------------
       DISPLAY CURRENCY
    ----------------------------------------- */

    const displayUnit =
      await formatDisplayPrice(
        unitPriceKES
      );


    const displaySubtotal =
      await formatDisplayPrice(
        subtotalKES
      );


    /* -----------------------------------------
       OPTIONAL DETAILS
    ----------------------------------------- */

    const sizeLine =
      item.size
        ? `
            <p>
              <strong>
                Size
              </strong>

              <span>
                ${item.size}
              </span>
            </p>
          `
        : '';


    const colorLine =
      item.color
        ? `
            <p>

              <strong>
                Color
              </strong>

              <span
                class="summary-color-value"
              >

                <i
                  class="summary-color-swatch"
                  style="background-color:${item.color};"
                ></i>

                ${item.color}

              </span>

            </p>
          `
        : '';


    /* -----------------------------------------
       CARD
    ----------------------------------------- */

    const productCard =
      document.createElement(
        'div'
      );


    productCard.classList.add(
      'cart-item'
    );


    productCard.innerHTML = `

      <div class="cart-product-image">

        <img
          src="${item.image}"
          alt="${item.name}"
        >

      </div>


      <div class="cart-product-details">

        <h4 class="summary-product-name">
          ${item.name}
        </h4>


        ${
          item.brand
            ? `
                <p>

                  <strong>
                    Brand
                  </strong>

                  <span>
                    ${item.brand}
                  </span>

                </p>
              `
            : ''
        }


        <p>

          <strong>
            Price
          </strong>

          <span>
            ${displayUnit.formatted}
          </span>

        </p>


        <p>

          <strong>
            Quantity
          </strong>

          <span>
            ${quantity}
          </span>

        </p>


        ${sizeLine}

        ${colorLine}


        <p
          class="summary-product-total"
        >

          <strong>
            Subtotal
          </strong>

          <span>
            ${displaySubtotal.formatted}
          </span>

        </p>

      </div>

    `;


    cartItemsContainer
      .appendChild(
        productCard
      );

  }


  /* =====================================================
     DISCOUNT — CALCULATED IN KES
  ===================================================== */

  const discountAmountKES =
    combinedKES *
    (
      cartDiscountPercent /
      100
    );


  cartBaseTotalKES =
    combinedKES -
    discountAmountKES;


  /*
    This variable is the ONLY total Paystack
    should use.
  */

  window.neatCheckoutKES =
    cartBaseTotalKES;


  /* =====================================================
     DISPLAY TOTAL
  ===================================================== */

  const displayTotal =
    await formatDisplayPrice(
      cartBaseTotalKES
    );


  if (currencyElement) {

    currencyElement.textContent =
      displayTotal.currency;

  }


  combinedPriceElement.textContent =
    displayTotal.amount;


  combinedPriceElement.dataset.kesTotal =
    String(
      cartBaseTotalKES
    );


  /* =====================================================
     KES PAYMENT NOTICE
  ===================================================== */

  if (kesNote) {

    if (
      displayTotal.currency !==
      'KES'
    ) {

      kesNote.style.display =
        'block';


      kesNote.textContent =
        `Payment processed as KSh ${cartBaseTotalKES.toLocaleString()} KES. Your bank/card provider may determine the final conversion rate.`;

    } else {

      kesNote.style.display =
        'none';

      kesNote.textContent =
        '';

    }

  }

}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
  'DOMContentLoaded',
  async () => {

    await renderCartFromLocalStorage();

  }
);


/* =========================================================
   DISCOUNTS
========================================================= */

const discountCodes = {

  GARMS15: 15,

  FREESHIP: 0,

  BIGSALE: 10

};


/* =========================================================
   TOAST
========================================================= */

function showFuturisticAlert(
  message,
  type = 'success'
) {

  let container =
    document.getElementById(
      'toast-container'
    );


  if (!container) {

    container =
      document.createElement(
        'div'
      );

    container.id =
      'toast-container';


    document.body.appendChild(
      container
    );

  }


  const toast =
    document.createElement(
      'div'
    );


  toast.className =
    `toast ${type}`;


  toast.textContent =
    message;


  container.appendChild(
    toast
  );


  setTimeout(
    () => {

      toast.classList.add(
        'show'
      );

    },
    10
  );


  setTimeout(
    () => {

      toast.classList.remove(
        'show'
      );


      setTimeout(
        () => toast.remove(),
        500
      );

    },
    4000
  );

}


/* =========================================================
   APPLY DISCOUNT
========================================================= */

document
  .getElementById(
    'apply-discount-btn'
  )
  ?.addEventListener(
    'click',
    async () => {

      const discountInput =
        document
          .getElementById(
            'discount-code'
          )
          ?.value
          .trim()
          .toUpperCase() || '';


      const discountValue =
        discountCodes[
          discountInput
        ];


      if (
        discountValue ===
        undefined
      ) {

        showFuturisticAlert(
          'Invalid discount code. Please try again.',
          'error'
        );

        return;

      }


      cartDiscountPercent =
        discountValue;


      await renderCartFromLocalStorage();


      showFuturisticAlert(
        `Discount code applied! You saved ${discountValue}%.`
      );

    }
  );


/* =========================================================
   PAYMENT METHOD
========================================================= */

const paymentMethods =
  document.querySelectorAll(
    '.payment-method'
  );


paymentMethods.forEach(
  method => {

    method.addEventListener(
      'click',
      () => {

        paymentMethods.forEach(
          item => {

            item.classList.remove(
              'selected'
            );

          }
        );


        method.classList.add(
          'selected'
        );

      }
    );

  }
);


/* =========================================================
   BILLING ADDRESS
========================================================= */

const sameAsShippingRadio =
  document.getElementById(
    'same-as-shipping'
  );

const differentBillingRadio =
  document.getElementById(
    'different-billing'
  );

const sameAddressContainer =
  document.getElementById(
    'same-address-container'
  );

const differentAddressContainer =
  document.getElementById(
    'different-address-container'
  );


sameAsShippingRadio
  ?.addEventListener(
    'change',
    function () {

      if (!this.checked) {
        return;
      }


      if (
        sameAddressContainer
      ) {

        sameAddressContainer
          .style.display =
          'block';

      }


      if (
        differentAddressContainer
      ) {

        differentAddressContainer
          .style.display =
          'none';

      }

    }
  );


differentBillingRadio
  ?.addEventListener(
    'change',
    function () {

      if (!this.checked) {
        return;
      }


      if (
        sameAddressContainer
      ) {

        sameAddressContainer
          .style.display =
          'none';

      }


      if (
        differentAddressContainer
      ) {

        differentAddressContainer
          .style.display =
          'block';

      }

    }
  );


/* =========================================================
   UTILITY
========================================================= */

function capitalizeFirstLetter(
  string
) {

  return (
    string
      .charAt(0)
      .toUpperCase() +
    string.slice(1)
  );

}


function goBack() {

  history.back();

}


window.goBack =
  goBack;