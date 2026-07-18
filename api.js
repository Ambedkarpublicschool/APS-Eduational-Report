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

async function apiGet(action, params = {}) {

    showLoader();

    try {

        const query = new URLSearchParams({

            action,

            ...params

        });

        const response = await fetch(

            API + "?" + query.toString()

        );

        const result = await response.json();

        hideLoader();

        if (!result.success) {

            showToast(result.message, false);

            return null;

        }

        return result.data;

    }

    catch (error) {

        hideLoader();

        console.error(error);

        showToast(error.message, false);

        return null;

    }

}

/*************************************************
 * POST API
 *************************************************/

async function apiPost(action, body = {}) {

    showLoader();

    try {

        const response = await fetch(API, {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                action,

                ...body

            })

        });

        const result = await response.json();

        hideLoader();

        if (!result.success) {

            showToast(result.message, false);

            return null;

        }

        showToast(result.data);

        return result.data;

    }

    catch (error) {

        hideLoader();

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

function submitAttendance(students) {

    return apiPost("submitAttendance", {

        students

    });

}

function submitEducationalReport(data) {

    return apiPost("submitEducationalReport", data);

}
