/*************************************************
 * attendance.js (Optimized with State & History)
 *************************************************/

let attendanceStudents = [];
let filteredStudents = [];
let activeModule = "attendance";

async function initializeAttendance(pushHistory = true) {
    activeModule = "attendance";
    
    if (pushHistory) {
        history.pushState({ module: "attendance" }, "", "#attendance");
    }

    document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));
    document.getElementById("attendanceTab").classList.add("active");

    const bar = document.getElementById("reportActionBar");
    if (bar) bar.style.display = "none";

    loadCurrentSession();
    await loadClasses();
    await loadSections();
    await loadAttendance();
}

function loadCurrentSession() {
    const session = document.getElementById("session");
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    let currentSession = month >= 4 ? year + "-" + (year + 1) : (year - 1) + "-" + year;
    session.innerHTML = `<option value="${currentSession}">${currentSession}</option>`;
}

async function loadAttendance() {
    if (activeModule !== "attendance") return;

    const session = document.getElementById("session").value;
    const className = document.getElementById("class").value;
    const section = document.getElementById("section").value;

    const students = await getAttendance(session, className, section);
    if (activeModule !== "attendance") return; // Prevent race conditions

    attendanceStudents = (students || []).map(student => ({
        ...student,
        present: student.attendance === "P"
    }));

    filteredStudents = [...attendanceStudents];
    renderAttendance();
}

function renderAttendance() {
    if (activeModule !== "attendance") return;

    const container = document.getElementById("content");
    if (filteredStudents.length === 0) {
        container.innerHTML = `<div class="empty" style="text-align:center; padding:40px; font-weight:700;">No Student Found</div>`;
        return;
    }

    let html = "";
    filteredStudents.forEach(student => {
        html += attendanceCard(student);
    });
    container.innerHTML = html;
}

async function toggleAttendance(studentId, checked) {
    const student = attendanceStudents.find(s => s.studentId === studentId);
    if (!student) return;

    student.present = checked;
    student.attendance = checked ? "P" : "A";

    const result = await submitAttendance([{
        rowNumber: student.rowNumber,
        studentId: student.studentId,
        present: checked
    }]);

    if (result && result.success) {
        student.totalPresent = result.students[0].totalPresent;
        student.monthPresent = result.students[0].monthPresent;
        renderAttendance();
        showToast("Attendance Saved");
    } else {
        student.present = !checked;
        student.attendance = !checked ? "P" : "A";
        renderAttendance();
        showToast("Attendance Save Failed", false);
    }
}

function searchStudent() {
    const keyword = document.getElementById("search").value.toLowerCase().trim();
    filteredStudents = attendanceStudents.filter(student => 
        student.studentName.toLowerCase().includes(keyword) || 
        student.studentId.toLowerCase().includes(keyword)
    );
    renderAttendance();
}

async function loadClasses() {
    const classes = await getClasses();
    const select = document.getElementById("class");
    if(!select) return;
    const currentVal = select.value;
    select.innerHTML = '<option value="">All Classes</option>';
    (classes || []).forEach(cls => {
        select.innerHTML += `<option value="${cls}">${cls}</option>`;
    });
    if(currentVal) select.value = currentVal;
}

async function loadSections() {
    const className = document.getElementById("class").value;
    const sections = await getSections(className);
    const select = document.getElementById("section");
    if(!select) return;
    const currentVal = select.value;
    select.innerHTML = '<option value="">All Sections</option>';
    (sections || []).forEach(sec => {
        select.innerHTML += `<option value="${sec}">${sec}</option>`;
    });
    if(currentVal) select.value = currentVal;
}

function attendanceCard(student) {
    return `
    <div class="student-card">
        <div class="student-photo">
          <img src="${student.photo || ''}" onerror="this.onerror=null;this.src='default-user.png';">
        </div>
        <div class="student-info">
            <div class="student-header">
                <h3>${student.studentName}</h3>
                <div class="attendance-toggle">
                    <label class="switch">
                        <input type="checkbox" ${student.present ? "checked" : ""} onchange="toggleAttendance('${student.studentId}',this.checked)">
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
            <p><b>ID:</b> ${student.studentId} &nbsp; | &nbsp; <b>Class:</b> ${student.currentClass}-${student.section}</p>
            <p>Total Present : ${student.totalPresent || 0} &nbsp; | &nbsp; This Month : ${student.monthPresent || 0}</p>
        </div>
    </div>`;
}

// Event Bindings
document.addEventListener("DOMContentLoaded", () => {
    // Tab Clicks with History Push
    document.getElementById("attendanceTab").addEventListener("click", () => initializeAttendance(true));
    
    const searchInput = document.getElementById("search");
    if(searchInput) searchInput.addEventListener("input", () => {
        if(activeModule === "attendance") searchStudent();
    });

    document.getElementById("class").addEventListener("change", async () => {
        if(activeModule === "attendance") {
            await loadSections();
            await loadAttendance();
        }
    });

    document.getElementById("section").addEventListener("change", () => {
        if(activeModule === "attendance") loadAttendance();
    });

    document.getElementById("session").addEventListener("change", () => {
        if(activeModule === "attendance") loadAttendance();
    });
});
