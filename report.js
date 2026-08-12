/**************************************************
 * Educational Report
 **************************************************/

let reportStudents = [];
let reportClass = "";
let reportSection = "";
let reportSearch = "";
let selectedStudent = null;
let selectedReports = [];
let reportEventsAttached = false;

/**************************************************
 * Init
 **************************************************/
async function initEducationalReport() {
    activeModule = "report";

    document.getElementById("attendanceTab")?.classList.remove("active");
    document.getElementById("defaulterTab")?.classList.remove("active");
    document.getElementById("reportTab")?.classList.add("active");

    const bar = document.getElementById("reportActionBar");
    if (bar) bar.style.display = "flex";

    reportClass = document.getElementById("class")?.value || "";
    reportSection = document.getElementById("section")?.value || "";
    reportSearch = "";

    attachReportEvents();
    await loadEducationalStudents();
}

/**************************************************
 * Load Students
 **************************************************/
async function loadEducationalStudents() {
    if (typeof activeModule !== "undefined" && activeModule !== "report") return;

    showLoader();
    try {
        const session = document.getElementById("session")?.value || "";
        const data = await getEducationalHistory(session, reportClass, reportSection);
        reportStudents = Array.isArray(data) ? data : [];
        renderEducationalStudents();
    } catch (err) {
        console.error(err);
        showToast(err.message || err, false);
    } finally {
        hideLoader();
    }
}

/**************************************************
 * Render
 **************************************************/
function renderEducationalStudents() {
    if (typeof activeModule !== "undefined" && activeModule !== "report") return;

    const content = document.getElementById("content");
    if (!content) return;

    if (!Array.isArray(reportStudents) || reportStudents.length === 0) {
        content.innerHTML = `<div class="empty">No Student Found</div>`;
        return;
    }

    const keyword = reportSearch.toLowerCase();
    const students = reportStudents.filter(s => {
        const name = (s.studentName || "").toLowerCase();
        const id = (s.studentId || "").toLowerCase();
        return name.includes(keyword) || id.includes(keyword);
    });

    if (students.length === 0) {
        content.innerHTML = `<div class="empty">No Student Found</div>`;
        return;
    }

    let html = "";
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
            <input
                type="checkbox"
                class="report-check"
                value="${student.rowNumber}"
                onchange="toggleReportSelection(${student.rowNumber}, this.checked)">
            <img src="${photo}" class="edu-photo" loading="lazy">
        </div>
        <div class="edu-center">
            <div class="edu-name">${student.studentName || ''}</div>
            <div class="edu-id">Student ID : <b>${student.studentId || ''}</b></div>
            <div class="edu-class">
                Class : <b>${student.currentClass || ''}</b> &nbsp;&nbsp;|&nbsp;&nbsp;
                Section : <b>${student.section || ''}</b>
            </div>
        </div>
        <div class="edu-right">
            <button class="edu-btn submit-btn" onclick="openSubmitReport(${student.rowNumber})">
                📝 Submit Report
            </button>
            <button class="edu-btn history-btn" onclick="viewEducationalHistory(${student.rowNumber})">
                📖 View History
            </button>
        </div>
    </div>
    `;
}

function getReportStudent(rowNumber) {
    return reportStudents.find(s => s.rowNumber == rowNumber);
}

/**************************************************
 * Events Attachment
 **************************************************/
function attachReportEvents() {
    if (reportEventsAttached) return;
    reportEventsAttached = true;

    document.getElementById("search")?.addEventListener("input", function () {
        if (activeModule === "report") {
            reportSearch = this.value.trim();
            renderEducationalStudents();
        }
    });

    document.getElementById("class")?.addEventListener("change", async function () {
        if (activeModule === "report") {
            reportClass = this.value;
            reportSection = "";
            const sec = document.getElementById("section");
            if (sec) sec.value = "";
            await loadEducationalStudents();
        }
    });

    document.getElementById("section")?.addEventListener("change", async function () {
        if (activeModule === "report") {
            reportSection = this.value;
            await loadEducationalStudents();
        }
    });
}

document.getElementById("reportTab")?.addEventListener("click", initEducationalReport);

/**************************************************
 * Modal Logic
 **************************************************/
function openSubmitReport(rowNumber) {
    selectedStudent = getReportStudent(rowNumber);
    if (!selectedStudent) return;

    document.getElementById("learning").value = "";
    document.getElementById("writing").value = "";
    document.getElementById("cleanliness").value = "";
    document.getElementById("studyMaterial").value = "";
    document.getElementById("parentReaction").value = "";

    document.getElementById("modalTitle").innerHTML =
        "Educational Report - " + selectedStudent.studentName;

    document.getElementById("reportModal").style.display = "flex";
}

function closeReportModal() {
    document.getElementById("reportModal").style.display = "none";
}

async function saveEducationalReport() {
    if (!selectedStudent) {
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

    const result = await submitEducationalReport(data);
    if (result) {
        showToast("Educational Report Saved Successfully");
        closeReportModal();
        await loadEducationalStudents();
    }
}

async function viewEducationalHistory(rowNumber) {
    const history = await getStudentHistory(rowNumber);
    if (!history) {
        showToast("History Not Found", false);
        return;
    }

    const student = getReportStudent(rowNumber);
    const win = window.open("", "_blank");

    win.document.write(`
<!DOCTYPE html>
<html>
<head>
<title>Educational Report</title>
<style>
@page{ size:A4 landscape; margin:10mm; }
body{ font-family:Arial,sans-serif; margin:0; padding:15px; font-size:13px; }
#printBtn{ position:fixed; right:20px; top:20px; padding:10px 20px; font-size:15px; cursor:pointer; }
h2{ margin:0; text-align:center; }
h3{ margin:5px 0 20px; text-align:center; font-weight:normal; }
.student{ border:1px solid #000; padding:8px; margin-bottom:15px; font-size:14px; }
table{ width:100%; border-collapse:collapse; table-layout:fixed; }
th,td{ border:1px solid #000; padding:8px; vertical-align:top; white-space:pre-wrap; word-break:break-word; }
th{ background:#eee; }
@media print{ #printBtn{ display:none; } body{ margin:0; } }
</style>
</head>
<body>
<button id="printBtn" onclick="window.print()">🖨 Print Report</button>
<h2>AMBEDKAR PUBLIC SCHOOL</h2>
<h3>Educational Monitoring Report</h3>
<div class="student">
<b>Student :</b> ${student.studentName || ''} &nbsp;&nbsp;&nbsp;
<b>ID :</b> ${student.studentId || ''} &nbsp;&nbsp;&nbsp;
<b>Class :</b> ${student.currentClass || ''} &nbsp;&nbsp;&nbsp;
<b>Section :</b> ${student.section || ''} &nbsp;&nbsp;&nbsp;
<b>Mobile :</b> ${student.primaryMobile || ''}
</div>
<table>
<tr>
<th>Learning</th>
<th>Writing</th>
<th>Presence & Cleanliness</th>
<th>Study Material</th>
<th>Parent Reaction</th>
</tr>
<tr>
<td>${(history.learning || "").replace(/\n/g, "<br>")}</td>
<td>${(history.writing || "").replace(/\n/g, "<br>")}</td>
<td>${(history.cleanliness || "").replace(/\n/g, "<br>")}</td>
<td>${(history.studyMaterial || "").replace(/\n/g, "<br>")}</td>
<td>${(history.parentReaction || "").replace(/\n/g, "<br>")}</td>
</tr>
</table>
</body>
</html>
`);
    win.document.close();
}

function toggleReportSelection(rowNumber, checked) {
    if (checked) {
        if (!selectedReports.includes(rowNumber)) selectedReports.push(rowNumber);
    } else {
        selectedReports = selectedReports.filter(r => r != rowNumber);
    }
    updateReportSelection();
}

function updateReportSelection() {
    const count = document.getElementById("selectedCount");
    if (count) count.innerHTML = selectedReports.length;
}

function toggleSelectAllReports(checked) {
    selectedReports = [];
    document.querySelectorAll(".report-check").forEach(chk => {
        chk.checked = checked;
        if (checked) selectedReports.push(Number(chk.value));
    });
    updateReportSelection();
}

async function printSelectedReports() {
    if (selectedReports.length == 0) {
        showToast("Please Select Student", false);
        return;
    }

    const students = await getMultipleStudentHistory(selectedReports);
    if (!students || students.length == 0) {
        showToast("No History Found", false);
        return;
    }

    const win = window.open("", "_blank");
    let html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Educational Report</title>
<style>
@page{ size:A4 landscape; margin:10mm; }
body{ font-family:Arial,sans-serif; margin:0; padding:15px; font-size:13px; }
#printBtn{ position:fixed; top:20px; right:20px; padding:10px 18px; font-size:15px; cursor:pointer; }
.page{ page-break-after:always; }
.school{ text-align:center; font-size:24px; font-weight:bold; }
.title{ text-align:center; margin-top:5px; margin-bottom:15px; font-size:18px; }
.student{ border:1px solid #000; padding:8px; margin-bottom:15px; font-size:14px; }
table{ width:100%; border-collapse:collapse; table-layout:fixed; }
th{ border:1px solid #000; padding:8px; background:#f2f2f2; }
td{ border:1px solid #000; padding:8px; vertical-align:top; white-space:pre-wrap; word-break:break-word; }
@media print{ #printBtn{ display:none; } }
</style>
</head>
<body>
<button id="printBtn" onclick="window.print()">🖨 Print Report</button>
`;

    students.forEach((student) => {
        html += `
<div class="page">
<div class="school">AMBEDKAR PUBLIC SCHOOL</div>
<div class="title">Educational Monitoring Report</div>
<div class="student">
<b>Student :</b> ${student.studentName || ''} &nbsp;&nbsp;&nbsp;
<b>ID :</b> ${student.studentId || ''} &nbsp;&nbsp;&nbsp;
<b>Class :</b> ${student.currentClass || ''} &nbsp;&nbsp;&nbsp;
<b>Section :</b> ${student.section || ''} &nbsp;&nbsp;&nbsp;
<b>Mobile :</b> ${student.primaryMobile || ''}
</div>
<table>
<tr>
<th>Learning</th>
<th>Writing</th>
<th>Presence & Cleanliness</th>
<th>Study Material</th>
<th>Parent Reaction</th>
</tr>
<tr>
<td>${(student.learning || "").replace(/\n/g, "<br>")}</td>
<td>${(student.writing || "").replace(/\n/g, "<br>")}</td>
<td>${(student.cleanliness || "").replace(/\n/g, "<br>")}</td>
<td>${(student.studyMaterial || "").replace(/\n/g, "<br>")}</td>
<td>${(student.parentReaction || "").replace(/\n/g, "<br>")}</td>
</tr>
</table>
</div>
`;
    });

    html += `</body></html>`;

    win.document.open();
    win.document.write(html);
    win.document.close();

    setTimeout(() => { win.focus(); }, 300);
}
