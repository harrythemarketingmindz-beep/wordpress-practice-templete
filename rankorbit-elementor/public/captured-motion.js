
/* Recovered original homepage script 08. */


(function () {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const menu =
        document.getElementById('roOffcanvas');

    const overlay =
        document.getElementById('roMenuOverlay');

    const closeButton =
        document.getElementById('roCloseMenu');


    if (!menu || !overlay) {
        return;
    }


    /* =====================================================
       OPEN
    ===================================================== */

    function openRankOrbitMenu() {

        menu.classList.add('ro-active');

        overlay.classList.add('ro-active');

        document.documentElement
            .classList.add('ro-menu-open');

        document.body
            .classList.add('ro-menu-open');

    }


    /* =====================================================
       CLOSE
    ===================================================== */

    function closeRankOrbitMenu() {

        menu.classList.remove('ro-active');

        overlay.classList.remove('ro-active');

        document.documentElement
            .classList.remove('ro-menu-open');

        document.body
            .classList.remove('ro-menu-open');

    }


    /* =====================================================
       GLOBAL FUNCTIONS
    ===================================================== */

    window.openRankOrbitMenu =
        openRankOrbitMenu;

    window.closeRankOrbitMenu =
        closeRankOrbitMenu;


    /* =====================================================
       CLOSE BUTTON
    ===================================================== */

    if (closeButton) {

        closeButton.addEventListener(
            'click',
            closeRankOrbitMenu
        );

    }


    /* =====================================================
       OVERLAY CLICK
    ===================================================== */

    overlay.addEventListener(
        'click',
        closeRankOrbitMenu
    );


    /* =====================================================
       ESC KEY
    ===================================================== */

    document.addEventListener(
        'keydown',
        function (event) {

            if (event.key === 'Escape') {

                closeRankOrbitMenu();

            }

        }
    );


    /* =====================================================
       ELEMENTOR HAMBURGER TRIGGER
       CSS CLASS = ro-menu-trigger
    ===================================================== */

    document.addEventListener(
        'click',
        function (event) {

            const trigger =
                event.target.closest(
                    '.ro-menu-trigger'
                );

            if (!trigger) {
                return;
            }

            event.preventDefault();

            openRankOrbitMenu();

        }
    );


    /* =====================================================
       SERVICES OPEN / CLOSE
    ===================================================== */

    const servicesWrapper =
        menu.querySelector(
            '.ro-services-wrapper'
        );

    const servicesToggle =
        menu.querySelector(
            '.ro-services-toggle'
        );


    if (
        servicesWrapper &&
        servicesToggle
    ) {

        servicesToggle.addEventListener(
            'click',
            function () {

                servicesWrapper
                    .classList
                    .toggle('ro-open');

            }
        );

    }


    /* =====================================================
       SERVICE CATEGORY ACCORDIONS
    ===================================================== */

    const categories =
        menu.querySelectorAll(
            '.ro-service-category'
        );


    categories.forEach(
        function (category) {

            const heading =
                category.querySelector(
                    '.ro-service-heading'
                );

            if (!heading) {
                return;
            }


            heading.addEventListener(
                'click',
                function () {

                    const currentlyOpen =
                        category.classList
                        .contains(
                            'ro-category-open'
                        );


                    /* Close others */

                    categories.forEach(
                        function (item) {

                            item.classList.remove(
                                'ro-category-open'
                            );

                        }
                    );


                    /* Open selected */

                    if (!currentlyOpen) {

                        category.classList.add(
                            'ro-category-open'
                        );

                    }

                }
            );

        }
    );


    /* =====================================================
       CLOSE MENU AFTER CLICKING ANY LINK
    ===================================================== */

    const links =
        menu.querySelectorAll('a');


    links.forEach(
        function (link) {

            link.addEventListener(
                'click',
                function () {

                    closeRankOrbitMenu();

                }
            );

        }
    );

})();



/* Recovered original homepage script 09. */

(function () {
  "use strict";

  const hero = document.getElementById("roHeroV8");

  if (!hero || hero.dataset.initialized === "1") {
    return;
  }

  hero.dataset.initialized = "1";

  const video = hero.querySelector(".ro8-video");

  if (!video) return;

  const sources = {
    desktop:
      (video.getAttribute("src") || window.ROCapture.publicUrl + "/assets/0010-Hero-Section-Video-Rank-Orbit.mp4"),

    mobile:
      (video.getAttribute("src") || window.ROCapture.publicUrl + "/assets/0010-Hero-Section-Video-Rank-Orbit.mp4")
  };

  const mobileQuery =
    window.matchMedia("(max-width:767px)");

  const reducedQuery =
    window.matchMedia("(prefers-reduced-motion:reduce)");

  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  const saveData = Boolean(
    connection && connection.saveData
  );

  let started = false;
  let currentSource = "";

  function getSource() {
    return mobileQuery.matches
      ? sources.mobile
      : sources.desktop;
  }

  function showVideo() {
    if (video.readyState >= 2 && !video.paused) {
      hero.classList.add("ro8-playing");
    }
  }

  function hideVideo() {
    hero.classList.remove("ro8-playing");
  }

  video.addEventListener("playing", showVideo);
  video.addEventListener("error", hideVideo);
  video.addEventListener("emptied", hideVideo);

  function safePlay() {

    if (
      document.hidden ||
      reducedQuery.matches ||
      saveData
    ) return;

    const result = video.play();

    if (result && typeof result.catch === "function") {
      result.catch(hideVideo);
    }
  }

  function initVideo() {

    if (
      started ||
      reducedQuery.matches ||
      saveData
    ) return;

    started = true;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = true;

    currentSource = getSource();

    video.src = currentSource;
    video.load();

    safePlay();
  }

  /* LOAD VIDEO AFTER INITIAL PAGE LOAD */

  function scheduleVideo() {

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(initVideo, {
        timeout: 2000
      });
    } else {
      window.setTimeout(initVideo, 900);
    }
  }

  if (document.readyState === "complete") {
    scheduleVideo();
  } else {
    window.addEventListener(
      "load",
      scheduleVideo,
      { once: true }
    );
  }

  /* UPDATE SOURCE ON BREAKPOINT CHANGE */

  function switchVideo() {

    if (!started) return;

    const nextSource = getSource();

    if (nextSource === currentSource) return;

    hideVideo();

    video.pause();

    currentSource = nextSource;

    video.src = currentSource;
    video.load();

    safePlay();
  }

  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener("change", switchVideo);
  } else if (mobileQuery.addListener) {
    mobileQuery.addListener(switchVideo);
  }

  /* PAUSE VIDEO WHEN TAB IS HIDDEN */

  document.addEventListener("visibilitychange", function () {

    if (!started) return;

    if (document.hidden) {
      video.pause();
    } else {
      safePlay();
    }

  });

})();


/* Recovered original homepage script 10. */


(function () {

    "use strict";


    let aliAttempts = 0;


    function aliInitializeOrbit() {


        aliAttempts++;


        /* =====================================================
           MOBILE
           COMPLETELY STATIC
           NO GSAP REQUIRED
        ====================================================== */

        if (
            window.innerWidth <= 767
        ) {


            document
            .querySelectorAll(
                ".ali-orbit-scroll"
            )
            .forEach(function (section) {


                if (
                    section.dataset.aliMobileReady === "true"
                ) {

                    return;

                }


                section.dataset.aliMobileReady =
                    "true";


                /*
                 * Remove possible cached / old inline
                 * animation styles.
                 */

                const main =
                    section.querySelector(
                        ".ali-orbit-main"
                    );


                const services =
                    section.querySelectorAll(
                        ".ali-orbit-service"
                    );


                const rings =
                    section.querySelector(
                        ".ali-orbit-rings"
                    );


                const progress =
                    section.querySelector(
                        ".ali-orbit-progress"
                    );


                if (main) {

                    main.removeAttribute(
                        "style"
                    );

                }


                if (rings) {

                    rings.removeAttribute(
                        "style"
                    );

                }


                if (progress) {

                    progress.removeAttribute(
                        "style"
                    );

                }


                services.forEach(
                    function (service) {


                        service.removeAttribute(
                            "style"
                        );


                        const image =
                            service.querySelector(
                                ".ali-orbit-service-image"
                            );


                        const content =
                            service.querySelector(
                                ".ali-orbit-content-wrap"
                            );


                        const textElements =
                            service.querySelectorAll(
                                ".ali-orbit-card-label, " +
                                ".ali-orbit-card h3, " +
                                ".ali-orbit-card p, " +
                                ".ali-orbit-card li"
                            );


                        if (image) {

                            image.removeAttribute(
                                "style"
                            );

                        }


                        if (content) {

                            content.removeAttribute(
                                "style"
                            );

                        }


                        textElements.forEach(
                            function (item) {


                                item.removeAttribute(
                                    "style"
                                );


                            }
                        );


                    }
                );


            });


            /*
             * STOP.
             *
             * No GSAP.
             * No ScrollTrigger.
             * No IntersectionObserver.
             * No mobile animation.
             */

            return;

        }


        /* =====================================================
           WAIT FOR GSAP — DESKTOP / TABLET ONLY
        ====================================================== */

        if (
            typeof window.gsap === "undefined" ||
            typeof window.ScrollTrigger === "undefined"
        ) {


            if (
                aliAttempts < 60
            ) {


                setTimeout(
                    aliInitializeOrbit,
                    120
                );


            }


            return;

        }


        const gsap =
            window.gsap;


        const ScrollTrigger =
            window.ScrollTrigger;


        gsap.registerPlugin(
            ScrollTrigger
        );


        document
        .querySelectorAll(
            ".ali-orbit-scroll"
        )
        .forEach(function (section) {


            if (
                section.dataset.aliReady === "true"
            ) {

                return;

            }


            section.dataset.aliReady =
                "true";


            const stage =
                section.querySelector(
                    ".ali-orbit-stage"
                );


            const main =
                section.querySelector(
                    ".ali-orbit-main"
                );


            const rings =
                section.querySelector(
                    ".ali-orbit-rings"
                );


            const services =
                gsap.utils.toArray(
                    section.querySelectorAll(
                        ".ali-orbit-service"
                    )
                );


            const progress =
                section.querySelector(
                    ".ali-orbit-progress"
                );


            const progressFill =
                section.querySelector(
                    ".ali-orbit-progress-fill"
                );


            if (
                !stage ||
                !main ||
                !rings ||
                !services.length
            ) {

                return;

            }


            /* =================================================
               STATES
            ================================================= */


            const mainState = {
                progress: 0
            };


            const serviceStates =
                services.map(function () {


                    return {
                        angle: 135
                    };


                });


            /* =================================================
               LAYOUT
            ================================================= */


            function getLayout() {


                const width =
                    stage.clientWidth;


                const height =
                    stage.clientHeight;


                /*
                 * Desktop arch pushed further right
                 * to remove blank strip.
                 */

                let centerX =
                    width * 1.075;


                let centerY =
                    height * .50;


                let radius =
                    Math.min(
                        width * .49,
                        height * .43
                    );


                let mainScale =
                    1.62;


                if (
                    window.innerWidth <= 1100
                ) {


                    centerX =
                        width * 1.06;


                    radius =
                        Math.min(
                            width * .53,
                            height * .42
                        );


                    mainScale =
                        1.50;


                }


                return {

                    width: width,

                    height: height,

                    centerX: centerX,

                    centerY: centerY,

                    radius: radius,

                    mainScale: mainScale

                };


            }


            /* =================================================
               MAIN POSITION
            ================================================= */


            function updateMain() {


                const layout =
                    getLayout();


                const x =
                    gsap.utils.interpolate(
                        layout.width * .50,
                        layout.centerX,
                        mainState.progress
                    );


                const y =
                    gsap.utils.interpolate(
                        layout.height * .50,
                        layout.centerY,
                        mainState.progress
                    );


                const scale =
                    gsap.utils.interpolate(
                        1,
                        layout.mainScale,
                        mainState.progress
                    );


                const rotation =
                    gsap.utils.interpolate(
                        0,
                        90,
                        mainState.progress
                    );


                gsap.set(
                    main,
                    {

                        left: x,

                        top: y,

                        scale: scale,

                        rotation: rotation

                    }
                );


            }


            /* =================================================
               SERVICE POSITION
            ================================================= */


            function positionService(
                service,
                state
            ) {


                const layout =
                    getLayout();


                const radians =
                    state.angle *
                    Math.PI /
                    180;


                const x =
                    layout.centerX +
                    Math.cos(radians) *
                    layout.radius;


                const y =
                    layout.centerY +
                    Math.sin(radians) *
                    layout.radius;


                const image =
                    service.querySelector(
                        ".ali-orbit-service-image"
                    );


                gsap.set(
                    service,
                    {

                        x: x,

                        y: y

                    }
                );


                gsap.set(
                    image,
                    {

                        rotation:
                            state.angle -
                            180

                    }
                );


            }


            /* =================================================
               INITIAL STATES
            ================================================= */


            gsap.set(
                main,
                {

                    opacity: 1,

                    scale: 1,

                    rotation: 0

                }
            );


            gsap.set(
                rings,
                {

                    opacity: 0,

                    scale: .82

                }
            );


            gsap.set(
                progress,
                {

                    opacity: 0

                }
            );


            gsap.set(
                progressFill,
                {

                    scaleX: 0

                }
            );


            gsap.set(
                services,
                {

                    autoAlpha: 0

                }
            );


            services.forEach(
                function (
                    service,
                    index
                ) {


                    const image =
                        service.querySelector(
                            ".ali-orbit-service-image"
                        );


                    const content =
                        service.querySelector(
                            ".ali-orbit-content-wrap"
                        );


                    const textElements =
                        service.querySelectorAll(
                            ".ali-orbit-card-label, " +
                            ".ali-orbit-card h3, " +
                            ".ali-orbit-card p, " +
                            ".ali-orbit-card li"
                        );


                    gsap.set(
                        image,
                        {

                            opacity: 0,

                            scale: .74

                        }
                    );


                    gsap.set(
                        content,
                        {

                            autoAlpha: 0,

                            x: 35,

                            filter:
                                "blur(12px)",

                            clipPath:
                                "inset(0 0 0 100% round 27px)"

                        }
                    );


                    gsap.set(
                        textElements,
                        {

                            opacity: 0,

                            x: 22,

                            filter:
                                "blur(7px)"

                        }
                    );


                    positionService(
                        service,
                        serviceStates[index]
                    );


                }
            );


            updateMain();


            /* =================================================
               TIMELINE
            ================================================= */


            const timeline =
                gsap.timeline({

                    defaults: {
                        ease: "none"
                    }

                });


            /* PROGRESS */

            timeline.to(
                progress,
                {

                    opacity: 1,

                    duration: .15

                },
                0
            );


            /* MAIN INTO ARCH */

            timeline.to(
                mainState,
                {

                    progress: 1,

                    duration: .62,

                    ease:
                        "power2.inOut",

                    onUpdate:
                        updateMain

                },
                .05
            );


            /* RINGS */

            timeline.to(
                rings,
                {

                    opacity: 1,

                    scale: 1,

                    duration: .44,

                    ease:
                        "power2.out"

                },
                .24
            );


            /* =================================================
               SERVICES
            ================================================= */


            services.forEach(
                function (
                    service,
                    index
                ) {


                    const state =
                        serviceStates[index];


                    const image =
                        service.querySelector(
                            ".ali-orbit-service-image"
                        );


                    const content =
                        service.querySelector(
                            ".ali-orbit-content-wrap"
                        );


                    const textElements =
                        service.querySelectorAll(
                            ".ali-orbit-card-label, " +
                            ".ali-orbit-card h3, " +
                            ".ali-orbit-card p, " +
                            ".ali-orbit-card li"
                        );


                    /* VISIBLE */

                    timeline.set(
                        service,
                        {

                            autoAlpha: 1

                        }
                    );


                    timeline.set(
                        state,
                        {

                            angle: 135,

                            onUpdate:
                                function () {


                                    positionService(
                                        service,
                                        state
                                    );


                                }

                        }
                    );


                    /* IMAGE IN */

                    timeline.to(
                        image,
                        {

                            opacity: 1,

                            scale: 1,

                            duration: .20,

                            ease:
                                "power2.out"

                        }
                    );


                    /* 135 → 180 */

                    timeline.to(
                        state,
                        {

                            angle: 180,

                            duration: .70,

                            ease:
                                "power1.inOut",

                            onUpdate:
                                function () {


                                    positionService(
                                        service,
                                        state
                                    );


                                }

                        },
                        "<0.04"
                    );


                    timeline.to(
                        image,
                        {

                            scale: 1.08,

                            rotation: 0,

                            duration: .20,

                            ease:
                                "power2.out"

                        }
                    );


                    /* CARD OPEN */

                    timeline.to(
                        content,
                        {

                            autoAlpha: 1,

                            x: 0,

                            filter:
                                "blur(0px)",

                            clipPath:
                                "inset(0 0 0 0% round 27px)",

                            duration: .48,

                            ease:
                                "power3.out"

                        },
                        "<0.04"
                    );


                    /* TEXT */

                    timeline.to(
                        textElements,
                        {

                            opacity: 1,

                            x: 0,

                            filter:
                                "blur(0px)",

                            duration: .32,

                            stagger: .045,

                            ease:
                                "power2.out"

                        },
                        "<0.20"
                    );


                    /* HOLD */

                    timeline.to(
                        {},
                        {

                            duration: .46

                        }
                    );


                    /* TEXT OUT */

                    timeline.to(
                        textElements,
                        {

                            opacity: 0,

                            x: 16,

                            filter:
                                "blur(5px)",

                            duration: .22,

                            stagger: {

                                each: .025,

                                from: "end"

                            },

                            ease:
                                "power2.in"

                        }
                    );


                    /* CARD CLOSE */

                    timeline.to(
                        content,
                        {

                            autoAlpha: 0,

                            x: 34,

                            filter:
                                "blur(10px)",

                            clipPath:
                                "inset(0 0 0 100% round 27px)",

                            duration: .38,

                            ease:
                                "power3.in"

                        },
                        "<0.06"
                    );


                    timeline.to(
                        image,
                        {

                            scale: 1,

                            duration: .16,

                            ease:
                                "power2.inOut"

                        },
                        "<0.12"
                    );


                    /* 180 → 225 */

                    timeline.to(
                        state,
                        {

                            angle: 225,

                            duration: .65,

                            ease:
                                "power1.inOut",

                            onUpdate:
                                function () {


                                    positionService(
                                        service,
                                        state
                                    );


                                }

                        }
                    );


                    /* IMAGE OUT */

                    timeline.to(
                        image,
                        {

                            opacity: 0,

                            scale: .76,

                            duration: .20,

                            ease:
                                "power2.in"

                        },
                        "<0.14"
                    );


                    timeline.set(
                        service,
                        {

                            autoAlpha: 0

                        }
                    );


                }
            );


            /* =================================================
               END
            ================================================= */


            timeline.to(
                rings,
                {

                    opacity: 0,

                    scale: .82,

                    duration: .34,

                    ease:
                        "power2.in"

                }
            );


            timeline.to(
                mainState,
                {

                    progress: 0,

                    duration: .55,

                    ease:
                        "power2.inOut",

                    onUpdate:
                        updateMain

                },
                "<0.04"
            );


            timeline.to(
                progress,
                {

                    opacity: 0,

                    duration: .18

                },
                "<"
            );


            /* =================================================
               SCROLLTRIGGER
            ================================================= */


            ScrollTrigger.create({

                trigger: section,

                animation: timeline,

                start: "top top",

                end: "bottom bottom",

                scrub: .85,

                invalidateOnRefresh: true,

                onUpdate:
                    function (self) {


                        if (
                            progressFill
                        ) {


                            gsap.set(
                                progressFill,
                                {

                                    scaleX:
                                        self.progress

                                }
                            );


                        }


                    }

            });


            /* =================================================
               DESKTOP / TABLET RESIZE
            ================================================= */


            let resizeTimer;


            function refreshOrbit() {


                if (
                    window.innerWidth <= 767
                ) {

                    return;

                }


                clearTimeout(
                    resizeTimer
                );


                resizeTimer =
                    setTimeout(
                        function () {


                            updateMain();


                            services.forEach(
                                function (
                                    service,
                                    index
                                ) {


                                    positionService(
                                        service,
                                        serviceStates[index]
                                    );


                                }
                            );


                            ScrollTrigger.refresh();


                        },
                        180
                    );


            }


            window.addEventListener(
                "resize",
                refreshOrbit,
                {
                    passive: true
                }
            );


            window.addEventListener(
                "orientationchange",
                refreshOrbit,
                {
                    passive: true
                }
            );


            setTimeout(
                function () {


                    updateMain();


                    services.forEach(
                        function (
                            service,
                            index
                        ) {


                            positionService(
                                service,
                                serviceStates[index]
                            );


                        }
                    );


                    ScrollTrigger.refresh();


                },
                500
            );


        });


    }


    /* =========================================================
       INIT
    ========================================================== */


    if (
        document.readyState === "loading"
    ) {


        document.addEventListener(
            "DOMContentLoaded",
            aliInitializeOrbit
        );


    } else {


        aliInitializeOrbit();


    }


    window.addEventListener(
        "load",
        function () {


            setTimeout(
                aliInitializeOrbit,
                200
            );


        }
    );


})();



/* Recovered original homepage script 11. */


(function(){

    const sections =
        document.querySelectorAll(
            '.ro-space-process'
        );


    sections.forEach(function(section){

        const cards =
            section.querySelectorAll(
                '.ro-process-card'
            );


        /* ==============================================
           REVEAL
        ============================================== */

        const sectionObserver =
            new IntersectionObserver(
                function(entries){

                    entries.forEach(
                        function(entry){

                            if(
                                entry.isIntersecting
                            ){

                                section.classList.add(
                                    'ro-active'
                                );


                                cards.forEach(
                                    function(card,index){

                                        /*
                                        Less delay on mobile.
                                        Prevents page from feeling
                                        broken / empty.
                                        */

                                        const isMobile =
                                            window.matchMedia(
                                                '(max-width:767px)'
                                            ).matches;


                                        const delay =
                                            isMobile
                                            ? 70 + (index * 90)
                                            : 150 + (index * 170);


                                        setTimeout(
                                            function(){

                                                card.classList.add(
                                                    'ro-show'
                                                );

                                            },
                                            delay
                                        );

                                    }
                                );


                                sectionObserver.unobserve(
                                    section
                                );

                            }

                        }
                    );

                },
                {
                    threshold:.10
                }
            );


        sectionObserver.observe(
            section
        );


        /* ==============================================
           DESKTOP PARALLAX ONLY
        ============================================== */

        if(
            window.matchMedia(
                '(min-width:768px) and (pointer:fine)'
            ).matches
        ){

            const leftPlanet =
                section.querySelector(
                    '.ro-planet-left'
                );

            const rightPlanet =
                section.querySelector(
                    '.ro-planet-right'
                );


            section.addEventListener(
                'mousemove',
                function(e){

                    const rect =
                        section.getBoundingClientRect();


                    const x =
                        (
                            e.clientX -
                            rect.left
                        ) /
                        rect.width -
                        .5;


                    const y =
                        (
                            e.clientY -
                            rect.top
                        ) /
                        rect.height -
                        .5;


                    if(leftPlanet){

                        leftPlanet.style.transform =
                            'translate(' +
                            (x * 12) +
                            'px,' +
                            (y * 10) +
                            'px)';
                    }


                    if(rightPlanet){

                        rightPlanet.style.transform =
                            'translate(' +
                            (x * -15) +
                            'px,' +
                            (y * -12) +
                            'px)';
                    }

                }
            );


            section.addEventListener(
                'mouseleave',
                function(){

                    if(leftPlanet){

                        leftPlanet.style.transform =
                            'translate(0,0)';
                    }


                    if(rightPlanet){

                        rightPlanet.style.transform =
                            'translate(0,0)';
                    }

                }
            );

        }

    });

})();



/* Recovered original homepage script 12. */

(function () {
    "use strict";

    function RO1InitializeVideoMarquee() {

        const marquees =
            document.querySelectorAll(".RO1-video-marquee");

        marquees.forEach(function (marquee) {

            if (
                marquee.dataset.RO1Initialized === "yes"
            ) {
                return;
            }

            const track =
                marquee.querySelector(
                    ".RO1-video-marquee-track"
                );

            const originalGroup =
                marquee.querySelector(
                    ".RO1-video-marquee-group"
                );

            if (!track || !originalGroup) {
                return;
            }

            /* Create duplicate group for seamless loop */
            const duplicateGroup =
                originalGroup.cloneNode(true);

            duplicateGroup.setAttribute(
                "aria-hidden",
                "true"
            );

            duplicateGroup
                .querySelectorAll(".RO1-video-card")
                .forEach(function (card) {

                    card.setAttribute(
                        "tabindex",
                        "-1"
                    );

                });

            track.appendChild(duplicateGroup);

            marquee.dataset.RO1Initialized =
                "yes";
        });

        RO1BindVideoCards();
    }


    function RO1BindVideoCards() {

        const cards =
            document.querySelectorAll(
                ".RO1-video-card"
            );

        const lightbox =
            document.getElementById(
                "RO1-video-lightbox"
            );

        const player =
            document.getElementById(
                "RO1-video-lightbox-player"
            );

        const closeButton =
            document.getElementById(
                "RO1-video-lightbox-close"
            );

        if (
            !lightbox ||
            !player ||
            !closeButton
        ) {
            return;
        }


        function openLightbox(videoURL) {

            if (!videoURL) {
                return;
            }

            player.pause();

            player.removeAttribute("src");

            player.load();

            player.src = videoURL;

            lightbox.classList.remove(
                "RO1-is-hidden"
            );

            lightbox.setAttribute(
                "aria-hidden",
                "false"
            );

            document.documentElement
                .classList.add(
                    "RO1-video-lock"
                );

            document.body
                .classList.add(
                    "RO1-video-lock"
                );

            player.load();

            const playPromise =
                player.play();

            if (
                playPromise !== undefined
            ) {

                playPromise.catch(
                    function () {
                        /* Controls remain available */
                    }
                );

            }
        }


        function closeLightbox() {

            player.pause();

            player.removeAttribute("src");

            player.load();

            lightbox.classList.add(
                "RO1-is-hidden"
            );

            lightbox.setAttribute(
                "aria-hidden",
                "true"
            );

            document.documentElement
                .classList.remove(
                    "RO1-video-lock"
                );

            document.body
                .classList.remove(
                    "RO1-video-lock"
                );
        }


        cards.forEach(function (card) {

            if (
                card.dataset.RO1Bound === "yes"
            ) {
                return;
            }

            card.addEventListener(
                "click",
                function () {

                    const videoURL =
                        card.getAttribute(
                            "data-RO1-video"
                        );

                    openLightbox(videoURL);
                }
            );

            card.dataset.RO1Bound =
                "yes";
        });


        if (
            closeButton.dataset.RO1Bound !==
            "yes"
        ) {

            closeButton.addEventListener(
                "click",
                closeLightbox
            );

            closeButton.dataset.RO1Bound =
                "yes";
        }


        if (
            lightbox.dataset.RO1Bound !==
            "yes"
        ) {

            lightbox.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target ===
                        lightbox
                    ) {
                        closeLightbox();
                    }

                }
            );

            lightbox.dataset.RO1Bound =
                "yes";
        }


        if (
            document.body.dataset
                .RO1EscapeBound !== "yes"
        ) {

            document.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key ===
                            "Escape" &&
                        !lightbox.classList
                            .contains(
                                "RO1-is-hidden"
                            )
                    ) {

                        closeLightbox();

                    }

                }
            );

            document.body.dataset
                .RO1EscapeBound =
                "yes";
        }
    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            RO1InitializeVideoMarquee
        );

    } else {

        RO1InitializeVideoMarquee();

    }


    window.addEventListener(
        "elementor/frontend/init",
        function () {

            if (
                window.elementorFrontend &&
                window.elementorFrontend.hooks
            ) {

                window.elementorFrontend
                    .hooks
                    .addAction(
                        "frontend/element_ready/html.default",
                        function () {

                            RO1InitializeVideoMarquee();

                        }
                    );

            }

        }
    );

})();


/* Recovered original homepage script 14. */


(function(){

    function initROC(){

        const zones =
            document.querySelectorAll(
                '.roc-scroll-zone'
            );


        zones.forEach(function(zone){

            if(
                zone.dataset.rocReady === 'yes'
            ){
                return;
            }


            zone.dataset.rocReady = 'yes';


            const section =
                zone.querySelector('.roc-cta');


            const floats =
                section.querySelectorAll(
                    '.roc-float'
                );

            const pauseDuration = 2000;


            let targetProgress = 0;

            let smoothProgress = 0;

            let rafId = null;



            /* ===========================================
               GET SCROLL PROGRESS
            =========================================== */

            function calculateProgress(){

                const rect =
                    zone.getBoundingClientRect();


                const scrollableDistance =
                    zone.offsetHeight -
                    window.innerHeight;


                if(
                    scrollableDistance <= 0
                ){
                    return 1;
                }


                let progress =
                    (-rect.top) /
                    scrollableDistance;


                progress =
                    Math.max(
                        0,
                        Math.min(
                            1,
                            progress
                        )
                    );


                return progress;

            }



            /* ===========================================
               MOBILE POSITIONS
            =========================================== */

            function getPosition(
                item,
                x,
                y
            ){

                if(
                    window.innerWidth <= 767
                ){

                    const mobileScale =
                        .29;


                    return {

                        x:
                            x *
                            mobileScale,

                        y:
                            y *
                            .75

                    };

                }


                if(
                    window.innerWidth <= 1200
                ){

                    return {

                        x:x * .72,
                        y:y * .88

                    };

                }


                return {
                    x:x,
                    y:y
                };

            }



            /* ===========================================
               RENDER
            =========================================== */

            function render(){

                /*
                Smooth interpolation.
                This creates the buttery reference feel.
                */

                smoothProgress +=
                    (
                        targetProgress -
                        smoothProgress
                    ) * .09;


                const p =
                    smoothProgress;


                /*
                Ease-out cubic
                */

                const eased =
                    1 -
                    Math.pow(
                        1 - p,
                        3
                    );


                floats.forEach(
                    function(
                        item,
                        index
                    ){

                        let x =
                            parseFloat(
                                item.dataset.x || 0
                            );


                        let y =
                            parseFloat(
                                item.dataset.y || 0
                            );


                        let rotation =
                            parseFloat(
                                item.dataset.r || 0
                            );


                        let finalScale =
                            parseFloat(
                                item.dataset.s || 1
                            );


                        const pos =
                            getPosition(
                                item,
                                x,
                                y
                            );


                        /*
                        Slight stagger.

                        Items farther away feel
                        fractionally delayed.
                        */

                        const delay =
                            index * .018;


                        let localP =
                            (
                                eased -
                                delay
                            ) /
                            (
                                1 -
                                delay
                            );


                        localP =
                            Math.max(
                                0,
                                Math.min(
                                    1,
                                    localP
                                )
                            );


                        const moveX =
                            pos.x *
                            localP;


                        const moveY =
                            pos.y *
                            localP;


                        const rotate =
                            rotation *
                            localP;


                        const scale =
                            .28 +
                            (
                                finalScale -
                                .28
                            ) *
                            localP;


                        const opacity =
                            Math.min(
                                1,
                                localP * 2.5
                            );


                        const blur =
                            5 *
                            (
                                1 -
                                localP
                            );


                        item.style.transform =
                            'translate(-50%,-50%) ' +
                            'translate(' +
                            moveX +
                            'px,' +
                            moveY +
                            'px) ' +
                            'rotate(' +
                            rotate +
                            'deg) ' +
                            'scale(' +
                            scale +
                            ')';


                        item.style.opacity =
                            opacity;


                        item.style.filter =
                            'blur(' +
                            blur +
                            'px)';

                    }
                );



                /*
                Small scale effect on center copy.
                Very subtle.
                */

                const center =
                    section.querySelector(
                        '.roc-center'
                    );


                if(center){

                    center.style.transform =
                        'scale(' +
                        (
                            1 -
                            eased * .025
                        )
                        +
                        ')';

                }



                /*
                Continue smoothing if needed
                */

                if(
                    Math.abs(
                        targetProgress -
                        smoothProgress
                    ) > .001
                ){

                    rafId =
                        requestAnimationFrame(
                            render
                        );

                }

                else{

                    rafId = null;

                }

            }



            /* ===========================================
               UPDATE
            =========================================== */

            function update(){

                targetProgress =
                    calculateProgress();


                if(!rafId){

                    rafId =
                        requestAnimationFrame(
                            render
                        );

                }

            }


            const pauseObserver =
                new IntersectionObserver(
                    function(entries, observer){

                        entries.forEach(
                            function(entry){

                                if(
                                    entry.isIntersecting
                                ){

                                    window.scrollTo({
                                        top:
                                            window.scrollY +
                                            zone.getBoundingClientRect().top,
                                        behavior:'instant'
                                    });

                                    update();

                                    section.classList.add(
                                        'roc-hold'
                                    );

                                    const htmlOverflow =
                                        document.documentElement.style.overflow;

                                    const bodyOverflow =
                                        document.body.style.overflow;

                                    document.documentElement.style.overflow =
                                        'hidden';

                                    document.body.style.overflow =
                                        'hidden';

                                    setTimeout(
                                        function(){

                                            section.classList.remove(
                                                'roc-hold'
                                            );

                                            document.documentElement.style.overflow =
                                                htmlOverflow;

                                            document.body.style.overflow =
                                                bodyOverflow;

                                        },
                                        pauseDuration
                                    );

                                    observer.unobserve(
                                        zone
                                    );

                                }

                            }
                        );

                    },
                    {
                        threshold:.25
                    }
                );


            pauseObserver.observe(
                zone
            );



            /* ===========================================
               EVENTS
            =========================================== */

            window.addEventListener(
                'scroll',
                update,
                {
                    passive:true
                }
            );


            window.addEventListener(
                'resize',
                update
            );


            update();

        });

    }



    /*
    Elementor sometimes injects HTML widgets
    after DOMContentLoaded, therefore both are used.
    */

    if(
        document.readyState === 'loading'
    ){

        document.addEventListener(
            'DOMContentLoaded',
            initROC
        );

    }

    else{

        initROC();

    }


    window.addEventListener(
        'load',
        initROC
    );

})();



/* Recovered original homepage script 15. */


        document.addEventListener(
            'DOMContentLoaded',
            function(){

                const footers =
                    document.querySelectorAll(
                        '.rnkft-footer'
                    );


                footers.forEach(
                    function(footer){

                        const items =
                            footer.querySelectorAll(
                                '.rnkft-reveal'
                            );


                        if(
                            !(
                                'IntersectionObserver'
                                in window
                            )
                        ){

                            items.forEach(
                                function(item){

                                    item.classList.add(
                                        'rnkft-visible'
                                    );

                                }
                            );

                            return;

                        }


                        const observer =
                            new IntersectionObserver(

                                function(entries){

                                    entries.forEach(
                                        function(entry){

                                            if(
                                                !entry.isIntersecting
                                            ){
                                                return;
                                            }


                                            const index =
                                                Array
                                                .prototype
                                                .indexOf
                                                .call(
                                                    items,
                                                    entry.target
                                                );


                                            setTimeout(
                                                function(){

                                                    entry
                                                    .target
                                                    .classList
                                                    .add(
                                                        'rnkft-visible'
                                                    );

                                                },
                                                Math.min(
                                                    index * 55,
                                                    280
                                                )
                                            );


                                            observer.unobserve(
                                                entry.target
                                            );

                                        }
                                    );

                                },

                                {
                                    threshold:.06,
                                    rootMargin:
                                        '0px 0px -20px 0px'
                                }

                            );


                        items.forEach(
                            function(item){

                                observer.observe(
                                    item
                                );

                            }
                        );

                    }
                );

            }
        );

        

/* Recovered original homepage script 17. */


        (function () {

            function roScrollToContact(event) {

                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }


                /*
                 * CONTACT SECTION FIND KARO
                 */

                var target =
                    document.getElementById('contact') ||
                    document.querySelector('[id="contact"]');


                if (!target) {

                    console.error(
                        'Rank Orbit: #contact section nahi mila.'
                    );

                    return false;
                }


                /*
                 * TARGET POSITION
                 */

                var headerOffset = 90;

                var targetPosition =
                    target.getBoundingClientRect().top +
                    window.pageYOffset -
                    headerOffset;


                /*
                 * SMOOTH SCROLL
                 */

                try {

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                } catch (error) {

                    window.scrollTo(
                        0,
                        targetPosition
                    );

                }


                /*
                 * HASH UPDATE
                 */

                try {

                    history.replaceState(
                        null,
                        '',
                        '#contact'
                    );

                } catch(e) {}


                return false;
            }


            /*
             * BUTTON CLICK
             */

            document.addEventListener(
                'DOMContentLoaded',
                function () {

                    var button =
                        document.getElementById(
                            'ro-floating-started'
                        );

                    if (!button) return;


                    button.addEventListener(
                        'click',
                        roScrollToContact
                    );

                }
            );


            /*
             * EXTRA FALLBACK
             */

            document.addEventListener(
                'click',
                function(e){

                    var button =
                        e.target.closest(
                            '#ro-floating-started'
                        );

                    if (!button) return;

                    roScrollToContact(e);

                }
            );

        })();

    