(() => {
  "use strict";

  const TABLES = [
    ["people.csv", "Hồ sơ người"],
    ["assignments.csv", "Phân công"],
    ["units.csv", "Đơn vị"],
    ["subunits.csv", "Đơn vị con"],
    ["academic_teams.csv", "Đội học thuật"],
    ["roles.csv", "Chức danh"]
  ];
  const FIELDS = {
    "units.csv": ["id", "parent_id", "name", "kind", "sort_order", "summary", "status"],
    "subunits.csv": ["id", "parent_id", "name", "kind", "sort_order", "summary", "status"],
    "academic_teams.csv": ["id", "parent_id", "name", "kind", "sort_order", "summary", "status"],
    "roles.csv": ["id", "unit_id", "title", "sort_order", "summary"],
    "people.csv": ["id", "name", "class_name"],
    "assignments.csv": ["id", "person_id", "unit_id", "role_id", "role_label", "status", "sort_order"]
  };
  const DISPLAY_FIELDS = {
    "units.csv": ["name", "kind", "parent_id", "summary", "status"],
    "subunits.csv": ["name", "kind", "parent_id", "summary", "status"],
    "academic_teams.csv": ["name", "kind", "parent_id", "summary", "status"],
    "roles.csv": ["title", "unit_id", "summary"],
    "people.csv": ["name", "class_name"],
    "assignments.csv": ["person_id", "role_label", "unit_id", "status"]
  };
  const LABELS = {
    id: "ID",
    parent_id: "Đơn vị cấp trên",
    unit_id: "Đơn vị",
    kind: "Loại đơn vị",
    sort_order: "Thứ tự",
    name: "Tên",
    title: "Chức danh",
    summary: "Mô tả công khai",
    status: "Trạng thái",
    person_id: "Thành viên",
    role_id: "Chức danh",
    role_label: "Vai trò hiển thị",
    class_name: "Lớp"
  };
  const ASSIGNMENT_STATUSES = ["Chính thức", "Tạm thời"];
  const state = {
    user: null,
    table: "people.csv",
    rows: [],
    drafts: [],
    editing: null,
    references: { units: [], roles: [], people: [], assignments: [], statuses: [] }
  };
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value == null ? "" : value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
  const collator = new Intl.Collator("vi", { sensitivity: "base", numeric: true });

  async function api(path, options = {}) {
    const headers = {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    };
    const response = await fetch(path, {
      cache: "no-store",
      credentials: "same-origin",
      headers,
      ...options
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(body.message || body.detail || "Không thể hoàn thành thao tác.");
      error.status = response.status;
      throw error;
    }
    return body;
  }

  function toast(message, tone = "ok") {
    const el = $("#toast");
    el.textContent = message;
    el.dataset.tone = tone;
    el.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove("show"), 3600);
  }

  function parseCSV(text) {
    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;
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
    return rows.slice(1)
      .filter(values => values.some(value => String(value).trim() !== ""))
      .map(values => Object.fromEntries(headers.map((header, i) => [header, (values[i] || "").trim()])));
  }

  async function loadCSV(path) {
    const response = await fetch("/database/" + encodeURIComponent(path), { cache: "no-store" });
    if (!response.ok) throw new Error("Không đọc được bảng " + path + ".");
    return parseCSV(await response.text());
  }

  async function loadReferences() {
    const [units, subunits, academic, roles, people, assignments] = await Promise.all([
      loadCSV("units.csv"),
      loadCSV("subunits.csv"),
      loadCSV("academic_teams.csv"),
      loadCSV("roles.csv"),
      loadCSV("people.csv"),
      loadCSV("assignments.csv")
    ]);
    state.references.units = [...units, ...subunits, ...academic];
    state.references.roles = roles;
    state.references.people = people;
    state.references.assignments = assignments;
    state.references.statuses = [...new Set([...ASSIGNMENT_STATUSES, ...assignments.map(row => row.status).filter(Boolean)])];
  }

  function rowKey(row) {
    return String(row?.id || "");
  }

  function getDraft(tableName, recordId) {
    return state.drafts.find(draft =>
      draft.table_name === tableName &&
      draft.record_id === String(recordId || "") &&
      draft.status === "pending"
    );
  }

  function getUnit(id) {
    return state.references.units.find(row => row.id === id);
  }

  function getPerson(id) {
    return state.references.people.find(row => row.id === id);
  }

  function getRole(id) {
    return state.references.roles.find(row => row.id === id);
  }

  function getPersonName(id) {
    const published = getPerson(id);
    if (published) return published.name + (published.class_name ? " · lớp " + published.class_name : "");
    const draft = state.drafts.find(item =>
      item.table_name === "people.csv" &&
      item.record_id === id &&
      item.operation === "create" &&
      item.status === "pending"
    );
    if (draft) return (draft.proposed_row.name || id) + " · nháp";
    return id || "Chưa chọn người";
  }

  function getRoleName(row) {
    return getRole(row.role_id)?.title || row.role_label || "Chưa gắn chức danh";
  }

  function getUnitName(id) {
    return getUnit(id)?.name || id || "Chưa chọn đơn vị";
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
      if (!session.configured) {
        setMode(false, "Cần cấu hình GitHub OAuth để bật đăng nhập chủ sở hữu.");
        $("#login-button").disabled = true;
        return;
      }
      $("#login-button").disabled = false;
      if (!session.authenticated) {
        setMode(false, "Chỉ chủ sở hữu được quản lý bản nháp.");
        return;
      }
      state.user = session.user;
      setMode(true);
      $("#signed-in-label").textContent = "Đã đăng nhập với GitHub @" + (session.user.login || "");
      await loadReferences();
      await loadDrafts();
      await loadTable();
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
      '<button class="table-tab ' + (state.table === name ? "active" : "") +
      '" data-table="' + esc(name) + '" aria-current="' + (state.table === name ? "page" : "false") + '">' +
      esc(label) + "</button>"
    ).join("");
    document.querySelectorAll("[data-table]").forEach(button => {
      button.addEventListener("click", async () => {
        state.table = button.dataset.table;
        await loadTable();
      });
    });
  }

  function updateToolbar() {
    const labels = Object.fromEntries(TABLES);
    const createButton = $("#create-row");
    const canCreate = state.table === "people.csv" || state.table === "assignments.csv";
    createButton.classList.toggle("hidden", !canCreate);
    createButton.textContent = state.table === "assignments.csv" ? "Thêm phân công" : "Thêm người";
    $("#table-title").textContent = labels[state.table] || state.table;
    $("#table-hint").textContent = state.table === "people.csv"
      ? "Một hồ sơ cho mỗi người. Thêm ít nhất một phân công để hiện trong danh bạ."
      : state.table === "assignments.csv"
        ? "Gỡ phân công sẽ ẩn người khỏi đơn vị; hồ sơ nguồn vẫn được giữ."
        : "Dữ liệu cơ cấu chỉ để tham khảo; cập nhật tại CSV nguồn.";
  }

  async function loadTable() {
    const table = state.table;
    const rows = await loadCSV(table);
    state.rows = rows;
    updateToolbar();
    renderTable();
    renderTableNav();
  }

  function displayValue(row, field, draft) {
    const active = draft && draft.operation !== "remove" ? draft.proposed_row : row;
    if (state.table === "assignments.csv") {
      if (field === "person_id") return getPersonName(active.person_id);
      if (field === "unit_id") return getUnitName(active.unit_id);
      if (field === "role_label") return getRoleName(active);
    }
    return String(active[field] || "");
  }

  function rowActions(row, index, draft) {
    const edit = '<button type="button" data-edit-row="' + index + '">' +
      (draft ? "Mở nháp" : "Sửa") + "</button>";
    if (state.table === "people.csv") {
      const assignmentCount = state.references.assignments.filter(item => item.person_id === row.id).length;
      const add = '<button type="button" data-add-assignment="' + esc(row.id) + '">Thêm phân công</button>';
      const remove = assignmentCount
        ? '<button type="button" class="action-remove" data-remove-person="' + esc(row.id) + '">Gỡ khỏi danh bạ</button>'
        : "";
      return edit + add + remove;
    }
    if (state.table === "assignments.csv") {
      if (draft?.operation === "remove") return "";
      return edit + '<button type="button" class="action-remove" data-remove-assignment="' + index + '">Gỡ phân công</button>';
    }
    return "";
  }

  function renderTable() {
    const table = state.table;
    const fields = DISPLAY_FIELDS[table] || [];
    $("#table-head").innerHTML = "<tr>" +
      fields.map(field => "<th scope=\"col\">" + esc(LABELS[field] || field) + "</th>").join("") +
      "<th scope=\"col\"><span class=\"sr-only\">Thao tác</span></th></tr>";
    $("#table-body").innerHTML = state.rows.map((row, index) => {
      const draft = table === "people.csv" || table === "assignments.csv"
        ? getDraft(table, rowKey(row))
        : null;
      const badge = draft
        ? '<span class="table-row-badge ' + (draft.operation === "remove" ? "table-row-badge--remove" : "") + '">' +
          (draft.operation === "remove" ? "Chờ gỡ" : "Có nháp") + "</span>"
        : "";
      return "<tr>" +
        fields.map(field => '<td data-label="' + esc(LABELS[field] || field) + '">' + esc(displayValue(row, field, draft)) + "</td>").join("") +
        '<td data-label="">' + badge + rowActions(row, index, draft) + "</td></tr>";
    }).join("");
    $("#table-empty").classList.toggle("hidden", state.rows.length > 0);
    document.querySelectorAll("[data-edit-row]").forEach(button =>
      button.addEventListener("click", () => openEditor(Number(button.dataset.editRow)))
    );
    document.querySelectorAll("[data-remove-assignment]").forEach(button =>
      button.addEventListener("click", () => {
        const row = state.rows[Number(button.dataset.removeAssignment)];
        if (row) removeAssignment(row);
      })
    );
    document.querySelectorAll("[data-remove-person]").forEach(button =>
      button.addEventListener("click", () => removePersonFromDirectory(button.dataset.removePerson))
    );
    document.querySelectorAll("[data-add-assignment]").forEach(button =>
      button.addEventListener("click", () => addAssignmentForPerson(button.dataset.addAssignment))
    );
  }

  function randomId(prefix) {
    const token = window.crypto?.randomUUID
      ? window.crypto.randomUUID().replaceAll("-", "").slice(0, 12)
      : Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    return prefix + "-" + token;
  }

  function emptyRow(tableName) {
    return Object.fromEntries((FIELDS[tableName] || []).map(field => [field, ""]));
  }

  function option(value, label, selected, disabled) {
    return '<option value="' + esc(value) + '"' +
      (selected ? " selected" : "") +
      (disabled ? " disabled" : "") +
      ">" + esc(label) + "</option>";
  }

  function peopleOptions(value) {
    const people = new Map();
    state.references.people.forEach(row => people.set(row.id, row));
    state.drafts.filter(row => row.table_name === "people.csv" && row.operation === "create" && row.status === "pending")
      .forEach(draft => people.set(draft.record_id, draft.proposed_row));
    const values = [...people.values()].sort((a, b) => collator.compare(a.name, b.name));
    let html = option("", "Chọn một người", !value, false);
    if (value && !people.has(value)) html += option(value, "ID chưa có trong danh bạ: " + value, true, false);
    return html + values.map(row => option(row.id, getPersonName(row.id), row.id === value, false)).join("");
  }

  function unitOptions(value) {
    const units = [...state.references.units].sort((a, b) =>
      (+a.sort_order || 999) - (+b.sort_order || 999) || collator.compare(a.name, b.name)
    );
    let html = option("", "Chọn một đơn vị", !value, false);
    if (value && !units.some(row => row.id === value)) html += option(value, "ID chưa có trong sơ đồ: " + value, true, false);
    return html + units.map(row => option(row.id, row.name, row.id === value, false)).join("");
  }

  function roleOptions(value) {
    const roles = [...state.references.roles].sort((a, b) =>
      collator.compare(a.title, b.title)
    );
    let html = option("", "Không gắn mã chức danh", !value, false);
    if (value && !roles.some(row => row.id === value)) html += option(value, "ID chức danh hiện tại: " + value, true, false);
    return html + roles.map(row => {
      const unitName = getUnitName(row.unit_id);
      return option(row.id, row.title + " · " + unitName, row.id === value, false);
    }).join("");
  }

  function statusOptions(value) {
    const statuses = [...new Set([...state.references.statuses, ...(value ? [value] : [])])];
    let html = option("", "Chọn trạng thái", !value, false);
    if (value && !statuses.includes(value)) html += option(value, value, true, false);
    return html + statuses.map(status => option(status, status, status === value, false)).join("");
  }

  function fieldHTML(tableName, key, value, mode) {
    const label = LABELS[key] || key;
    const escaped = esc(value);
    const required = mode === "create" && ["name", "person_id", "unit_id", "status"].includes(key);
    let control;
    if (key === "id") {
      control = '<input data-field="id" value="' + escaped + '" readonly aria-describedby="id-help">';
    } else if (tableName === "assignments.csv" && key === "person_id") {
      control = '<select data-field="person_id"' + (required ? " required" : "") + ">" + peopleOptions(value) + "</select>";
    } else if (tableName === "assignments.csv" && key === "unit_id") {
      control = '<select data-field="unit_id"' + (required ? " required" : "") + ">" + unitOptions(value) + "</select>";
    } else if (tableName === "assignments.csv" && key === "role_id") {
      control = '<select data-field="role_id">' + roleOptions(value) + "</select>";
    } else if (tableName === "assignments.csv" && key === "status") {
      control = '<select data-field="status"' + (required ? " required" : "") + ">" + statusOptions(value) + "</select>";
    } else if (key === "summary") {
      control = '<textarea data-field="' + esc(key) + '" rows="3">' + escaped + "</textarea>";
    } else {
      const type = key === "sort_order" ? ' type="number" inputmode="numeric"' : ' type="text"';
      control = '<input data-field="' + esc(key) + '"' + type + ' value="' + escaped + '"' +
        (required ? " required" : "") +
        (key === "name" ? ' maxlength="120" autocomplete="name"' : "") +
        (key === "class_name" ? ' maxlength="40" autocomplete="off"' : "") +
        ">";
    }
    const help = key === "id" ? '<small id="id-help" class="field-help">ID ổn định, hệ thống tự tạo.</small>' : "";
    return '<label class="field"><span>' + esc(label) + "</span>" + control + help + "</label>";
  }

  function renderFields(tableName, row, mode) {
    const fields = FIELDS[tableName] || Object.keys(row);
    $("#row-fields").innerHTML = fields.map(key => fieldHTML(tableName, key, row[key] || "", mode)).join("");
    if (tableName === "assignments.csv") {
      const roleSelect = document.querySelector('[data-field="role_id"]');
      const roleLabel = document.querySelector('[data-field="role_label"]');
      if (roleSelect && roleLabel) {
        roleLabel.addEventListener("input", () => { roleLabel.dataset.manual = "true"; });
        roleSelect.addEventListener("change", () => {
          if (roleLabel.dataset.manual === "true") return;
          roleLabel.value = getRole(roleSelect.value)?.title || "";
        });
      }
    }
  }

  function configureDialog({ tableName, operation, original, proposed, draft, prefillPersonId }) {
    state.editing = { tableName, operation, original, proposed, draft };
    const creating = operation === "create";
    const isPerson = tableName === "people.csv";
    $("#dialog-eyebrow").textContent = creating ? "TẠO BẢN NHÁP RIÊNG" : operation === "remove" ? "NHÁP GỠ PHÂN CÔNG" : "CHỈNH SỬA BẢN NHÁP";
    $("#row-title").textContent = creating
      ? (isPerson ? "Thêm người" : "Thêm phân công")
      : proposed.name || proposed.title || proposed.role_label || "Bản ghi";
    $("#row-path").textContent = (TABLES.find(row => row[0] === tableName)?.[1] || tableName) + " · ID " + rowKey(proposed);
    $("#row-guidance").textContent = creating && isPerson
      ? "Tạo một hồ sơ người duy nhất. Để người đó xuất hiện trong danh bạ, cần thêm ít nhất một phân công."
      : creating
        ? "Chọn người, đơn vị, chức danh và trạng thái. Thay đổi chỉ được lưu thành nháp."
        : "Các trường chỉ chứa dữ liệu công khai; lưu nháp chưa đổi trang công khai.";
    renderFields(tableName, proposed, operation);
    $("#row-message").textContent = draft
      ? "Đây là nháp riêng. Lưu sẽ tạo phiên bản mới."
      : "Bản nháp cần được đối chiếu với CSV nguồn trước khi xuất bản.";
    $("#save-row").textContent = creating ? "Tạo nháp" : "Lưu nháp";
    $("#save-row").classList.toggle("hidden", operation === "remove");
    $("#save-and-assign").classList.toggle("hidden", !(creating && isPerson));
    if (prefillPersonId) {
      const select = document.querySelector('[data-field="person_id"]');
      if (select) select.value = prefillPersonId;
    }
    $("#row-dialog").showModal();
    const firstField = $("#row-fields").querySelector('[data-field="name"],[data-field="person_id"]');
    if (firstField) requestAnimationFrame(() => firstField.focus());
  }

  function openEditor(index) {
    const original = state.rows[index];
    if (!original) return;
    const draft = getDraft(state.table, rowKey(original));
    if (draft?.operation === "remove") {
      toast("Đang có nháp gỡ phân công cho dòng này. Bỏ nháp trước khi sửa.", "error");
      return;
    }
    const proposed = draft ? draft.proposed_row : original;
    configureDialog({
      tableName: state.table,
      operation: draft?.operation || "update",
      original,
      proposed,
      draft
    });
  }

  function openCreateEditor(tableName = state.table, { personId = "", draft = null } = {}) {
    const proposed = draft ? { ...draft.proposed_row } : emptyRow(tableName);
    if (!draft) {
      proposed.id = randomId(tableName === "people.csv" ? "person" : "assignment");
      if (tableName === "assignments.csv") {
        proposed.person_id = personId || "";
        proposed.sort_order = String(state.references.assignments.length + 1);
      }
    }
    state.table = tableName;
    updateToolbar();
    renderTableNav();
    configureDialog({
      tableName,
      operation: "create",
      original: null,
      proposed,
      draft,
      prefillPersonId: personId
    });
  }

  function readFormRow(tableName) {
    const row = {};
    $("#row-fields").querySelectorAll("[data-field]").forEach(input => {
      row[input.dataset.field] = String(input.value || "").trim();
    });
    if (tableName === "assignments.csv" && row.role_id && !row.role_label) {
      row.role_label = getRole(row.role_id)?.title || "";
    }
    return row;
  }

  function validateClientRow(tableName, operation, row) {
    if (operation !== "create") return "";
    if (tableName === "people.csv" && !row.name) return "Nhập tên người trước khi lưu.";
    if (tableName === "assignments.csv") {
      if (!row.person_id) return "Chọn người cần phân công.";
      if (!row.unit_id) return "Chọn đơn vị.";
      if (!row.role_id && !row.role_label) return "Chọn hoặc nhập chức danh.";
      if (!row.status) return "Chọn trạng thái phân công.";
    }
    return "";
  }

  async function saveRow(assignAfter = false) {
    const editing = state.editing;
    if (!editing) return;
    const { tableName, operation, original, draft } = editing;
    const proposed = readFormRow(tableName);
    const validationMessage = validateClientRow(tableName, operation, proposed);
    if (validationMessage) {
      $("#row-message").textContent = validationMessage;
      toast(validationMessage, "error");
      return;
    }
    if (operation === "create") {
      const duplicate = state.references[tableName === "people.csv" ? "people" : "assignments"]
        .some(row => row.id === proposed.id);
      const pending = state.drafts.some(item => item.table_name === tableName && item.record_id === proposed.id && item.status === "pending" && item.id !== draft?.id);
      if (duplicate || pending) {
        const message = "ID này đã tồn tại. Tải lại dữ liệu và thử lại.";
        $("#row-message").textContent = message;
        toast(message, "error");
        return;
      }
    }
    const body = {
      tableName,
      operation,
      recordId: rowKey(proposed),
      baseRow: draft ? draft.base_row : (original || {}),
      proposedRow: proposed,
      draftId: draft ? draft.id : null,
      revision: draft ? draft.revision : null
    };
    try {
      await api("/api/admin/drafts", { method: "POST", body: JSON.stringify(body) });
      const followUpPersonId = assignAfter && tableName === "people.csv" ? proposed.id : "";
      $("#row-dialog").close();
      await Promise.all([loadDrafts(), loadTable()]);
      toast(operation === "create" ? "Đã tạo nháp riêng." : "Đã lưu nháp.");
      if (followUpPersonId) {
        state.table = "assignments.csv";
        await loadTable();
        openCreateEditor("assignments.csv", { personId: followUpPersonId });
      }
    } catch (error) {
      $("#row-message").textContent = error.message;
      toast(error.message, "error");
    }
  }

  async function addAssignmentForPerson(personId) {
    state.table = "assignments.csv";
    await loadTable();
    openCreateEditor("assignments.csv", { personId });
  }

  function activeAssignmentsForPerson(personId) {
    return state.references.assignments.filter(item => item.person_id === personId);
  }

  async function removeAssignment(row) {
    const existing = getDraft("assignments.csv", row.id);
    if (existing) {
      toast(existing.operation === "remove" ? "Phân công này đã có nháp gỡ." : "Bỏ hoặc xử lý nháp sửa trước khi gỡ phân công.", "error");
      return;
    }
    const personName = getPersonName(row.person_id);
    const unitName = getUnitName(row.unit_id);
    const roleName = getRoleName(row);
    if (!confirm("Tạo nháp gỡ " + roleName + " của " + personName + " tại " + unitName + "? Hồ sơ người vẫn được giữ.")) return;
    try {
      await api("/api/admin/drafts", {
        method: "POST",
        body: JSON.stringify({
          tableName: "assignments.csv",
          operation: "remove",
          recordId: row.id,
          baseRow: row,
          proposedRow: row
        })
      });
      await Promise.all([loadDrafts(), loadTable()]);
      toast("Đã tạo nháp gỡ phân công.");
    } catch (error) {
      toast(error.message, "error");
    }
  }

  async function removePersonFromDirectory(personId) {
    const person = getPerson(personId);
    const assignments = activeAssignmentsForPerson(personId);
    if (!person || !assignments.length) {
      toast("Người này không còn phân công công khai để gỡ.", "error");
      return;
    }
    const blocked = assignments.find(row => {
      const draft = getDraft("assignments.csv", row.id);
      return draft && draft.operation !== "remove";
    });
    if (blocked) {
      toast("Có nháp sửa một phân công của người này. Bỏ hoặc xử lý nháp đó trước.", "error");
      return;
    }
    const toRemove = assignments.filter(row => !getDraft("assignments.csv", row.id));
    if (!toRemove.length) {
      toast("Các phân công của người này đã có nháp gỡ.");
      return;
    }
    const prompt = "Tạo nháp gỡ " + toRemove.length + " phân công của " + person.name + "? Hồ sơ nguồn được giữ; khi bản nháp được xuất bản, người này sẽ ẩn khỏi danh bạ.";
    if (!confirm(prompt)) return;
    let created = 0;
    try {
      for (const row of toRemove) {
        await api("/api/admin/drafts", {
          method: "POST",
          body: JSON.stringify({
            tableName: "assignments.csv",
            operation: "remove",
            recordId: row.id,
            baseRow: row,
            proposedRow: row
          })
        });
        created++;
      }
      await Promise.all([loadDrafts(), loadTable()]);
      toast(created + (created === 1 ? " nháp gỡ đã tạo." : " nháp gỡ đã tạo."));
    } catch (error) {
      await Promise.all([loadDrafts(), loadTable()]);
      toast("Đã tạo " + created + " nháp; còn " + (toRemove.length - created) + " dòng chưa xử lý. " + error.message, "error");
    }
  }

  function draftTitle(draft) {
    const row = draft.proposed_row || draft.base_row || {};
    if (draft.table_name === "assignments.csv") {
      return getPersonName(row.person_id) + " · " + getRoleName(row);
    }
    return row.name || row.title || row.role_label || draft.record_id;
  }

  function draftOperationLabel(draft) {
    if (draft.operation === "create") return "Thêm";
    if (draft.operation === "remove") return "Gỡ";
    return "Sửa";
  }

  function renderDrafts() {
    $("#drafts-list").innerHTML = state.drafts.length
      ? state.drafts.map(draft => {
          const operation = draft.operation || "update";
          const label = draftOperationLabel(draft);
          const typeClass = operation === "remove" ? "draft-type--remove" : "";
          const editable = draft.table_name === "people.csv" || draft.table_name === "assignments.csv";
          const openButton = operation === "remove" || !editable
            ? ""
            : '<button class="secondary-button" data-reopen="' + esc(draft.id) + '">Mở</button>';
          return '<article class="draft-card">' +
            '<div><strong><span class="draft-type ' + typeClass + '">' + label + "</span>" + esc(draftTitle(draft)) + "</strong>" +
            "<small>" + esc(draft.table_name) + " · ID " + esc(draft.record_id) + " · phiên bản " + draft.revision + "</small></div>" +
            '<div class="draft-actions"><span class="draft-status">' + (operation === "remove" ? "Chờ gỡ" : "Chưa đăng") + "</span>" +
            openButton +
            '<button class="quiet-button" data-delete="' + esc(draft.id) + '" data-revision="' + draft.revision + '">Bỏ nháp</button></div>' +
            "</article>";
        }).join("")
      : '<div class="empty-message">Chưa có nháp nào. Thay đổi trên màn hình này chưa được công khai.</div>';

    document.querySelectorAll("[data-reopen]").forEach(button => {
      button.addEventListener("click", () => openDraft(button.dataset.reopen));
    });
    document.querySelectorAll("[data-delete]").forEach(button => {
      button.addEventListener("click", () => deleteDraft(button.dataset.delete, Number(button.dataset.revision)));
    });
  }

  async function openDraft(id) {
    const draft = state.drafts.find(item => item.id === id);
    if (!draft) return;
    if (draft.operation === "remove") {
      toast("Đây là nháp gỡ. Dùng Bỏ nháp để hủy thao tác này.");
      return;
    }
    if (draft.table_name !== "people.csv" && draft.table_name !== "assignments.csv") {
      toast("Pha 1 chỉ cho phép sửa nháp hồ sơ người và phân công.", "error");
      return;
    }
    state.table = draft.table_name;
    await loadTable();
    if (draft.operation === "create") {
      openCreateEditor(draft.table_name, { draft });
      return;
    }
    const index = state.rows.findIndex(row => rowKey(row) === draft.record_id);
    if (index >= 0) openEditor(index);
    else toast("Bản ghi không còn trong nguồn public; hãy đối chiếu lại CSV.", "error");
  }

  async function deleteDraft(id, revision) {
    if (!confirm("Bỏ bản nháp này? Dữ liệu công khai không thay đổi.")) return;
    try {
      await api("/api/admin/drafts", { method: "DELETE", body: JSON.stringify({ id, revision }) });
      await Promise.all([loadDrafts(), loadTable()]);
      toast("Đã bỏ nháp.");
    } catch (error) {
      toast(error.message, "error");
    }
  }

  async function init() {
    $("#login-button").addEventListener("click", () => { location.href = "/api/auth/login"; });
    $("#logout-button").addEventListener("click", async () => {
      await api("/api/auth/logout", { method: "POST", body: "{}" }).catch(() => {});
      location.reload();
    });
    $("#create-row").addEventListener("click", () => openCreateEditor(state.table));
    $("#save-row").addEventListener("click", () => saveRow(false));
    $("#save-and-assign").addEventListener("click", () => saveRow(true));
    $("#reload-table").addEventListener("click", () => loadTable().catch(error => toast(error.message, "error")));
    $("#reload-drafts").addEventListener("click", () => loadDrafts().catch(error => toast(error.message, "error")));
    $("#row-dialog").querySelector("form").addEventListener("submit", event => event.preventDefault());
    document.querySelectorAll("[data-close-dialog]").forEach(button =>
      button.addEventListener("click", () => $("#row-dialog").close())
    );
    $("#row-dialog").addEventListener("close", () => { state.editing = null; });
    await checkSession();
    renderTableNav();
  }

  init();
})();
