// product.js
import { productsData } from './partials/productsData.js';


/* =========================================================
   CURRENT PRODUCT — GLOBAL TO THIS MODULE
========================================================= */

const currentParams =
  new URLSearchParams(
    window.location.search
  );

const currentProductId =
  currentParams.get("id");

const currentProductData =
  currentProductId
    ? productsData[currentProductId]
    : null;


/* =========================================================
   PRODUCT INITIALIZATION
========================================================= */

document.addEventListener(
  'DOMContentLoaded',
  () => {

    const params =
      new URLSearchParams(
        window.location.search
      );

    const productId =
      params.get("id");


    if (
      !productId ||
      !productsData[productId]
    ) {

      console.error(
        "Product not found:",
        productId
      );

      return;

    }


    const productData =
      productsData[productId];


    /* =====================================================
       MAIN PRODUCT IMAGE
    ===================================================== */

    const mainImage =
      document.getElementById(
        'main-image'
      );

    let currentImageIndex = 0;


    if (
      mainImage &&
      productData.images?.length
    ) {

      mainImage.src =
        productData.images[
          currentImageIndex
        ];

    }


    /* =====================================================
       IMAGE NAVIGATION
    ===================================================== */

    const nextImage =
      document.getElementById(
        'next-image'
      );

    const prevImage =
      document.getElementById(
        'prev-image'
      );


    nextImage?.addEventListener(
      'click',
      () => {

        currentImageIndex =
          (
            currentImageIndex + 1
          ) %
          productData.images.length;


        mainImage.src =
          productData.images[
            currentImageIndex
          ];

      }
    );


    prevImage?.addEventListener(
      'click',
      () => {

        currentImageIndex =
          (
            currentImageIndex -
            1 +
            productData.images.length
          ) %
          productData.images.length;


        mainImage.src =
          productData.images[
            currentImageIndex
          ];

      }
    );


    /* =====================================================
       MOBILE SWIPE
    ===================================================== */

    const slider =
      document.querySelector(
        '.image-slider'
      );

    let touchStartX = 0;
    let touchEndX = 0;


    slider?.addEventListener(
      'touchstart',
      e => {

        touchStartX =
          e.changedTouches[0]
            .screenX;

      },
      false
    );


    slider?.addEventListener(
      'touchend',
      e => {

        touchEndX =
          e.changedTouches[0]
            .screenX;

        handleGesture();

      },
      false
    );


    function handleGesture() {

      const swipeThreshold = 30;


      if (
        touchStartX -
        touchEndX >
        swipeThreshold
      ) {

        currentImageIndex =
          (
            currentImageIndex + 1
          ) %
          productData.images.length;


        mainImage.src =
          productData.images[
            currentImageIndex
          ];

      } else if (
        touchEndX -
        touchStartX >
        swipeThreshold
      ) {

        currentImageIndex =
          (
            currentImageIndex -
            1 +
            productData.images.length
          ) %
          productData.images.length;


        mainImage.src =
          productData.images[
            currentImageIndex
          ];

      }

    }


    /* =====================================================
       PRODUCT NAME
    ===================================================== */

    const productNameElement =
      document.getElementById(
        'product-name'
      );


    if (productNameElement) {

      productNameElement.innerText =
        productData.name;

    }


    /* =====================================================
       PRODUCT PRICES
       ORIGINAL VALUE ALWAYS STORED AS KES
    ===================================================== */

    const oldPriceElement =
      document.querySelector(
        '.old-price'
      );

    const newPriceElement =
      document.querySelector(
        '.new-price'
      );


    if (oldPriceElement) {

      oldPriceElement.dataset.kesPrice =
        window.NeatCurrency
          ? window.NeatCurrency
              .parseKESPrice(
                productData.oldPrice
              )
          : productData.oldPrice || "";


      oldPriceElement.innerText =
        productData.oldPrice || "";

    }


    if (newPriceElement) {

      newPriceElement.dataset.kesPrice =
        window.NeatCurrency
          ? window.NeatCurrency
              .parseKESPrice(
                productData.newPrice
              )
          : productData.newPrice || "";


      newPriceElement.innerText =
        productData.newPrice || "";

    }


    /*
      Now visually convert the KES prices
      into the customer's selected currency.
    */

    if (window.NeatCurrency) {

      window.NeatCurrency.refresh();

    }


    /* =====================================================
       SIZES
    ===================================================== */

    const sizeSelection =
      document.querySelector(
        '.size-selection'
      );


    if (
      productData.sizes?.length &&
      sizeSelection
    ) {

      sizeSelection.innerHTML =
        productData.sizes
          .map(size => {

            const soldOut =
              productData.outOfStock
                ?.includes(size);


            return `
              <button
                type="button"
                class="size-btn${
                  soldOut
                    ? ' unavailable'
                    : ''
                }"
                data-size="${size}"
                ${
                  soldOut
                    ? 'aria-disabled="true" data-soldout="true"'
                    : ''
                }
              >
                ${size}
              </button>
            `;

          })
          .join('');


      /* LIVE SIZES */

      sizeSelection
        .querySelectorAll(
          '.size-btn:not(.unavailable)'
        )
        .forEach(button => {

          button.addEventListener(
            'click',
            () => {

              sizeSelection
                .querySelectorAll(
                  '.size-btn'
                )
                .forEach(btn => {

                  btn.classList.remove(
                    'selected'
                  );

                });


              button.classList.add(
                'selected'
              );


              console.log(
                'Selected Size:',
                button.dataset.size
              );

            }
          );

        });


      /* SOLD OUT SIZES */

      sizeSelection
        .querySelectorAll(
          '.size-btn.unavailable'
        )
        .forEach(button => {

          button.addEventListener(
            'click',
            () => {

              alert(
                'Sorry, that size is currently sold out.'
              );

            }
          );

        });

    }


    /* =====================================================
       COLORS
    ===================================================== */

    const colorSelection =
      document.querySelector(
        '.color-selection'
      );


    if (
      productData.colors?.length &&
      colorSelection
    ) {

      colorSelection.innerHTML =
        `<h4>Available Colors:</h4>` +

        productData.colors
          .map(color => {

            return `
              <button
                class="color-btn"
                data-color="${color}"
                style="background-color:${color.toLowerCase()}"
              >
                ${color}
              </button>
            `;

          })
          .join('');


      colorSelection
        .querySelectorAll(
          '.color-btn'
        )
        .forEach(button => {

          button.addEventListener(
            'click',
            () => {

              colorSelection
                .querySelectorAll(
                  '.color-btn'
                )
                .forEach(btn => {

                  btn.classList.remove(
                    'selected'
                  );

                });


              button.classList.add(
                'selected'
              );


              console.log(
                'Selected Color:',
                button.dataset.color
              );

            }
          );

        });

    }


    /* =====================================================
       PRODUCT DESCRIPTION
    ===================================================== */

    const descriptionElement =
      document.getElementById(
        'product-description'
      );


    if (descriptionElement) {

      descriptionElement.innerText =
        productData.description || "";

    }


    const sizeFitElement =
      document.getElementById(
        'size-fit'
      );


    if (sizeFitElement) {

      sizeFitElement.innerText =
        productData.sizeFit || "";

    }


    /* =====================================================
       FEATURES
    ===================================================== */

    const featuresList =
      document.querySelector(
        '#key-features ul'
      );


    if (
      featuresList &&
      Array.isArray(
        productData.features
      )
    ) {

      featuresList.innerHTML = "";


      productData.features
        .forEach(feature => {

          const li =
            document.createElement(
              'li'
            );

          li.textContent =
            feature;

          featuresList.appendChild(
            li
          );

        });

    }


    /* =====================================================
       PRODUCT STATUS
    ===================================================== */

    const productStatus =
      document.getElementById(
        'product-status'
      );


    if (productStatus) {

      productStatus.textContent =
        "In Stock";

    }


    /* =====================================================
       BACK BUTTON
    ===================================================== */

    document
      .getElementById(
        'back-button'
      )
      ?.addEventListener(
        'click',
        () => {

          window.history.back();

        }
      );


    /* =====================================================
       DROPDOWNS
    ===================================================== */

    document
      .querySelectorAll(
        '.toggle-btn'
      )
      .forEach(button => {

        button.addEventListener(
          'click',
          () => {

            const content =
              button.nextElementSibling;


            button.classList.toggle(
              'active'
            );


            if (content) {

              content.style.display =
                content.style.display ===
                'block'
                  ? 'none'
                  : 'block';

            }

          }
        );

      });

  }
);


/* =========================================================
   QUANTITY
========================================================= */

document.addEventListener(
  'DOMContentLoaded',
  () => {

    const quantityInput =
      document.getElementById(
        'quantity'
      );


    const increaseButton =
      document.getElementById(
        'increase-quantity'
      );


    const decreaseButton =
      document.getElementById(
        'decrease-quantity'
      );


    increaseButton?.addEventListener(
      'click',
      () => {

        if (!quantityInput) return;


        quantityInput.value =
          parseInt(
            quantityInput.value
          ) + 1;

      }
    );


    decreaseButton?.addEventListener(
      'click',
      () => {

        if (!quantityInput) return;


        if (
          parseInt(
            quantityInput.value
          ) > 1
        ) {

          quantityInput.value =
            parseInt(
              quantityInput.value
            ) - 1;

        }

      }
    );

  }
);


/* =========================================================
   VALIDATE SIZE / COLOR
========================================================= */

function validateSelections() {

  const selectedSize =
    document.querySelector(
      '.size-btn.selected'
    );

  const selectedColor =
    document.querySelector(
      '.color-btn.selected'
    );


  const sizeBtn =
    document.querySelector(
      '.size-btn'
    );

  const colorBtn =
    document.querySelector(
      '.color-btn'
    );


  const sizeExists =
    sizeBtn &&
    sizeBtn.offsetParent !== null;


  const colorExists =
    colorBtn &&
    colorBtn.offsetParent !== null;


  if (
    sizeExists &&
    !selectedSize
  ) {

    alert(
      "Please select a size before proceeding."
    );

    return false;

  }


  if (
    colorExists &&
    !selectedColor
  ) {

    alert(
      "Please select a color before proceeding."
    );

    return false;

  }


  return true;

}


/* =========================================================
   ADD TO BAG
========================================================= */

document.addEventListener(
  'DOMContentLoaded',
  () => {

    const addToCartButton =
      document.getElementById(
        'add-to-cart'
      );


    addToCartButton?.addEventListener(
      'click',
      () => {

        if (
          !validateSelections()
        ) {
          return;
        }


        if (
          !currentProductData
        ) {

          console.error(
            "Current product data unavailable."
          );

          return;

        }


        /* -----------------------------------------
           DISPLAY INFORMATION
        ----------------------------------------- */

        const productImage =
          document.getElementById(
            'main-image'
          )?.src || "";


        const productBrand =
          document.getElementById(
            'product-brand'
          )?.innerText || "";


        const productName =
          currentProductData.name;


        /* -----------------------------------------
           CRITICAL:
           ALWAYS STORE ORIGINAL KES PRICES

           Never use .new-price.innerText here
           because that may currently be USD,
           GBP, EUR, etc.
        ----------------------------------------- */

        const oldPrice =
          currentProductData.oldPrice ||
          null;


        const newPrice =
          currentProductData.newPrice ||
          null;


        /* -----------------------------------------
           OPTIONS
        ----------------------------------------- */

        const selectedSize =
          document.querySelector(
            '.size-btn.selected'
          )?.dataset.size || null;


        const selectedColor =
          document.querySelector(
            '.color-btn.selected'
          )?.dataset.color || null;


        const quantity =
          parseInt(
            document.getElementById(
              'quantity'
            )?.value
          ) || 1;


        /* -----------------------------------------
           CART ITEM
        ----------------------------------------- */

        const cartItem = {

          image:
            productImage,

          brand:
            productBrand,

          name:
            productName,

          oldPrice:
            oldPrice,

          newPrice:
            newPrice,

          size:
            selectedSize,

          color:
            selectedColor,

          quantity:
            quantity

        };


        /* -----------------------------------------
           EXISTING CART
        ----------------------------------------- */

        const cart =
          JSON.parse(
            localStorage.getItem(
              'cart'
            )
          ) || [];


        cart.push(
          cartItem
        );


        /* -----------------------------------------
           SAVE
        ----------------------------------------- */

        localStorage.setItem(
          'cart',
          JSON.stringify(cart)
        );


        /* -----------------------------------------
           UPDATE BAG COUNT
        ----------------------------------------- */

        if (
          window.updateNeatBagCount
        ) {

          window.updateNeatBagCount();

        }


        /* -----------------------------------------
           GO TO CART
        ----------------------------------------- */

        window.location.href =
          'cart.html';

      }
    );

  }
);


/* =========================================================
   BUY NOW
========================================================= */

document.addEventListener(
  'DOMContentLoaded',
  () => {

    const buyNowButton =
      document.getElementById(
        'buy-now'
      );


    buyNowButton?.addEventListener(
      'click',
      () => {

        if (
          !validateSelections()
        ) {
          return;
        }


        if (
          !currentProductData
        ) {

          console.error(
            "Current product data unavailable."
          );

          return;

        }


        const mainImage =
          document.getElementById(
            'main-image'
          )?.src || "";


        const productBrand =
          document.getElementById(
            'product-brand'
          )?.textContent?.trim() ||
          'Unknown Brand';


        /*
          Use original product data,
          NOT the converted DOM values.
        */

        const productName =
          currentProductData.name;


        const oldPrice =
          currentProductData.oldPrice ||
          'N/A';


        const newPrice =
          currentProductData.newPrice ||
          'N/A';


        const selectedSize =
          document.querySelector(
            '.size-btn.selected'
          )?.dataset.size || null;


        const selectedColor =
          document.querySelector(
            '.color-btn.selected'
          )?.dataset.color || null;


        const quantity =
          parseInt(
            document.getElementById(
              'quantity'
            )?.value
          ) || 1;


        const product = {

          image:
            mainImage,

          brand:
            productBrand,

          name:
            productName,

          quantity:
            quantity,

          oldPrice:
            oldPrice,

          newPrice:
            newPrice,

          size:
            selectedSize,

          color:
            selectedColor

        };


        localStorage.setItem(
          'buyNowProduct',
          JSON.stringify(product)
        );


        window.location.href =
          'buy2.html';

      }
    );

  }
);


/* =========================================================
   SHARE PRODUCT
========================================================= */

document.addEventListener(
  'DOMContentLoaded',
  () => {

    const shareButton =
      document.getElementById(
        'share-btn'
      );


    shareButton?.addEventListener(
      'click',
      async () => {

        const productBrand =
          document.getElementById(
            'product-brand'
          )?.textContent ||
          'Unknown Brand';


        const productName =
          document.getElementById(
            'product-name'
          )?.textContent ||
          'Unnamed Product';


        const oldPrice =
          document.querySelector(
            '.old-price'
          )?.textContent ||
          'No Old Price';


        const newPrice =
          document.querySelector(
            '.new-price'
          )?.textContent ||
          'No New Price';


        const productStatus =
          document.getElementById(
            'product-status'
          )?.textContent ||
          'Status not available';


        const currentImageSrc =
          document.getElementById(
            'main-image'
          )?.src ||
          'No Image Available';


        const shareUrl =
          window.location.href;


        const shareText = `
Check out this product!
Brand: ${productBrand}
Name: ${productName}
Old Price: ${oldPrice}
New Price: ${newPrice}
Status: ${productStatus}
Image: ${currentImageSrc}
        `.trim();


        if (navigator.share) {

          try {

            await navigator.share({
              title:
                `${productBrand} - ${productName}`,
              text:
                shareText,
              url:
                shareUrl
            });

          } catch (error) {

            console.error(
              'Sharing failed',
              error
            );

          }

        } else {

          const clipboardText =
            `${shareText}\nProduct URL: ${shareUrl}`;


          navigator.clipboard
            .writeText(
              clipboardText
            )
            .then(() => {

              alert(
                'Product details copied to clipboard!'
              );

            })
            .catch(err => {

              console.error(
                'Failed to copy to clipboard',
                err
              );

            });

        }

      }
    );

  }
);


/* =========================================================
   REVIEW RATING
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const ratingInputs =
      document.querySelectorAll(
        ".rating input[type='radio']"
      );


    const selectedRatingDisplay =
      document.getElementById(
        "selected-rating"
      );


    ratingInputs.forEach(
      input => {

        input.addEventListener(
          "change",
          event => {

            const selectedValue =
              event.target.value;


            if (
              selectedRatingDisplay
            ) {

              selectedRatingDisplay.textContent =
                `Selected Rating: ${selectedValue} Stars`;

            }

          }
        );

      }
    );


    const reviewForm =
      document.getElementById(
        "review-form"
      );


    reviewForm?.addEventListener(
      "submit",
      e => {

        const existingHiddenInput =
          document.getElementById(
            "hidden-rating"
          );


        if (
          existingHiddenInput &&
          selectedRatingDisplay
        ) {

          existingHiddenInput.value =
            selectedRatingDisplay
              .textContent
              .replace(
                "Selected Rating: ",
                ""
              );

        } else if (
          selectedRatingDisplay
        ) {

          const hiddenInput =
            document.createElement(
              "input"
            );


          hiddenInput.type =
            "hidden";

          hiddenInput.name =
            "rating";

          hiddenInput.id =
            "hidden-rating";

          hiddenInput.value =
            selectedRatingDisplay
              .textContent
              .replace(
                "Selected Rating: ",
                ""
              );


          reviewForm.appendChild(
            hiddenInput
          );

        }

      }
    );

  }
);


/* =========================================================
   REVIEW FORM
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const reviewBtn =
      document.getElementById(
        "review-btn"
      );

    const reviewFormContainer =
      document.getElementById(
        "review-form-container"
      );

    const cancelBtn =
      document.getElementById(
        "cancel-btn"
      );

    const reviewForm =
      document.getElementById(
        "review-form"
      );


    let reviewData = {};


    reviewBtn?.addEventListener(
      "click",
      () => {

        if (
          !reviewFormContainer
        ) {
          return;
        }


        if (
          reviewFormContainer
            .style.display ===
          "none"
        ) {

          reviewFormContainer
            .style.display =
            "block";


          if (
            Object.keys(
              reviewData
            ).length
          ) {

            const title =
              document.getElementById(
                "review-title"
              );

            const content =
              document.getElementById(
                "review-content"
              );

            const name =
              document.getElementById(
                "reviewer-name"
              );

            const email =
              document.getElementById(
                "reviewer-email"
              );

            const stars =
              document.getElementById(
                "review-stars"
              );


            if (title) {
              title.value =
                reviewData.title || "";
            }

            if (content) {
              content.value =
                reviewData.content || "";
            }

            if (name) {
              name.value =
                reviewData.name || "";
            }

            if (email) {
              email.value =
                reviewData.email || "";
            }

            if (stars) {
              stars.value =
                reviewData.stars || "";
            }

          }

        } else {

          reviewFormContainer
            .style.display =
            "none";

        }

      }
    );


    cancelBtn?.addEventListener(
      "click",
      () => {

        if (
          reviewFormContainer
        ) {

          reviewFormContainer
            .style.display =
            "none";

        }

      }
    );


    reviewForm?.addEventListener(
      "submit",
      event => {

        event.preventDefault();


        const formData =
          new FormData(
            reviewForm
          );


        const emailData = {

          title:
            formData.get(
              "review-title"
            ),

          content:
            formData.get(
              "review-content"
            ),

          name:
            formData.get(
              "reviewer-name"
            ),

          email:
            formData.get(
              "reviewer-email"
            ),

          stars:
            formData.get(
              "review-stars"
            ),

          rating:
            formData.get(
              "selected-rating"
            )

        };


        console.log(
          "Review Submitted:",
          emailData
        );


        alert(
          "Review submitted successfully!"
        );


        reviewForm.reset();


        if (
          reviewFormContainer
        ) {

          reviewFormContainer
            .style.display =
            "none";

        }

      }
    );

  }
);


/* =========================================================
   THUMBNAIL GALLERY
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    if (
      !currentProductData
    ) {
      return;
    }


    const productData =
      currentProductData;


    const mainImage =
      document.getElementById(
        'main-image'
      );

    const thumbnailList =
      document.getElementById(
        'thumbnail-list'
      );

    const prevButton =
      document.getElementById(
        'prev-image'
      );

    const nextButton =
      document.getElementById(
        'next-image'
      );


    /*
      If your HTML doesn't contain
      thumbnail-list, stop this section.
    */

    if (
      !mainImage ||
      !thumbnailList
    ) {
      return;
    }


    let currentImageIndex = 0;
    let thumbnails = [];


    function updateMainImage(
      index
    ) {

      if (
        !productData.images ||
        !productData.images[index]
      ) {
        return;
      }


      mainImage.src =
        productData.images[index];


      thumbnails.forEach(
        img => {

          img.classList.remove(
            'active'
          );

        }
      );


      if (
        thumbnails[index]
      ) {

        thumbnails[index]
          .classList.add(
            'active'
          );

      }


      const imageCounter =
        document.getElementById(
          'image-counter'
        );


      if (imageCounter) {

        imageCounter.textContent =
          String(index + 1)
            .padStart(
              2,
              '0'
            );

      }

    }


    /* CREATE THUMBNAILS */

    if (
      productData.images &&
      productData.images.length > 0
    ) {

      thumbnailList.innerHTML = "";


      thumbnails =
        productData.images.map(
          (src, index) => {

            const thumb =
              document.createElement(
                'img'
              );


            thumb.src =
              src;


            thumb.addEventListener(
              'click',
              () => {

                currentImageIndex =
                  index;

                updateMainImage(
                  index
                );

              }
            );


            thumbnailList.appendChild(
              thumb
            );


            return thumb;

          }
        );


      updateMainImage(0);

    }

  }
);


/* =========================================================
   PRODUCT FOOTER — BACK TO TOP
========================================================= */

const productBackToTop =
  document.getElementById(
    'product-back-top'
  );


productBackToTop?.addEventListener(
  'click',
  () => {

    if (
      typeof lenis !==
      'undefined'
    ) {

      lenis.scrollTo(
        0,
        {
          duration: 1.2
        }
      );

    } else {

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });

    }

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