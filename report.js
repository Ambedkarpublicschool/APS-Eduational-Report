/**************************************************
 * Educational Report
 **************************************************/

let reportStudents = [];

let reportClass = "";

let reportSection = "";

let reportSearch = "";


/**************************************************
 * Init
 **************************************************/

async function initEducationalReport() {

    document.getElementById("attendanceTab")
        .classList.remove("active");

    document.getElementById("reportTab")
        .classList.add("active");

    reportClass = document.getElementById("class").value;

    reportSection = document.getElementById("section").value;

    reportSearch = "";

    await loadEducationalStudents();

}


/**************************************************
 * Load Students
 **************************************************/

async function loadEducationalStudents() {

    showLoader();

    try {

        reportStudents =
            await getEducationalHistory(
                reportClass,
                reportSection
            );

        renderEducationalStudents();

    }

    catch (err) {

        console.error(err);

        showToast(err.message || err);

    }

    hideLoader();

}


/**************************************************
 * Render
 **************************************************/

function renderEducationalStudents() {

    const content =
        document.getElementById("content");

    let html = "";

    const keyword =
        reportSearch.toLowerCase();

    const students =
        reportStudents.filter(s => {

            return (

                s.studentName
                .toLowerCase()
                .includes(keyword)

                ||

                s.studentId
                .toLowerCase()
                .includes(keyword)

            );

        });

    if (students.length == 0) {

        content.innerHTML =

            `
            <div class="empty">

                No Student Found

            </div>
            `;

        return;

    }

    students.forEach(student => {

        html += createReportCard(student);

    });

    content.innerHTML = html;

}

/**************************************************
 * Student Card
 **************************************************/

function createReportCard(student) {

    const photo = student.photo && student.photo.trim() !== ""
        ? student.photo
        : "https://via.placeholder.com/70x70?text=Photo";

    return `

    <div class="student-card">

        <div class="student-photo">

            <img src="${photo}"
                 alt="${student.studentName}"
                 loading="lazy">

        </div>

        <div class="student-info">

            <h3>${student.studentName}</h3>

            <p>
                <strong>ID :</strong>
                ${student.studentId}
            </p>

            <p>
                <strong>Class :</strong>
                ${student.currentClass}
                -
                ${student.section}
            </p>

        </div>

        <div class="student-actions">

            <button
                class="btn btn-primary"
                onclick="openSubmitReport(${student.rowNumber})">

                Submit Report

            </button>

            <button
                class="btn btn-success"
                onclick="viewEducationalHistory(${student.rowNumber})">

                View Report

            </button>

        </div>

    </div>

    `;

}

/**************************************************
 * Find Student
 **************************************************/

function getReportStudent(rowNumber){

    return reportStudents.find(
        s => s.rowNumber == rowNumber
    );

}

/**************************************************
 * Search
 **************************************************/

document
.getElementById("search")
.addEventListener("input", function(){

    reportSearch = this.value.trim();

    renderEducationalStudents();

});

document
.getElementById("class")
.addEventListener("change", async function(){

    reportClass = this.value;

    reportSection = "";

    document.getElementById("section").value="";

    await loadEducationalStudents();

});

document
.getElementById("section")
.addEventListener("change", async function(){

    reportSection = this.value;

    await loadEducationalStudents();

});

document
.getElementById("reportTab")
.addEventListener("click", initEducationalReport);

