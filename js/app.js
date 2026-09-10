// ============================================================
// ICT Service Request Management System — Application Logic
// Handles CRUD operations, dashboard, search, filter, analytics
// ============================================================

// --- Global State ---
let allRequests = [];
let currentUser = null;
let deleteTargetId = null;

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener("DOMContentLoaded", async () => {
  // Guard: redirect to login if not authenticated (BR-07)
  currentUser = await requireAuth();
  if (!currentUser) return;

  // Display user email in navbar
  document.getElementById("userEmail").textContent = currentUser.email;

  // Load all data
  await loadRequests();
});

// ============================================================
// CRUD: READ — Fetch all requests from Supabase
// ============================================================
async function loadRequests() {
  const { data, error } = await supabaseClient
    .from("service_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading requests:", error.message);
    showToast("Failed to load requests: " + error.message, "error");
    return;
  }

  allRequests = data || [];
  applyFilters();
  updateDashboard();
  updateAnalytics();
}

// ============================================================
// CRUD: CREATE — Insert a new request
// ============================================================
async function createRequest(requestData) {
  const { data, error } = await supabaseClient
    .from("service_requests")
    .insert([
      {
        requester_name: requestData.requesterName,
        department: requestData.department,
        category: requestData.category,
        description: requestData.description,
        priority: requestData.priority,
        status: "Pending", // BR-06: New requests auto-set to Pending
        user_id: currentUser.id,
      },
    ])
    .select();

  if (error) {
    console.error("Error creating request:", error.message);
    showToast("Failed to create request: " + error.message, "error");
    return false;
  }

  showToast("Service request submitted successfully!", "success");
  await loadRequests();
  return true;
}

// ============================================================
// CRUD: UPDATE — Modify an existing request
// ============================================================
async function updateRequest(id, requestData) {
  const { data, error } = await supabaseClient
    .from("service_requests")
    .update({
      requester_name: requestData.requesterName,
      department: requestData.department,
      category: requestData.category,
      description: requestData.description,
      priority: requestData.priority,
      status: requestData.status,
    })
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error updating request:", error.message);
    showToast("Failed to update request: " + error.message, "error");
    return false;
  }

  showToast("Request updated successfully!", "success");
  await loadRequests();
  return true;
}

// ============================================================
// CRUD: DELETE — Remove a request (with confirmation, BR-08)
// ============================================================
async function deleteRequest(id) {
  const { error } = await supabaseClient
    .from("service_requests")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting request:", error.message);
    showToast("Failed to delete request: " + error.message, "error");
    return false;
  }

  showToast("Request deleted.", "success");
  await loadRequests();
  return true;
}

// ============================================================
// DASHBOARD — Update counts
// ============================================================
function updateDashboard() {
  const total = allRequests.length;
  const pending = allRequests.filter((r) => r.status === "Pending").length;
  const inprogress = allRequests.filter((r) => r.status === "In Progress").length;
  const completed = allRequests.filter((r) => r.status === "Completed").length;

  animateCount("totalCount", total);
  animateCount("pendingCount", pending);
  animateCount("inprogressCount", inprogress);
  animateCount("completedCount", completed);
}

function animateCount(elementId, target) {
  const el = document.getElementById(elementId);
  const current = parseInt(el.textContent) || 0;
  if (current === target) {
    el.textContent = target;
    return;
  }
  const duration = 400;
  const steps = 20;
  const increment = (target - current) / steps;
  let step = 0;

  const timer = setInterval(() => {
    step++;
    if (step >= steps) {
      el.textContent = target;
      clearInterval(timer);
    } else {
      el.textContent = Math.round(current + increment * step);
    }
  }, duration / steps);
}

// ============================================================
// SEARCH & FILTER
// ============================================================
function applyFilters() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase().trim();
  const statusFilter = document.getElementById("filterStatus").value;
  const priorityFilter = document.getElementById("filterPriority").value;

  let filtered = allRequests;

  // Search by requester name or description
  if (searchTerm) {
    filtered = filtered.filter(
      (r) =>
        r.requester_name.toLowerCase().includes(searchTerm) ||
        r.description.toLowerCase().includes(searchTerm)
    );
  }

  // Filter by status
  if (statusFilter !== "All") {
    filtered = filtered.filter((r) => r.status === statusFilter);
  }

  // Filter by priority
  if (priorityFilter !== "All") {
    filtered = filtered.filter((r) => r.priority === priorityFilter);
  }

  renderTable(filtered);
}

// ============================================================
// RENDER TABLE
// ============================================================
function renderTable(requests) {
  const tbody = document.getElementById("requestTableBody");
  const countEl = document.getElementById("tableCount");
  countEl.textContent = requests.length + " record" + (requests.length !== 1 ? "s" : "");

  if (requests.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <p>No service requests found.</p>
          </div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = requests
    .map((r) => {
      const statusClass = getStatusClass(r.status);
      const priorityClass = getPriorityClass(r.priority);
      const dateStr = new Date(r.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const isOwner = currentUser && r.user_id === currentUser.id;

      return `
      <tr>
        <td><strong>${r.id}</strong></td>
        <td>${escapeHtml(r.requester_name)}</td>
        <td>${escapeHtml(r.department)}</td>
        <td>${escapeHtml(r.category)}</td>
        <td><span class="badge ${priorityClass}">${r.priority}</span></td>
        <td><span class="badge ${statusClass}">${r.status}</span></td>
        <td>${dateStr}</td>
        <td class="actions">
          ${
            isOwner
              ? `
            <button class="btn btn-secondary btn-sm btn-icon" title="Edit" onclick="openEditModal(${r.id})">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="btn btn-danger btn-sm btn-icon" title="Delete" onclick="openConfirm(${r.id})">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>`
              : `<span style="color: var(--color-text-light); font-size: 0.75rem;">View only</span>`
          }
        </td>
      </tr>`;
    })
    .join("");
}

// ============================================================
// ANALYTICS (Bonus)
// ============================================================
function updateAnalytics() {
  // By Category
  const categories = {};
  allRequests.forEach((r) => {
    categories[r.category] = (categories[r.category] || 0) + 1;
  });

  const categoryBody = document.getElementById("categoryAnalytics");
  const sortedCategories = Object.entries(categories).sort((a, b) => b[1] - a[1]);
  categoryBody.innerHTML = sortedCategories.length
    ? sortedCategories
        .map(
          ([cat, count]) =>
            `<tr><td>${escapeHtml(cat)}</td><td>${count}</td></tr>`
        )
        .join("")
    : `<tr><td colspan="2" style="text-align:center; color: var(--color-text-light); padding: 1rem;">No data</td></tr>`;

  // By Priority
  const priorities = { High: 0, Medium: 0, Low: 0 };
  allRequests.forEach((r) => {
    if (priorities.hasOwnProperty(r.priority)) {
      priorities[r.priority]++;
    }
  });

  const priorityBody = document.getElementById("priorityAnalytics");
  priorityBody.innerHTML = Object.entries(priorities)
    .map(
      ([pri, count]) =>
        `<tr><td><span class="badge ${getPriorityClass(pri)}">${pri}</span></td><td>${count}</td></tr>`
    )
    .join("");
}

// ============================================================
// MODAL: CREATE
// ============================================================
function openCreateModal() {
  document.getElementById("modalTitle").textContent = "New Service Request";
  document.getElementById("saveBtn").textContent = "Submit Request";
  document.getElementById("requestId").value = "";
  document.getElementById("statusGroup").style.display = "none";

  // Clear form
  document.getElementById("requestForm").reset();
  clearFormErrors();

  // Open modal
  document.getElementById("requestModal").classList.add("active");
}

// ============================================================
// MODAL: EDIT
// ============================================================
function openEditModal(id) {
  const request = allRequests.find((r) => r.id === id);
  if (!request) return;

  document.getElementById("modalTitle").textContent = "Edit Service Request";
  document.getElementById("saveBtn").textContent = "Save Changes";
  document.getElementById("requestId").value = id;
  document.getElementById("statusGroup").style.display = "block";

  // Populate form
  document.getElementById("requesterName").value = request.requester_name;
  document.getElementById("department").value = request.department;
  document.getElementById("category").value = request.category;
  document.getElementById("description").value = request.description;
  document.getElementById("priority").value = request.priority;
  document.getElementById("status").value = request.status;

  clearFormErrors();

  // Open modal
  document.getElementById("requestModal").classList.add("active");
}

// ============================================================
// MODAL: CLOSE
// ============================================================
function closeModal() {
  document.getElementById("requestModal").classList.remove("active");
}

// ============================================================
// FORM: SAVE (Create or Update)
// ============================================================
async function saveRequest() {
  if (!validateForm()) return;

  const id = document.getElementById("requestId").value;
  const requestData = {
    requesterName: document.getElementById("requesterName").value.trim(),
    department: document.getElementById("department").value.trim(),
    category: document.getElementById("category").value,
    description: document.getElementById("description").value.trim(),
    priority: document.getElementById("priority").value,
    status: document.getElementById("status").value,
  };

  // Disable button during save
  const saveBtn = document.getElementById("saveBtn");
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<span class="spinner"></span> Saving...';

  let success;
  if (id) {
    success = await updateRequest(parseInt(id), requestData);
  } else {
    success = await createRequest(requestData);
  }

  saveBtn.disabled = false;
  saveBtn.textContent = id ? "Save Changes" : "Submit Request";

  if (success) {
    closeModal();
  }
}

// ============================================================
// FORM: VALIDATION (BR-01 through BR-05)
// ============================================================
function validateForm() {
  let isValid = true;
  clearFormErrors();

  const requesterName = document.getElementById("requesterName").value.trim();
  const department = document.getElementById("department").value.trim();
  const category = document.getElementById("category").value;
  const description = document.getElementById("description").value.trim();
  const priority = document.getElementById("priority").value;

  // BR-01: Requester name cannot be empty
  if (!requesterName) {
    showFieldError("requesterName", "requesterNameError");
    isValid = false;
  }

  // BR-02: Department must be provided
  if (!department) {
    showFieldError("department", "departmentError");
    isValid = false;
  }

  // BR-03: Category must be selected
  if (!category) {
    showFieldError("category", "categoryError");
    isValid = false;
  }

  // BR-04: Description must contain sufficient information
  if (!description || description.length < 10) {
    showFieldError("description", "descriptionError");
    isValid = false;
  }

  // BR-05: Priority must be Low, Medium, or High
  if (!priority || !["Low", "Medium", "High"].includes(priority)) {
    showFieldError("priority", "priorityError");
    isValid = false;
  }

  return isValid;
}

function showFieldError(fieldId, errorId) {
  document.getElementById(fieldId).classList.add("error");
  document.getElementById(errorId).classList.add("visible");
}

function clearFormErrors() {
  document.querySelectorAll(".form-control.error").forEach((el) => el.classList.remove("error"));
  document.querySelectorAll(".form-error.visible").forEach((el) => el.classList.remove("visible"));
}

// ============================================================
// DELETE: CONFIRM DIALOG (BR-08)
// ============================================================
function openConfirm(id) {
  deleteTargetId = id;
  document.getElementById("confirmDialog").classList.add("active");
}

function closeConfirm() {
  deleteTargetId = null;
  document.getElementById("confirmDialog").classList.remove("active");
}

async function confirmDelete() {
  if (deleteTargetId === null) return;

  const btn = document.getElementById("confirmDeleteBtn");
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>';

  await deleteRequest(deleteTargetId);

  btn.disabled = false;
  btn.textContent = "Delete";
  closeConfirm();
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const icon =
    type === "success"
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;

  toast.innerHTML = `${icon}<span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  // Auto-remove after animation
  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 3200);
}

// ============================================================
// UTILITY HELPERS
// ============================================================
function getStatusClass(status) {
  switch (status) {
    case "Pending":
      return "badge-pending";
    case "In Progress":
      return "badge-inprogress";
    case "Completed":
      return "badge-completed";
    default:
      return "";
  }
}

function getPriorityClass(priority) {
  switch (priority) {
    case "High":
      return "badge-high";
    case "Medium":
      return "badge-medium";
    case "Low":
      return "badge-low";
    default:
      return "";
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
