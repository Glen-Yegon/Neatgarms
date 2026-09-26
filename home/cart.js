/* =========================================================
   NEATGARMS — CART
========================================================= */

document.addEventListener(
  'DOMContentLoaded',
  () => {


    /* =====================================================
       ELEMENTS
    ====================================================== */

    const cartItemsContainer =
      document.getElementById(
        'cart-items'
      );


    const closeButton =
      document.getElementById(
        'close-btn'
      );


    const buyNowButton =
      document.getElementById(
        'buy-now-btn'
      );


    const combinedPriceElement =
      document.getElementById(
        'combined-price'
      );


    const navCount =
      document.getElementById(
        'cart-nav-count'
      );


    const objectCount =
      document.getElementById(
        'cart-object-count'
      );


    const summaryItemCount =
      document.getElementById(
        'summary-item-count'
      );



    /* =====================================================
       CART
    ====================================================== */

    let cart =
      JSON.parse(
        localStorage.getItem('cart')
      ) || [];



    /* =====================================================
       HELPERS
    ====================================================== */

    const parsePrice = value => {

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
            ''
          )
          .trim();


      return (
        parseFloat(cleaned) ||
        0
      );

    };



    const formatPrice = value => {

      return new Intl.NumberFormat(
        'en-KE',
        {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }
      ).format(value);

    };



    const escapeHTML = value => {

      const div =
        document.createElement('div');


      div.textContent =
        value ?? '';


      return div.innerHTML;

    };



    const saveCart = () => {

      localStorage.setItem(
        'cart',
        JSON.stringify(cart)
      );

    };



    /* =====================================================
       TOTAL QUANTITY
    ====================================================== */

    const getTotalQuantity = () => {

      return cart.reduce(
        (total, item) => {

          const quantity =
            parseInt(
              item.quantity,
              10
            ) || 1;


          return (
            total + quantity
          );

        },
        0
      );

    };



    /* =====================================================
       UPDATE COUNTERS
    ====================================================== */

    const updateCounters = () => {

      const totalQuantity =
        getTotalQuantity();


      if (navCount) {

        navCount.textContent =
          totalQuantity;

      }


      if (summaryItemCount) {

        summaryItemCount.textContent =
          totalQuantity;

      }


      if (objectCount) {

        objectCount.textContent =
          `${String(totalQuantity)
            .padStart(2, '0')} ${
              totalQuantity === 1
                ? 'OBJECT'
                : 'OBJECTS'
            }`;

      }

    };



    /* =====================================================
       EMPTY CART
    ====================================================== */

    const renderEmptyCart = () => {

      cartItemsContainer.innerHTML = `

        <div class="empty-cart">

          <span class="empty-cart__index">
            00 / EMPTY
          </span>


          <h2>
            NOTHING<br>
            IN THE BAG.
          </h2>


          <p>
            YOUR SELECTION IS CURRENTLY EMPTY.
            RETURN TO THE INDEX TO EXPLORE
            THE CURRENT RELEASE.
          </p>


          <a href="main.html">

            <span>
              EXPLORE THE INDEX
            </span>

            <span>
              ↗
            </span>

          </a>

        </div>

      `;


      combinedPriceElement.textContent =
        '0';


      buyNowButton.disabled = true;

    };



    /* =====================================================
       PRODUCT TEMPLATE
    ====================================================== */

const createProductCard = async (
  item,
  index
) => {


      const quantity =
        Math.max(
          1,
          parseInt(
            item.quantity,
            10
          ) || 1
        );


      const unitPrice =
        parsePrice(
          item.newPrice
        );


      const totalPrice =
        unitPrice * quantity;

        const convertedUnitPrice =
  await window.NeatCurrency.formatKES(
    unitPrice,
    {
      codeOnly: true
    }
  );


const convertedTotalPrice =
  await window.NeatCurrency.formatKES(
    totalPrice,
    {
      codeOnly: true
    }
  );


      const brand =
        escapeHTML(
          item.brand ||
          'NEATGARMS'
        );


      const name =
        escapeHTML(
          item.name ||
          'NEAT OBJECT'
        );


      const size =
        item.size
          ? escapeHTML(item.size)
          : '—';


      const color =
        item.color
          ? escapeHTML(item.color)
          : '—';


      const image =
        escapeHTML(
          item.image || ''
        );


      const itemNumber =
        String(index + 1)
          .padStart(2, '0');


      const card =
        document.createElement(
          'article'
        );


      card.className =
        'product-card';


      card.dataset.index =
        index;


      card.innerHTML = `

        <!-- =========================================
             IMAGE
        ========================================== -->

        <div class="cart-product__visual">

          <img
            src="${image}"
            alt="${name}"
          >

          <span class="cart-product__number">
            ${itemNumber}
          </span>

        </div>



        <!-- =========================================
             CONTENT
        ========================================== -->

        <div class="cart-product__content">


          <div class="cart-product__top">

            <div>

              <span class="cart-product__release">
                ${brand} / CURRENT RELEASE
              </span>

              <h2 class="cart-product__name">
                ${name}
              </h2>

            </div>


            <button
              type="button"
              class="remove-btn"
              data-index="${index}"
              aria-label="Remove ${name} from bag"
            >
              REMOVE
            </button>

          </div>



          <!-- =====================================
               ATTRIBUTES
          ====================================== -->

          <div class="cart-product__attributes">


            <div class="cart-attribute">

              <span class="cart-attribute__label">
                SIZE
              </span>

              <span class="cart-attribute__value">
                ${size}
              </span>

            </div>



            <div class="cart-attribute">

              <span class="cart-attribute__label">
                COLOUR
              </span>


              <span class="cart-attribute__value">

                ${
                  item.color
                    ? `
                      <i
                        class="cart-color-dot"
                        style="background-color:${color}"
                        aria-hidden="true"
                      ></i>
                    `
                    : ''
                }

                ${color}

              </span>

            </div>

          </div>



          <!-- =====================================
               BOTTOM
          ====================================== -->

          <div class="cart-product__bottom">


            <!-- QUANTITY -->

            <div
              class="cart-quantity"
              aria-label="Quantity"
            >

              <button
                type="button"
                class="quantity-decrease"
                data-index="${index}"
                aria-label="Decrease quantity"
              >
                −
              </button>


              <span class="cart-quantity__value">
                ${quantity}
              </span>


              <button
                type="button"
                class="quantity-increase"
                data-index="${index}"
                aria-label="Increase quantity"
              >
                +
              </button>

            </div>



            <!-- PRICE -->

            <div class="cart-product__price">

              <span class="cart-product__price-label">
                ${
                  quantity > 1
                    ? `${quantity} × ${convertedUnitPrice.amount}`
                    : 'PRICE'
                }
              </span>


<div class="cart-product__price-value">

  <small>
    ${convertedTotalPrice.currency}
  </small>

  <strong>
    ${convertedTotalPrice.amount}
  </strong>

</div>

            </div>

          </div>

        </div>

      `;


      return {
        card,
        totalPrice
      };

    };



    /* =====================================================
       RENDER CART
    ====================================================== */

const renderCart = async () => {


      cartItemsContainer.innerHTML =
        '';


      updateCounters();


      if (
        cart.length === 0
      ) {

        renderEmptyCart();

        return;

      }


      buyNowButton.disabled =
        false;


      let combinedPrice = 0;


for (
  let index = 0;
  index < cart.length;
  index++
) {

  const item =
    cart[index];


  const {
    card,
    totalPrice
  } =
    await createProductCard(
      item,
      index
    );


  combinedPrice +=
    totalPrice;


  cartItemsContainer
    .appendChild(card);

}


const convertedCombinedPrice =
  await window.NeatCurrency.formatKES(
    combinedPrice,
    {
      codeOnly: true
    }
  );


combinedPriceElement.textContent =
  convertedCombinedPrice.amount;


const currencyLabels =
  document.querySelectorAll(
    "[data-currency-code]"
  );


currencyLabels.forEach(
  label => {

    label.textContent =
      convertedCombinedPrice.currency;

  }
);

    };



    /* =====================================================
       CART ACTIONS
    ====================================================== */

    cartItemsContainer.addEventListener(
      'click',
      event => {


        const removeButton =
          event.target.closest(
            '.remove-btn'
          );


        const increaseButton =
          event.target.closest(
            '.quantity-increase'
          );


        const decreaseButton =
          event.target.closest(
            '.quantity-decrease'
          );



        /* ===============================================
           REMOVE
        ================================================ */

        if (removeButton) {

          const index =
            Number(
              removeButton.dataset.index
            );


          if (
            Number.isNaN(index) ||
            !cart[index]
          ) {
            return;
          }


          cart.splice(
            index,
            1
          );


          saveCart();

          renderCart();

          return;

        }



        /* ===============================================
           INCREASE
        ================================================ */

        if (increaseButton) {

          const index =
            Number(
              increaseButton.dataset.index
            );


          if (!cart[index]) {
            return;
          }


          const currentQuantity =
            parseInt(
              cart[index].quantity,
              10
            ) || 1;


          cart[index].quantity =
            currentQuantity + 1;


          saveCart();

          renderCart();

          return;

        }



        /* ===============================================
           DECREASE
        ================================================ */

        if (decreaseButton) {

          const index =
            Number(
              decreaseButton.dataset.index
            );


          if (!cart[index]) {
            return;
          }


          const currentQuantity =
            parseInt(
              cart[index].quantity,
              10
            ) || 1;


          /*
            If quantity is already 1,
            remove the object.
          */

          if (
            currentQuantity <= 1
          ) {

            cart.splice(
              index,
              1
            );

          } else {

            cart[index].quantity =
              currentQuantity - 1;

          }


          saveCart();

          renderCart();

        }

      }
    );



    /* =====================================================
       BACK
    ====================================================== */

    closeButton?.addEventListener(
      'click',
      () => {

        if (
          window.history.length > 1
        ) {

          window.history.back();

        } else {

          window.location.href =
            'main.html';

        }

      }
    );



    /* =====================================================
       CHECKOUT
    ====================================================== */

    buyNowButton?.addEventListener(
      'click',
      () => {


        if (
          cart.length === 0
        ) {
          return;
        }


        /*
          Keep compatibility with
          your existing checkout.
        */

        localStorage.setItem(
          'cartItems',
          JSON.stringify(cart)
        );


        window.location.href =
          'buy.html';

      }
    );



    /* =====================================================
       INITIAL RENDER
    ====================================================== */

    renderCart();


  }
);


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