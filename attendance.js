/*************************************************
 * attendance.js
 *************************************************/

let attendanceStudents = [];
let filteredStudents = [];
let attendanceEventsAttached = false;

document.addEventListener("DOMContentLoaded", () => {
    initializeAttendance();
});

/*************************************************
 * Initialize
 *************************************************/
async function initializeAttendance() {
    activeModule = "attendance";

    const bar = document.getElementById("reportActionBar");
    if (bar) {
        bar.style.display = "none";
    }

    loadCurrentSession();
    await loadClasses();
    await loadSections();
    await loadAttendance();
    attachEvents();
}

/*************************************************
 * Default Session
 *************************************************/
function loadCurrentSession() {
    const session = document.getElementById("session");
    if (!session) return;

    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    let currentSession = "";

    if (month >= 4) {
        currentSession = year + "-" + (year + 1);
    } else {
        currentSession = (year - 1) + "-" + year;
    }

    session.innerHTML = `<option value="${currentSession}">${currentSession}</option>`;
}

/*************************************************
 * Load Attendance
 *************************************************/
async function loadAttendance() {
    if (typeof activeModule !== "undefined" && activeModule !== "attendance") return;

    const sessionEl = document.getElementById("session");
    const classEl = document.getElementById("class");
    const sectionEl = document.getElementById("section");

    const session = sessionEl ? sessionEl.value : "";
    const className = classEl ? classEl.value : "";
    const section = sectionEl ? sectionEl.value : "";

    const students = await getAttendance(session, className, section);

    attendanceStudents = (students || []).map(student => ({
        ...student,
        present: student.attendance === "P"
    }));

    filteredStudents = [...attendanceStudents];
    renderAttendance();
}

/*************************************************
 * Render Students
 *************************************************/
function renderAttendance() {
    if (typeof activeModule !== "undefined" && activeModule !== "attendance") return;

    const container = document.getElementById("content");
    if (!container) return;

    if (!filteredStudents || filteredStudents.length === 0) {
        container.innerHTML = "<h2>No Student Found</h2>";
        return;
    }

    let html = "";
    filteredStudents.forEach(student => {
        html += attendanceCard(student);
    });

    container.innerHTML = html;
}

/*************************************************
 * Toggle Attendance
 *************************************************/
async function toggleAttendance(studentId, checked) {
    const student = attendanceStudents.find(s => s.studentId === studentId);
    if (!student) return;

    student.present = checked;
    student.attendance = checked ? "P" : "A";

    const result = await submitAttendance([
        {
            rowNumber: student.rowNumber,
            studentId: student.studentId,
            present: checked
        }
    ]);

    if (result && result.success) {
        if (result.students && result.students[0]) {
            student.totalPresent = result.students[0].totalPresent;
            student.monthPresent = result.students[0].monthPresent;
        }
        renderAttendance();
        showToast("Attendance Saved");
    } else {
        student.present = !checked;
        student.attendance = !checked ? "P" : "A";
        renderAttendance();
        showToast("Attendance Save Failed", false);
    }
}

/*************************************************
 * Search Student
 *************************************************/
function searchStudent() {
    if (typeof activeModule !== "undefined" && activeModule !== "attendance") return;

    const keyword = (document.getElementById("search")?.value || "").toLowerCase().trim();

    filteredStudents = attendanceStudents.filter(student => {
        return (
            (student.studentName && student.studentName.toLowerCase().includes(keyword)) ||
            (student.studentId && student.studentId.toLowerCase().includes(keyword))
        );
    });

    renderAttendance();
}

/*************************************************
 * Events
 *************************************************/
function attachEvents() {
    if (attendanceEventsAttached) return;
    attendanceEventsAttached = true;

    document.getElementById("search")?.addEventListener("keyup", () => {
        if (activeModule === "attendance") searchStudent();
    });

    document.getElementById("session")?.addEventListener("change", async () => {
        if (activeModule === "attendance") await loadAttendance();
    });

    document.getElementById("class")?.addEventListener("change", async () => {
        if (activeModule === "attendance") {
            await loadSections();
            await loadAttendance();
        }
    });

    document.getElementById("section")?.addEventListener("change", async () => {
        if (activeModule === "attendance") await loadAttendance();
    });
}

/*************************************************
 * Helper Loaders
 *************************************************/
async function loadClasses() {
    const classes = await getClasses();
    const select = document.getElementById("class");
    if (!select) return;

    select.innerHTML = '<option value="">All Classes</option>';
    if (Array.isArray(classes)) {
        classes.forEach(cls => {
            select.innerHTML += `<option value="${cls}">${cls}</option>`;
        });
    }
}

async function loadSections() {
    const classEl = document.getElementById("class");
    const className = classEl ? classEl.value : "";
    const sections = await getSections(className);

    const select = document.getElementById("section");
    if (!select) return;

    select.innerHTML = '<option value="">All Sections</option>';
    if (Array.isArray(sections)) {
        sections.forEach(sec => {
            select.innerHTML += `<option value="${sec}">${sec}</option>`;
        });
    }
}

/*************************************************
 * Attendance Card HTML
 *************************************************/
function attendanceCard(student) {
    return `
    <div class="student-card">
        <div class="student-photo">
          <img src="${student.photo || ''}" onerror="this.onerror=null;this.src='default-user.png';">
        </div>
        <div class="student-info">
            <div class="student-header">
                <h3>${student.studentName || ''}</h3>
                <div class="attendance-toggle">
                    <label class="switch">
                        <input
                            type="checkbox"
                            ${student.present ? "checked" : ""}
                            onchange="toggleAttendance('${student.studentId}', this.checked)">
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
            <p>
                <b>ID:</b> ${student.studentId || ''} &nbsp; | &nbsp;
                <b>Class:</b> ${student.currentClass || ''}-${student.section || ''}
            </p>
            <p>
                Total Present : ${student.totalPresent || 0} &nbsp; | &nbsp;
                This Month : ${student.monthPresent || 0}
            </p>
        </div>
    </div>
    `;
}

/*************************************************
 * Tab Switching
 *************************************************/
document.getElementById("attendanceTab")?.addEventListener("click", async function () {
    document.getElementById("reportTab")?.classList.remove("active");
    document.getElementById("defaulterTab")?.classList.remove("active");
    this.classList.add("active");

    await initializeAttendance();
});
