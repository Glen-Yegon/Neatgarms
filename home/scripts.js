import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";


/* =========================================================
   NEATGARMS / HOMEPAGE 2026
   Real SVG extrusion + physical glass
   ========================================================= */


const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const finePointer = window.matchMedia(
  "(pointer: fine)"
).matches;

/* =========================================================
   LENIS / SMOOTH SCROLL
   ========================================================= */

let lenis =
  null;


if (
  !prefersReducedMotion &&
  window.Lenis
) {

  lenis =
    new Lenis({

      /*
        Lower lerp = softer / heavier movement.

        0.075 gives the site a premium campaign feel
        without making the page feel delayed.
      */

      lerp:
        0.075,

      smoothWheel:
        true,

      wheelMultiplier:
        0.88,

      anchors:
        true,

      autoRaf:
        true

    });

}


/* =========================================================
   DOM
   ========================================================= */

const loader =
  document.getElementById(
    "neatLoader"
  );

const loaderCounter =
  document.getElementById(
    "loaderCounter"
  );

const loaderStatus =
  document.getElementById(
    "loaderStatus"
  );

const loaderTrack =
  document.getElementById(
    "loaderTrack"
  );

const loaderScanner =
  document.querySelector(
    ".loader-track__scanner"
  );

const loaderRevealLine =
  document.getElementById(
    "loaderRevealLine"
  );

const hero =
  document.querySelector(
    ".hero"
  );

const heroImage =
  document.getElementById(
    "heroImage"
  );

const header =
  document.getElementById(
    "siteHeader"
  );

const heroMeta =
  document.querySelectorAll(
    ".hero-meta"
  );

const frameCorners =
  document.querySelectorAll(
    ".campaign-frame__corner"
  );

const scrollCue =
  document.querySelector(
    ".scroll-cue"
  );

const objectZone =
  document.getElementById(
    "objectZone"
  );

const heroHost =
  document.getElementById(
    "threeCanvasHost"
  );

const menuTrigger =
  document.getElementById(
    "menuTrigger"
  );

const menuClose =
  document.getElementById(
    "menuClose"
  );

const mobileMenu =
  document.getElementById(
    "mobileMenu"
  );

const pageTransition =
  document.getElementById(
    "pageTransition"
  );

const pageTransitionLogo =
  document.querySelector(
    ".page-transition__logo"
  );

const footer =
  document.getElementById(
    "footer"
  );

const footerLines =
  document.querySelectorAll(
    ".footer-statement__line"
  );

const backTop =
  document.getElementById(
    "backTop"
  );


/* =========================================================
   HELPERS
   ========================================================= */

const clamp = (
  value,
  min,
  max
) =>
  Math.max(
    min,
    Math.min(
      max,
      value
    )
  );


function capPixelRatio() {

  if (
    window.innerWidth <= 767
  ) {

    return Math.min(
      window.devicePixelRatio || 1,
      1.25
    );

  }

  return Math.min(
    window.devicePixelRatio || 1,
    1.5
  );
}


/* =========================================================
   THREE.JS SCENE FACTORY
   ========================================================= */

function createScene(
  host
) {

  if (!host) {
    return null;
  }


  const scene =
    new THREE.Scene();


  const camera =
    new THREE.PerspectiveCamera(
      30,
      1,
      0.1,
      100
    );


  camera.position.set(
    0,
    0,
    8
  );


const renderer =
  new THREE.WebGLRenderer({

    alpha: true,

    antialias:
      window.innerWidth > 767,

    stencil: true,

    powerPreference:
      "high-performance"

  });


  renderer.setPixelRatio(
    capPixelRatio()
  );


  renderer.setClearColor(
    0x000000,
    0
  );


  renderer.outputColorSpace =
    THREE.SRGBColorSpace;


  renderer.toneMapping =
    THREE.ACESFilmicToneMapping;


  renderer.toneMappingExposure =
    1.0;


  host.appendChild(
    renderer.domElement
  );


  /* =======================================================
     ENVIRONMENT
     ======================================================= */

  const pmremGenerator =
    new THREE.PMREMGenerator(
      renderer
    );


  const environment =
    new RoomEnvironment();


  const environmentTexture =
    pmremGenerator.fromScene(
      environment,
      0.04
    ).texture;


  scene.environment =
    environmentTexture;


  environment.dispose();

  pmremGenerator.dispose();


  /* =======================================================
     VERY SOFT LIGHTING
     ======================================================= */

  const keyLight =
    new THREE.DirectionalLight(
      0xffffff,
      0.55
    );


  keyLight.position.set(
    -3,
    4,
    6
  );


  scene.add(
    keyLight
  );


  const rimLight =
    new THREE.DirectionalLight(
      0xffffff,
      0.28
    );


  rimLight.position.set(
    4,
    1,
    -2
  );


  scene.add(
    rimLight
  );


  const fillLight =
    new THREE.DirectionalLight(
      0xffffff,
      0.16
    );


  fillLight.position.set(
    2,
    -4,
    4
  );


  scene.add(
    fillLight
  );


  function resize() {

    const width =
      Math.max(
        1,
        host.clientWidth
      );


    const height =
      Math.max(
        1,
        host.clientHeight
      );


    renderer.setSize(
      width,
      height,
      false
    );


    camera.aspect =
      width / height;


    camera.updateProjectionMatrix();

  }


  resize();


  return {

    scene,

    camera,

    renderer,

    resize,

    environmentTexture

  };

}


/* =========================================================
   HERO WEBGL BACKGROUND
   ========================================================= */

async function createHeroBackground(
  sceneData
) {

  if (!sceneData) {
    return null;
  }


  const {
    scene,
    camera
  } = sceneData;


  const isMobile =
    window.matchMedia(
      "(max-width: 767px)"
    ).matches;


  const imageURL =
    isMobile
      ? "images/DSC00449.jpg"
      : "images/DSC00437.jpg";


  const textureLoader =
    new THREE.TextureLoader();


  const texture =
    await textureLoader.loadAsync(
      imageURL
    );


  texture.colorSpace =
    THREE.SRGBColorSpace;


  texture.wrapS =
    THREE.ClampToEdgeWrapping;


  texture.wrapT =
    THREE.ClampToEdgeWrapping;


  texture.minFilter =
    THREE.LinearFilter;


  texture.magFilter =
    THREE.LinearFilter;


  const geometry =
    new THREE.PlaneGeometry(
      2,
      2
    );


  const material =
    new THREE.MeshBasicMaterial({

      map: texture,

      toneMapped: false,

      depthWrite: false,

      depthTest: true

    });


  const background =
    new THREE.Mesh(
      geometry,
      material
    );


  background.position.z =
    -3.5;


  background.renderOrder =
    -10;


  scene.add(
    background
  );


  /* =======================================================
     OBJECT-FIT: COVER
     ======================================================= */

  function updateBackground() {

    if (
      !texture.image ||
      !texture.image.width ||
      !texture.image.height
    ) {

      return;

    }


    if (!heroHost) {
      return;
    }


    const viewportWidth =
      Math.max(
        heroHost.clientWidth,
        1
      );


    const viewportHeight =
      Math.max(
        heroHost.clientHeight,
        1
      );


    const viewportAspect =
      viewportWidth /
      viewportHeight;


    const imageAspect =
      texture.image.width /
      texture.image.height;


    texture.repeat.set(
      1,
      1
    );


    texture.offset.set(
      0,
      0
    );


    if (
      imageAspect >
      viewportAspect
    ) {

      const repeatX =
        viewportAspect /
        imageAspect;


      texture.repeat.x =
        repeatX;


      texture.offset.x =
        (
          1 -
          repeatX
        ) / 2;

    } else {

      const repeatY =
        imageAspect /
        viewportAspect;


      texture.repeat.y =
        repeatY;


      texture.offset.y =
        (
          1 -
          repeatY
        ) / 2;

    }


    const distance =
      camera.position.z -
      background.position.z;


    const visibleHeight =
      2 *
      Math.tan(
        THREE.MathUtils.degToRad(
          camera.fov / 2
        )
      ) *
      distance;


    const visibleWidth =
      visibleHeight *
      camera.aspect;


    background.scale.set(

      visibleWidth / 2,

      visibleHeight / 2,

      1

    );


    texture.needsUpdate =
      true;

  }


  updateBackground();


  return {

    mesh: background,

    texture,

    geometry,

    material,

    update: updateBackground

  };

}


/* =========================================================
   CREATE SVG MODEL
   ========================================================= */

async function createNeatModel() {

  const svgLoader =
    new SVGLoader();


  console.log(
    "Loading NEAT SVG..."
  );


  const svgData =
    await svgLoader.loadAsync(
      "./mains/neat-mark-3d.svg"
    );


  console.log(
    "SVG loaded.",
    "Paths:",
    svgData.paths.length
  );


  const model =
    new THREE.Group();


  /* =======================================================
     CLEAR GLASS MATERIAL
     ======================================================= */

  const glassMaterial =
    new THREE.MeshPhysicalMaterial({

      color:
        new THREE.Color(
          0xffffff
        ),

      metalness: 0,

      roughness: 0.025,

      transmission: 1,

      transparent: true,

      opacity: 1,

      ior: 1.18,

      thickness: 0.48,

      clearcoat: 0.28,

      clearcoatRoughness:
        0.025,

      envMapIntensity:
        0.38,

      attenuationColor:
        new THREE.Color(
          0xffffff
        ),

      attenuationDistance:
        100,

      side:
        THREE.DoubleSide

    });


  /* =======================================================
     SVG -> EXTRUDED GEOMETRY
     ======================================================= */

  let meshCount = 0;


  svgData.paths.forEach(
    path => {

      const shapes =
        SVGLoader.createShapes(
          path
        );


      console.log(
        "Shapes in path:",
        shapes.length
      );


      shapes.forEach(
        shape => {

          const geometry =
            new THREE.ExtrudeGeometry(
              shape,
              {

                depth: 10,

                steps: 1,

                bevelEnabled: true,

                bevelThickness:
                  1.4,

                bevelSize:
                  1.1,

                bevelOffset:
                  0,

                bevelSegments:
                  3,

                curveSegments:
                  8

              }
            );


          geometry.computeVertexNormals();


          const mesh =
            new THREE.Mesh(
              geometry,
              glassMaterial
            );


          model.add(
            mesh
          );


          meshCount++;

        }
      );

    }
  );


  console.log(
    "NEAT meshes created:",
    meshCount
  );


  if (
    meshCount === 0
  ) {

    throw new Error(
      "SVG loaded but SVGLoader created zero shapes."
    );

  }


  /* =======================================================
     CENTER RAW SVG
     ======================================================= */

  model.updateMatrixWorld(
    true
  );


  const rawBox =
    new THREE.Box3().setFromObject(
      model
    );


  const rawCenter =
    rawBox.getCenter(
      new THREE.Vector3()
    );


  model.children.forEach(
    mesh => {

      mesh.position.x -=
        rawCenter.x;

      mesh.position.y -=
        rawCenter.y;

      mesh.position.z -=
        rawCenter.z;

    }
  );


  /* =======================================================
     FLIP SVG Y AXIS
     ======================================================= */

  model.scale.y =
    -1;


  model.updateMatrixWorld(
    true
  );


  /* =======================================================
     NORMALIZE SIZE
     ======================================================= */

  const centeredBox =
    new THREE.Box3().setFromObject(
      model
    );


  const size =
    centeredBox.getSize(
      new THREE.Vector3()
    );


  console.log(
    "Raw model size:",
    size
  );


  const largestDimension =
    Math.max(
      size.x,
      size.y
    );


  const desiredSize =
    4.8;


  const scale =
    desiredSize /
    largestDimension;


  model.scale.multiplyScalar(
    scale
  );


  /* =======================================================
     DEFAULT ORIENTATION
     ======================================================= */

  model.rotation.set(

    THREE.MathUtils.degToRad(
      -3
    ),

    THREE.MathUtils.degToRad(
      -10
    ),

    THREE.MathUtils.degToRad(
      -1
    )

  );


  model.position.set(
    0,
    0,
    0
  );


  return model;

}

/* =========================================================
   NEAT BACKGROUND MAGNIFIER
   ========================================================= */

/*
  This creates a second copy of the hero photograph.

  The photograph is sampled at a tighter UV scale, which
  makes it look zoomed.

  The cloned NEAT geometry writes into the stencil buffer.

  The zoomed photograph is then rendered ONLY where the
  projected NEAT geometry exists.

  Result:

  normal photograph
        +
  strongly magnified photograph inside NEAT
        +
  original transparent glass NEAT on top
*/


function createNeatMagnifier(
  sceneData,
  heroModel,
  heroBackground,
  magnification = 1.72
) {

  if (
    !sceneData ||
    !heroModel ||
    !heroBackground
  ) {

    return null;

  }


  const {
    scene
  } = sceneData;


  const sourceTexture =
    heroBackground.texture;


  /* =======================================================
     1. CREATE A SECOND COPY OF THE BACKGROUND TEXTURE
     ======================================================= */

  const zoomTexture =
    sourceTexture.clone();


  zoomTexture.needsUpdate =
    true;


  zoomTexture.colorSpace =
    THREE.SRGBColorSpace;


  zoomTexture.wrapS =
    THREE.ClampToEdgeWrapping;


  zoomTexture.wrapT =
    THREE.ClampToEdgeWrapping;


  zoomTexture.minFilter =
    THREE.LinearFilter;


  zoomTexture.magFilter =
    THREE.LinearFilter;


  /*
    We will calculate the final UV crop in update().
  */


  /* =======================================================
     2. STENCIL WRITER

     Clone the NEAT geometry.

     It does NOT render visible colour.

     Its only job is to write "1" into the stencil wherever
     the NEAT sculpture appears on screen.
     ======================================================= */

const maskMaterial =
  new THREE.MeshBasicMaterial({

    colorWrite: false,

    depthWrite: false,

    depthTest: true,

    side:
      THREE.DoubleSide,

    stencilWrite: true,

    stencilRef: 1,

    stencilFunc:
      THREE.AlwaysStencilFunc,

    stencilZPass:
      THREE.ReplaceStencilOp,

    stencilZFail:
      THREE.ReplaceStencilOp,

    stencilFail:
      THREE.ReplaceStencilOp

  });
  

  const maskGroup =
    new THREE.Group();


  heroModel.children.forEach(
    child => {

      if (!child.isMesh) {
        return;
      }


      const maskMesh =
        new THREE.Mesh(
          child.geometry,
          maskMaterial
        );


      maskMesh.position.copy(
        child.position
      );


      maskMesh.rotation.copy(
        child.rotation
      );


      maskMesh.scale.copy(
        child.scale
      );


      maskMesh.renderOrder =
        1;


      maskGroup.add(
        maskMesh
      );

    }
  );


  /*
    The group follows the exact same transformation
    as the visible NEAT model.
  */

  maskGroup.position.copy(
    heroModel.position
  );


  maskGroup.rotation.copy(
    heroModel.rotation
  );


  maskGroup.scale.copy(
    heroModel.scale
  );


  scene.add(
    maskGroup
  );


  /* =======================================================
     3. MAGNIFIED BACKGROUND PLANE
     ======================================================= */

  const zoomGeometry =
    new THREE.PlaneGeometry(
      2,
      2
    );


const zoomMaterial =
  new THREE.MeshBasicMaterial({

    map:
      zoomTexture,

    toneMapped:
      false,

    depthWrite:
      false,

    depthTest:
      true,


    /*
      Render the magnified photograph only
      inside the NEAT stencil.
    */

    stencilWrite:
      true,

    stencilRef:
      1,

    stencilFunc:
      THREE.EqualStencilFunc,

    stencilFail:
      THREE.KeepStencilOp,

    stencilZFail:
      THREE.KeepStencilOp,

    stencilZPass:
      THREE.KeepStencilOp

  });


  const zoomPlane =
    new THREE.Mesh(
      zoomGeometry,
      zoomMaterial
    );


  /*
    Put it just in front of the original photograph,
    but still behind the NEAT sculpture.
  */

  zoomPlane.position.z =
    heroBackground.mesh.position.z +
    0.01;


  zoomPlane.renderOrder =
    2;


  scene.add(
    zoomPlane
  );


  /* =======================================================
     UPDATE BACKGROUND SIZE + MAGNIFICATION
     ======================================================= */

  function update() {

    if (
      !sourceTexture.image ||
      !sourceTexture.image.width ||
      !sourceTexture.image.height ||
      !heroHost
    ) {

      return;

    }


    /*
      Match the zoom plane physically to the
      normal background plane.
    */

    zoomPlane.position.copy(
      heroBackground.mesh.position
    );


    zoomPlane.position.z +=
      0.01;


    zoomPlane.scale.copy(
      heroBackground.mesh.scale
    );


    /*
      First recreate the exact same object-fit:
      cover crop used by the original background.
    */

    const viewportWidth =
      Math.max(
        heroHost.clientWidth,
        1
      );


    const viewportHeight =
      Math.max(
        heroHost.clientHeight,
        1
      );


    const viewportAspect =
      viewportWidth /
      viewportHeight;


    const imageAspect =
      sourceTexture.image.width /
      sourceTexture.image.height;


    let baseRepeatX =
      1;


    let baseRepeatY =
      1;


    let baseOffsetX =
      0;


    let baseOffsetY =
      0;


    if (
      imageAspect >
      viewportAspect
    ) {

      baseRepeatX =
        viewportAspect /
        imageAspect;


      baseOffsetX =
        (
          1 -
          baseRepeatX
        ) / 2;

    } else {

      baseRepeatY =
        imageAspect /
        viewportAspect;


      baseOffsetY =
        (
          1 -
          baseRepeatY
        ) / 2;

    }


    /* =====================================================
       MAGNIFY

       Smaller UV window = larger-looking photograph.

       Example:
       1.72 magnification means we sample only
       ~58% of the normal visible photograph.
       ===================================================== */

    const zoomFactor =
      Math.max(
        1,
        magnification
      );


    const zoomRepeatX =
      baseRepeatX /
      zoomFactor;


    const zoomRepeatY =
      baseRepeatY /
      zoomFactor;


    /*
      Keep the magnification centered on the same
      visual point as the background.

      This gives the impression that NEAT is
      magnifying what's directly behind it,
      rather than displaying an unrelated crop.
    */

    const baseCenterX =
      baseOffsetX +
      baseRepeatX * 0.5;


    const baseCenterY =
      baseOffsetY +
      baseRepeatY * 0.5;


    zoomTexture.repeat.set(
      zoomRepeatX,
      zoomRepeatY
    );


    zoomTexture.offset.set(

      baseCenterX -
      zoomRepeatX * 0.5,

      baseCenterY -
      zoomRepeatY * 0.5

    );


    zoomTexture.needsUpdate =
      true;

  }


  update();


  /* =======================================================
     SYNC MASK TO ROTATING NEAT
     ======================================================= */

  function sync() {

    maskGroup.position.copy(
      heroModel.position
    );


    maskGroup.rotation.copy(
      heroModel.rotation
    );


    maskGroup.scale.copy(
      heroModel.scale
    );

  }


  return {

    maskGroup,

    maskMaterial,

    zoomPlane,

    zoomGeometry,

    zoomMaterial,

    zoomTexture,

    update,

    sync

  };

}

/* =========================================================
   THREE INSTANCES
   ========================================================= */

let heroScene =
  null;

let heroModel =
  null;

let heroBackground =
  null;

let heroMagnifier =
  null;

let modelReady =
  false;


/*
  NEAT MAGNIFICATION

  1.0 = no zoom
  1.5 = strong
  1.75 = very strong
  2.0 = extreme

  Start at 1.72.
*/

const NEAT_MAGNIFICATION =
  1.72;


/* =========================================================
   INTERACTION STATE
   ========================================================= */

let targetRotationX =
  THREE.MathUtils.degToRad(
    -4
  );

let targetRotationY =
  THREE.MathUtils.degToRad(
    -12
  );

let rotationVelocityX =
  0;

let rotationVelocityY =
  0;

let dragging =
  false;

let previousPointerX =
  0;

let previousPointerY =
  0;

let lastPointerTime =
  0;

let heroVisible =
  true;

let animationFrame =
  null;


/* =========================================================
   HERO LOGO VISIBILITY CYCLE
   ========================================================= */

const LOGO_VISIBLE_TIME =
  3;

const LOGO_HIDDEN_TIME =
  3;

const LOGO_FADE_TIME =
  2.2;

let logoOpacity =
  1;


/*
  Keeps autonomous rotation independent
  of the monitor refresh rate.
*/

const heroClock =
  new THREE.Clock();


/* =========================================================
   LOAD WEBGL
   ========================================================= */

async function initialise3D() {

  try {

    heroScene =
      createScene(
        heroHost
      );


    if (!heroScene) {

      throw new Error(
        "Unable to create hero WebGL scene."
      );

    }


    heroBackground =
      await createHeroBackground(
        heroScene
      );


    hero?.classList.add(
      "is-webgl-ready"
    );


    /*
      Only ONE Three.js model is now required.

      The loader no longer uses WebGL.
    */

heroModel =
  await createNeatModel();


/*
  Responsive NEAT sculpture size.

  Desktop / tablet = 0.58
  Mobile           = 0.42
*/

const isMobileHero =
  window.matchMedia(
    "(max-width: 767px)"
  ).matches;


heroModel.scale.multiplyScalar(
  isMobileHero
    ? 0.42
    : 0.58
);


heroScene.scene.add(
  heroModel
);


/*
  Create the moving magnified-background
  effect behind the transparent glass.
*/

heroMagnifier =
  createNeatMagnifier(

    heroScene,

    heroModel,

    heroBackground,

    NEAT_MAGNIFICATION

  );


modelReady =
  true;


    startIntro();

  } catch (error) {

    console.error(
      "NEAT 3D model failed to load:",
      error
    );


    /*
      If WebGL/SVG fails, don't trap the
      visitor behind the loading screen.
    */

    if (loader) {

      loader.style.display =
        "none";

    }


    revealHeroUI();

  }

}


/* =========================================================
   HERO REVEAL
   ========================================================= */

function revealHeroUI() {

  if (
    !window.gsap ||
    prefersReducedMotion
  ) {

    if (header) {

      header.style.opacity =
        "1";

    }


    heroMeta.forEach(
      element => {

        element.style.opacity =
          "1";

      }
    );


    if (objectZone) {

      objectZone.style.opacity =
        "1";

    }


    if (scrollCue) {

      scrollCue.style.opacity =
        "0.6";

    }


    frameCorners.forEach(
      element => {

        element.style.opacity =
          "0.58";

        element.style.transform =
          "scale(1)";

      }
    );


    return;

  }


  gsap.to(
    [
      header,
      objectZone,
      ...heroMeta,
      scrollCue
    ],
    {

      opacity: 1,

      y: 0,

      duration: 0.8,

      stagger: 0.045,

      ease: "power3.out"

    }
  );


  gsap.to(
    frameCorners,
    {

      opacity: 0.58,

      scale: 1,

      duration: 0.65,

      stagger: 0.035,

      ease: "power3.out"

    }
  );

}


/* =========================================================
   NEATGARMS / CAMPAIGN SYSTEM INTRO
   ========================================================= */

function startIntro() {

  const alreadyVisited =
    sessionStorage.getItem(
      "hasVisited"
    ) === "true";


  /*
    Returning visitor:
    skip the first-visit intro.
  */

  if (
    alreadyVisited ||
    prefersReducedMotion ||
    !window.gsap
  ) {

    if (loader) {

      loader.style.display =
        "none";

    }


    revealHeroUI();

    return;

  }


  /*
    Mark session as visited only once
    the loader is actually starting.
  */

  sessionStorage.setItem(
    "hasVisited",
    "true"
  );


  /* -------------------------------------------------------
     HERO START STATE
     ------------------------------------------------------- */

  gsap.set(
    [
      header,
      objectZone,
      ...heroMeta,
      scrollCue
    ],
    {

      opacity: 0

    }
  );


  gsap.set(
    frameCorners,
    {

      opacity: 0,

      scale: 0.82

    }
  );


  /* -------------------------------------------------------
     LOADER SAFETY
     ------------------------------------------------------- */

  if (
    !loader ||
    !loaderCounter ||
    !loaderStatus ||
    !loaderTrack ||
    !loaderScanner ||
    !loaderRevealLine
  ) {

    if (loader) {

      loader.style.display =
        "none";

    }


    revealHeroUI();

    return;

  }


  /* -------------------------------------------------------
     LOADER INITIAL STATE
     ------------------------------------------------------- */

  gsap.set(
    loader,
    {

      display: "grid",

      opacity: 1

    }
  );


  gsap.set(
    loaderCounter,
    {

      opacity: 0,

      scale: 0.94,

      scaleX: 0.94,

      scaleY: 0.94,

      fontVariationSettings:
        '"wght" 180, "wdth" 55'

    }
  );


  gsap.set(
    ".loader-system-meta",
    {

      opacity: 0,

      y: 8

    }
  );


  gsap.set(
    loaderTrack,
    {

      opacity: 0,

      scaleX: 0.7,

      transformOrigin:
        "50% 50%"

    }
  );


  gsap.set(
    loaderScanner,
    {

      xPercent: -120

    }
  );


  gsap.set(
    loaderRevealLine,
    {

      width: 0,

      opacity: 0

    }
  );


  /* -------------------------------------------------------
     COUNTER
     ------------------------------------------------------- */

  const counterState = {

    value: 0

  };


  function updateCounter() {

    const value =
      Math.round(
        counterState.value
      );


    loaderCounter.textContent =
      value === 100
        ? "100"
        : String(
            value
          ).padStart(
            2,
            "0"
          );


    if (
      value < 28
    ) {

      loaderStatus.textContent =
        "INITIALISING";

    } else if (
      value < 64
    ) {

      loaderStatus.textContent =
        "CALIBRATING";

    } else if (
      value < 91
    ) {

      loaderStatus.textContent =
        "LOADING CAMPAIGN";

    } else {

      loaderStatus.textContent =
        "READY";

    }

  }


  updateCounter();


  /* -------------------------------------------------------
     TIMELINE
     ------------------------------------------------------- */

  const intro =
    gsap.timeline();


  /* Metadata enters */

  intro.fromTo(
    ".loader-meta",
    {

      opacity: 0

    },
    {

      opacity: 1,

      duration: 0.45,

      ease: "power2.out"

    }
  );


  /* Giant 00 */

  intro.to(
    loaderCounter,
    {

      opacity: 1,

      scale: 1,

      fontVariationSettings:
        '"wght" 180, "wdth" 70',

      duration: 0.7,

      ease: "expo.out"

    },
    "-=.2"
  );


  /* System text */

  intro.to(
    ".loader-system-meta",
    {

      opacity: 1,

      y: 0,

      duration: 0.45,

      ease: "power3.out"

    },
    "-=.42"
  );


  /* Scanner track */

  intro.to(
    loaderTrack,
    {

      opacity: 1,

      scaleX: 1,

      duration: 0.45,

      ease: "power3.out"

    },
    "-=.3"
  );


  /* -------------------------------------------------------
     SCANNER + COUNTER RUN TOGETHER
     ------------------------------------------------------- */

  intro.to(
    loaderScanner,
    {

      xPercent: 650,

      duration: 1.85,

      ease: "power1.inOut"

    },
    "<"
  );


  intro.to(
    counterState,
    {

      value: 100,

      duration: 1.85,

      ease: "power2.inOut",

      onUpdate:
        updateCounter,

      onComplete: () => {

        counterState.value =
          100;

        updateCounter();

      }

    },
    "<"
  );


  /*
    Variable width expansion.

    This is intentionally subtle.
  */

  intro.to(
    loaderCounter,
    {

      fontVariationSettings:
        '"wght" 210, "wdth" 92',

      duration: 1.85,

      ease: "power1.inOut"

    },
    "<"
  );


  /* -------------------------------------------------------
     HOLD 100
     ------------------------------------------------------- */

  intro.to(
    {},
    {

      duration: 0.22

    }
  );


  /* -------------------------------------------------------
     REMOVE SMALL INFORMATION
     ------------------------------------------------------- */

  intro.to(
    [
      ".loader-system-meta",
      loaderTrack
    ],
    {

      opacity: 0,

      duration: 0.22,

      ease: "power2.in"

    }
  );


  /* -------------------------------------------------------
     CRUSH 100 INTO A LINE
     ------------------------------------------------------- */

  intro.to(
    loaderCounter,
    {

      scaleX: 0.025,

      scaleY: 0.012,

      opacity: 0,

      duration: 0.42,

      ease: "expo.in"

    },
    "-=.08"
  );


  /* -------------------------------------------------------
     FULL SCREEN RAZOR LINE
     ------------------------------------------------------- */

  intro.set(
    loaderRevealLine,
    {

      opacity: 1

    }
  );


  intro.to(
    loaderRevealLine,
    {

      width: "100vw",

      duration: 0.62,

      ease: "expo.inOut"

    }
  );


  /* Corner metadata leaves */

  intro.to(
    ".loader-meta",
    {

      opacity: 0,

      duration: 0.22,

      ease: "power2.out"

    },
    "-=.25"
  );


  /* -------------------------------------------------------
     REVEAL HERO PHOTO
     ------------------------------------------------------- */

  intro.to(
    loader,
    {

      opacity: 0,

      duration: 0.34,

      ease: "power2.out"

    }
  );


  intro.set(
    loader,
    {

      display: "none"

    }
  );


  /* -------------------------------------------------------
     HERO UI ENTERS
     ------------------------------------------------------- */

  intro.to(
    [
      header,
      objectZone,
      ...heroMeta
    ],
    {

      opacity: 1,

      y: 0,

      duration: 0.8,

      stagger: 0.045,

      ease: "power3.out"

    },
    "-=.08"
  );


  intro.to(
    frameCorners,
    {

      opacity: 0.58,

      scale: 1,

      duration: 0.6,

      stagger: 0.035,

      ease: "power3.out"

    },
    "-=.65"
  );


  intro.to(
    scrollCue,
    {

      opacity: 0.6,

      duration: 0.45

    },
    "-=.4"
  );

}


/* =========================================================
   POINTER TILT
   ========================================================= */

if (
  finePointer &&
  hero &&
  objectZone
) {

  hero.addEventListener(
    "pointermove",
    event => {

      if (dragging) {
        return;
      }


      const ny =
        event.clientY /
        window.innerHeight -
        0.5;


      /*
        Only X tilt is pointer-driven.

        Y remains free for continuous
        autonomous rotation.
      */

      targetRotationX =
        THREE.MathUtils.degToRad(
          -4 -
          ny * 8
        );

    },
    {

      passive: true

    }
  );


  hero.addEventListener(
    "pointerleave",
    () => {

      if (dragging) {
        return;
      }


      targetRotationX =
        THREE.MathUtils.degToRad(
          -4
        );

    }
  );

}


/* =========================================================
   DRAG
   ========================================================= */

objectZone?.addEventListener(
  "pointerdown",
  event => {

    if (
      !modelReady
    ) {

      return;

    }


    dragging =
      true;


    objectZone.classList.add(
      "is-dragging"
    );


    objectZone.setPointerCapture?.(
      event.pointerId
    );


    previousPointerX =
      event.clientX;


    previousPointerY =
      event.clientY;


    lastPointerTime =
      performance.now();


    rotationVelocityX =
      0;


    rotationVelocityY =
      0;

  }
);


objectZone?.addEventListener(
  "pointermove",
  event => {

    if (
      !dragging ||
      !heroModel
    ) {

      return;

    }


    const dx =
      event.clientX -
      previousPointerX;


    const dy =
      event.clientY -
      previousPointerY;


    const now =
      performance.now();


    const dt =
      Math.max(
        16,
        now -
        lastPointerTime
      );


    /* Horizontal drag */

    targetRotationY +=
      dx * 0.006;


    /* Vertical drag */

    targetRotationX +=
      dy * 0.004;


    targetRotationX =
      clamp(

        targetRotationX,

        THREE.MathUtils.degToRad(
          -28
        ),

        THREE.MathUtils.degToRad(
          28
        )

      );


    /* Release velocity */

    rotationVelocityY =
      (
        dx /
        dt
      ) * 0.13;


    rotationVelocityX =
      (
        dy /
        dt
      ) * 0.08;


    previousPointerX =
      event.clientX;


    previousPointerY =
      event.clientY;


    lastPointerTime =
      now;

  }
);


/* =========================================================
   RELEASE DRAG
   ========================================================= */

function releaseDrag(
  event
) {

  if (!dragging) {
    return;
  }


  dragging =
    false;


  objectZone?.classList.remove(
    "is-dragging"
  );


  if (
    event?.pointerId !==
    undefined
  ) {

    try {

      objectZone?.releasePointerCapture?.(
        event.pointerId
      );

    } catch {

      /*
        Pointer may already have been
        released by the browser.
      */

    }

  }

}


objectZone?.addEventListener(
  "pointerup",
  releaseDrag
);


objectZone?.addEventListener(
  "pointercancel",
  releaseDrag
);


/* =========================================================
   HERO LOGO APPEAR / DISAPPEAR CYCLE
   ========================================================= */

function updateHeroLogoVisibility(
  seconds
) {

  if (
    !heroModel ||
    prefersReducedMotion
  ) {
    return;
  }


  const cycleDuration =
    LOGO_VISIBLE_TIME +
    LOGO_FADE_TIME +
    LOGO_HIDDEN_TIME +
    LOGO_FADE_TIME;


  const cycleTime =
    seconds %
    cycleDuration;


  /* =======================================================
     SMOOTHERSTEP

     Softer than normal smoothstep at both ends.
     This gives the glass a more natural dissolve / reveal.
     ======================================================= */

  const smootherStep = (
    value
  ) => {

    const t =
      clamp(
        value,
        0,
        1
      );


    return (
      t *
      t *
      t *
      (
        t *
        (
          t * 6 -
          15
        ) +
        10
      )
    );

  };


  /* =======================================================
     FULLY VISIBLE
     ======================================================= */

  if (
    cycleTime <
    LOGO_VISIBLE_TIME
  ) {

    logoOpacity =
      1;

  }


  /* =======================================================
     FADE OUT
     ======================================================= */

  else if (
    cycleTime <
    LOGO_VISIBLE_TIME +
    LOGO_FADE_TIME
  ) {

    const progress =
      (
        cycleTime -
        LOGO_VISIBLE_TIME
      ) /
      LOGO_FADE_TIME;


    logoOpacity =
      1 -
      smootherStep(
        progress
      );

  }


  /* =======================================================
     FULLY HIDDEN
     ======================================================= */

  else if (
    cycleTime <
    LOGO_VISIBLE_TIME +
    LOGO_FADE_TIME +
    LOGO_HIDDEN_TIME
  ) {

    logoOpacity =
      0;

  }


  /* =======================================================
     FADE IN
     ======================================================= */

  else {

    const progress =
      (
        cycleTime -
        LOGO_VISIBLE_TIME -
        LOGO_FADE_TIME -
        LOGO_HIDDEN_TIME
      ) /
      LOGO_FADE_TIME;


    logoOpacity =
      smootherStep(
        progress
      );

  }


  /* =======================================================
     GLASS SVG
     ======================================================= */

  heroModel.traverse(
    child => {

      if (
        !child.isMesh ||
        !child.material
      ) {
        return;
      }


      /*
        Fade ONLY the visible glass sculpture.

        We do not touch:
        - transmission
        - magnification
        - stencil
        - zoom texture
        - zoom material
      */

      child.material.transparent =
        true;


      child.material.opacity =
        logoOpacity;


      /*
        Keep the mesh alive throughout the entire fade.
      */

      child.visible =
        logoOpacity >
        0.00001;

    }
  );


  /* =======================================================
     MAGNIFICATION
     ======================================================= */
/* =======================================================
   MAGNIFICATION / FADE WITH SVG
   ======================================================= */

if (heroMagnifier) {

  /*
    IMPORTANT:
    The actual magnification remains 1.72x.

    We are ONLY controlling how visible the
    magnified layer is during the dissolve.
  */

  heroMagnifier.zoomMaterial.transparent =
    true;


  /*
    Keep the zoom visually strong for most of
    the fade.

    logoOpacity:
      1.00 -> zoom 1.00
      0.75 -> zoom 0.94
      0.50 -> zoom 0.81
      0.25 -> zoom 0.58
      0.10 -> zoom 0.35
      0.00 -> zoom 0.00

    This preserves the magnifying-glass effect
    while still allowing it to dissolve fully.
  */

  const magnifierOpacity =
    Math.pow(
      logoOpacity,
      0.45
    );


  heroMagnifier.zoomMaterial.opacity =
    magnifierOpacity;


  /*
    Keep the stencil + zoom plane rendering
    until the fade has completely finished.
  */

  const magnifierVisible =
    logoOpacity > 0.0001;


  heroMagnifier.maskGroup.visible =
    magnifierVisible;


  heroMagnifier.zoomPlane.visible =
    magnifierVisible;
}

}

/* =========================================================
   MAIN RENDER LOOP
   ========================================================= */

function render(
  time
) {

  /*
    Clamp delta so changing browser tabs
    cannot create a huge rotation jump.
  */

  const delta =
    Math.min(
      heroClock.getDelta(),
      0.05
    );


  const seconds =
    time * 0.001;


  updateHeroLogoVisibility(
    seconds
  );


  /* -------------------------------------------------------
     HERO

     There is NO Three.js loader anymore.
     ------------------------------------------------------- */

  if (
    heroModel &&
    heroScene &&
    heroVisible
  ) {

    if (
      !prefersReducedMotion
    ) {

      if (!dragging) {

        /* Drag inertia */

        targetRotationY +=
          rotationVelocityY;


        targetRotationX +=
          rotationVelocityX;


        rotationVelocityY *=
          0.94;


        rotationVelocityX *=
          0.94;


        /*
          Slow continuous rotation.

          ~0.16 radians / second.
        */

        targetRotationY +=
          delta * 0.16;

      }


      /*
        Smooth model movement.
      */

      heroModel.rotation.x +=
        (
          targetRotationX -
          heroModel.rotation.x
        ) * 0.055;


      heroModel.rotation.y +=
        (
          targetRotationY -
          heroModel.rotation.y
        ) * 0.055;


      /*
        Tiny organic movement.
      */

      heroModel.rotation.z =
        Math.sin(
          seconds * 0.34
        ) * 0.012;


      heroModel.position.y =
        Math.sin(
          seconds * 0.62
        ) * 0.035;

        /*
  Make the magnification mask follow
  the rotating / floating NEAT object.
*/

heroMagnifier?.sync();

    }


    heroScene.renderer.render(
      heroScene.scene,
      heroScene.camera
    );

  }


  animationFrame =
    requestAnimationFrame(
      render
    );

}


/* =========================================================
   RESIZE
   ========================================================= */

let resizeFrame =
  null;


window.addEventListener(
  "resize",
  () => {

    cancelAnimationFrame(
      resizeFrame
    );


    resizeFrame =
      requestAnimationFrame(
        () => {

          heroScene?.renderer.setPixelRatio(
            capPixelRatio()
          );


          heroScene?.resize();


          heroBackground?.update();

          heroMagnifier?.update();

        }
      );

  },
  {

    passive: true

  }
);


/* =========================================================
   VISIBILITY / PERFORMANCE
   ========================================================= */

document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.hidden
    ) {

      if (
        animationFrame
      ) {

        cancelAnimationFrame(
          animationFrame
        );


        animationFrame =
          null;

      }

    } else if (
      !animationFrame
    ) {

      /*
        Consume the hidden-tab delta.
      */

      heroClock.getDelta();


      animationFrame =
        requestAnimationFrame(
          render
        );

    }

  }
);


/* =========================================================
   MOBILE MENU
   ========================================================= */

function openMenu() {

  if (
    !mobileMenu ||
    !menuTrigger
  ) {

    return;

  }


  mobileMenu.classList.add(
    "is-open"
  );


  mobileMenu.setAttribute(
    "aria-hidden",
    "false"
  );


  menuTrigger.setAttribute(
    "aria-expanded",
    "true"
  );


  document.body.classList.add(
    "menu-open"
  );


  if (
    window.gsap &&
    !prefersReducedMotion
  ) {

    gsap.fromTo(
      ".mobile-menu__nav a strong",
      {

        yPercent: 115

      },
      {

        yPercent: 0,

        duration: 0.85,

        stagger: 0.055,

        ease: "expo.out"

      }
    );

  }

}


function closeMenu() {

  if (
    !mobileMenu ||
    !menuTrigger
  ) {

    return;

  }


  mobileMenu.classList.remove(
    "is-open"
  );


  mobileMenu.setAttribute(
    "aria-hidden",
    "true"
  );


  menuTrigger.setAttribute(
    "aria-expanded",
    "false"
  );


  document.body.classList.remove(
    "menu-open"
  );

}


menuTrigger?.addEventListener(
  "click",
  openMenu
);


menuClose?.addEventListener(
  "click",
  closeMenu
);


document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape" &&
      mobileMenu?.classList.contains(
        "is-open"
      )
    ) {

      closeMenu();

    }

  }
);


/* =========================================================
   INTERNAL PAGE TRANSITIONS
   ========================================================= */

function isInternalTransitionLink(
  link
) {

  if (!link) {
    return false;
  }


  const href =
    link.getAttribute(
      "href"
    );


  if (!href) {
    return false;
  }


  if (
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    link.target === "_blank" ||
    link.hasAttribute(
      "download"
    )
  ) {

    return false;

  }


  try {

    const url =
      new URL(
        link.href,
        window.location.href
      );


    return (
      url.origin ===
      window.location.origin
    );

  } catch {

    return false;

  }

}


document
  .querySelectorAll(
    "a[data-transition-link]"
  )
  .forEach(
    link => {

      link.addEventListener(
        "click",
        event => {

          if (
            !isInternalTransitionLink(
              link
            )
          ) {

            return;

          }


          if (
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          ) {

            return;

          }


          event.preventDefault();


          const destination =
            link.href;


          closeMenu();


          document.body.classList.add(
            "is-transitioning"
          );


          pageTransition?.classList.add(
            "is-active"
          );


          if (
            !window.gsap ||
            prefersReducedMotion
          ) {

            window.location.href =
              destination;

            return;

          }


          const tl =
            gsap.timeline({

              onComplete: () => {

                window.location.href =
                  destination;

              }

            });


          tl.set(
            pageTransition,
            {

              yPercent: -101

            }
          );


          tl.to(
            pageTransition,
            {

              yPercent: 0,

              duration: 0.72,

              ease: "expo.inOut"

            }
          );


          tl.to(
            pageTransitionLogo,
            {

              opacity: 1,

              scale: 1,

              rotateY: 0,

              duration: 0.42,

              ease: "power3.out"

            },
            "-=.25"
          );

        }
      );

    }
  );


/* =========================================================
   BACK / FORWARD CACHE FIX
   ========================================================= */

window.addEventListener(
  "pageshow",
  () => {

    document.body.classList.remove(
      "is-transitioning"
    );


    if (
      pageTransition
    ) {

      pageTransition.classList.remove(
        "is-active"
      );


      if (
        window.gsap
      ) {

        gsap.set(
          pageTransition,
          {

            yPercent: -101

          }
        );

      }

    }


    if (
      pageTransitionLogo &&
      window.gsap
    ) {

      gsap.set(
        pageTransitionLogo,
        {

          opacity: 0,

          scale: 0.78,

          rotateY: -18

        }
      );

    }

  }
);


/* =========================================================
   FOOTER MOTION
   ========================================================= */

function updateFooterMotion() {

  if (
    !footer ||
    prefersReducedMotion
  ) {

    return;

  }


  const rect =
    footer.getBoundingClientRect();


  const viewportH =
    window.innerHeight;


  const progress =
    clamp(
      (
        viewportH -
        rect.top
      ) /
      (
        viewportH +
        rect.height * 0.5
      ),
      0,
      1
    );


  const rotateX =
    10 -
    progress * 10;


  const y =
    72 -
    progress * 72;


  footerLines.forEach(
    (
      line,
      index
    ) => {

      const direction =
        index === 0
          ? -1
          : 1;


      const x =
        direction *
        (
          1 -
          progress
        ) *
        3.2;


      line.style.transform =
        `translate3d(${x}vw, ${y}px, 0) rotateX(${rotateX}deg)`;

    }
  );

}


/* =========================================================
   HERO SCROLL
   ========================================================= */

function updateHeroScroll() {

  if (!hero) {
    return;
  }


  const rect =
    hero.getBoundingClientRect();


  const progress =
    clamp(
      -rect.top /
      Math.max(
        1,
        rect.height
      ),
      0,
      1
    );



  /*
    Fade interaction area as the
    hero leaves the viewport.
  */

  if (
    objectZone
  ) {

    objectZone.style.opacity =
      String(
        1 -
        progress * 0.72
      );

  }


  heroVisible =
    rect.bottom > 0 &&
    rect.top <
      window.innerHeight;

}


/* =========================================================
   SCROLL
   ========================================================= */

window.addEventListener(
  "scroll",
  () => {

    updateFooterMotion();

    updateHeroScroll();

  },
  {

    passive: true

  }
);


updateFooterMotion();

updateHeroScroll();


/* =========================================================
   BACK TO TOP
   ========================================================= */

backTop?.addEventListener(
  "click",
  () => {

    if (lenis) {

      lenis.scrollTo(
        0,
        {
          duration: 1.25
        }
      );

      return;
    }


    window.scrollTo({
      top: 0,
      behavior:
        prefersReducedMotion
          ? "auto"
          : "smooth"
    });

  }
);


/* =========================================================
   CLEANUP
   ========================================================= */

window.addEventListener(
  "pagehide",
  () => {

    if (
      animationFrame
    ) {

      cancelAnimationFrame(
        animationFrame
      );


      animationFrame =
        null;

    }


    /*
      Dispose hero model geometry/materials.
    */

    heroModel?.traverse(
      child => {

        if (!child.isMesh) {
          return;
        }


        child.geometry?.dispose();


        if (
          Array.isArray(
            child.material
          )
        ) {

          child.material.forEach(
            material => {

              material?.dispose();

            }
          );

        } else {

          child.material?.dispose();

        }

      }
    );


    heroBackground?.geometry?.dispose();

    heroBackground?.material?.dispose();

    heroBackground?.texture?.dispose();

    heroMagnifier?.zoomGeometry?.dispose();

    heroMagnifier?.zoomMaterial?.dispose();

    heroMagnifier?.zoomTexture?.dispose();

    heroMagnifier?.maskMaterial?.dispose();

    heroScene?.environmentTexture?.dispose();

    heroScene?.renderer?.dispose();

  }
);

/* =========================================================
   START
   THREE.JS = DESKTOP ONLY
   ========================================================= */

const shouldRunThree =
  window.matchMedia(
    "(min-width: 768px)"
  ).matches &&
  !prefersReducedMotion;


/*
 * DESKTOP
 * Run the complete Three.js experience.
 */
if (shouldRunThree) {

  initialise3D();

  animationFrame =
    requestAnimationFrame(
      render
    );

} else {

  /*
   * MOBILE
   *
   * Do NOT:
   * - create WebGL renderer
   * - load SVG model
   * - load WebGL hero texture
   * - run Three animation loop
   *
   * Normal scripts.js functionality continues
   * below this block.
   */

  document.documentElement.classList.add(
    "no-three"
  );


  /*
   * Hide/remove Three-only interaction elements.
   */

  if (heroHost) {
    heroHost.style.display = "none";
  }

  if (objectZone) {
    objectZone.style.display = "none";
  }


  /*
   * The normal HTML <picture> hero remains visible.
   *
   * Three.js normally calls startIntro() after the
   * model has loaded. Because mobile doesn't create
   * the model, we start the intro ourselves.
   */

  startIntro();
}
  
/* =========================================================
   NEATGARMS / PURPLE SHOOTING STAR CURSOR
   ========================================================= */

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