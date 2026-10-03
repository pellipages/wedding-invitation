document.addEventListener(
    "DOMContentLoaded",
    async function () {


        /* =============================
           LOAD SECTION
        ============================= */

        async function loadSection(
            containerId,
            file
        ) {

            const container =
                document.getElementById(
                    containerId
                );


            if (!container) {

                console.error(
                    "Container missing:",
                    containerId
                );

                return false;
            }


            try {

                const response =
                    await fetch(file);


                if (!response.ok) {

                    throw new Error(
                        file +
                        " returned " +
                        response.status
                    );

                }


                const html =
                    await response.text();


                container.innerHTML =
                    html;


                console.log(
                    "Loaded:",
                    file
                );


                return true;

            }

            catch (error) {

                console.error(
                    "Failed:",
                    file,
                    error
                );


                container.innerHTML =
                    `
                    <div style="
                        padding:40px;
                        text-align:center;
                        color:#8a1f24;
                    ">
                        Could not load ${file}
                    </div>
                    `;


                return false;

            }

        }



        /* =============================
           LOAD ALL SECTIONS
        ============================= */

        const results =
            await Promise.all([

                loadSection(
                    "hero-container",
                    "sections/hero.html"
                ),

                loadSection(
                    "couple-container",
                    "sections/couple.html"
                ),

                loadSection(
                    "date-container",
                    "sections/date.html"
                )

            ]);



        console.log(
            "Sections:",
            results
        );



        /* =============================
           HERO
        ============================= */

        if (
            typeof setupHero ===
            "function"
        ) {

            setupHero();

        }



        /* =============================
           DATE
        ============================= */

        if (
            typeof setupDateSection ===
            "function"
        ) {

            setupDateSection();

        }



        /* =============================
           OPENING LAST
        ============================= */

        if (
            typeof setupOpening ===
            "function"
        ) {

            setupOpening();

        }

    }
);