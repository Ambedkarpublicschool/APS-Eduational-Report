/*************************************************
 * Fee Defaulter Module
 *************************************************/

let activeModule = "attendance";

let defaulterData = [];

let defaulterSearch = "";


/*************************************************
 * Initialize
 *************************************************/
async function initDefaulter() {

    activeModule = "defaulter";

    document.getElementById("attendanceTab")
        .classList.remove("active");

    document.getElementById("reportTab")
        .classList.remove("active");

    document.getElementById("defaulterTab")
        .classList.add("active");

    const bar = document.getElementById("reportActionBar");

    if (bar) {

        bar.style.display = "none";

    }

    await loadDefaulters();

}

/*************************************************
 * Load Data
 *************************************************/
async function loadDefaulters() {

    const session = document.getElementById("session").value;

    const className = document.getElementById("class").value;

    const search = document.getElementById("search").value.trim();

    const data = await getFeeDefaulters(
        session,
        className,
        search
    );

    if (!data) return;

    defaulterData = data;

    renderDefaulters();

}

/*************************************************
 * Render
 *************************************************/
function renderDefaulters() {

    const content = document.getElementById("content");

    // यदि API सीधे array लौटाती है
    const students = Array.isArray(defaulterData)
        ? defaulterData
        : (defaulterData.data || []);

    // Summary
    const totalStudents = defaulterData.totalStudents || students.length;
    const totalRemainFee = defaulterData.totalRemainFee || 0;

    if (students.length === 0) {

        content.innerHTML = `
            <div class="empty">
                No Fee Defaulter Found
            </div>
        `;

        return;
    }

    let html = `
        <div class="def-summary">
            <div><b>Total Students :</b> ${totalStudents}</div>
            <div><b>Total Remaining Fee :</b> ₹${Number(totalRemainFee).toLocaleString("en-IN")}</div>
        </div>
    `;

    students.forEach(student => {

        html += `
            <div class="student-card">

                <div class="student-info">

                    <h3>${student.studentName}</h3>

                    <p>
                        <b>ID :</b> ${student.studentId}
                    </p>

                    <p>
                        <b>Father :</b> ${student.fatherName}
                    </p>

                    <p>
                        <b>Class :</b> ${student.currentClass}
                        -
                        ${student.section}
                    </p>

                    <p>
                        <b>Mobile :</b> ${student.primaryMobile}
                    </p>

                    <p style="color:red;font-weight:bold;">
                        Remaining Fee : ₹${Number(student.remainFee).toLocaleString("en-IN")}
                    </p>

                </div>

            </div>
        `;

    });

    content.innerHTML = html;

}

/*************************************************
 * Events
 *************************************************/

document
.getElementById("defaulterTab")
.addEventListener("click", async function () {

    await initDefaulter();

});

document
.getElementById("search")
.addEventListener("input", async function () {

    if (activeModule !== "defaulter") return;

    await loadDefaulters();

});

document
.getElementById("class")
.addEventListener("change", async function () {

    if (activeModule !== "defaulter") return;

    await loadDefaulters();

});

document
.getElementById("session")
.addEventListener("change", async function () {

    if (activeModule !== "defaulter") return;

    await loadDefaulters();

});
