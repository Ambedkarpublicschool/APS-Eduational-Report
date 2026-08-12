/*************************************************
 * api.js (Optimized with LocalStorage Caching)
 *************************************************/

const API = CONFIG.API_URL;

function showLoader() {
    const loader = document.getElementById("loader");
    if (loader) loader.style.display = "flex";
}

function hideLoader() {
    const loader = document.getElementById("loader");
    if (loader) loader.style.display = "none";
}

function showToast(message, success = true) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.innerHTML = message;
    toast.style.display = "block";
    toast.style.background = success ? "#2e7d32" : "#c62828";
    setTimeout(() => {
        toast.style.display = "none";
    }, 3000);
}

/*************************************************
 * Cached API GET
 *************************************************/
async function apiGet(action, params = {}, showLoading = true, useCache = false) {
    const cacheKey = "aps_cache_" + action + "_" + JSON.stringify(params);
    
    if (useCache) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch (e) {}
        }
    }

    if (showLoading) showLoader();

    try {
        const query = new URLSearchParams({ action, ...params });
        const response = await fetch(API + "?" + query.toString());
        const result = await response.json();

        if (showLoading) hideLoader();

        if (!result.success) {
            showToast(result.message, false);
            return null;
        }

        if (useCache) {
            localStorage.setItem(cacheKey, JSON.stringify(result.data));
        }

        return result.data;
    } catch (error) {
        if (showLoading) hideLoader();
        console.error(error);
        showToast(error.message, false);
        return null;
    }
}

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

        // Clear related caches on POST
        localStorage.clear();

        return result.data;
    } catch (error) {
        if (showLoading) hideLoader();
        console.error(error);
        showToast(error.message, false);
        return null;
    }
}

// Wrapper Functions
function getStudents() { return apiGet("getStudents", {}, true, true); }
function getAttendance(session, className, section) { return apiGet("getAttendance", { session, class: className, section }, true, false); }
function getEducationalHistory(session, className, section) { return apiGet("getEducationalHistory", { session, class: className, section }, true, false); }
function submitAttendance(students) { return apiPost("submitAttendance", { students }, false); }
function submitEducationalReport(data) { return apiPost("submitEducationalReport", data); }
function getClasses() { return apiGet("getClasses", {}, true, true); }
function getSections(className) { return apiGet("getSections", { class: className }, true, true); }
function getStudentHistory(rowNumber) { return apiGet("getStudentHistory", { rowNumber }, true, false); }
function getMultipleStudentHistory(rows) { return apiPost("getMultipleStudentHistory", { rows }); }
function getFeeDefaulters(session, className, search) { return apiGet("getFeeDefaulters", { session, className, search }, true, false); }
