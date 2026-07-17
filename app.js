# 🚀 Google Sheets + GitHub Responsive Web App
### **Student Attendance & Educational History Management System**

A state-of-the-art, glassmorphism-themed responsive web application built with HTML5, Tailwind CSS, and Pure JavaScript (Fetch API) hosted on GitHub Pages, powered by a Google Apps Script (`Code.gs`) backend connected to Google Sheets.

---

## ✨ Features & Modules

### 1. 📊 Dynamic Database Structure (Google Sheets)
- **`Student data source` (Read Only):** Contains 50 columns of student master data (IDs, Names, DOB, Category, Address, Photo Links, Marksheet Links).
- **`Student Attendance` (Write & Auto-Sync):** 
  - Automatically syncs active students from the data source.
  - Columns A-J store core info + live calculated **`Total Present`** and **`Month Present`** counters.
  - Columns K onwards cover all **365 days of the session (`1-Apr` to `31-Mar`)**.
- **`Educational History` (Append / Time-stamped Log):**
  - Stores answers to 5 core teaching & parent evaluation questions.
  - Never overwrites old records! Instead, it appends entries inside the exact cell using the format `\n[DD-MM-YYYY hh:mm AM/PM] - Answer`.

### 2. ⚡ Backend API (`Code.gs`)
- **Dynamic Session Calculation:** Auto-calculates current session based on month (`April-Dec` $\rightarrow$ `YYYY-(YYYY+1)`, `Jan-Mar` $\rightarrow$ `(YYYY-1)-YYYY`).
- **Auto-Sync Engine (`autoSyncStudents`):** Detects new active students and automatically provisions rows in `Student Attendance` and `Educational History`.
- **`doGet(e)` API:** Returns JSON containing active students joined with live attendance and historical evaluation logs.
- **`doPost(e)` API:** Handles attendance marking (`markAttendance`) and cell appending (`submitReport`).

### 3. 🎨 Frontend UI (`index.html`, `style.css`, `app.js`)
- **Responsive Dual Layout:**
  - **PC / Desktop:** Full-width rich table view with clean columns and instant toggle buttons.
  - **Mobile Touch-Friendly:** Card-based single-column layout optimized for thumb interaction.
- **Educational History Evaluation Modals:**
  - **Submit Report Modal:** 5-question pop-up form (`Learning`, `Writing`, `Presence`, `Material`, `Parent Reaction`).
  - **View Report Timeline:** Parses multi-line cell history into beautiful date-wise timeline cards.
- **🖨️ A4 Print Media Query (`@media print`):**
  - Click **Print Report Card (A4)** to instantly hide all navigation tabs, filter bars, and buttons.
  - Generates a pristine A4 student report card ready for physical distribution or PDF export.

---

## 🛠️ Setup Instructions

### Step 1: Google Sheets Setup
1. Create a new Google Sheet and create three tabs exactly named:
   - `Student data source`
   - `Student Attendance`
   - `Educational History`
2. In `Student data source`, add the 50 columns across row 1 (`Primary Mobile Number` up to `Marksheet Document Link (Drive)`).
3. In `Student Attendance`, add columns A to J:
   `Primary Mobile Number`, `Current Session`, `Student ID`, `Student Name`, `Current Class`, `Section`, `Student Status`, `Student Photo Link (Drive)`, `Total Present`, `Month Present`.
   From column K onwards, add `1-Apr`, `2-Apr`, ..., up to `31-Mar`.
4. In `Educational History`, add columns A to H same as above, plus I to M:
   `Students reaction After teaching(Learning)`, `Students reaction After teaching(Writing)`, `Presence, cleanness(total)`, `Study Material Availbity`, `Reaction of Paret atfer knowing all about Student`.

### Step 2: Google Apps Script Deployment
1. In your Google Sheet, click **Extensions** $\rightarrow$ **Apps Script**.
2. Replace the contents of `Code.gs` with the provided `Code.gs` file in this repository.
3. Click **Deploy** $\rightarrow$ **New deployment**.
4. Select **Web app**:
   - **Execute as:** `Me (your email)`
   - **Who has access:** `Anyone`
5. Click **Deploy** and copy the **Web App URL** (`https://script.google.com/macros/s/.../exec`).

### Step 3: GitHub Pages Hosting
1. Upload `index.html`, `style.css`, and `app.js` to your GitHub repository.
2. Go to **Settings** $\rightarrow$ **Pages** and enable GitHub Pages on the `main` branch.
3. Open your deployed GitHub Pages URL, click the **⚙️ Settings** icon in the top header, paste your **Google Apps Script Web App URL**, and click **Save Settings**!
4. *(Note: If no URL is entered, the app runs in Built-in Demo Mode so you can preview all UI workflows instantly!)*

---
## 👨‍💻 Built By
Designed and implemented exactly according to the **100% Project Blueprint** specification.
