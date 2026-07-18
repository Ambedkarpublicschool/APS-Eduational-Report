/**
 * 🚀 GOOGLE SHEETS + GITHUB RESPONSIVE WEB APP
 * 📋 Student Attendance & Educational History Management System
 * Backend Connected & Dynamic Filter Synchronized
 */

// ==========================================================================
// ⚙️ GLOBAL CONFIGURATION
// ==========================================================================
const API_URL = "https://script.google.com/macros/s/AKfycbxamNHVVbKN89GpFws3WAhdnngFhJm0j_E2SdoEG41v6mb_0dHvdyfFYExpqRwe2PFvlg/exec";
const IS_DEMO_MODE = false; 

// ==========================================================================
// ⚡ INITIALIZATION & STATE MANAGEMENT
// ==========================================================================
let studentDatabase = [];
let currentModule = 'attendance';

document.addEventListener("DOMContentLoaded", () => {
    console.log("⚡ System Initialized connecting to:", API_URL);
    
    // आज की तारीख इनपुट फ़ील्ड में डिफ़ॉल्ट सेट करें
    const dateInput = document.getElementById("attendanceDateInput");
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
    
    initApp();
});

function initApp() {
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
    
    if (IS_DEMO_MODE || !API_URL) {
        showSpinner(false);
        return;
    }

    try {
        // ऐप्स स्क्रिप्ट को तारीख भेजकर डेटा मंगवाएं
        const dateInput = document.getElementById("attendanceDateInput")?.value || "";
        let formattedDate = "";
        if (dateInput) {
            const d = new Date(dateInput);
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            formattedDate = `${d.getDate()}-${months[d.getMonth()]}`;
        }
        
        const urlWithParams = `${API_URL}?action=getStudents&date=${formattedDate}`;
        const response = await fetch(urlWithParams);
        if (!response.ok) throw new Error("Network response was not ok");
        
        const resObject = await response.json();
        
        if (resObject.status === "success" && resObject.data) {
            studentDatabase = resObject.data;
            console.log("📊 Live Sheet Data Loaded:", studentDatabase);
            
            // डेटा के आधार पर फिल्टर्स (Session, Class) को लाइव अपडेट करें
            populateDynamicFilters();
            
            // डेटा ग्रिड रेंडर करें
            renderAttendanceModule();
            renderHistoryModule();
            showToast("✅ Google Sheets data loaded successfully!");
        } else {
            throw new Error(resObject.message || "Unknown error from server");
        }
    } catch (error) {
        console.error("❌ Error fetching sheets data:", error);
        showToast("❌ Failed to connect with Google Sheets!", true);
    } finally {
        showSpinner(false);
    }
}

// ==========================================================================
// 🔍 DYNAMIC FILTER POPULATION
// ==========================================================================
function populateDynamicFilters() {
    const sessions = [...new Set(studentDatabase.map(s => s.session).filter(Boolean))];
    const classes = [...new Set(studentDatabase.map(s => s.currentClass).filter(Boolean))];

    // सेशन्स ड्रॉपडाउन अपडेट करें
    document.querySelectorAll(".session-select").forEach(select => {
        select.innerHTML = sessions.map(sess => `<option value="${sess}">${sess}</option>`).join('');
    });

    // क्लासेस ड्रॉपडाउन अपडेट करें (क्लास 9, 10 आदि)
    const classFilters = ["attFilterClass", "histFilterClass"];
    classFilters.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            let optionsHtml = '<option value="ALL">All Classes</option>';
            classes.forEach(cls => {
                optionsHtml += `<option value="${cls}">${cls}</option>`;
            });
            select.innerHTML = optionsHtml;
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

    // फ़िल्टर वैल्यूज प्राप्त करें
    const selectedClass = document.getElementById("attFilterClass")?.value || "ALL";
    const selectedSection = document.getElementById("attFilterSection")?.value || "ALL";

    // डेटा को फ़िल्टर करें
    const filteredData = studentDatabase.filter(student => {
        const classMatch = selectedClass === "ALL" || student.currentClass === selectedClass;
        const sectionMatch = selectedSection === "ALL" || student.section === selectedSection;
        return classMatch && sectionMatch;
    });

    // 1. PC Table View रेंडर करें
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
                    <div class="inline-flex rounded-xl bg-slate-900/80 p-1 border border-slate-700/60" data-sid="${student.studentId}">
                        <button onclick="markLocalStatus('${student.studentId}', 'P')" class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${isPresent ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}">P</button>
                        <button onclick="markLocalStatus('${student.studentId}', 'A')" class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${isAbsent ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}">A</button>
                    </div>
                </td>
            </tr>
        `;
    });
    tableBody.innerHTML = tableHtml || `<tr><td colspan="5" class="p-8 text-center text-slate-500">No active students found matching filters.</td></tr>`;

    // 2. Mobile Card View रेंडर करें
    let cardsHtml = "";
    filteredData.forEach(student => {
        const isPresent = student.attendanceStatus === "P";
        const isAbsent = student.attendanceStatus === "A";
        
        cardsHtml += `
            <div class="glass-panel p-4 rounded-2xl border border-slate-700/50 space-y-4">
                <div class="flex items-center gap-3">
                    <img src="${student.studentPhotoLink || 'https://via.placeholder.com/150'}" class="w-12 h-12 rounded-xl object-cover border border-slate-600">
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
            </div>
        `;
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

    const searchVal = document.getElementById("historySearchInput")?.value.toLowerCase() || "";
    const selectedClass = document.getElementById("histFilterClass")?.value || "ALL";
    const selectedSection = document.getElementById("histFilterSection")?.value || "ALL";

    const filteredData = studentDatabase.filter(student => {
        const nameMatch = student.studentName.toLowerCase().includes(searchVal) || student.studentId.toLowerCase().includes(searchVal);
        const classMatch = selectedClass === "ALL" || student.currentClass === selectedClass;
        const sectionMatch = selectedSection === "ALL" || student.section === selectedSection;
        return nameMatch && classMatch && sectionMatch;
    });

    let html = "";
    filteredData.forEach(student => {
        html += `
            <div class="glass-panel p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-700/60">
                <div class="flex items-center gap-4">
                    <img src="${student.studentPhotoLink || 'https://via.placeholder.com/150'}" class="w-14 h-14 rounded-2xl object-cover border border-slate-600">
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
            </div>
        `;
    });
    container.innerHTML = html || `<div class="p-8 text-center text-slate-500">No records found.</div>`;
}

// ==========================================================================
// 📤 POST SUBMISSIONS
// ==========================================================================
async function submitAttendance() {
    const selectedDate = document.getElementById("attendanceDateInput")?.value || "";
    if (!selectedDate) {
        showToast("❌ Please select a valid attendance date first!", true);
        return;
    }

    const d = new Date(selectedDate);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedDate = `${d.getDate()}-${months[d.getMonth()]}`;

    const markedRecords = studentDatabase
        .filter(s => s.attendanceStatus === "P" || s.attendanceStatus === "A")
        .map(s => ({
            studentId: s.studentId,
            session: s.session,
            date: formattedDate,
            status: s.attendanceStatus
        }));

    if (markedRecords.length === 0) {
        showToast("⚠️ No attendance modifications detected to save.", true);
        return;
    }

    showSpinner(true);
    try {
        await fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'markAttendance', records: markedRecords })
        });
        showToast("🚀 Attendance saved & synchronizing with Sheets!");
        setTimeout(fetchStudentData, 1500); // 1.5 सेकंड बाद फ्रेश डेटा री-लोड करें
    } catch (error) {
        showToast("❌ Attendance save failed!", true);
    } finally {
        showSpinner(false);
    }
}

// ==========================================================================
// 🎨 EVENT LISTENERS & MODALS LOGIC
// ==========================================================================
function setupEventListeners() {
    document.getElementById("btnSubmitAttendance")?.addEventListener("click", submitAttendance);
    
    // फ़िल्टर्स पर लाइव लिसनर जोड़ें
    document.getElementById("attFilterClass")?.addEventListener("change", renderAttendanceModule);
    document.getElementById("attFilterSection")?.addEventListener("change", renderAttendanceModule);
    document.getElementById("attendanceDateInput")?.addEventListener("change", fetchStudentData); // डेट चेंज होते ही डेटा री-फेच हो
    
    document.getElementById("historySearchInput")?.addEventListener("input", renderHistoryModule);
    document.getElementById("histFilterClass")?.addEventListener("change", renderHistoryModule);
    document.getElementById("histFilterSection")?.addEventListener("change", renderHistoryModule);

    // टैब टॉगलिंग
    document.getElementById("tabAttendance")?.addEventListener("click", () => switchModule('attendance'));
    document.getElementById("tabHistory")?.addEventListener("click", () => switchModule('history'));

    // क्लोज मॉडल्स बटन वर्किंग
    document.querySelectorAll(".close-modal-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const modal = e.target.closest(".fixed-modal");
            if (modal) modal.classList.add("hidden");
        });
    });

    // रिपोर्ट फॉर्म सबमिशन हैंडलर
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
            showToast("💾 Report submitted and log appended!");
            document.getElementById("submitReportForm").reset();
            document.getElementById("modalSubmitReport").classList.add("hidden");
            setTimeout(fetchStudentData, 1500);
        } catch (err) {
            showToast("❌ Failed to append evaluation log.", true);
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
        <p class="text-xs text-slate-400">Student ID: ${student.studentId} | Class: ${student.currentClass}</p>
    `;
    document.getElementById("reportStudentId").value = student.studentId;
    document.getElementById("reportStudentSession").value = student.session;
    
    toggleModal("modalSubmitReport", true);
};

window.openTimelineModal = (studentId) => {
    const student = studentDatabase.find(s => s.studentId === studentId);
    if (!student) return;

    const contentArea = document.getElementById("modalTimelineContent");
    const h = student.history || {};

    // ऐप्स स्क्रिप्ट के \n स्ट्रक्चर लॉग को ब्यूटीफुल टाइमलाइन कार्ड्स में ब्रेक करें
    const parseLogs = (logString) => {
        if (!logString) return ['<p class="text-xs text-slate-500 italic">No historical log recorded.</p>'];
        return logString.split('\n').reverse().map(log => `<div class="bg-slate-900/40 border border-slate-800 p-3 rounded-xl font-mono text-xs text-indigo-300">${log}</div>`);
    };

    contentArea.innerHTML = `
        <div class="flex items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <img src="${student.studentPhotoLink || 'https://via.placeholder.com/150'}" class="w-16 h-16 rounded-xl object-cover border border-slate-700">
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
        </div>
    `;

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
    setTimeout(() => {
        toast.classList.add("translate-y-20", "opacity-0");
    }, 4000);
}
