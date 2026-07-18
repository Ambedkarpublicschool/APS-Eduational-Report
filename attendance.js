/*************************************************
 * attendance.js
 *************************************************/

let attendanceStudents = [];

let filteredStudents = [];

document.addEventListener("DOMContentLoaded", () => {

    initializeAttendance();

});

/*************************************************
 * Initialize
 *************************************************/

async function initializeAttendance() {

    loadCurrentSession();

    await loadAttendance();

    attachEvents();

}

/*************************************************
 * Default Session
 *************************************************/

function loadCurrentSession() {

    const session = document.getElementById("session");

    const year = new Date().getFullYear();

    const month = new Date().getMonth() + 1;

    let currentSession = "";

    if(month >= 4){

        currentSession = year + "-" + (year + 1);

    }else{

        currentSession = (year-1) + "-" + year;

    }

    session.innerHTML =

    `<option value="${currentSession}">${currentSession}</option>`;

}

/*************************************************
 * Load Attendance
 *************************************************/

async function loadAttendance(){

    const session = document.getElementById("session").value;

    const className = document.getElementById("class").value;

    const section = document.getElementById("section").value;

    const students = await getAttendance(

        session,

        className,

        section

    );

    attendanceStudents = students || [];

    filteredStudents = [...attendanceStudents];

    renderAttendance();

}

/*************************************************
 * Render Students
 *************************************************/

function renderAttendance(){

    const container = document.getElementById("content");

    if(filteredStudents.length==0){

        container.innerHTML="<h2>No Student Found</h2>";

        return;

    }

    let html="";

    filteredStudents.forEach(student=>{

        html += attendanceCard(student);

    });

    html +=

    `<br>

    <button

        class="btn btn-success"

        onclick="submitAttendanceData()">

        Submit Attendance

    </button>`;

    container.innerHTML = html;

}

/*************************************************
 * Toggle Attendance
 *************************************************/

function toggleAttendance(studentId, checked) {

    const student = attendanceStudents.find(

        s => s.studentId == studentId

    );

    if (!student) return;

    student.present = checked;

}


/*************************************************
 * Submit Attendance
 *************************************************/

async function submitAttendanceData() {

    if (attendanceStudents.length == 0) {

        showToast("No Students Found", false);

        return;

    }

    const students = attendanceStudents.map(student => ({

        rowNumber: student.rowNumber,

        present: student.present === true

    }));

    const result = await submitAttendance(students);

    if (result) {

        showToast("Attendance Saved Successfully");

        loadAttendance();

    }

}

/*************************************************
 * Search Student
 *************************************************/

function searchStudent() {

    const keyword = document
        .getElementById("search")
        .value
        .toLowerCase()
        .trim();

    filteredStudents = attendanceStudents.filter(student => {

        return (

            student.studentName.toLowerCase().includes(keyword)

            ||

            student.studentId.toLowerCase().includes(keyword)

        );

    });

    renderAttendance();

}

/*************************************************
 * Events
 *************************************************/

function attachEvents() {

    document

        .getElementById("search")

        .addEventListener(

            "keyup",

            searchStudent

        );



    document

        .getElementById("session")

        .addEventListener(

            "change",

            loadAttendance

        );



    document

        .getElementById("class")

        .addEventListener(

            "change",

            loadAttendance

        );



    document

        .getElementById("section")

        .addEventListener(

            "change",

            loadAttendance

        );

}

/*************************************************
 * Refresh Attendance
 *************************************************/

function refreshAttendance() {

    loadAttendance();

}


async function loadClasses(){

    const classes = await getClasses();

    const select = document.getElementById("class");

    select.innerHTML = '<option value="">All Classes</option>';

    classes.forEach(cls=>{

        select.innerHTML += `<option value="${cls}">${cls}</option>`;

    });

}

async function loadSections(){

    const className=document.getElementById("class").value;

    const sections=await getSections(className);

    const select=document.getElementById("section");

    select.innerHTML='<option value="">All Sections</option>';

    sections.forEach(sec=>{

        select.innerHTML += `<option value="${sec}">${sec}</option>`;

    });

}

