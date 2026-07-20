/**************************************************
 * Educational Report
 **************************************************/

let reportStudents = [];

let reportClass = "";

let reportSection = "";

let reportSearch = "";

let selectedStudent = null;

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

const session = document.getElementById("session").value;

reportStudents = await getEducationalHistory(
    session,
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
    : "default-user.png";

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

function openSubmitReport(rowNumber){

    selectedStudent =
        getReportStudent(rowNumber);

    document.getElementById("learning").value="";
    document.getElementById("writing").value="";
    document.getElementById("cleanliness").value="";
    document.getElementById("studyMaterial").value="";
    document.getElementById("parentReaction").value="";

    document.getElementById("modalTitle").innerHTML =
        "Educational Report - " +
        selectedStudent.studentName;

    document.getElementById("reportModal")
        .style.display="flex";

}

function closeReportModal(){

    document.getElementById("reportModal")
        .style.display="none";

}

async function saveEducationalReport(){

    if(!selectedStudent){
        showToast("Student Not Selected", false);
        return;
    }

    const data = {

        rowNumber: selectedStudent.rowNumber,

        learning: document.getElementById("learning").value.trim(),

        writing: document.getElementById("writing").value.trim(),

        cleanliness: document.getElementById("cleanliness").value.trim(),

        studyMaterial: document.getElementById("studyMaterial").value.trim(),

        parentReaction: document.getElementById("parentReaction").value.trim()

    };

    console.log(data);

    const result = await submitEducationalReport(data);

    if(result){

        showToast("Educational Report Saved Successfully");

        closeReportModal();

        await loadEducationalStudents();

    }

}

async function viewEducationalHistory(rowNumber){

    const history = await getStudentHistory(rowNumber);

    if(!history){
        showToast("History Not Found", false);
        return;
    }

    document.getElementById("modalTitle").innerHTML =
        "Educational History";

    document.getElementById("learning").value =
        history.learning || "";

    document.getElementById("writing").value =
        history.writing || "";

    document.getElementById("cleanliness").value =
        history.cleanliness || "";

    document.getElementById("studyMaterial").value =
        history.studyMaterial || "";

    document.getElementById("parentReaction").value =
        history.parentReaction || "";

    document.getElementById("reportModal").style.display = "flex";

}
