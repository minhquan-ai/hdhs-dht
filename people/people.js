(() => {
  "use strict";

  const DATA_FILES = [
    "../database/units.csv",
    "../database/subunits.csv",
    "../database/academic_teams.csv",
    "../database/roles.csv",
    "../database/people.csv",
    "../database/assignments.csv"
  ];

  const collator = new Intl.Collator("vi", { sensitivity: "base", numeric: true });
  const state = { units: [], roles: [], people: [], assignments: [], visibleCount: 60 };
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value == null ? "" : value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

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
    const response = await fetch(path + "?t=" + Date.now(), { cache: "no-store" });
    if (!response.ok) throw new Error("Không đọc được dữ liệu danh bạ.");
    return parseCSV(await response.text());
  }

  function roleKey(assignment) {
    const label = String(assignment.role_label || "").trim();
    return label
      ? "label:" + label.toLocaleLowerCase("vi")
      : assignment.role_id ? "id:" + assignment.role_id : "label:thành viên";
  }

  function assignmentRole(assignment, roleById) {
    return assignment.role_label || roleById.get(assignment.role_id)?.title || "Thành viên";
  }

  function initials(name) {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    return parts.slice(-2).map(part => Array.from(part)[0] || "").join("").toLocaleUpperCase("vi");
  }

  function fillFilters(unitById, roleById) {
    const unitFilter = $("#unit-filter");
    const classFilter = $("#class-filter");
    const roleFilter = $("#role-filter");
    const unitIds = [...new Set(state.assignments.map(item => item.unit_id).filter(Boolean))];
    const units = unitIds
      .map(id => unitById.get(id) || { id, name: "Đơn vị chưa rõ", sort_order: "999" })
      .sort((a, b) => (+a.sort_order || 999) - (+b.sort_order || 999) || collator.compare(a.name, b.name));

    const roleOptions = new Map();
    state.assignments.forEach(item => {
      const key = roleKey(item);
      const title = assignmentRole(item, roleById);
      if (!roleOptions.has(key)) roleOptions.set(key, title);
    });

    unitFilter.innerHTML = '<option value="">Tất cả đơn vị</option>' +
      units.map(item => '<option value="' + esc(item.id) + '">' + esc(item.name) + "</option>").join("");
    const classes = [...new Set(state.people.map(item => item.class_name).filter(Boolean))]
      .sort((a, b) => collator.compare(a, b));
    classFilter.innerHTML = '<option value="">Tất cả lớp</option>' +
      classes.map(value => '<option value="' + esc(value) + '">Lớp ' + esc(value) + "</option>").join("");
    roleFilter.innerHTML = '<option value="">Tất cả chức danh</option>' +
      [...roleOptions.entries()].sort((a, b) => collator.compare(a[1], b[1]))
        .map(([key, title]) => '<option value="' + esc(key) + '">' + esc(title) + "</option>").join("");
  }

  function render() {
    const query = $("#people-query").value.trim().toLocaleLowerCase("vi");
    const selectedUnit = $("#unit-filter").value;
    const selectedClass = $("#class-filter").value;
    const selectedRole = $("#role-filter").value;
    const unitById = new Map(state.units.map(item => [item.id, item]));
    const roleById = new Map(state.roles.map(item => [item.id, item]));
    const personById = new Map(state.people.map(item => [item.id, item]));
    const assignmentsByPerson = new Map();

    state.assignments.forEach(item => {
      if (!personById.has(item.person_id)) return;
      if (!assignmentsByPerson.has(item.person_id)) assignmentsByPerson.set(item.person_id, []);
      assignmentsByPerson.get(item.person_id).push(item);
    });

    const results = state.people
      .map(person => {
        const matches = (assignmentsByPerson.get(person.id) || [])
          .filter(item => (!selectedUnit || item.unit_id === selectedUnit) &&
            (!selectedRole || roleKey(item) === selectedRole));
        const haystack = (person.name + " " + (person.class_name || "")).toLocaleLowerCase("vi");
        return { person, assignments: matches, haystack };
      })
      .filter(item => item.assignments.length &&
        (!selectedClass || item.person.class_name === selectedClass) &&
        (!query || item.haystack.includes(query)))
      .sort((a, b) => collator.compare(a.person.name, b.person.name));

    const count = results.length;
    const assignmentCount = results.reduce((total, item) => total + item.assignments.length, 0);
    const activeFilters = [selectedUnit, selectedClass, selectedRole].filter(Boolean).length;
    $("#people-count").textContent = new Intl.NumberFormat("vi").format(count);
    $("#assignment-count").textContent = assignmentCount + " phân công";
    $("#result-count").textContent = count + " người";
    $("#filter-count").textContent = activeFilters ? activeFilters + " đang bật" : "Tất cả";
    $("#clear-search").hidden = !$("#people-query").value;
    const visibleResults = results.slice(0, state.visibleCount);
    $("#people-results").innerHTML = visibleResults.map(({ person, assignments }) => {
      const list = assignments.slice().sort((a, b) => {
        const unitOrder = (+unitById.get(a.unit_id)?.sort_order || 999) - (+unitById.get(b.unit_id)?.sort_order || 999);
        if (unitOrder) return unitOrder;
        return collator.compare(assignmentRole(a, roleById), assignmentRole(b, roleById));
      });
      const className = person.class_name ? "Lớp " + person.class_name : "Học sinh";
      return '<details class="person-result">' +
        '<summary><span class="person-avatar" aria-hidden="true">' + esc(initials(person.name)) + '</span>' +
        '<span class="person-summary"><strong>' + esc(person.name) + '</strong><small>' + esc(className) + " · " + list.length + (list.length === 1 ? " vai trò" : " vai trò") + '</small></span>' +
        '<span class="person-chevron" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="m6 9 6 6 6-6"></path></svg></span></summary>' +
        '<div class="person-details"><p class="person-details-label">Đơn vị và chức danh</p><div class="person-assignments">' +
        list.map(item => {
          const unit = unitById.get(item.unit_id);
          const role = assignmentRole(item, roleById);
          const params = new URLSearchParams({ unit: item.unit_id });
          if (item.role_id) params.set("role", item.role_id);
          const target = "../index.html#" + params.toString();
          return '<a class="person-assignment" href="' + esc(target) + '">' +
            '<span><strong>' + esc(role) + '</strong><small>' + esc(unit?.name || "Đơn vị chưa rõ") + '</small></span>' +
            (item.status ? '<span class="assignment-status">' + esc(item.status) + "</span>" : "") +
            "</a>";
        }).join("") +
        "</div></div></details>";
    }).join("");
    const remaining = Math.max(0, count - visibleResults.length);
    $("#people-more").hidden = remaining === 0;
    $("#people-more").textContent = remaining ? "Hiện thêm " + Math.min(60, remaining) + " người" : "";

    const empty = count === 0;
    $("#people-results").hidden = empty;
    $("#people-empty").hidden = !empty;
    $("#people-status").textContent = empty
      ? "Không tìm thấy người phù hợp."
      : "Có " + count + " người và " + assignmentCount + " phân công phù hợp.";
  }

  function resetFilters() {
    state.visibleCount = 60;
    $("#people-query").value = "";
    $("#unit-filter").value = "";
    $("#class-filter").value = "";
    $("#role-filter").value = "";
    render();
  }

  async function init() {
    const filterPanel = $("#filter-panel");
    const desktopFilters = window.matchMedia("(min-width: 701px)");
    const syncFilterPanel = () => { filterPanel.open = desktopFilters.matches; };
    syncFilterPanel();
    desktopFilters.addEventListener("change", syncFilterPanel);

    $("#people-search-form").addEventListener("submit", event => event.preventDefault());
    $("#people-query").addEventListener("input", () => { state.visibleCount = 60; render(); });
    $("#unit-filter").addEventListener("change", () => { state.visibleCount = 60; render(); });
    $("#class-filter").addEventListener("change", () => { state.visibleCount = 60; render(); });
    $("#role-filter").addEventListener("change", () => { state.visibleCount = 60; render(); });
    $("#people-more").addEventListener("click", () => { state.visibleCount += 60; render(); });
    $("#clear-search").addEventListener("click", () => {
      $("#people-query").value = "";
      state.visibleCount = 60;
      render();
      $("#people-query").focus();
    });
    $("#reset-filters").addEventListener("click", resetFilters);
    $("#empty-reset").addEventListener("click", resetFilters);

    try {
      const [units, subunits, academic, roles, people, assignments] = await Promise.all(DATA_FILES.map(loadCSV));
      state.units = [...units, ...subunits, ...academic];
      state.roles = roles;
      state.people = people;
      state.assignments = assignments;
      const unitById = new Map(state.units.map(item => [item.id, item]));
      const roleById = new Map(state.roles.map(item => [item.id, item]));
      fillFilters(unitById, roleById);
      render();
    } catch (error) {
      $("#people-results").innerHTML = '<div class="people-state people-state--error">Không tải được danh bạ. Vui lòng tải lại trang.</div>';
      $("#people-count").textContent = "—";
      $("#assignment-count").textContent = "Chưa tải được dữ liệu";
      $("#result-count").textContent = "";
      $("#people-status").textContent = error.message;
    }
  }

  init();
})();
