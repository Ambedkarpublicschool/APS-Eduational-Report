/*************************************************
 * Fee Defaulter Module
 *************************************************/

let activeModule = "attendance";

let defaulterStudents = [];

let defaulterSearch = "";


/*************************************************
 * Fee Defaulter Module
 *************************************************/

let defaulterData = [];

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

    content.innerHTML = `
        <div style="padding:40px;text-align:center;">
            Fee Defaulter Module Loading...
        </div>
    `;

}
