function setupDateSection() {

    const canvas =
        document.getElementById(
            "scratchCanvas"
        );

    const card =
        document.getElementById(
            "scratchCard"
        );

    const afterScratch =
        document.getElementById(
            "afterScratch"
        );

    const petals =
        document.getElementById(
            "petalContainer"
        );


    if (!canvas || !card) {
        return;
    }


    const ctx =
        canvas.getContext("2d");


    let scratching = false;

    let revealed = false;

    let scratchedPoints = 0;



    /* ==========================
       CREATE SCRATCH SURFACE
    ========================== */

    function createScratchSurface() {

        const rect =
            card.getBoundingClientRect();


        const ratio =
            window.devicePixelRatio || 1;


        canvas.width =
            rect.width * ratio;


        canvas.height =
            rect.height * ratio;


        ctx.setTransform(
            ratio,
            0,
            0,
            ratio,
            0,
            0
        );


        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                rect.width,
                rect.height
            );


        gradient.addColorStop(
            0,
            "#d9c79a"
        );


        gradient.addColorStop(
            0.5,
            "#eadcb5"
        );


        gradient.addColorStop(
            1,
            "#cbb681"
        );


        ctx.fillStyle =
            gradient;


        ctx.fillRect(
            0,
            0,
            rect.width,
            rect.height
        );


        ctx.fillStyle =
            "#765f43";


        ctx.textAlign =
            "center";


        ctx.font =
            "italic 17px Cormorant Garamond";


        ctx.fillText(
            "Scratch to Reveal",
            rect.width / 2,
            rect.height / 2
        );


        ctx.font =
            "8px Cormorant Garamond";


        ctx.fillText(
            "OUR SPECIAL DATE",
            rect.width / 2,
            rect.height / 2 + 18
        );

    }



    createScratchSurface();



    /* ==========================
       SCRATCH
    ========================== */

    function scratch(x, y) {

        if (revealed) {
            return;
        }


        const rect =
            canvas.getBoundingClientRect();


        const localX =
            x - rect.left;


        const localY =
            y - rect.top;


        ctx.globalCompositeOperation =
            "destination-out";


        ctx.beginPath();


        ctx.arc(
            localX,
            localY,
            25,
            0,
            Math.PI * 2
        );


        ctx.fill();


        scratchedPoints++;


        if (scratchedPoints > 70) {

            revealDate();

        }

    }



    /* MOUSE */

    canvas.addEventListener(
        "mousedown",
        function (event) {

            scratching = true;

            scratch(
                event.clientX,
                event.clientY
            );

        }
    );


    canvas.addEventListener(
        "mousemove",
        function (event) {

            if (!scratching) {
                return;
            }


            scratch(
                event.clientX,
                event.clientY
            );

        }
    );


    window.addEventListener(
        "mouseup",
        function () {

            scratching = false;

        }
    );



    /* TOUCH */

    canvas.addEventListener(
        "touchstart",
        function (event) {

            event.preventDefault();

            scratching = true;


            const touch =
                event.touches[0];


            scratch(
                touch.clientX,
                touch.clientY
            );

        },
        {
            passive: false
        }
    );


    canvas.addEventListener(
        "touchmove",
        function (event) {

            event.preventDefault();


            if (!scratching) {
                return;
            }


            const touch =
                event.touches[0];


            scratch(
                touch.clientX,
                touch.clientY
            );

        },
        {
            passive: false
        }
    );


    canvas.addEventListener(
        "touchend",
        function () {

            scratching = false;

        }
    );



    /* ==========================
       REVEAL
    ========================== */

    function revealDate() {

        if (revealed) {
            return;
        }


        revealed = true;


        canvas.classList.add(
            "complete"
        );


        setTimeout(
            function () {

                if (afterScratch) {

                    afterScratch.classList.add(
                        "show"
                    );

                }


                if (petals) {

                    petals.classList.add(
                        "active"
                    );

                }

            },
            500
        );

    }



    /* ==========================
       COUNTDOWN
    ========================== */

    const weddingDate =
        new Date(
            "2026-11-18T18:01:00"
        );


    function updateCountdown() {

        const now =
            new Date();


        let difference =
            weddingDate.getTime() -
            now.getTime();


        if (difference < 0) {
            difference = 0;
        }


        const days =
            Math.floor(
                difference /
                (
                    1000 *
                    60 *
                    60 *
                    24
                )
            );


        const hours =
            Math.floor(
                (
                    difference /
                    (
                        1000 *
                        60 *
                        60
                    )
                ) % 24
            );


        const minutes =
            Math.floor(
                (
                    difference /
                    (
                        1000 *
                        60
                    )
                ) % 60
            );


        const seconds =
            Math.floor(
                (
                    difference /
                    1000
                ) % 60
            );


        const dayElement =
            document.getElementById(
                "days"
            );


        const hourElement =
            document.getElementById(
                "hours"
            );


        const minuteElement =
            document.getElementById(
                "minutes"
            );


        const secondElement =
            document.getElementById(
                "seconds"
            );


        if (dayElement) {
            dayElement.textContent =
                String(days)
                .padStart(2, "0");
        }


        if (hourElement) {
            hourElement.textContent =
                String(hours)
                .padStart(2, "0");
        }


        if (minuteElement) {
            minuteElement.textContent =
                String(minutes)
                .padStart(2, "0");
        }


        if (secondElement) {
            secondElement.textContent =
                String(seconds)
                .padStart(2, "0");
        }

    }


    updateCountdown();


    setInterval(
        updateCountdown,
        1000
    );

}