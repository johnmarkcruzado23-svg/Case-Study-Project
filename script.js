

"use strict";

const $ = id => document.getElementById(id);

const STUDENTS_KEY = "khs_sims_students_v1";
const USERS_KEY = "khs_sims_users_v1";
const SESSION_KEY = "khs_sims_logged_in";

const defaultStudents = [
    {
        id: "KHS-2026-0001",
        name: "Juan Dela Cruz",
        grade: "Grade 11",
        strand: "STEM",
        contact: "0917-123-4567",
        email: "",
        dob: "",
        gender: "Male",
        address: "",
        status: "Active",
        dateAdded: "2026-01-05"
    },
    {
        id: "KHS-2026-0002",
        name: "Maria Santos",
        grade: "Grade 12",
        strand: "ABM",
        contact: "0918-222-3344",
        email: "",
        dob: "",
        gender: "Female",
        address: "",
        status: "Active",
        dateAdded: "2026-01-06"
    },
    {
        id: "KHS-2026-0003",
        name: "Carlos Reyes",
        grade: "Grade 11",
        strand: "HUMSS",
        contact: "0919-555-6677",
        email: "",
        dob: "",
        gender: "Male",
        address: "",
        status: "Active",
        dateAdded: "2026-01-07"
    }
];

const defaultUsers = [
    {
        username: "admin",
        name: "System Administrator",
        role: "Administrator",
        status: "Active"
    },
    {
        username: "registrar",
        name: "School Registrar",
        role: "Registrar",
        status: "Active"
    }
];

function loadData(key, fallback) {
    try {
        const data = localStorage.getItem(key);
        return data === null ? fallback : JSON.parse(data);
    } catch {
        return fallback;
    }
}

let students = loadData(STUDENTS_KEY, defaultStudents);
let users = loadData(USERS_KEY, defaultUsers);

function saveStudents() {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
}

function saveUsers() {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function safe(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[ch]);
}

function emptyRow(columns) {
    return `<tr><td colspan="${columns}">No records found.</td></tr>`;
}

function statusText(status) {
    return safe(status);
}

// LOGIN
$("loginForm").addEventListener("submit", event => {
    event.preventDefault();

    if (
        $("username").value.trim() === "admin" &&
        $("password").value === "admin123"
    ) {
        sessionStorage.setItem(SESSION_KEY, "true");
        $("loginError").textContent = "";
        $("loginPage").classList.add("hidden");
        $("app").classList.remove("hidden");
        renderAll();
        navigate("dashboard");
    } else {
        $("loginError").textContent = "Incorrect username or password.";
    }
});

function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    $("app").classList.add("hidden");
    $("loginPage").classList.remove("hidden");
    $("loginForm").reset();
}

$("logoutBtn").addEventListener("click", logout);

// NAVIGATION
const pageTitles = {
    dashboard: "Dashboard",
    students: "Student Management",
    add: "Add Student",
    search: "Search Students",
    reports: "Reports",
    users: "User Management"
};

function navigate(page) {
    document.querySelectorAll(".page").forEach(section => {
        section.classList.toggle("hidden", section.id !== page);
    });

    if (pageTitles[page]) {
        document.querySelector("h2") &&
            (document.querySelector("h2").textContent = pageTitles[page]);
    }

    if (page === "dashboard") renderDashboard();
    if (page === "students") renderStudents();
    if (page === "search") renderSearch();
    if (page === "reports") renderReports();
    if (page === "users") renderUsers();
}

document.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", () => navigate(button.dataset.page));
});

document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", () => navigate(button.dataset.go));
});

// DASHBOARD
function renderDashboard() {
    $("totalStudents").textContent = students.length;
    $("activeStudents").textContent =
        students.filter(s => s.status === "Active").length;
    $("grade11").textContent =
        students.filter(s => s.grade === "Grade 11").length;
    $("grade12").textContent =
        students.filter(s => s.grade === "Grade 12").length;

    const recent = [...students].reverse().slice(0, 5);

    $("recentStudents").innerHTML = recent.length
        ? recent.map(s => `
            <tr>
                <td>${safe(s.id)}</td>
                <td>${safe(s.name)}</td>
                <td>${safe(s.grade)}</td>
                <td>${safe(s.strand)}</td>
                <td>${statusText(s.status)}</td>
            </tr>
        `).join("")
        : emptyRow(5);
}

// STUDENT MANAGEMENT
function renderStudents(query = $("studentQuickSearch").value) {
    const term = query.toLowerCase().trim();

    const list = students.filter(s =>
        `${s.id} ${s.name}`.toLowerCase().includes(term)
    );

    $("studentsTable").innerHTML = list.length
        ? list.map(s => `
            <tr>
                <td>${safe(s.id)}</td>
                <td>${safe(s.name)}</td>
                <td>${safe(s.grade)}</td>
                <td>${safe(s.strand)}</td>
                <td>${safe(s.contact)}</td>
                <td>${statusText(s.status)}</td>
                <td>
                    <button data-edit="${safe(s.id)}">Edit</button>
                    <button data-delete="${safe(s.id)}">Delete</button>
                </td>
            </tr>
        `).join("")
        : emptyRow(7);

    $("studentsTable").querySelectorAll("[data-edit]").forEach(button => {
        button.addEventListener("click", () => editStudent(button.dataset.edit));
    });

    $("studentsTable").querySelectorAll("[data-delete]").forEach(button => {
        button.addEventListener("click", () => deleteStudent(button.dataset.delete));
    });
}

$("studentQuickSearch").addEventListener("input", () => {
    renderStudents($("studentQuickSearch").value);
});

function resetStudentForm() {
    $("studentForm").reset();
    $("editOriginalId").value = "";
    $("studentFormTitle").textContent = "Add Student";
    $("dateAdded").value = new Date().toISOString().slice(0, 10);
}

function editStudent(id) {
    const s = students.find(student => student.id === id);
    if (!s) return;

    $("editOriginalId").value = s.id;
    $("studentId").value = s.id;
    $("fullName").value = s.name;
    $("grade").value = s.grade;
    $("strand").value = s.strand;
    $("contact").value = s.contact || "";
    $("email").value = s.email || "";
    $("dob").value = s.dob || "";
    $("gender").value = s.gender || "";
    $("address").value = s.address || "";
    $("status").value = s.status || "Active";
    $("dateAdded").value = s.dateAdded || "";
    $("studentFormTitle").textContent = "Edit Student";

    navigate("add");
}

function deleteStudent(id) {
    const s = students.find(student => student.id === id);
    if (!s || !confirm("Delete this student record?")) return;

    students = students.filter(student => student.id !== id);
    saveStudents();
    renderAll();
}

$("studentForm").addEventListener("submit", event => {
    event.preventDefault();

    const oldId = $("editOriginalId").value;
    const id = $("studentId").value.trim();

    if (students.some(s =>
        s.id.toLowerCase() === id.toLowerCase() && s.id !== oldId
    )) {
        alert("Student ID already exists.");
        return;
    }

    const student = {
        id,
        name: $("fullName").value.trim(),
        grade: $("grade").value,
        strand: $("strand").value,
        contact: $("contact").value.trim(),
        email: $("email").value.trim(),
        dob: $("dob").value,
        gender: $("gender").value,
        address: $("address").value.trim(),
        status: $("status").value,
        dateAdded: $("dateAdded").value || new Date().toISOString().slice(0, 10)
    };

    if (oldId) {
        const index = students.findIndex(s => s.id === oldId);
        if (index !== -1) students[index] = student;
    } else {
        students.push(student);
    }

    saveStudents();
    resetStudentForm();
    renderAll();
    navigate("students");
});

$("cancelStudent").addEventListener("click", () => {
    resetStudentForm();
    navigate("students");
});

// CSV EXPORT
$("exportBtn").addEventListener("click", () => {
    const headers = [
        "Student ID", "Name", "Grade", "Strand",
        "Contact", "Email", "Status"
    ];

    const rows = students.map(s => [
        s.id, s.name, s.grade, s.strand, s.contact, s.email, s.status
    ]);

    const csv = [headers, ...rows]
        .map(row => row.map(value =>
            `"${String(value ?? "").replace(/"/g, '""')}"`
        ).join(","))
        .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "KHS-Students.csv";
    link.click();
    URL.revokeObjectURL(url);
});

// SEARCH
function renderSearch() {
    const term = $("searchText").value.toLowerCase().trim();
    const grade = $("filterGrade").value;
    const strand = $("filterStrand").value;
    const status = $("filterStatus").value;

    const list = students.filter(s =>
        `${s.id} ${s.name}`.toLowerCase().includes(term) &&
        (!grade || s.grade === grade) &&
        (!strand || s.strand === strand) &&
        (!status || s.status === status)
    );

    $("searchResults").innerHTML = list.length
        ? list.map(s => `
            <tr>
                <td>${safe(s.id)}</td>
                <td>${safe(s.name)}</td>
                <td>${safe(s.grade)}</td>
                <td>${safe(s.strand)}</td>
                <td>${safe(s.contact)}</td>
                <td>${statusText(s.status)}</td>
            </tr>
        `).join("")
        : emptyRow(6);

    $("searchCount").textContent = list.length + " records found.";
}

["searchText", "filterGrade", "filterStrand", "filterStatus"].forEach(id => {
    $(id).addEventListener("input", renderSearch);
    $(id).addEventListener("change", renderSearch);
});

$("clearFilters").addEventListener("click", () => {
    $("searchText").value = "";
    $("filterGrade").value = "";
    $("filterStrand").value = "";
    $("filterStatus").value = "";
    renderSearch();
});

// REPORTS
function renderReports() {
    const grade = $("reportGrade").value;
    const strand = $("reportStrand").value;
    const status = $("reportStatus").value;

    const list = students.filter(s =>
        (!grade || s.grade === grade) &&
        (!strand || s.strand === strand) &&
        (!status || s.status === status)
    );

    $("reportTotal").textContent = list.length;
    $("reportActive").textContent =
        list.filter(s => s.status === "Active").length;
    $("report11").textContent =
        list.filter(s => s.grade === "Grade 11").length;
    $("report12").textContent =
        list.filter(s => s.grade === "Grade 12").length;

    $("reportTable").innerHTML = list.length
        ? list.map(s => `
            <tr>
                <td>${safe(s.id)}</td>
                <td>${safe(s.name)}</td>
                <td>${safe(s.grade)}</td>
                <td>${safe(s.strand)}</td>
                <td>${statusText(s.status)}</td>
            </tr>
        `).join("")
        : emptyRow(5);

    const counts = {};
    list.forEach(s => {
        counts[s.strand] = (counts[s.strand] || 0) + 1;
    });

    $("strandChart").innerHTML = Object.entries(counts)
        .map(([name, count]) => `<p>${safe(name)}: ${count}</p>`)
        .join("") || "<p>No report data.</p>";
}

["reportGrade", "reportStrand", "reportStatus"].forEach(id => {
    $(id).addEventListener("change", renderReports);
});

$("printReport").addEventListener("click", () => window.print());

// USER MANAGEMENT
function renderUsers() {
    $("usersTable").innerHTML = users.length
        ? users.map(u => `
            <tr>
                <td>${safe(u.username)}</td>
                <td>${safe(u.name)}</td>
                <td>${safe(u.role)}</td>
                <td>${statusText(u.status)}</td>
                <td>
                    <button data-edit-user="${safe(u.username)}">Edit</button>
                    <button data-delete-user="${safe(u.username)}">Delete</button>
                </td>
            </tr>
        `).join("")
        : emptyRow(5);

    $("usersTable").querySelectorAll("[data-edit-user]").forEach(button => {
        button.addEventListener("click", () => editUser(button.dataset.editUser));
    });

    $("usersTable").querySelectorAll("[data-delete-user]").forEach(button => {
        button.addEventListener("click", () => deleteUser(button.dataset.deleteUser));
    });
}

function openUserForm(user = null) {
    $("userForm").reset();
    $("userOriginal").value = user ? user.username : "";
    $("userDialogTitle").textContent = user ? "Edit User" : "Add User";
    $("newUsername").disabled = Boolean(user);

    if (user) {
        $("newUsername").value = user.username;
        $("newFullName").value = user.name;
        $("newRole").value = user.role;
        $("newUserStatus").value = user.status;
    }

    $("userDialog").showModal();
}

function editUser(username) {
    const user = users.find(u => u.username === username);
    if (user) openUserForm(user);
}

function deleteUser(username) {
    if (username === "admin") {
        alert("The demo admin account cannot be deleted.");
        return;
    }

    if (!confirm("Delete this user profile?")) return;

    users = users.filter(u => u.username !== username);
    saveUsers();
    renderUsers();
}

$("addUserBtn").addEventListener("click", () => openUserForm());

$("cancelUser").addEventListener("click", () => {
    $("userDialog").close();
});

$("userForm").addEventListener("submit", event => {
    event.preventDefault();

    const original = $("userOriginal").value;
    const username = $("newUsername").value.trim();

    if (!original && users.some(u =>
        u.username.toLowerCase() === username.toLowerCase()
    )) {
        alert("Username already exists.");
        return;
    }

    const user = {
        username: original || username,
        name: $("newFullName").value.trim(),
        role: $("newRole").value,
        status: $("newUserStatus").value
    };

    if (original) {
        const index = users.findIndex(u => u.username === original);
        if (index !== -1) users[index] = user;
    } else {
        users.push(user);
    }

    saveUsers();
    renderUsers();
    $("userDialog").close();
});

// UPDATE ALL PAGES
function renderAll() {
    renderDashboard();
    renderStudents();
    renderSearch();
    renderReports();
    renderUsers();
}

// INITIALIZE
saveStudents();
saveUsers();

if (sessionStorage.getItem(SESSION_KEY) === "true") {
    $("loginPage").classList.add("hidden");
    $("app").classList.remove("hidden");
    renderAll();
    navigate("dashboard");
}