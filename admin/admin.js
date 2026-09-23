(() => {
  "use strict";
  const TABLES = [
    ["units.csv", "Đơn vị"],
    ["subunits.csv", "Đơn vị con"],
    ["academic_teams.csv", "Đội học thuật"],
    ["roles.csv", "Chức danh"],
    ["people.csv", "Thành viên công khai"],
    ["assignments.csv", "Phân công"]
  ];
  const DISPLAY_FIELDS = {
    "units.csv": ["name", "kind", "parent_id", "summary", "status"],
    "subunits.csv": ["name", "kind", "parent_id", "summary", "status"],
    "academic_teams.csv": ["name", "kind", "parent_id", "summary", "status"],
    "roles.csv": ["title", "unit_id", "summary"],
    "people.csv": ["name", "class_name"],
    "assignments.csv": ["person_id", "role_label", "unit_id", "status"]
  };
  const LABELS = {
    id: "ID", parent_id: "Đơn vị cấp trên", unit_id: "Đơn vị", kind: "Loại",
    sort_order: "Thứ tự", name: "Tên", title: "Chức danh", summary: "Mô tả",
    status: "Trạng thái", person_id: "Thành viên", role_id: "Mã chức danh",
    role_label: "Vai trò hiển thị", class_name: "Lớp"
  };
  const state = { user: null, table: "units.csv", rows: [], drafts: [], editing: null };
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value == null ? "" : value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");

  async function api(path, options = {}) {
    const headers = { Accept: "application/json", ...(options.body ? { "Content-Type": "application/json" } : {}), ...(options.headers || {}) };
    const response = await fetch(path, { cache: "no-store", credentials: "same-origin", headers, ...options });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(body.message || body.detail || "Không thể hoàn thành thao tác.");
      error.status = response.status;
      throw error;
    }
    return body;
  }
  function toast(message, tone = "ok") {
    const el = $("#toast"); el.textContent = message; el.dataset.tone = tone; el.classList.add("show");
    clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("show"), 3200);
  }
  function parseCSV(text) {
    const rows = []; let row = []; let cell = ""; let quoted = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (quoted) {
        if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (ch === '"') quoted = false;
        else cell += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === ",") { row.push(cell); cell = ""; }
      else if (ch === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
      else if (ch !== "\r") cell += ch;
    }
    if (cell.length || row.length) { row.push(cell); rows.push(row); }
    if (!rows.length) return [];
    const headers = rows[0].map(value => value.trim());
    return rows.slice(1).filter(values => values.some(value => String(value).trim() !== ""))
      .map(values => Object.fromEntries(headers.map((header, i) => [header, (values[i] || "").trim()])));
  }
  function csvEscape(value) {
    const text = String(value == null ? "" : value);
    return /[",\r\n]/.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text;
  }
  function rowKey(row) { return String(row.id || ""); }
  function getDraft(tableName, recordId) {
    return state.drafts.find(draft => draft.table_name === tableName && draft.record_id === recordId && draft.status === "pending");
  }
  function setMode(isOwner, message = "") {
    $("#login-panel").classList.toggle("hidden", isOwner);
    $("#editor-panel").classList.toggle("hidden", !isOwner);
    $("#logout-button").classList.toggle("hidden", !isOwner);
    $("#login-message").textContent = message;
  }
  async function checkSession() {
    try {
      const session = await api("/api/auth/session");
      if (!session.configured) { setMode(false, "Cần cấu hình GitHub OAuth để bật đăng nhập chủ sở hữu."); $("#login-button").disabled = true; return; }
      $("#login-button").disabled = false;
      if (!session.authenticated) { setMode(false, ""); return; }
      state.user = session.user;
      setMode(true);
      $("#signed-in-label").textContent = "Đã đăng nhập với GitHub @" + (session.user.login || "");
      await Promise.all([loadDrafts(), loadTable()]);
    } catch (error) {
      setMode(false, error.status === 503 ? "Chức năng quản trị chưa được cấu hình." : error.message);
    }
  }
  async function loadDrafts() {
    const result = await api("/api/admin/drafts");
    state.drafts = result.drafts || [];
    $("#pending-count").textContent = state.drafts.length;
    renderDrafts();
  }
  function renderTableNav() {
    $("#table-nav").innerHTML = TABLES.map(([name, label]) =>
      '<button class="table-tab ' + (state.table === name ? "active" : "") + '" data-table="' + esc(name) + '">' + esc(label) + "</button>").join("");
    document.querySelectorAll("[data-table]").forEach(button => button.addEventListener("click", async () => {
      state.table = button.dataset.table; renderTableNav(); await loadTable();
    }));
  }
  async function loadTable() {
    const table = state.table;
    const response = await fetch("/database/" + encodeURIComponent(table), { cache: "no-store" });
    if (!response.ok) throw new Error("Không đọc được bảng công khai.");
    state.rows = parseCSV(await response.text());
    const label = TABLES.find(row => row[0] === table)?.[1] || table;
    $("#table-title").textContent = label;
    renderTable();
    renderTableNav();
  }
  function displayValue(row, field) {
    const draft = getDraft(state.table, rowKey(row));
    const active = draft ? draft.proposed_row : row;
    const text = String(active[field] || "");
    return text.length > 120 ? text.slice(0, 117) + "…" : text;
  }
  function renderTable() {
    const table = state.table;
    const fields = DISPLAY_FIELDS[table];
    $("#table-head").innerHTML = "<tr>" + fields.map(field => "<th>" + esc(LABELS[field] || field) + "</th>").join("") + "<th></th></tr>";
    $("#table-body").innerHTML = state.rows.map((row, index) => {
      const draft = getDraft(table, rowKey(row));
      return "<tr>" + fields.map(field => "<td>" + esc(displayValue(row, field)) + "</td>").join("") +
        '<td><button data-edit-row="' + index + '">' + (draft ? "Sửa nháp" : "Sửa") + "</button>" +
        (draft ? '<span class="draft-status">Có nháp</span>' : "") + "</td></tr>";
    }).join("");
    $("#table-empty").classList.toggle("hidden", state.rows.length > 0);
    document.querySelectorAll("[data-edit-row]").forEach(button => button.addEventListener("click", () => openEditor(Number(button.dataset.editRow))));
  }
  function openEditor(index) {
    const original = state.rows[index];
    const draft = getDraft(state.table, rowKey(original));
    const proposed = draft ? draft.proposed_row : original;
    const editableFields = Object.keys(original);
    state.editing = { original, proposed, draft, index };
    $("#row-title").textContent = proposed.name || proposed.title || proposed.role_label || "Bản ghi";
    $("#row-path").textContent = "Bảng " + state.table + " · ID " + rowKey(original);
    $("#row-fields").innerHTML = editableFields.map(key => {
      const label = esc(LABELS[key] || key);
      const value = esc(proposed[key]);
      const control = key === "id"
        ? '<input data-field="' + esc(key) + '" value="' + value + '" readonly>'
        : key === "summary"
          ? '<textarea data-field="' + esc(key) + '" rows="3">' + value + "</textarea>"
          : '<input data-field="' + esc(key) + '" value="' + value + '">';
      return '<label class="field"><span>' + label + "</span>" + control + "</label>";
    }).join("");
    $("#row-message").textContent = draft ? "Bản nháp riêng đã có; lưu sẽ tạo phiên bản mới của bản nháp." : "Các thay đổi ở đây chưa hiển thị với khách truy cập.";
    $("#row-dialog").showModal();
  }
  async function saveRow() {
    if (!state.editing) return;
    const draft = state.editing.draft;
    const proposed = {};
    document.querySelectorAll("[data-field]").forEach(input => { proposed[input.dataset.field] = input.value.trim(); });
    const body = {
      tableName: state.table,
      recordId: rowKey(state.editing.original),
      baseRow: draft ? draft.base_row : state.editing.original,
      proposedRow: proposed,
      draftId: draft ? draft.id : null,
      revision: draft ? draft.revision : null
    };
    try {
      await api("/api/admin/drafts", { method: "POST", body: JSON.stringify(body) });
      $("#row-message").textContent = "Đã lưu riêng. Khách truy cập chưa thấy thay đổi.";
      await loadDrafts(); await loadTable(); toast("Đã lưu nháp.");
    } catch (error) {
      $("#row-message").textContent = error.message;
      toast(error.message, "error");
    }
  }
  function renderDrafts() {
    $("#drafts-list").innerHTML = state.drafts.length ? state.drafts.map(draft =>
      '<article class="draft-card"><div><strong>' + esc(draft.proposed_row.name || draft.proposed_row.title || draft.proposed_row.role_label || draft.record_id) +
      '</strong><small>' + esc(draft.table_name) + " · " + esc(draft.record_id) + " · phiên bản " + draft.revision +
      '</small></div><div class="draft-actions"><span class="draft-status">Chưa đăng</span><button class="secondary-button" data-reopen="' +
      esc(draft.id) + '">Mở</button><button class="quiet-button" data-delete="' + esc(draft.id) + '" data-revision="' + draft.revision + '">Bỏ nháp</button></div></article>').join("") :
      '<div class="empty-message">Chưa có nháp nào.</div>';
    document.querySelectorAll("[data-reopen]").forEach(button => button.addEventListener("click", async () => {
      const draft = state.drafts.find(item => item.id === button.dataset.reopen);
      if (!draft) return;
      state.table = draft.table_name;
      await loadTable();
      const index = state.rows.findIndex(row => rowKey(row) === draft.record_id);
      if (index >= 0) openEditor(index);
    }));
    document.querySelectorAll("[data-delete]").forEach(button => button.addEventListener("click", () => deleteDraft(button.dataset.delete, Number(button.dataset.revision))));
  }
  async function deleteDraft(id, revision) {
    if (!confirm("Bỏ bản nháp này?")) return;
    try {
      await api("/api/admin/drafts", { method: "DELETE", body: JSON.stringify({ id, revision }) });
      await loadDrafts(); await loadTable(); toast("Đã bỏ nháp.");
    } catch (error) { toast(error.message, "error"); }
  }
  async function init() {
    $("#login-button").addEventListener("click", () => { location.href = "/api/auth/login"; });
    $("#logout-button").addEventListener("click", async () => {
      await api("/api/auth/logout", { method: "POST", body: "{}" }).catch(() => {});
      location.reload();
    });
    $("#save-row").addEventListener("click", saveRow);
    $("#reload-table").addEventListener("click", () => loadTable().catch(error => toast(error.message, "error")));
    $("#reload-drafts").addEventListener("click", () => loadDrafts().catch(error => toast(error.message, "error")));
    $("#row-dialog").addEventListener("close", () => { state.editing = null; });
    await checkSession();
    renderTableNav();
  }
  init();
})();