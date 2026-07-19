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
    activeModule = "report";

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
        : "https://via.placeholder.com/90x90?text=Photo";

    return `

    <div class="edu-card">

        <div class="edu-left">

            <img
                src="${photo}"
                class="edu-photo"
                loading="lazy">

        </div>

        <div class="edu-center">

            <div class="edu-name">
                ${student.studentName}
            </div>

            <div class="edu-id">
                Student ID : <b>${student.studentId}</b>
            </div>

            <div class="edu-class">

                Class :
                <b>${student.currentClass}</b>

                &nbsp;&nbsp;|&nbsp;&nbsp;

                Section :
                <b>${student.section}</b>

            </div>

        </div>

        <div class="edu-right">

            <button
                class="edu-btn submit-btn"
                onclick="openSubmitReport(${student.rowNumber})">

                📝 Submit Report

            </button>

            <button
                class="edu-btn history-btn"
                onclick="viewEducationalHistory(${student.rowNumber})">

                📖 View History

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

