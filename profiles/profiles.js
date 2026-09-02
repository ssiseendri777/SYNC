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
let cardStep = 0;
let cardWidth = 0;

let autoPlayTimer = null;

const AUTO_PLAY_DELAY = 3000;


// =====================================================
// CALCULATE CARD POSITION
// =====================================================

function calculateCardStep() {

    const firstCard = track.querySelector(".profile-card");

    if (!firstCard) {
        cardStep = 0;
        cardWidth = 0;
        return;
    }

    const cardStyle = window.getComputedStyle(track);
    const gap = parseFloat(cardStyle.columnGap) || 0;

    cardWidth = firstCard.getBoundingClientRect().width;

    cardStep = cardWidth + gap;
}


// =====================================================
// UPDATE CENTER CARD
// =====================================================

function updateCenterCard() {

    const cards = track.querySelectorAll(".profile-card");

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

    const cards = track.querySelectorAll(".profile-card");

    if (!cards.length) {
        return;
    }

    const targetCard = cards[currentIndex];

    if (!targetCard) {
        return;
    }


    // Temporarily remove the transform so we can
    // measure the card's real position.
    track.style.transition = "none";
    track.style.transform = "translateX(0)";


    requestAnimationFrame(() => {

        const containerRect =
            carousel.getBoundingClientRect();

        const cardRect =
            targetCard.getBoundingClientRect();


        // Center of carousel
        const containerCenter =
            containerRect.left +
            (containerRect.width / 2);


        // Center of selected card
        const cardCenter =
            cardRect.left +
            (cardRect.width / 2);


        // Exact amount required to move the card
        // into the middle of the carousel.
        const offset =
            containerCenter - cardCenter;


        track.style.transition = animate
            ? "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)"
            : "none";


        track.style.transform =
            `translateX(${offset}px)`;


        updateCenterCard();

    });
}


// =====================================================
// BUILD INFINITE CAROUSEL
// =====================================================

function buildCarousel() {

    track.innerHTML = "";

    if (!filteredCards.length) {

        currentIndex = 0;

        track.style.transform = "translateX(0)";

        updateButtonState();

        return;
    }


    /*
        We create three copies:

        [COPY 1] [MAIN] [COPY 3]

        When the user reaches either end,
        JavaScript silently jumps to the
        corresponding card in the middle.
    */

    const firstSet = filteredCards.map(card =>
        card.cloneNode(true)
    );

    const secondSet = filteredCards.map(card =>
        card.cloneNode(true)
    );

    const thirdSet = filteredCards.map(card =>
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


    currentIndex = filteredCards.length;


    requestAnimationFrame(() => {

        calculateCardStep();

        moveTrack(false);

        updateButtonState();

    });
}


// =====================================================
// MOVE ONE CARD TO THE RIGHT
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
// MOVE ONE CARD TO THE LEFT
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

track.addEventListener("transitionend", () => {

    const total = filteredCards.length;

    if (!total) {
        return;
    }


    /*
        If we move into COPY 3,
        jump back to MAIN.
    */

    if (currentIndex >= total * 2) {

        currentIndex -= total;

        moveTrack(false);

    }


    /*
        If we move into COPY 1,
        jump forward to MAIN.
    */

    else if (currentIndex < total) {

        currentIndex += total;

        moveTrack(false);

    }

});


// =====================================================
// BUTTON CONTROLS
// =====================================================

nextBtn.addEventListener("click", () => {

    nextSlide();

});


prevBtn.addEventListener("click", () => {

    previousSlide();

});


// =====================================================
// AUTOMATIC RIGHT → LEFT MOVEMENT
// =====================================================

function startAutoPlay() {

    stopAutoPlay();

    if (filteredCards.length <= 1) {
        return;
    }

    autoPlayTimer = setInterval(() => {

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
// PAUSE WHEN HOVERING
// =====================================================

carousel.addEventListener("mouseenter", () => {

    stopAutoPlay();

});


carousel.addEventListener("mouseleave", () => {

    startAutoPlay();

});


// =====================================================
// SEARCH
// =====================================================

function searchProfiles() {

    const input =
        document.getElementById("search")
            .value
            .trim()
            .toLowerCase();


    filteredCards = originalCards.filter(card => {

        const name =
            card.querySelector("h3")
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

    prevBtn.disabled = disabled;
    nextBtn.disabled = disabled;

    prevBtn.style.opacity =
        disabled ? "0.4" : "1";

    nextBtn.style.opacity =
        disabled ? "0.4" : "1";

}


// =====================================================
// RESPONSIVE RECALCULATION
// =====================================================

window.addEventListener("resize", () => {

    calculateCardStep();

    moveTrack(false);

});


// =====================================================
// INITIALIZE
// =====================================================

buildCarousel();

startAutoPlay();