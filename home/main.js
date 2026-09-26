/* =========================================================
   NEATGARMS — SHOP PAGE
========================================================= */


/* =========================================================
   01. NAVIGATION MENU
========================================================= */

const menuBtn = document.getElementById('menu-btn');
const menu = document.getElementById('menu');
const closeBtn = document.getElementById('close-btn');


function openNavMenu() {
  if (!menu || !menuBtn) return;

  menu.classList.add('is-open');

  menu.setAttribute('aria-hidden', 'false');
  menuBtn.setAttribute('aria-expanded', 'true');

  document.body.style.overflow = 'hidden';

  if (typeof lenis !== 'undefined') {
    lenis.stop();
  }
}


function closeNavMenu() {
  if (!menu || !menuBtn) return;

  menu.classList.remove('is-open');

  menu.setAttribute('aria-hidden', 'true');
  menuBtn.setAttribute('aria-expanded', 'false');

  document.body.style.overflow = '';

  if (typeof lenis !== 'undefined') {
    lenis.start();
  }
}


menuBtn?.addEventListener('click', openNavMenu);
closeBtn?.addEventListener('click', closeNavMenu);


document.addEventListener('keydown', (event) => {

  if (
    event.key === 'Escape' &&
    menu?.classList.contains('is-open')
  ) {
    closeNavMenu();
  }

});


/* =========================================================
   02. PRODUCT DATA
========================================================= */

/*
  Reads all product information from the dynamically
  imported .product-card.

  This keeps the same structure your product.html
  already expects.
*/

function getProductData(card) {

  const images = Array
    .from(card.querySelectorAll('.image-wrapper img'))
    .map(img => img.src);


  const status =
    card.querySelector('.status')?.innerText.trim() ||
    card.querySelector('.sold-out-badge')?.innerText.trim() ||
    null;


  const name =
    card.querySelector('.product-name')?.innerText.trim() || '';


  const oldPrice =
    card.querySelector('.old-price')?.innerText.trim() || null;


  const newPrice =
    card.querySelector('.new-price')?.innerText.trim() || null;


  const colors = Array
    .from(card.querySelectorAll('.color-buttons .color-btn'))
    .map(btn => btn.dataset.color)
    .filter(Boolean);


  const rawSizes = Array
    .from(card.querySelectorAll('.size-buttons .size-btn'))
    .map(btn => btn.dataset.size)
    .filter(Boolean);


  const sizes = rawSizes.map(size =>
    size.replace('*', '').trim()
  );


  const outOfStock = rawSizes
    .filter(size => size.includes('*'))
    .map(size => size.replace('*', '').trim());


  const description =
    card.dataset.description || '';


  let features = [];

  if (card.dataset.features) {

    try {
      features = JSON.parse(card.dataset.features);
    }

    catch (error) {
      console.warn(
        'Could not parse product features:',
        error
      );
    }

  }


  const sizeFit =
    card.dataset.sizefit || '';


  /*
    IMPORTANT:

    Your old system used card.id.

    We preserve that so product.html?id=...
    continues working exactly the same way.
  */

  const productId =
    card.id ||
    card.dataset.productId ||
    '';


  return {
    productId,
    productData: {
      images,
      status,
      name,
      oldPrice,
      newPrice,
      sizes,
      outOfStock,
      colors,
      description,
      features,
      sizeFit
    }
  };

}


/* =========================================================
   03. OPEN PRODUCT
========================================================= */

function openProduct(card) {

  if (!card) return;


  const {
    productId,
    productData
  } = getProductData(card);


  if (!productId) {

    console.error(
      'Product card has no ID:',
      card
    );

    return;
  }


  /*
    Save product exactly as product.html expects.
  */

  localStorage.setItem(
    'selectedProduct',
    JSON.stringify(productData)
  );


  /*
    Open product page.
  */

  window.location.href =
    `product.html?id=${encodeURIComponent(productId)}`;
}


/* =========================================================
   04. PRODUCT IMAGE HOVER
========================================================= */

function initializeImageHover(card) {

  /*
    Prevent duplicate initialization if your importer
    calls initializeProductBehaviors more than once.
  */

  if (card.dataset.hoverInitialized === 'true') {
    return;
  }


  card.dataset.hoverInitialized = 'true';


  const images =
    card.querySelectorAll('.image-wrapper img');


  if (!images.length) return;


  /*
    First image visible by default.
  */

  images.forEach((img, index) => {

    img.style.opacity =
      index === 0 ? '1' : '0';

    img.style.zIndex =
      index === 0 ? '1' : '0';

  });


  /*
    Only create hover swapping when there
    is actually another image.
  */

  if (images.length < 2) return;


  card.addEventListener('mouseenter', () => {

    images[0].style.opacity = '0';
    images[0].style.zIndex = '0';

    images[1].style.opacity = '1';
    images[1].style.zIndex = '1';

  });


  card.addEventListener('mouseleave', () => {

    images[0].style.opacity = '1';
    images[0].style.zIndex = '1';

    images[1].style.opacity = '0';
    images[1].style.zIndex = '0';

  });

}




/* =========================================================
   06. INITIALIZE PRODUCT CARDS
========================================================= */

window.initializeProductBehaviors = function () {

  const cards =
    document.querySelectorAll('.product-card');


  cards.forEach(card => {

    /*
      Image swapping
    */

    initializeImageHover(card);



    /*
      Avoid registering the card click twice.
    */

    if (
      card.dataset.clickInitialized === 'true'
    ) {
      return;
    }


    card.dataset.clickInitialized = 'true';


    /*
      Entire product card opens product.
    */

    card.addEventListener('click', (event) => {

      /*
        Ignore interactive elements if you add
        other buttons/links later.
      */

      if (
        event.target.closest(
          'button, a, input, select, textarea'
        )
      ) {
        return;
      }


      openProduct(card);

    });


    /*
      Keyboard accessibility.
    */

    if (!card.hasAttribute('tabindex')) {
      card.setAttribute('tabindex', '0');
    }


    card.addEventListener('keydown', (event) => {

      if (
        event.key === 'Enter' ||
        event.key === ' '
      ) {

        event.preventDefault();

        openProduct(card);

      }

    });

  });

};


/* =========================================================
   07. INITIAL PAGE LOAD
========================================================= */

document.addEventListener(
  'DOMContentLoaded',
  () => {

    window.initializeProductBehaviors();

  }
);


/* =========================================================
   08. HANDLE DYNAMIC PRODUCT IMPORT
========================================================= */

/*
  Your product cards are inserted into .product-slot
  AFTER the page HTML loads.

  MutationObserver watches the collection and initializes
  any new cards as soon as import-products.js inserts them.
*/

const productArea =
  document.querySelector('.kin-collection');


if (productArea) {

  const productObserver =
    new MutationObserver((mutations) => {

      let productAdded = false;


      mutations.forEach(mutation => {

        mutation.addedNodes.forEach(node => {

          if (!(node instanceof HTMLElement)) {
            return;
          }


          if (
            node.matches?.('.product-card') ||
            node.querySelector?.('.product-card')
          ) {
            productAdded = true;
          }

        });

      });


      if (productAdded) {

        window.initializeProductBehaviors();

      }

    });


  productObserver.observe(
    productArea,
    {
      childList: true,
      subtree: true
    }
  );

}


/* =========================================================
   09. URL HASH / PRODUCT HIGHLIGHT
========================================================= */

document.addEventListener(
  'DOMContentLoaded',
  () => {

    const urlHash =
      window.location.hash;


    if (!urlHash) return;


    /*
      Because products are dynamically loaded,
      give the importer time to create them.
    */

    const findProduct = () => {

      const targetProduct =
        document.querySelector(urlHash);


      if (!targetProduct) {
        return false;
      }


      targetProduct.classList.add('highlight');


      targetProduct.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });


      setTimeout(() => {

        targetProduct.classList.remove(
          'highlight'
        );

      }, 3000);


      return true;

    };


    if (findProduct()) return;


    /*
      Watch for imported product.
    */

    const hashObserver =
      new MutationObserver(() => {

        if (findProduct()) {

          hashObserver.disconnect();

        }

      });


    const collection =
      document.querySelector('.kin-collection');


    if (collection) {

      hashObserver.observe(
        collection,
        {
          childList: true,
          subtree: true
        }
      );

    }

  }
);


/* =========================================================
   10. SEARCH
========================================================= */

const searchBtn =
  document.querySelector('.search-btn');

const searchContainer =
  document.getElementById('ui-input-container');

const searchInput =
  document.getElementById('ui-input');

const closeSearchBtn =
  document.getElementById('close-search');


searchBtn?.addEventListener(
  'click',
  () => {

    if (!searchContainer) return;


    searchContainer.classList.remove(
      'hidden'
    );


    searchInput?.focus();

  }
);


closeSearchBtn?.addEventListener(
  'click',
  () => {

    if (!searchContainer) return;


    searchContainer.classList.add(
      'hidden'
    );


    if (searchInput) {
      searchInput.value = '';
    }


    filterProducts('');

  }
);


searchInput?.addEventListener(
  'input',
  () => {

    const query =
      searchInput.value
        .toLowerCase()
        .trim();


    filterProducts(query);

  }
);


/* =========================================================
   11. SEARCH PRODUCTS
========================================================= */

function filterProducts(query) {

  /*
    Don't store productCards globally.

    Products don't exist when main.js initially runs
    because import-products.js creates them later.

    Always query the CURRENT cards.
  */

  const cards =
    document.querySelectorAll('.product-card');


  cards.forEach(card => {

    const productName =
      card
        .querySelector('.product-name')
        ?.textContent
        .toLowerCase() || '';


    /*
      Hide the entire editorial piece,
      not only the inner card.
    */

    const piece =
      card.closest('.kin-piece');


    if (productName.includes(query)) {

      if (piece) {
        piece.style.display = '';
      }

      else {
        card.style.display = '';
      }

    }

    else {

      if (piece) {
        piece.style.display = 'none';
      }

      else {
        card.style.display = 'none';
      }

    }

  });

}


/* =========================================================
   12. PRODUCT ID GENERATOR
========================================================= */

function generateProductId(name) {

  return name
    .split(' ')
    .filter(Boolean)
    .map(word => word[0])
    .join('')
    .toLowerCase();

}

/* =========================================================
   KIN END — CINEMATIC LIGHT
========================================================= */

const kinEnd = document.querySelector('.kin-end');

if (kinEnd && window.matchMedia('(hover: hover)').matches) {

  kinEnd.addEventListener('mousemove', (event) => {

    const rect = kinEnd.getBoundingClientRect();

    const x =
      ((event.clientX - rect.left) / rect.width) * 100;

    const y =
      ((event.clientY - rect.top) / rect.height) * 100;

    kinEnd.style.setProperty('--mx', `${x}%`);
    kinEnd.style.setProperty('--my', `${y}%`);

  });


  kinEnd.addEventListener('mouseleave', () => {

    kinEnd.style.setProperty('--mx', '50%');
    kinEnd.style.setProperty('--my', '50%');

  });

}

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