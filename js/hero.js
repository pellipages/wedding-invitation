function setupHero() {

    const hero =
        document.getElementById(
            "hero-section"
        );


    if (!hero) {
        return;
    }


    function animateHero() {

        const rect =
            hero.getBoundingClientRect();


        const heroHeight =
            hero.offsetHeight;


        let progress =
            -rect.top /
            (heroHeight * 0.75);


        progress =
            Math.max(
                0,
                Math.min(
                    1,
                    progress
                )
            );


        const opacity =
            1 - progress * 0.85;


        const scale =
            1 - progress * 0.025;


        const blur =
            progress * 3;


        hero.style.opacity =
            opacity;


        hero.style.transform =
            "scale(" +
            scale +
            ")";


        hero.style.filter =
            "blur(" +
            blur +
            "px)";

    }


    window.addEventListener(
        "scroll",
        animateHero,
        {
            passive: true
        }
    );


    animateHero();

}