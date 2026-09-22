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

    const createProductCard = (
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
                    ? `${quantity} × ${formatPrice(unitPrice)}`
                    : 'PRICE'
                }
              </span>


              <div class="cart-product__price-value">

                <small>
                  KES
                </small>

                <strong>
                  ${formatPrice(totalPrice)}
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

    const renderCart = () => {


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


      cart.forEach(
        (item, index) => {

          const {
            card,
            totalPrice
          } =
            createProductCard(
              item,
              index
            );


          combinedPrice +=
            totalPrice;


          cartItemsContainer
            .appendChild(card);

        }
      );


      combinedPriceElement.textContent =
        formatPrice(
          combinedPrice
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