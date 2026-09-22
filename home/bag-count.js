/* =========================================================
   NEATGARMS — GLOBAL BAG COUNT
========================================================= */

(() => {

  /* =====================================================
     GET CART
  ====================================================== */

  const getCart = () => {

    try {

      const cart = JSON.parse(
        localStorage.getItem('cart')
      );

      return Array.isArray(cart)
        ? cart
        : [];

    } catch (error) {

      console.error(
        'Unable to read cart:',
        error
      );

      return [];

    }

  };


  /* =====================================================
     GET TOTAL QUANTITY
  ====================================================== */

  const getCartQuantity = () => {

    const cart = getCart();

    return cart.reduce(
      (total, item) => {

        const quantity =
          parseInt(
            item.quantity,
            10
          ) || 1;

        return total + Math.max(
          quantity,
          1
        );

      },
      0
    );

  };


  /* =====================================================
     UPDATE BAG COUNTS
  ====================================================== */

  const updateBagCount = () => {

    const quantity =
      getCartQuantity();


    /* ===============================================
       HOMEPAGE
       Example: (3)
    ================================================ */

    document
      .querySelectorAll('.bag-count')
      .forEach(counter => {

        counter.textContent =
          `(${quantity})`;

      });


    /* ===============================================
       SHOP PAGE
       Example: 3
    ================================================ */

    document
      .querySelectorAll(
        '.shop-nav__bag-count'
      )
      .forEach(counter => {

        counter.textContent =
          quantity;

      });


    /* ===============================================
       PRODUCT PAGE
       Example: 3
    ================================================ */

    document
      .querySelectorAll(
        '.product-nav__bag-count'
      )
      .forEach(counter => {

        counter.textContent =
          quantity;

      });


    /* ===============================================
       CART PAGE
       Example: 3
    ================================================ */

    document
      .querySelectorAll(
        '.cart-nav__bag-count'
      )
      .forEach(counter => {

        counter.textContent =
          quantity;

      });

  };


  /* =====================================================
     INITIAL LOAD
  ====================================================== */

  if (
    document.readyState === 'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      updateBagCount
    );

  } else {

    updateBagCount();

  }


  /* =====================================================
     PAGE RESTORED FROM BACK/FORWARD CACHE
  ====================================================== */

  window.addEventListener(
    'pageshow',
    updateBagCount
  );


  /* =====================================================
     CART CHANGED IN ANOTHER TAB
  ====================================================== */

  window.addEventListener(
    'storage',
    event => {

      if (event.key === 'cart') {

        updateBagCount();

      }

    }
  );


  /* =====================================================
     GLOBAL ACCESS

     Allows product.js / cart.js to manually refresh
     the number immediately after changing the cart.
  ====================================================== */

  window.updateNeatBagCount =
    updateBagCount;

})();