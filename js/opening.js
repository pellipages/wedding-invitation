function setupOpening() {

    const opening =
        document.getElementById("opening");

    const video =
        document.getElementById("introVideo");

    const skip =
        document.getElementById("skipIntro");


    if (!opening) {
        return;
    }


    let finished = false;


    function finishIntro() {

        if (finished) {
            return;
        }

        finished = true;


        if (video) {
            video.pause();
        }


        opening.classList.add(
            "opening-exit"
        );


        document.body.classList.remove(
            "intro-active"
        );

        document.body.classList.add(
            "invitation-open"
        );


        setTimeout(function () {

            opening.style.display = "none";

            window.scrollTo(
                0,
                0
            );

        }, 1800);

    }


    if (video) {

        video.muted = true;

        video.defaultMuted = true;

        video.playsInline = true;


        video.addEventListener(
            "playing",
            function () {

                opening.classList.add(
                    "video-playing"
                );

            }
        );


        video.addEventListener(
            "ended",
            finishIntro
        );


        video.addEventListener(
            "error",
            function () {

                console.log(
                    "Video failed. Opening invitation."
                );

                finishIntro();

            }
        );


        const playPromise =
            video.play();


        if (playPromise) {

            playPromise.catch(
                function (error) {

                    console.log(
                        "Autoplay blocked:",
                        error
                    );

                }
            );

        }

    }


    if (skip) {

        skip.addEventListener(
            "click",
            finishIntro
        );

    }

}