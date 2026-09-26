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


/* =========================================================
   NEATGARMS / SHOOTING STAR CURSOR
   ========================================================= */

/*
  Only enable custom cursor on devices
  with a real mouse / fine pointer.
*/

const finePointer =
  window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;


const neatCursor =
  document.getElementById(
    "neatCursor"
  );


if (
  neatCursor &&
  finePointer
) {

  /* -------------------------------------------------------
     POSITION
     ------------------------------------------------------- */

  let cursorX =
    window.innerWidth * 0.5;

  let cursorY =
    window.innerHeight * 0.5;


  let targetCursorX =
    cursorX;

  let targetCursorY =
    cursorY;


  /* -------------------------------------------------------
     SCALE
     ------------------------------------------------------- */

  let cursorScale = 1;

  let targetCursorScale = 1;


  /* -------------------------------------------------------
     DIRECTION / ROTATION
     ------------------------------------------------------- */

  let cursorRotation = 0;

  let targetCursorRotation = 0;


  /* -------------------------------------------------------
     SPEED / TAIL
     ------------------------------------------------------- */

  let tailScale = 0.65;

  let targetTailScale = 0.65;


  let lastPointerX = cursorX;
  let lastPointerY = cursorY;


  let cursorVisible = false;


  /* -------------------------------------------------------
     POINTER MOVEMENT
     ------------------------------------------------------- */

  window.addEventListener(
    "pointermove",
    event => {

      const newX =
        event.clientX;

      const newY =
        event.clientY;


      /*
        Calculate direction of travel.
      */

      const deltaX =
        newX - lastPointerX;

      const deltaY =
        newY - lastPointerY;


      /*
        Calculate mouse speed.
      */

      const speed =
        Math.sqrt(
          deltaX * deltaX +
          deltaY * deltaY
        );


      /*
        Only update direction when there
        is meaningful movement.

        This prevents tiny mouse movements
        from making the star jitter.
      */

      if (speed > 1.5) {

        targetCursorRotation =
          Math.atan2(
            deltaY,
            deltaX
          ) *
          (180 / Math.PI);

      }


      /*
        Tail grows as mouse moves faster.
      */

      targetTailScale =
        Math.min(
          1.65,
          Math.max(
            0.55,
            0.55 + speed * 0.035
          )
        );


      targetCursorX = newX;
      targetCursorY = newY;


      lastPointerX = newX;
      lastPointerY = newY;


      /*
        First movement:
        immediately position cursor so it
        doesn't fly in from the centre.
      */

      if (!cursorVisible) {

        cursorX =
          targetCursorX;

        cursorY =
          targetCursorY;

        cursorVisible = true;

        neatCursor.style.opacity =
          "1";

      }

    },
    {
      passive: true
    }
  );


  /* -------------------------------------------------------
     LEAVE / RETURN
     ------------------------------------------------------- */

  document.addEventListener(
    "mouseleave",
    () => {

      neatCursor.style.opacity =
        "0";

    }
  );


  document.addEventListener(
    "mouseenter",
    () => {

      if (cursorVisible) {

        neatCursor.style.opacity =
          "1";

      }

    }
  );


  /* -------------------------------------------------------
     INTERACTIVE ELEMENTS
     ------------------------------------------------------- */

  const interactiveSelector =
    [
      "a",
      "button",
      "input",
      "label",
      ".object-zone",
      "[role='button']"
    ].join(",");


  document.addEventListener(
    "pointerover",
    event => {

      const interactive =
        event.target.closest?.(
          interactiveSelector
        );


      if (!interactive) {
        return;
      }


      neatCursor.classList.add(
        "is-interactive"
      );


      /*
        Slight enlargement over links/buttons.
      */

      targetCursorScale =
        1.18;


      /*
        Slightly longer tail.
      */

      targetTailScale =
        Math.max(
          targetTailScale,
          1
        );

    }
  );


  document.addEventListener(
    "pointerout",
    event => {

      const interactive =
        event.target.closest?.(
          interactiveSelector
        );


      if (!interactive) {
        return;
      }


      /*
        Don't trigger when moving between
        children of the same element.
      */

      if (
        event.relatedTarget &&
        interactive.contains(
          event.relatedTarget
        )
      ) {

        return;

      }


      neatCursor.classList.remove(
        "is-interactive"
      );


      targetCursorScale =
        1;

    }
  );


  /* -------------------------------------------------------
     CLICK
     ------------------------------------------------------- */

  window.addEventListener(
    "pointerdown",
    () => {

      targetCursorScale =
        0.72;

      targetTailScale =
        0.45;

    }
  );


  window.addEventListener(
    "pointerup",
    event => {

      const interactive =
        event.target.closest?.(
          interactiveSelector
        );


      targetCursorScale =
        interactive
          ? 1.18
          : 1;


      targetTailScale =
        0.7;

    }
  );


  /* -------------------------------------------------------
     ANIMATION LOOP
     ------------------------------------------------------- */

  function updateNeatCursor() {

    /*
      Smooth follow.
    */

    cursorX +=
      (
        targetCursorX -
        cursorX
      ) * 0.28;


    cursorY +=
      (
        targetCursorY -
        cursorY
      ) * 0.28;


    /*
      Smooth scale.
    */

    cursorScale +=
      (
        targetCursorScale -
        cursorScale
      ) * 0.16;


    /*
      Smooth rotation.

      This calculation uses the shortest
      rotational path so the star doesn't
      randomly spin 300+ degrees.
    */

    let rotationDifference =
      targetCursorRotation -
      cursorRotation;


    rotationDifference =
      (
        (
          rotationDifference + 180
        ) % 360 +
        360
      ) % 360 -
      180;


    cursorRotation +=
      rotationDifference * 0.18;


    /*
      Tail gradually returns to normal
      even after mouse movement stops.
    */

    targetTailScale +=
      (
        0.62 -
        targetTailScale
      ) * 0.035;


    tailScale +=
      (
        targetTailScale -
        tailScale
      ) * 0.18;


    /*
      Position + direction.
    */

    neatCursor.style.left =
      `${cursorX}px`;


    neatCursor.style.top =
      `${cursorY}px`;


    neatCursor.style.transform =
      `
        translate3d(
          -50%,
          -50%,
          0
        )
        rotate(${cursorRotation}deg)
        scale(${cursorScale})
      `;


    /*
      Send tail length to CSS.
    */

    neatCursor.style.setProperty(
      "--tail-scale",
      tailScale
    );


    requestAnimationFrame(
      updateNeatCursor
    );

  }


  requestAnimationFrame(
    updateNeatCursor
  );

}