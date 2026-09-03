const track = document.getElementById("carouselTrack");
const prevBtn = document.querySelector(".carousel-btn.prev");
const nextBtn = document.querySelector(".carousel-btn.next");
const carousel = document.querySelector(".carousel-container");


// =====================================================
// ORIGINAL PROFILE CARDS
// =====================================================

const originalCards = Array.from(
    track.querySelectorAll(".profile-card")
);

let filteredCards = [...originalCards];

let currentIndex = 0;

let autoPlayTimer = null;

const AUTO_PLAY_DELAY = 3000;


// =====================================================
// DRAG SETTINGS
// =====================================================

let isDragging = false;

let dragStartX = 0;
let dragCurrentX = 0;

let dragStartTransform = 0;

let hasDragged = false;

let suppressClick = false;

const DRAG_THRESHOLD = 80;


// =====================================================
// GET CURRENT TRACK POSITION
// =====================================================

function getCurrentTransform() {

    const transform =
        window.getComputedStyle(track).transform;

    if (transform === "none") {
        return 0;
    }

    const matrix = new DOMMatrix(transform);

    return matrix.m41;
}


// =====================================================
// UPDATE CENTER CARD
// =====================================================

function updateCenterCard() {

    const cards =
        track.querySelectorAll(".profile-card");

    cards.forEach((card, index) => {

        card.classList.toggle(
            "center-card",
            index === currentIndex
        );

    });
}


// =====================================================
// MOVE TRACK
// =====================================================

function moveTrack(animate = true) {

    if (!filteredCards.length) {
        return;
    }

    const cards =
        track.querySelectorAll(".profile-card");

    if (!cards.length) {
        return;
    }

    const targetCard =
        cards[currentIndex];

    if (!targetCard) {
        return;
    }


    /*
        Calculate the target position directly.

        IMPORTANT:
        We DO NOT reset the track to translateX(0)
        before moving.
    */

    const cardLeft =
        targetCard.offsetLeft;

    const cardWidth =
        targetCard.getBoundingClientRect().width;

    const containerCenter =
        carousel.clientWidth / 2;

    const offset =
        containerCenter
        - cardLeft
        - (cardWidth / 2);


    /*
        Normal movement:
        smooth physical slide.

        During drag:
        transition is disabled separately.
    */

    track.style.transition = animate
        ? "transform 0.85s cubic-bezier(0.22, 1, 0.36, 1)"
        : "none";


    track.style.transform =
        `translateX(${offset}px)`;


    updateCenterCard();
}


// =====================================================
// BUILD INFINITE CAROUSEL
// =====================================================

function buildCarousel() {

    track.innerHTML = "";

    if (!filteredCards.length) {

        currentIndex = 0;

        track.style.transform =
            "translateX(0)";

        updateButtonState();

        return;
    }


    /*
        Three copies:

        COPY 1 | MAIN | COPY 3
    */

    const firstSet =
        filteredCards.map(card =>
            card.cloneNode(true)
        );

    const secondSet =
        filteredCards.map(card =>
            card.cloneNode(true)
        );

    const thirdSet =
        filteredCards.map(card =>
            card.cloneNode(true)
        );


    firstSet.forEach(card =>
        track.appendChild(card)
    );

    secondSet.forEach(card =>
        track.appendChild(card)
    );

    thirdSet.forEach(card =>
        track.appendChild(card)
    );


    /*
        Start inside the middle copy.
    */

    currentIndex =
        filteredCards.length;


    requestAnimationFrame(() => {

        moveTrack(false);

        updateButtonState();

    });
}


// =====================================================
// NEXT SLIDE
// =====================================================

function nextSlide() {

    if (filteredCards.length <= 1) {
        return;
    }

    currentIndex++;

    moveTrack(true);

    restartAutoPlay();
}


// =====================================================
// PREVIOUS SLIDE
// =====================================================

function previousSlide() {

    if (filteredCards.length <= 1) {
        return;
    }

    currentIndex--;

    moveTrack(true);

    restartAutoPlay();
}


// =====================================================
// INFINITE LOOP
// =====================================================

track.addEventListener(
    "transitionend",
    (event) => {

        /*
            Only react to the transform transition.
        */

        if (event.propertyName !== "transform") {
            return;
        }


        /*
            Ignore while the user is dragging.
        */

        if (isDragging) {
            return;
        }


        const total =
            filteredCards.length;

        if (!total) {
            return;
        }


        /*
            Re-enter middle copy after reaching COPY 3.
        */

        if (currentIndex >= total * 2) {

            currentIndex -= total;

            moveTrack(false);

        }


        /*
            Re-enter middle copy after reaching COPY 1.
        */

        else if (currentIndex < total) {

            currentIndex += total;

            moveTrack(false);

        }

    }
);


// =====================================================
// BUTTON CONTROLS
// =====================================================

nextBtn.addEventListener(
    "click",
    (event) => {

        event.preventDefault();

        nextSlide();

    }
);


prevBtn.addEventListener(
    "click",
    (event) => {

        event.preventDefault();

        previousSlide();

    }
);


// =====================================================
// AUTOPLAY
// =====================================================

function startAutoPlay() {

    stopAutoPlay();

    if (filteredCards.length <= 1) {
        return;
    }

    autoPlayTimer =
        setInterval(() => {

            /*
                Never autoplay while dragging.
            */

            if (isDragging) {
                return;
            }

            currentIndex++;

            moveTrack(true);

        }, AUTO_PLAY_DELAY);
}


function stopAutoPlay() {

    if (autoPlayTimer) {

        clearInterval(autoPlayTimer);

        autoPlayTimer = null;
    }
}


function restartAutoPlay() {

    startAutoPlay();

}


// =====================================================
// PAUSE ON HOVER
// =====================================================

carousel.addEventListener(
    "mouseenter",
    () => {

        if (!isDragging) {
            stopAutoPlay();
        }

    }
);


carousel.addEventListener(
    "mouseleave",
    () => {

        if (!isDragging) {
            startAutoPlay();
        }

    }
);


// =====================================================
// START DRAG
// =====================================================

function startDrag(event) {

    /*
        IMPORTANT:
        Don't start carousel dragging when the user
        is actually clicking a profile link or button.
    */

    if (event.target.closest("a, button")) {
        return;
    }


    /*
        Only allow the left mouse button.
    */

    if (
        event.type === "mousedown" &&
        event.button !== 0
    ) {
        return;
    }


    isDragging = true;

    hasDragged = false;

    suppressClick = false;


    dragStartX =
        event.type === "touchstart"
            ? event.touches[0].clientX
            : event.clientX;


    dragCurrentX =
        dragStartX;


    dragStartTransform =
        getCurrentTransform();


    /*
        Disable transition so the track follows
        the cursor exactly.
    */

    track.style.transition = "none";


    stopAutoPlay();


    carousel.classList.add(
        "is-dragging"
    );
}


// =====================================================
// DRAG MOVE
// =====================================================

function dragMove(event) {

    if (!isDragging) {
        return;
    }


    dragCurrentX =
        event.type === "touchmove"
            ? event.touches[0].clientX
            : event.clientX;


    const deltaX =
        dragCurrentX - dragStartX;


    /*
        Mark it as a real drag once the mouse/finger
        has moved enough.
    */

    if (Math.abs(deltaX) > 5) {

        hasDragged = true;

        suppressClick = true;

    }


    /*
        Track follows cursor directly.
    */

    track.style.transform =
        `translateX(${dragStartTransform + deltaX}px)`;
}


// =====================================================
// END DRAG
// =====================================================

function endDrag() {

    if (!isDragging) {
        return;
    }


    isDragging = false;


    carousel.classList.remove(
        "is-dragging"
    );


    const deltaX =
        dragCurrentX - dragStartX;


    /*
        Drag left → next card
    */

    if (deltaX < -DRAG_THRESHOLD) {

        currentIndex++;

    }


    /*
        Drag right → previous card
    */

    else if (deltaX > DRAG_THRESHOLD) {

        currentIndex--;

    }


    /*
        Small drag → return to the current card.
        Large drag → settle on the next/previous card.
    */

    moveTrack(true);


    startAutoPlay();


    /*
        If a real drag occurred, the browser may
        generate a click immediately afterwards.
        Keep that click suppressed briefly.
    */

    if (hasDragged) {

        setTimeout(() => {

            suppressClick = false;
            hasDragged = false;

        }, 120);

    }
}


// =====================================================
// MOUSE EVENTS
// =====================================================

carousel.addEventListener(
    "mousedown",
    startDrag
);

window.addEventListener(
    "mousemove",
    dragMove
);

window.addEventListener(
    "mouseup",
    endDrag
);


// =====================================================
// TOUCH EVENTS
// =====================================================

carousel.addEventListener(
    "touchstart",
    startDrag,
    {
        passive: true
    }
);

carousel.addEventListener(
    "touchmove",
    dragMove,
    {
        passive: true
    }
);

carousel.addEventListener(
    "touchend",
    endDrag
);


// =====================================================
// PREVENT ONLY ACCIDENTAL CLICKS AFTER DRAGGING
// =====================================================

carousel.addEventListener(
    "click",
    (event) => {

        if (suppressClick) {

            event.preventDefault();
            event.stopPropagation();

            suppressClick = false;

        }

    },
    true
);


// =====================================================
// SEARCH
// =====================================================

function searchProfiles() {

    const input =
        document
            .getElementById("search")
            .value
            .trim()
            .toLowerCase();


    filteredCards =
        originalCards.filter(card => {

            const name =
                card
                    .querySelector("h3")
                    .innerText
                    .toLowerCase();


            return name.includes(input);

        });


    stopAutoPlay();

    buildCarousel();

    startAutoPlay();
}


// =====================================================
// BUTTON STATE
// =====================================================

function updateButtonState() {

    const disabled =
        filteredCards.length <= 1;


    prevBtn.disabled =
        disabled;

    nextBtn.disabled =
        disabled;


    prevBtn.style.opacity =
        disabled
            ? "0.4"
            : "1";


    nextBtn.style.opacity =
        disabled
            ? "0.4"
            : "1";
}


// =====================================================
// RESPONSIVE RECALCULATION
// =====================================================

window.addEventListener(
    "resize",
    () => {

        if (!isDragging) {

            moveTrack(false);

        }

    }
);


// =====================================================
// KEYBOARD CONTROLS
// =====================================================

document.addEventListener(
    "keydown",
    (event) => {

        /*
            Don't hijack arrow keys while typing
            in the search box.
        */

        if (
            document.activeElement &&
            document.activeElement.tagName === "INPUT"
        ) {
            return;
        }


        if (event.key === "ArrowRight") {

            nextSlide();

        }


        if (event.key === "ArrowLeft") {

            previousSlide();

        }

    }
);


// =====================================================
// INITIALIZE
// =====================================================

buildCarousel();

startAutoPlay();