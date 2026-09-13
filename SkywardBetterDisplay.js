async function replaceSemesterGrades() {
    // ─────────────────────────────────────────────
    // Get the grade-info HTML from the SIS
    // ─────────────────────────────────────────────
    function getGradeInfo(link) {
        return new Promise((resolve, reject) => {
            sff.request(
                "sfgradebook001.w",
                {
                    action: "viewGradeInfoDialog",
                    gridCount: sff.getValue("gridCount"),
                    fromHttp: "yes",

                    stuId: link.dataset.sid,
                    entityId: link.dataset.eid,
                    corNumId: link.dataset.cni,
                    track: link.dataset.trk,
                    section: sff.revertCharReplaceForId(link.dataset.sec),
                    gbId: link.dataset.gid,
                    bucket: link.dataset.bkt,
                    subjectId: link.dataset.subjid || "",
                    dialogLevel: 1,
                    isEoc: link.dataset.iseoc
                },
                response => {
                    if (response.status === "success") {
                        resolve(response.output);
                    } else {
                        reject(response);
                    }
                }
            );
        });
    }


    // ─────────────────────────────────────────────
    // Extract the overall percentage from the
    // "S1 Grade / Score (%)" summary table
    // ─────────────────────────────────────────────
    function getOverallPercentage(html) {
        const doc = new DOMParser().parseFromString(
            html,
            "text/html"
        );

        const summaryTable = [...doc.querySelectorAll("table")]
            .find(table =>
                table.innerText.includes("S1 Grade") &&
                table.innerText.includes("Score (%)")
            );

        if (!summaryTable) {
            throw new Error(
                "Could not find S1 summary table"
            );
        }

        const rows = [
            ...summaryTable.querySelectorAll("tbody tr")
        ];

        const gradeRow = rows.find(row => {
            const cells = row.querySelectorAll("td");

            return (
                cells.length >= 2 &&
                cells[0].innerText.trim() !== "" &&
                /^\d+(?:\.\d+)?$/.test(
                    cells[1].innerText.trim()
                )
            );
        });

        if (!gradeRow) {
            throw new Error(
                "Could not find overall grade row"
            );
        }

        const cells = gradeRow.querySelectorAll("td");

        return {
            letter: cells[0].innerText.trim(),
            percentage: cells[1].innerText.trim()
        };
    }


    // ─────────────────────────────────────────────
    // Find every SEM 1 grade
    // ─────────────────────────────────────────────
    const links = [
        ...document.querySelectorAll(
            'a#showGradeInfo[name="showGradeInfo"][data-bkt="SEM 1"]'
        )
    ];

    console.log(
        `Found ${links.length} SEM 1 grades`
    );


    // ─────────────────────────────────────────────
    // Replace each letter grade with its percentage
    // ─────────────────────────────────────────────
    for (const link of links) {
        try {
            const result = getOverallPercentage(
                await getGradeInfo(link)
            );

            link.textContent = `${result.percentage}%`;

            console.log(
                `${link.dataset.cni}: ` +
                `${result.letter} → ${result.percentage}%`
            );

        } catch (error) {
            console.error(
                `Couldn't get grade for ${link.dataset.cni}:`,
                error
            );
        }
    }

    console.log("✅ Semester grade replacement complete!");
}


// Run it
replaceSemesterGrades();
const rows = [
    ...document.querySelectorAll(
        '#grid_stuGradesGrid_28753_100 tbody tr[group-parent]'
    )
];

rows.forEach(row => {
    const term1 = row
        .querySelector('[data-bkt="TERM 1"]')
        ?.closest('td');

    const term2 = row
        .querySelector('[data-bkt="TERM 2"]')
        ?.closest('td');

    const sem1 = row
        .querySelector('[data-bkt="SEM 1"]')
        ?.closest('td');

    if (!term1 || !term2 || !sem1) return;

    // Keep TERM 1 as the letter
    // Hide TERM 2
    term2.style.display = 'none';

    // Hide the spacer between TERM 2 and SEM 1
    if (term2.nextElementSibling) {
        term2.nextElementSibling.style.display = 'none';
    }

    // SEM 1 becomes the percentage
});

const headerRow = document.querySelector(
    '#grid_stuGradesGrid_28753_100 thead tr'
);

if (headerRow) {
    const headers = [...headerRow.children];

    // Hide Q1
    headers[1].style.display = "none";

    // Hide Q2
    headers[2].style.display = "none";

    // SE1 → S1 Letter
    headers[3].style.display = "";
    headers[3].querySelector("div").textContent = "S1 Letter";

    // S1 → S1 Percent
    headers[4].style.display = "";
    headers[4].querySelector("div").textContent = "S1 Percent";
}

const darkMode = document.createElement("style");

darkMode.textContent = `
    /* Base */
    html,
    body {
        background: #121212 !important;
        color: #e8e8e8 !important;
    }

    #page,
    #content,
    .content,
    .sf_content,
    .fixedColWrap,
    .fixedHeader,
    .fixedRows {
        background: #121212 !important;
        color: #e8e8e8 !important;
    }

    /* Tables */
    table,
    tbody,
    tr,
    td,
    th {
        background: #181818 !important;
        color: #e8e8e8 !important;
    }

    th {
        background: #222222 !important;
    }

    /* Links */
    a {
        color: #8ab4f8 !important;
    }

    /* Inputs */
    input,
    select,
    textarea {
        background: #222222 !important;
        color: #e8e8e8 !important;
        border-color: #444 !important;
    }

    /* Navigation */
    #sf_navMenu,
    #sf_navMenu li,
    #sf_navMenu .sf_navMenuItem {
        background: #181a1f !important;
    }

    #sf_navMenu .sf_navMenuItem {
        color: #e6e6e6 !important;
        border-color: #303238 !important;
        opacity: 1 !important;
        text-shadow: none !important;
        filter: none !important;
    }

    #sf_navMenu .sf_navMenuItem:hover {
        background: #252830 !important;
        color: #ffffff !important;
    }

    #sf_navMenu li.selected,
    #sf_navMenu li.selected .sf_navMenuItem {
        background: #2b2e36 !important;
        color: #ffffff !important;
    }

    /* Grid tables */
    .sf_gridTableWrap,
    .sf_gridTableWrap table,
    .sf_gridTableWrap tbody,
    .sf_gridTableWrap tr,
    .sf_gridTableWrap td {
        background: #181a1f !important;
        color: #e6e6e6 !important;
    }

    .sf_gridTableWrap a {
        color: #8ab4f8 !important;
    }

    /* Grades */
    #grid_stuGradesGrid_28753_100,
    #grid_stuGradesGrid_28753_100 tbody,
    #grid_stuGradesGrid_28753_100 tr,
    #grid_stuGradesGrid_28753_100 td,
    #grid_stuGradesGrid_28753_100 th {
        background: #181a1f !important;
        color: #e6e6e6 !important;
    }

    #grid_stuGradesGrid_28753_100 .sf_highlightYellow {
        background: #22242a !important;
        color: #e6e6e6 !important;
    }

    #grid_stuGradesGrid_28753_100 tbody tr[group-parent],
    #grid_stuGradesGrid_28753_100 tbody tr[group-parent] td {
        background: #181a1f !important;
        color: #e6e6e6 !important;
    }

    /* Tags */
    .sfTag {
        background: #181a1f !important;
        color: #e6e6e6 !important;
        border-color: #303238 !important;
    }

    /* Header */
    #sf_HeaderWrap {
        background: #181a1f !important;
        color: #e6e6e6 !important;
    }

    #sf_HeaderWrap .sf_titleArea,
    #sf_HeaderWrap #sf_StudentLabel,
    #sf_HeaderWrap #sf_UtilityTable {
        background: #181a1f !important;
        color: #e6e6e6 !important;
    }

    #sf_HeaderWrap #sf_UtilityTable,
    #sf_HeaderWrap #sf_UtilityTable * {
        color: #e6e6e6 !important;
    }

    #sf_HeaderWrap #sf_StudentLabel {
        color: #ff6b6b !important;
    }

    /* Page background */
    #sf_Background {
        background: #101114 !important;
        background-color: #101114 !important;
    }

    /* Suppressed assignments */
    #grid_suppressed_gridWrap,
    #grid_suppressed_gridWrap table,
    #grid_suppressed_gridWrap tbody,
    #grid_suppressed_gridWrap tr,
    #grid_suppressed_gridWrap td,
    #grid_suppressed_gridWrap th {
        background: #181a1f !important;
        color: #e6e6e6 !important;
    }

    /* Missing assignments */
    #grid_missingAssignmentsModule_gridWrap,
    #grid_missingAssignmentsModule_gridWrap table,
    #grid_missingAssignmentsModule_gridWrap tbody,
    #grid_missingAssignmentsModule_gridWrap tr,
    #grid_missingAssignmentsModule_gridWrap td,
    #grid_missingAssignmentsModule_gridWrap th {
        background: #181a1f !important;
        color: #e6e6e6 !important;
    }
    #grid_stuGradesGrid_28753_100_gridWrap {
    border-bottom: none !important;
    box-shadow: none !important;
}
.sf_heading {
    color: #e6e6e6 !important;
}
#sf_UtilityArea,
#sf_UtilityArea * {
    background-color: #181a1f !important;
    color: #e6e6e6 !important;
}
.sf_utilityAreaBG {
    background: transparent !important;
    border: 1px solid #ffffff !important;
}
#grid_stuGradesGrid_28753_100_gridWrap {
    background: #181a1f !important;
    background-color: #181a1f !important;
}
`;

document.head.appendChild(darkMode);
