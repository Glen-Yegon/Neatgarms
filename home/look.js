/* =========================================================
   NEATGARMS LOOKBOOK
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =======================================================
     ELEMENTS
     ======================================================= */

  const body = document.body;

  const track =
    document.getElementById("lookbookTrack");

  const firstGroup =
    track?.querySelector(".lookbook-group");

  const menuToggle =
    document.getElementById("menuToggle");

  const menuClose =
    document.getElementById("menuClose");

  const mobileMenu =
    document.getElementById("mobileMenu");



  /* =======================================================
     PAGE LOAD
     ======================================================= */

  window.addEventListener("load", () => {

    requestAnimationFrame(() => {

      body.classList.add("loaded");

    });

  });



  /* =======================================================
     MOBILE MENU
     ======================================================= */

  function openMenu() {

    if (!mobileMenu || !menuToggle) return;

    mobileMenu.classList.add("active");

    mobileMenu.setAttribute(
      "aria-hidden",
      "false"
    );

    menuToggle.setAttribute(
      "aria-expanded",
      "true"
    );

    body.classList.add("menu-open");

  }



  function closeMenu() {

    if (!mobileMenu || !menuToggle) return;

    mobileMenu.classList.remove("active");

    mobileMenu.setAttribute(
      "aria-hidden",
      "true"
    );

    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    body.classList.remove("menu-open");

  }



  menuToggle?.addEventListener(
    "click",
    openMenu
  );


  menuClose?.addEventListener(
    "click",
    closeMenu
  );



  /* close using Escape */

  document.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Escape" &&
        mobileMenu?.classList.contains("active")
      ) {

        closeMenu();

      }

    }
  );



  /* close after selecting mobile link */

  const mobileLinks =
    document.querySelectorAll(".mobile-link");


  mobileLinks.forEach((link) => {

    link.addEventListener(
      "click",
      closeMenu
    );

  });



  /* =======================================================
     INFINITE HORIZONTAL LOOKBOOK
     ======================================================= */

  if (!track || !firstGroup) return;


  let position = 0;

  let groupWidth = 0;

  let previousTime = performance.now();

  let speed = getSpeed();

  let animationFrame = null;

  let paused = false;



function getSpeed() {

  /*
    Pixels per second.

    Desktop: 30px/s
    Tablet: 25px/s
    Mobile: 20px/s

    LOWER = slower
    HIGHER = faster
  */

  if (window.innerWidth <= 600) {
    return 20;
  }

  if (window.innerWidth <= 900) {
    return 25;
  }

  return 30;
}



  /* =======================================================
     MEASURE LOOP
     ======================================================= */

  function measureTrack() {

    groupWidth =
      firstGroup.getBoundingClientRect().width;

  }



  /* =======================================================
     ANIMATION
     ======================================================= */

  function animate(currentTime) {

    const delta =
      Math.min(
        (currentTime - previousTime) / 1000,
        0.05
      );

    previousTime = currentTime;


    if (!paused && groupWidth > 0) {

      position -= speed * delta;


      /*
        Once the entire first group has moved
        off-screen, move position forward by
        exactly one group.

        Because group 2 is identical, the user
        cannot see the reset.
      */

      if (Math.abs(position) >= groupWidth) {

        position += groupWidth;

      }


      track.style.transform =
        `translate3d(${position}px, 0, 0)`;

    }


    animationFrame =
      requestAnimationFrame(animate);

  }



  /* =======================================================
     INITIALIZE
     ======================================================= */

  function initializeMarquee() {

    measureTrack();

    previousTime =
      performance.now();

    if (!animationFrame) {

      animationFrame =
        requestAnimationFrame(animate);

    }

  }



  /*
    Wait until images are ready before
    measuring the track.
  */

  const images =
    track.querySelectorAll("img");


  let loadedImages = 0;


  function imageReady() {

    loadedImages++;


    if (loadedImages >= images.length) {

      initializeMarquee();

    }

  }



  images.forEach((image) => {

    if (image.complete) {

      imageReady();

    } else {

      image.addEventListener(
        "load",
        imageReady,
        { once: true }
      );


      image.addEventListener(
        "error",
        imageReady,
        { once: true }
      );

    }

  });



  /*
    Fallback in case image events behave
    differently because of browser caching.
  */

  window.addEventListener(
    "load",
    initializeMarquee,
    { once: true }
  );



  /* =======================================================
     RESPONSIVE RECALCULATION
     ======================================================= */

  let resizeTimer;


  window.addEventListener(
    "resize",
    () => {

      clearTimeout(resizeTimer);


      resizeTimer = setTimeout(() => {

        speed = getSpeed();

        measureTrack();


        /*
          Keep position safely inside
          the current loop width.
        */

        if (groupWidth > 0) {

          position =
            position % groupWidth;

        }

      }, 120);

    }
  );



  /* =======================================================
     TAB VISIBILITY
     ======================================================= */

  document.addEventListener(
    "visibilitychange",
    () => {

      if (document.hidden) {

        paused = true;

      } else {

        previousTime =
          performance.now();

        paused = false;

      }

    }
  );



  /* =======================================================
     REDUCED MOTION
     ======================================================= */

  const reducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );


  function handleReducedMotion() {

    paused =
      reducedMotion.matches;

  }


  handleReducedMotion();


  reducedMotion.addEventListener?.(
    "change",
    handleReducedMotion
  );

});


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