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
