/**
 * 🚀 GOOGLE SHEETS + GITHUB RESPONSIVE WEB APP
 * 📋 Student Attendance & Educational History Management System
 * 
 * FEATURES & MODULES SUMMARY:
 * 1. Dynamic Database Structure (Google Sheets Sync)
 * 2. Backend API Endpoint connection (Code.gs)
 * 3. Frontend UI Actions & Modals Handler
 */

// ==========================================================================
// ⚙️ GLOBAL CONFIGURATION (YOUR WEB APP URL FIXED HERE)
// ==========================================================================
// यहाँ आपका असली गूगल ऐप्स स्क्रिप्ट यूआरएल परमानेंटली सेट कर दिया गया है
const API_URL = "https://script.google.com/macros/s/AKfycbxamNHVVbKN89GpFws3WAhdnngFhJm0j_E2SdoEG41v6mb_0dHvdyfFYExpqRwe2PFvlg/exec";
const IS_DEMO_MODE = false; // असली डेटा एक्टिव करने के लिए इसे false रखा है

// ==========================================================================
// ⚡ INITIALIZATION & STATE MANAGEMENT
// ==========================================================================
let studentDatabase = [];
let currentModule = 'attendance';

document.addEventListener("DOMContentLoaded", () => {
    console.log("⚡ System Initialized connecting to:", API_URL);
    initApp();
});

function initApp() {
    // UI एलिमेंट्स अपडेट करें और डेमो मोड बैज हटाएं
    updateApiStatusBadge();
    setupEventListeners();
    fetchStudentData();
}

function updateApiStatusBadge() {
    const badge = document.getElementById("apiStatusBadge");
    if (badge) {
        if (IS_DEMO_MODE || !API_URL) {
            badge.className = "text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 cursor-pointer";
            badge.innerHTML = '<span class="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1.5 animate-pulse"></span>Demo Mode';
        } else {
            badge.className = "text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 cursor-pointer";
            badge.innerHTML = '<span class="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1.5"></span>Live Sheets Connected';
        }
    }
}

// ==========================================================================
// 📥 FETCH DATA FROM GOOGLE SHEETS (`doGet`)
// ==========================================================================
async function fetchStudentData() {
    showSpinner(true);
    
    // अगर यूआरएल नहीं है या डेमो मोड ऑन है तो यहीं से बाहर निकलें (या यहाँ अपना डेमो डेटा रेंडर लॉजिक डालें)
    if (IS_DEMO_MODE || !API_URL) {
        console.log("📋 Running in Demo Mode. Load dummy data here if needed.");
        showSpinner(false);
        return;
    }

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Network response was not ok");
        
        const data = await response.json();
        studentDatabase = data;
        console.log("📊 Data received from Google Sheets:", data);
        
        // डेटा मिलने के बाद UI रेंडर करने वाले फंक्शन्स को कॉल करें
        renderAttendanceModule();
        renderHistoryModule();
        showToast("✅ Google Sheets data loaded successfully!");
    } catch (error) {
        console.error("❌ Error fetching sheets data:", error);
        showToast("❌ Failed to connect with Google Sheets!", true);
    } finally {
        showSpinner(false);
    }
}

// ==========================================================================
// 📤 POST DATA TO GOOGLE SHEETS (`doPost`)
// ==========================================================================
async function submitAttendanceToSheets(attendanceData) {
    showSpinner(true);
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors', // CORS इशू से बचने के लिए
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'markAttendance', data: attendanceData })
        });
        showToast("🚀 Attendance updated inside Google Sheet!");
    } catch (error) {
        console.error("❌ Attendance submission failed:", error);
        showToast("❌ Attendance save failed!", true);
    } finally {
        showSpinner(false);
    }
}

async function submitReportToSheets(reportData) {
    showSpinner(true);
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'submitReport', data: reportData })
        });
        showToast("💾 Educational history log appended successfully!");
    } catch (error) {
        console.error("❌ Report submission failed:", error);
        showToast("❌ Report save failed!", true);
    } finally {
        showSpinner(false);
    }
}

// ==========================================================================
// 🎨 UI CONTROLLERS, MODALS & UTILITIES
// ==========================================================================
function setupEventListeners() {
    // सेटिंग्स बटन क्लिक पर यूआरएल दिखाने के लिए (HTML इनपुट में पहले से ही वैल्यू दिखेगी)
    const btnSettings = document.getElementById("btnSettings");
    const inputApiUrl = document.getElementById("inputApiUrl");
    if (btnSettings && inputApiUrl) {
        inputApiUrl.value = API_URL;
        btnSettings.addEventListener("click", () => toggleModal("modalSettings", true));
    }
    
    document.getElementById("btnCloseSettings")?.addEventListener("click", () => toggleModal("modalSettings", false));
    document.getElementById("btnSaveSettings")?.addEventListener("click", () => {
        showToast("⚙️ Base API URL is locked in code!");
        toggleModal("modalSettings", false);
    });

    // मॉड्यूल्स स्विच टैब्स
    document.getElementById("tabAttendance")?.addEventListener("click", () => switchModule('attendance'));
    document.getElementById("tabHistory")?.addEventListener("click", () => switchModule('history'));

    // क्लोज मॉडल्स के कंबाइंड बटन्स
    document.querySelectorAll(".close-modal-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const modal = e.target.closest(".fixed-modal");
            if (modal) modal.classList.add("hidden");
        });
    });
}

function switchModule(moduleName) {
    currentModule = moduleName;
    const mAttendance = document.getElementById("moduleAttendance");
    const mHistory = document.getElementById("moduleHistory");
    const tAttendance = document.getElementById("tabAttendance");
    const tHistory = document.getElementById("tabHistory");

    if (moduleName === 'attendance') {
        mAttendance?.classList.remove("hidden");
        mHistory?.classList.add("hidden");
        tAttendance?.classList.add("bg-indigo-600", "text-white");
        tHistory?.classList.remove("bg-indigo-600", "text-white");
    } else {
        mAttendance?.classList.add("hidden");
        mHistory?.classList.remove("hidden");
        tHistory?.classList.add("bg-indigo-600", "text-white");
        tAttendance?.classList.remove("bg-indigo-600", "text-white");
    }
}

function renderAttendanceModule() { /* टेबल और मोबाइल कार्ड्स बनाने का आपका लॉजिक यहाँ रहेगा */ }
function renderHistoryModule() { /* हिस्ट्री कार्ड्स और टाइमलाइन रेंडर का आपका लॉजिक यहाँ रहेगा */ }

function toggleModal(id, show) {
    const el = document.getElementById(id);
    if (el) show ? el.classList.remove("hidden") : el.classList.add("hidden");
}

function showSpinner(show) {
    const el = document.getElementById("globalSpinner");
    if (el) show ? el.classList.remove("hidden") : el.classList.add("hidden");
}

function showToast(message, isError = false) {
    const toast = document.getElementById("globalToast");
    if (!toast) return;
    toast.innerText = message;
    toast.className = `fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold transition-all transform duration-300 z-50 print-hide ${isError ? 'bg-rose-600 text-white' : 'bg-indigo-600 text-white'}`;
    toast.classList.remove("translate-y-20", "opacity-0");
    setTimeout(() => {
        toast.classList.add("translate-y-20", "opacity-0");
    }, 4000);
}
