/*************************************************
 * api.js
 * Google Apps Script API Helper
 *************************************************/

const API = CONFIG.API_URL;

/*************************************************
 * Loader
 *************************************************/

function showLoader() {

    const loader = document.getElementById("loader");

    if (loader) {
        loader.style.display = "flex";
    }

}

function hideLoader() {

    const loader = document.getElementById("loader");

    if (loader) {
        loader.style.display = "none";
    }

}

/*************************************************
 * Toast Message
 *************************************************/

function showToast(message, success = true) {

    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.innerHTML = message;

    toast.style.display = "block";

    toast.style.background = success
        ? "#2e7d32"
        : "#c62828";

    setTimeout(() => {

        toast.style.display = "none";

    }, 3000);

}

/*************************************************
 * GET API
 *************************************************/

async function apiGet(action, params = {}, showLoading = true) {

    if (showLoading) showLoader();

    try {

        const query = new URLSearchParams({
            action,
            ...params
        });

        const response = await fetch(
            API + "?" + query.toString()
        );

        const result = await response.json();

        if (showLoading) hideLoader();

        if (!result.success) {

            showToast(result.message, false);

            return null;

        }

        return result.data;

    }
    catch (error) {

        if (showLoading) hideLoader();

        console.error(error);

        showToast(error.message, false);

        return null;

    }

}

/*************************************************
 * POST API
 *************************************************/

async function apiPost(action, body = {}, showLoading = true) {

    if (showLoading) showLoader();

    try {

        const formData = new URLSearchParams();

        formData.append("action", action);

        Object.keys(body).forEach(key => {

            const value = body[key];

            if (typeof value === "object") {

                formData.append(key, JSON.stringify(value));

            } else {

                formData.append(key, value);

            }

        });

        const response = await fetch(API, {

            method: "POST",

            body: formData

        });

        const result = await response.json();

        if (showLoading) hideLoader();

        if (!result.success) {

            showToast(result.message, false);

            return null;

        }

        return result.data;

    }
    catch (error) {

        if (showLoading) hideLoader();

        console.error(error);

        showToast(error.message, false);

        return null;

    }

}

/*************************************************
 * API Wrapper Functions
 *************************************************/

function getStudents() {

    return apiGet("getStudents");

}

function getAttendance(session, className, section) {

    return apiGet("getAttendance", {

        session,

        class: className,

        section

    });

}

function getEducationalHistory(session, className, section) {

    return apiGet("getEducationalHistory", {

        session,

        class: className,

        section

    });

}

// Attendance Save WITHOUT Loader
function submitAttendance(students) {

    return apiPost(
        "submitAttendance",
        {
            students
        },
        false
    );

}

function submitEducationalReport(data) {

    return apiPost("submitEducationalReport", data);

}

/*************************************************
 * Class List
 *************************************************/

function getClasses() {

    return apiGet("getClasses");

}

/*************************************************
 * Section List
 *************************************************/

function getSections(className) {

    return apiGet("getSections", {

        class: className

    });

}

async function getStudentHistory(rowNumber){

    const result = await apiGet("getStudentHistory",{
        rowNumber
    });

    console.log("History API :", result);

    return result;

}
