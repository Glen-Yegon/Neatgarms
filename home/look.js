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



  /* =======================================================
     SPEED
     ======================================================= */

  function getSpeed() {

    /*
      Pixels per second.

      Desktop:
      24px/s

      Tablet:
      20px/s

      Mobile:
      16px/s

      LOWER = slower
      HIGHER = faster
    */

    if (window.innerWidth <= 600) {
      return 16;
    }

    if (window.innerWidth <= 900) {
      return 20;
    }

    return 24;

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