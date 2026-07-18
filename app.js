/**
 * 🚀 GOOGLE SHEETS + GITHUB RESPONSIVE WEB APP
 * 📋 Student Attendance & Educational History Management System
 * 100% Dynamic Session & Date Initializer Engine
 */

// ==========================================================================
// ⚙️ GLOBAL CONFIGURATION
// ==========================================================================
const API_URL = "https://script.google.com/macros/s/AKfycbxgcHiS4n0ygB1gcHoGj6jbb14YQCB5fKSI9-iyCl4Z1qOzxOXAwM35fwYCfFg79C69TA/exec";
const IS_DEMO_MODE = false; 

// ==========================================================================
// ⚡ INITIALIZATION & STATE MANAGEMENT
// ==========================================================================
let studentDatabase = [];
let currentModule = 'attendance';
let hasUserSelectedSession = false;

document.addEventListener("DOMContentLoaded", () => {
    console.log("⚡ System Initialized connecting to:", API_URL);
    
    // 1. आज की तारीख को लोकल टाइमज़ोन के अनुसार बॉक्स में ऑटो-सेट करें
    const dateInput = document.getElementById("attendanceDateInput");
    if (dateInput) {
        const tzOffset = (new Date()).getTimezoneOffset() * 60000;
        const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
        dateInput.value = localISOTime;
    }
    
    setupEventListeners();
    
    // 2. सबसे पहले बिना किसी हार्डकोडेड सत्र के डेटा मंगाएंगे ताकि शीट का लाइव सत्र मिल सके
    fetchStudentData(true); 
});

function updateApiStatusBadge() {
    const badge = document.getElementById("apiStatusBadge");
    if (badge) {
        badge.className = "text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30";
        badge.innerHTML = '<span class="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>Live Sheets Connected';
    }
}

// ==========================================================================
// 📥 FETCH DATA FROM GOOGLE SHEETS (`doGet`)
// ==========================================================================
async function fetchStudentData(isInitialLoad = false) {
    showSpinner(true);
    try {
        const dateInput = document.getElementById("attendanceDateInput")?.value || "";
        let formattedDate = "";
        if (dateInput) {
            const d = new Date(dateInput);
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            formattedDate = `${d.getDate()}-${months[d.getMonth()]}`; 
        }
        
        let url = `${API_URL}?action=getStudents&date=${formattedDate}`;
        
        // यदि यूजर ने खुद ड्रॉपडाउन से कोई सत्र चुना है, तभी वह पैरामीटर भेजें
        if (!isInitialLoad) {
            const selectedSession = document.querySelector(".session-select")?.value || "";
            if (selectedSession && selectedSession !== "ALL") {
                url += `&session=${selectedSession}`;
            }
        } else {
            // शुरुआती लोड पर बैकएंड को बिना सत्र के हिट करेंगे ताकि वह सभी सक्रिय छात्रों को दे और हम शीट से लाइव सत्र उठा सकें
            url += `&session=ALL`;
        }

        const response = await fetch(url);
        const resObject = await response.json();
        
        if (resObject.status === "success" && resObject.data) {
            studentDatabase = resObject.data;
            updateApiStatusBadge();
            
            // यदि शुरुआती लोड है, तो शीट के वास्तविक डेटा के आधार पर फिल्टर्स (सत्र, क्लास, सेक्शन) का निर्माण करें
            if (isInitialLoad || !hasUserSelectedSession) {
                populateDynamicFilters(isInitialLoad);
            }
            
            renderAttendanceModule();
            renderHistoryModule();
        }
    } catch (error) {
        console.error("❌ Fetch Error:", error);
        showToast("❌ Connection error with Google Sheets!", true);
    } finally {
        showSpinner(false);
    }
}

// ==========================================================================
// 🔍 DYNAMIC FILTER POPULATION (100% LIVE SHEET BASED)
// ==========================================================================
function populateDynamicFilters(isInitialLoad = false) {
    if (!studentDatabase.length) return;

    // शीट से आने वाले वास्तविक डेटा के आधार पर यूनीक वैल्यूज निकालें
    const sessions = [...new Set(studentDatabase.map(s => s.session).filter(Boolean))].sort().reverse(); // नए सत्र ऊपर दिखें
    const classes = [...new Set(studentDatabase.map(s => s.currentClass).filter(Boolean))].sort();
    const sections = [...new Set(studentDatabase.map(s => s.section).filter(Boolean))].sort();

    // 1. सत्र ड्रॉपडाउन को पूरी तरह डायनामिक भरें
    document.querySelectorAll(".session-select").forEach(select => {
        let options = "";
        sessions.forEach(s => { options += `<option value="${s}">${s}</option>`; });
        options += '<option value="ALL">All Sessions</option>';
        select.innerHTML = options;
        
        // शुरुआती लोड पर, जो भी सत्र शीट में सबसे पहले नंबर पर मौजूद है, उसे डिफ़ॉल्ट रूप से सेलेक्ट करें
        if (isInitialLoad && sessions.length > 0) {
            select.value = sessions[0];
        }
    });

    // 2. क्लास ड्रॉपडाउन लोड करना
    ["attFilterClass", "histFilterClass"].forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            let options = '<option value="ALL">All Classes</option>';
            classes.forEach(c => { options += `<option value="${c}">${c}</option>`; });
            select.innerHTML = options;
        }
    });

    // 3. सेक्शन ड्रॉपडाउन लोड करना
    ["attFilterSection", "histFilterSection"].forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            let options = '<option value="ALL">All Sections</option>';
            sections.forEach(s => { options += `<option value="${s}">${s}</option>`; });
            select.innerHTML = options;
        }
    });
}

// ==========================================================================
// 🎨 ATTENDANCE MODULE RENDERER
// ==========================================================================
function renderAttendanceModule() {
    const tableBody = document.getElementById("attendanceTableBody");
    const cardContainer = document.getElementById("attendanceCardContainer");
    if (!tableBody || !cardContainer) return;

    const selectedSession = document.querySelector(".session-select")?.value || "ALL";
    const selectedClass = document.getElementById("attFilterClass")?.value || "ALL";
    const selectedSection = document.getElementById("attFilterSection")?.value || "ALL";

    const filteredData = studentDatabase.filter(student => {
        const sessionMatch = selectedSession === "ALL" || student.session === selectedSession;
        const classMatch = selectedClass === "ALL" || student.currentClass === selectedClass;
        const sectionMatch = selectedSection === "ALL" || student.section === selectedSection;
        return sessionMatch && classMatch && sectionMatch;
    });

    let tableHtml = "";
    filteredData.forEach(student => {
        const isPresent = student.attendanceStatus === "P";
        const isAbsent = student.attendanceStatus === "A";
        tableHtml += `
            <tr class="border-b border-slate-700/40 hover:bg-slate-800/30 transition-colors">
                <td class="p-4 font-mono font-bold text-indigo-400">${student.studentId}</td>
                <td class="p-4 flex items-center gap-3">
                    <img src="${student.studentPhotoLink || 'https://via.placeholder.com/150'}" class="w-10 h-10 rounded-lg object-cover border border-slate-700" onerror="this.src='https://via.placeholder.com/150'">
                    <div>
                        <div class="font-bold text-white">${student.studentName}</div>
                        <div class="text-xs text-slate-400">${student.currentClass} - ${student.section}</div>
                    </div>
                </td>
                <td class="p-4 text-center font-bold text-emerald-400">${student.totalPresent}</td>
                <td class="p-4 text-center font-bold text-teal-400">${student.monthPresent}</td>
                <td class="p-4 text-center">
                    <div class="inline-flex rounded-xl bg-slate-900/80 p-1 border border-slate-700/60">
                        <button onclick="markLocalStatus('${student.studentId}', 'P')" class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${isPresent ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}">P</button>
                        <button onclick="markLocalStatus('${student.studentId}', 'A')" class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${isAbsent ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}">A</button>
                    </div>
                </td>
            </tr>`;
    });
    tableBody.innerHTML = tableHtml || `<tr><td colspan="5" class="p-8 text-center text-slate-500">No active students found matching filters.</td></tr>`;

    let cardsHtml = "";
    filteredData.forEach(student => {
        const isPresent = student.attendanceStatus === "P";
        const isAbsent = student.attendanceStatus === "A";
        cardsHtml += `
            <div class="glass-panel p-4 rounded-2xl border border-slate-700/50 space-y-4">
                <div class="flex items-center gap-3">
                    <img src="${student.studentPhotoLink || 'https://via.placeholder.com/150'}" class="w-12 h-12 rounded-xl object-cover border border-slate-600" onerror="this.src='https://via.placeholder.com/150'">
                    <div class="flex-1">
                        <div class="text-xs font-mono text-indigo-400 font-bold">${student.studentId}</div>
                        <div class="font-bold text-white">${student.studentName}</div>
                        <div class="text-xs text-slate-400">${student.currentClass} | ${student.section}</div>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-2 text-center bg-slate-900/40 p-2 rounded-xl border border-slate-800">
                    <div><span class="block text-[10px] uppercase text-slate-500 font-bold">Total P</span><span class="text-sm font-bold text-emerald-400">${student.totalPresent}</span></div>
                    <div><span class="block text-[10px] uppercase text-slate-500 font-bold">Month P</span><span class="text-sm font-bold text-teal-400">${student.monthPresent}</span></div>
                </div>
                <div class="flex justify-center bg-slate-900/60 p-1 rounded-xl border border-slate-800">
                    <button onclick="markLocalStatus('${student.studentId}', 'P')" class="flex-1 py-2 rounded-lg text-xs font-bold transition-all ${isPresent ? 'bg-emerald-600 text-white' : 'text-slate-400'}">Present (P)</button>
                    <button onclick="markLocalStatus('${student.studentId}', 'A')" class="flex-1 py-2 rounded-lg text-xs font-bold transition-all ${isAbsent ? 'bg-rose-600 text-white' : 'text-slate-400'}">Absent (A)</button>
                </div>
            </div>`;
    });
    cardContainer.innerHTML = cardsHtml || `<div class="p-4 text-center text-slate-500">No active students available.</div>`;
}

window.markLocalStatus = (studentId, status) => {
    const student = studentDatabase.find(s => s.studentId === studentId);
    if (student) {
        student.attendanceStatus = student.attendanceStatus === status ? "" : status; 
        renderAttendanceModule();
    }
};

// ==========================================================================
// 📊 EDUCATIONAL HISTORY MODULE RENDERER
// ==========================================================================
function renderHistoryModule() {
    const container = document.getElementById("historyListContainer");
    if (!container) return;

    const selectedSession = document.querySelector(".session-select")?.value || "ALL";
    const searchVal = document.getElementById("historySearchInput")?.value.toLowerCase() || "";
    const selectedClass = document.getElementById("histFilterClass")?.value || "ALL";
    const selectedSection = document.getElementById("histFilterSection")?.value || "ALL";

    const filteredData = studentDatabase.filter(student => {
        const sessionMatch = selectedSession === "ALL" || student.session === selectedSession;
        const nameMatch = student.studentName.toLowerCase().includes(searchVal) || student.studentId.toLowerCase().includes(searchVal);
        const classMatch = selectedClass === "ALL" || student.currentClass === selectedClass;
        const sectionMatch = selectedSection === "ALL" || student.section === selectedSection;
        return sessionMatch && nameMatch && classMatch && sectionMatch;
    });

    let html = "";
    filteredData.forEach(student => {
        html += `
            <div class="glass-panel p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-700/60">
                <div class="flex items-center gap-4">
                    <img src="${student.studentPhotoLink || 'https://via.placeholder.com/150'}" class="w-14 h-14 rounded-2xl object-cover border border-slate-600" onerror="this.src='https://via.placeholder.com/150'">
                    <div>
                        <span class="text-xs font-mono font-bold text-indigo-400">${student.studentId}</span>
                        <h3 class="font-bold text-white text-base">${student.studentName}</h3>
                        <p class="text-xs text-slate-400">${student.currentClass} • ${student.section} • Session: ${student.session}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3 w-full md:w-auto">
                    <button onclick="openEvaluationModal('${student.studentId}')" class="flex-1 md:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all">📝 Submit Report</button>
                    <button onclick="openTimelineModal('${student.studentId}')" class="flex-1 md:flex-none px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition-all">📊 View History</button>
                </div>
            </div>`;
    });
    container.innerHTML = html || `<div class="p-8 text-center text-slate-500">No records found.</div>`;
}

// ==========================================================================
// 📤 POST SUBMISSIONS
// ==========================================================================
async function submitAttendance() {
    const selectedDate = document.getElementById("attendanceDateInput")?.value || "";
    if (!selectedDate) return showToast("❌ Select a valid date first!", true);

    const d = new Date(selectedDate);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedDate = `${d.getDate()}-${months[d.getMonth()]}`;

    const markedRecords = studentDatabase
        .filter(s => s.attendanceStatus === "P" || s.attendanceStatus === "A")
        .map(s => ({ studentId: s.studentId, session: s.session, date: formattedDate, status: s.attendanceStatus }));

    if (!markedRecords.length) return showToast("⚠️ No modifications to save.", true);

    showSpinner(true);
    try {
        await fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'markAttendance', records: markedRecords })
        });
        showToast("🚀 Attendance synchronized with Sheet!");
        setTimeout(() => fetchStudentData(false), 1500);
    } catch (error) {
        showToast("❌ Save failed!", true);
    } finally {
        showSpinner(false);
    }
}

// ==========================================================================
// 🎨 EVENT LISTENERS
// ==========================================================================
function setupEventListeners() {
    document.getElementById("btnSubmitAttendance")?.addEventListener("click", submitAttendance);
    
    document.querySelectorAll(".session-select").forEach(select => {
        select.addEventListener("change", (e) => {
            hasUserSelectedSession = true; 
            document.querySelectorAll(".session-select").forEach(el => el.value = e.target.value);
            fetchStudentData(false);
        });
    });

    document.getElementById("attFilterClass")?.addEventListener("change", renderAttendanceModule);
    document.getElementById("attFilterSection")?.addEventListener("change", renderAttendanceModule);
    document.getElementById("attendanceDateInput")?.addEventListener("change", () => fetchStudentData(false));
    
    document.getElementById("historySearchInput")?.addEventListener("input", renderHistoryModule);
    document.getElementById("histFilterClass")?.addEventListener("change", renderHistoryModule);
    document.getElementById("histFilterSection")?.addEventListener("change", renderHistoryModule);

    document.getElementById("tabAttendance")?.addEventListener("click", () => switchModule('attendance'));
    document.getElementById("tabHistory")?.addEventListener("click", () => switchModule('history'));

    document.querySelectorAll(".close-modal-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const modal = e.target.closest(".fixed-modal");
            if (modal) modal.classList.add("hidden");
        });
    });

    document.getElementById("submitReportForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
            action: "submitReport",
            studentId: document.getElementById("reportStudentId").value,
            session: document.getElementById("reportStudentSession").value,
            learningReaction: document.getElementById("reportLearning").value,
            writingReaction: document.getElementById("reportWriting").value,
            presenceCleanness: document.getElementById("reportPresence").value,
            studyMaterial: document.getElementById("reportMaterial").value,
            parentReaction: document.getElementById("reportParent").value
        };

        showSpinner(true);
        try {
            await fetch(API_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            showToast("💾 Log appended successfully!");
            document.getElementById("submitReportForm").reset();
            document.getElementById("modalSubmitReport").classList.add("hidden");
            setTimeout(() => fetchStudentData(false), 1500);
        } catch (err) {
            showToast("❌ Save failed.", true);
        } finally {
            showSpinner(false);
        }
    });
}

window.openEvaluationModal = (studentId) => {
    const student = studentDatabase.find(s => s.studentId === studentId);
    if (!student) return;
    document.getElementById("modalSubmitReportHeader").innerHTML = `
        <h3 class="text-lg font-bold text-white">📝 Evaluate: ${student.studentName}</h3>
        <p class="text-xs text-slate-400">ID: ${student.studentId} | Class: ${student.currentClass}</p>`;
    document.getElementById("reportStudentId").value = student.studentId;
    document.getElementById("reportStudentSession").value = student.session;
    toggleModal("modalSubmitReport", true);
};

window.openTimelineModal = (studentId) => {
    const student = studentDatabase.find(s => s.studentId === studentId);
    if (!student) return;

    const contentArea = document.getElementById("modalTimelineContent");
    const h = student.history || {};
    const parseLogs = (logString) => {
        if (!logString) return ['<p class="text-xs text-slate-500 italic">No log recorded.</p>'];
        return logString.split('\n').reverse().map(log => `<div class="bg-slate-900/40 border border-slate-800 p-3 rounded-xl font-mono text-xs text-indigo-300">${log}</div>`);
    };

    contentArea.innerHTML = `
        <div class="flex items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <img src="${student.studentPhotoLink || 'https://via.placeholder.com/150'}" class="w-16 h-16 rounded-xl object-cover border border-slate-700" onerror="this.src='https://via.placeholder.com/150'">
            <div>
                <h2 class="text-xl font-bold text-white">${student.studentName}</h2>
                <p class="text-xs text-slate-400">ID: ${student.studentId} | Class: ${student.currentClass} - ${student.section}</p>
            </div>
        </div>
        <div class="space-y-4 pt-2">
            <div><label class="text-xs uppercase font-bold text-slate-400 tracking-wider">1. Learning Behavior Log</label><div class="space-y-1.5 mt-1">${parseLogs(h.learningReaction).join('')}</div></div>
            <div><label class="text-xs uppercase font-bold text-slate-400 tracking-wider">2. Writing Capabilities Log</label><div class="space-y-1.5 mt-1">${parseLogs(h.writingReaction).join('')}</div></div>
            <div><label class="text-xs uppercase font-bold text-slate-400 tracking-wider">3. Hygiene & Presence Log</label><div class="space-y-1.5 mt-1">${parseLogs(h.presenceCleanness).join('')}</div></div>
            <div><label class="text-xs uppercase font-bold text-slate-400 tracking-wider">4. Material Availability Log</label><div class="space-y-1.5 mt-1">${parseLogs(h.studyMaterial).join('')}</div></div>
            <div><label class="text-xs uppercase font-bold text-slate-400 tracking-wider">5. Parent Feedback Log</label><div class="space-y-1.5 mt-1">${parseLogs(h.parentReaction).join('')}</div></div>
        </div>`;
    toggleModal("modalTimelineReport", true);
};

function switchModule(moduleName) {
    currentModule = moduleName;
    const mAttendance = document.getElementById("moduleAttendance");
    const mHistory = document.getElementById("moduleHistory");
    const tAttendance = document.getElementById("tabAttendance");
    const tHistory = document.getElementById("tabHistory");

    if (moduleName === 'attendance') {
        mAttendance?.classList.remove("hidden");
        mHistory?.classList.add("hidden");
        tAttendance?.className = "flex-1 md:flex-none px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-indigo-600 text-white shadow-lg";
        tHistory?.className = "flex-1 md:flex-none px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-slate-800/60 text-slate-300 hover:text-white";
    } else {
        mAttendance?.classList.add("hidden");
        mHistory?.classList.remove("hidden");
        tHistory?.className = "flex-1 md:flex-none px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-indigo-600 text-white shadow-lg";
        tAttendance?.className = "flex-1 md:flex-none px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-slate-800/60 text-slate-300 hover:text-white";
    }
}

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
    setTimeout(() => { toast.classList.add("translate-y-20", "opacity-0"); }, 4000);
}
