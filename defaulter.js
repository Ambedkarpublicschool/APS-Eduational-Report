/*************************************************
 * Fee Defaulter Module (Optimized)
 *************************************************/

let defaulterData = [];

async function initDefaulter(pushHistory = true) {
    activeModule = "defaulter";
    
    if (pushHistory) {
        history.pushState({ module: "defaulter" }, "", "#defaulter");
    }

    document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));
    document.getElementById("defaulterTab").classList.add("active");

    const bar = document.getElementById("reportActionBar");
    if (bar) bar.style.display = "none";

    await loadDefaulters();
}

async function loadDefaulters() {
    if (activeModule !== "defaulter") return;

    const session = document.getElementById("session").value;
    const className = document.getElementById("class").value;
    const search = document.getElementById("search").value.trim();

    const data = await getFeeDefaulters(session, className, search);
    if (activeModule !== "defaulter") return;

    if (!data || !data.success) {
        showToast(data?.message || "Unable to load fee defaulters", false);
        return;
    }

    defaulterData = data;
    renderDefaulters();
}

function renderDefaulters() {
    if (activeModule !== "defaulter") return;

    const content = document.getElementById("content");
    const students = Array.isArray(defaulterData) ? defaulterData : (defaulterData.data || []);
    const totalStudents = defaulterData.totalStudents || students.length;
    const totalRemainFee = defaulterData.totalRemainFee || 0;

    if (students.length === 0) {
        content.innerHTML = `<div class="empty" style="text-align:center; padding:40px; font-weight:700;">No Fee Defaulter Found</div>`;
        return;
    }

    let html = `
        <div class="def-summary" style="background:#fff; padding:15px 25px; margin-bottom:20px; border-radius:12px; display:flex; justify-content:space-between; box-shadow:0 2px 10px rgba(0,0,0,0.05); font-weight:700;">
            <div>Total Students : ${totalStudents}</div>
            <div style="color:red;">Total Remaining Fee : ₹${Number(totalRemainFee).toLocaleString("en-IN")}</div>
        </div>
    `;

    students.forEach(student => {
        html += `
            <div class="student-card">
                <div class="student-info">
                    <h3>${student.studentName}</h3>
                    <p><b>ID :</b> ${student.studentId} &nbsp;|&nbsp; <b>Father :</b> ${student.fatherName}</p>
                    <p><b>Class :</b> ${student.className} - ${student.section} &nbsp;|&nbsp; <b>Mobile :</b> ${student.mobile}</p>
                    <p style="color:red; font-weight:bold; margin-top:5px;">Remaining Fee : ₹${Number(student.remainFee).toLocaleString("en-IN")}</p>
                </div>
            </div>`;
    });

    content.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("defaulterTab").addEventListener("click", () => initDefaulter(true));

    const searchInput = document.getElementById("search");
    if(searchInput) {
        searchInput.addEventListener("input", async () => {
            if (activeModule === "defaulter") await loadDefaulters();
        });
    }

    const classSelect = document.getElementById("class");
    if(classSelect) {
        classSelect.addEventListener("change", async () => {
            if (activeModule === "defaulter") await loadDefaulters();
        });
    }

    const sessionSelect = document.getElementById("session");
    if(sessionSelect) {
        sessionSelect.addEventListener("change", async () => {
            if (activeModule === "defaulter") await loadDefaulters();
        });
    }
});
