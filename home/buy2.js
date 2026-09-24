/* =========================================================
   NEATGARMS — BUY NOW CHECKOUT
   DISPLAY CURRENCY + KES PAYMENT BASE
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
   CHECKOUT STATE
========================================================= */

let buyNowBaseTotalKES = 0;
let buyNowDiscountPercent = 0;


/* =========================================================
   GET PRODUCT
========================================================= */

function getBuyNowProduct() {

  try {

    return JSON.parse(
      localStorage.getItem(
        'buyNowProduct'
      )
    );

  } catch (error) {

    console.error(
      'Could not read buyNowProduct:',
      error
    );

    return null;

  }

}


/* =========================================================
   GET ORIGINAL KES PRICE
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
   SHIPPING

   IMPORTANT:
   Shipping is still interpreted as KES.
========================================================= */

function getShippingKES() {

  const shippingFeeElement =
    document.getElementById(
      'shipping-fee'
    );


  if (!shippingFeeElement) {
    return 0;
  }


  return getKESPrice(
    shippingFeeElement.textContent
  );

}


/* =========================================================
   FORMAT DISPLAY CURRENCY
========================================================= */

async function formatDisplayPrice(
  kesAmount
) {

  if (
    !window.NeatCurrency
  ) {

    return {
      currency: 'KES',
      symbol: 'KSh',
      amount:
        Number(kesAmount)
          .toLocaleString(
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


  return await window.NeatCurrency
    .formatKES(kesAmount);

}


/* =========================================================
   CALCULATE CURRENT KES TOTAL
========================================================= */

function calculateBuyNowTotalKES() {

  const product =
    getBuyNowProduct();


  if (!product) {
    return 0;
  }


  const unitPriceKES =
    getKESPrice(
      product.newPrice
    );


  const quantity =
    parseInt(
      product.quantity
    ) || 1;


  const subtotalKES =
    unitPriceKES *
    quantity;


  const discountAmount =
    subtotalKES *
    (
      buyNowDiscountPercent /
      100
    );


  const shippingKES =
    getShippingKES();


  return (
    subtotalKES -
    discountAmount +
    shippingKES
  );

}


/* =========================================================
   RENDER PRODUCT
========================================================= */

async function renderProductWithShipping() {

  const productCardSection =
    document.getElementById(
      'product-card-section'
    );


  if (!productCardSection) {
    return;
  }


  const product =
    getBuyNowProduct();


  if (!product) {

    productCardSection.innerHTML =
      `
        <p>
          No product found.
          Please go back and select a product.
        </p>
      `;

    return;

  }


  /* -----------------------------------------
     ORIGINAL KES VALUES
  ----------------------------------------- */

  const unitPriceKES =
    getKESPrice(
      product.newPrice
    );


  const quantity =
    parseInt(
      product.quantity
    ) || 1;


  const subtotalKES =
    unitPriceKES *
    quantity;


  const shippingKES =
    getShippingKES();


  const discountKES =
    subtotalKES *
    (
      buyNowDiscountPercent /
      100
    );


  buyNowBaseTotalKES =
    subtotalKES -
    discountKES +
    shippingKES;


  /*
    Save payment total separately.

    This is ALWAYS KES.
  */

  window.neatCheckoutKES =
    buyNowBaseTotalKES;


  /* -----------------------------------------
     CONVERT FOR DISPLAY ONLY
  ----------------------------------------- */

  const displayUnitPrice =
    await formatDisplayPrice(
      unitPriceKES
    );


  const displaySubtotal =
    await formatDisplayPrice(
      subtotalKES
    );


  const displayFinalTotal =
    await formatDisplayPrice(
      buyNowBaseTotalKES
    );


  /* -----------------------------------------
     SIZE / COLOR
  ----------------------------------------- */

  const sizeLine =
    product.size
      ? `
          <p>
            <strong>Size</strong>
            <span>
              ${product.size}
            </span>
          </p>
        `
      : '';


  const colorLine =
    product.color
      ? `
          <p>
            <strong>Color</strong>
            <span>
              ${product.color}
            </span>
          </p>
        `
      : '';


  /* -----------------------------------------
     PRODUCT CARD
  ----------------------------------------- */

  productCardSection.innerHTML =
    '';


  const productCard =
    document.createElement(
      'div'
    );


  productCard.classList.add(
    'product-card'
  );


  productCard.innerHTML = `

    <div class="product-image">

      <img
        src="${product.image}"
        alt="${product.name}"
      >

    </div>


    <div class="product-details">

      <h4 class="summary-product-name">
        ${product.name}
      </h4>


      ${
        product.brand
          ? `
              <p>
                <strong>
                  Brand
                </strong>

                <span>
                  ${product.brand}
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
          ${displayUnitPrice.formatted}
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


      <p class="summary-product-total">

        <strong>
          Subtotal
        </strong>

        <span>
          ${displaySubtotal.formatted}
        </span>

      </p>

    </div>
  `;


  productCardSection.appendChild(
    productCard
  );


  /* =====================================================
     ESTIMATED TOTAL
  ===================================================== */

  const estimatedTotalSection =
    document.querySelector(
      '.estimated-total'
    );


  if (estimatedTotalSection) {

    estimatedTotalSection.innerHTML = `

      <h3>

        Estimated Total:

        <span
          id="combined-price"
          data-kes-total="${buyNowBaseTotalKES}"
        >
          ${displayFinalTotal.formatted}
        </span>

      </h3>

      ${
        displayFinalTotal.currency !==
        'KES'
          ? `
              <small
                class="checkout-kes-note"
              >
                Payment processed as
                KSh ${buyNowBaseTotalKES.toLocaleString()}
                KES.
              </small>
            `
          : ''
      }

    `;

  }

}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
  'DOMContentLoaded',
  async () => {

    await renderProductWithShipping();


    const shippingFeeElement =
      document.getElementById(
        'shipping-fee'
      );


    if (shippingFeeElement) {

      const observer =
        new MutationObserver(
          async () => {

            await renderProductWithShipping();

          }
        );


      observer.observe(
        shippingFeeElement,
        {
          characterData: true,
          childList: true,
          subtree: true
        }
      );

    }

  }
);


/* =========================================================
   DISCOUNT CODES
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


      buyNowDiscountPercent =
        discountValue;


      await renderProductWithShipping();


      showFuturisticAlert(
        `Discount code applied! You saved ${discountValue}%.`
      );

    }
  );


/* =========================================================
   PAYMENT METHOD SELECTION
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


/* Make available to inline HTML onclick */
window.goBack =
  goBack;