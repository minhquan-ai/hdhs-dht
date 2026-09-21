(() => {
  "use strict";

  const FILES = [
    "database/units.csv",
    "database/subunits.csv",
    "database/academic_teams.csv",
    "database/roles.csv",
    "database/people.csv",
    "database/assignments.csv"
  ];

  const state = {
    units: [],
    roles: [],
    people: [],
    assignments: [],
    focusUnitId: "hdhs",
    focusRoleId: null
  };

  const app = document.querySelector("#app");
  const breadcrumbs = document.querySelector("#breadcrumbs");
  const backButton = document.querySelector("#backButton");
  const homeButton = document.querySelector("#homeButton");

  function parseCSV(text) {
    const rows = [];
    let row = [], cell = "", quote = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (quote) {
        if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (ch === '"') quote = false;
        else cell += ch;
      } else {
        if (ch === '"') quote = true;
        else if (ch === ",") { row.push(cell); cell = ""; }
        else if (ch === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
        else if (ch !== "\r") cell += ch;
      }
    }
    if (cell.length || row.length) { row.push(cell); rows.push(row); }
    if (!rows.length) return [];
    const headers = rows[0].map(x => x.trim());
    return rows.slice(1)
      .filter(r => r.some(x => String(x).trim() !== ""))
      .map(r => Object.fromEntries(headers.map((h, i) => [h, (r[i] ?? "").trim()])));
  }

  async function loadCSV(path) {
    const res = await fetch(path + "?t=" + Date.now(), { cache: "no-store" });
    if (!res.ok) throw new Error("Không đọc được " + path);
    return parseCSV(await res.text());
  }

  async function loadData() {
    const [units, subunits, academic, roles, people, assignments] = await Promise.all(FILES.map(loadCSV));
    state.units = [...units, ...subunits, ...academic];
    state.roles = roles;
    state.people = people;
    state.assignments = assignments;
  }

  function unit(id) { return state.units.find(x => x.id === id); }
  function role(id) { return state.roles.find(x => x.id === id); }
  function person(id) { return state.people.find(x => x.id === id); }

  function childrenOf(id) {
    return state.units
      .filter(x => x.parent_id === id)
      .sort((a,b) => (+a.sort_order || 999) - (+b.sort_order || 999));
  }

  function rolesOf(id) {
    return state.roles
      .filter(x => x.unit_id === id)
      .sort((a,b) => (+a.sort_order || 999) - (+b.sort_order || 999));
  }

  function assignmentsOfUnit(id) {
    return state.assignments
      .filter(x => x.unit_id === id && !x.role_id)
      .sort((a,b) => (+a.sort_order || 999) - (+b.sort_order || 999));
  }

  function assignmentsOfRole(id) {
    return state.assignments
      .filter(x => x.role_id === id)
      .sort((a,b) => (+a.sort_order || 999) - (+b.sort_order || 999));
  }

  function esc(v="") {
    return String(v)
      .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
      .replaceAll('"',"&quot;").replaceAll("'","&#039;");
  }

  function initials(name="") {
    return name.split(/\s+/).filter(Boolean).slice(-2).map(x => x[0]).join("").toUpperCase() || "•";
  }

  function labelKind(kind) {
    return ({
      root:"Hội đồng",
      board:"Điều hành",
      assembly:"Đại diện",
      network:"Mạng lưới",
      council:"Hội đồng",
      department:"Ban chuyên môn",
      oversight:"Kiểm tra",
      club:"Câu lạc bộ",
      "school-board":"Ban trực thuộc Đoàn",
      academic:"Học thuật",
      "academic-hub":"Khối học thuật",
      "academic-team":"Đội tuyển",
      group:"Nhóm đại diện",
      team:"Tổ"
    })[kind] || "Đơn vị";
  }

  function pathToUnit(id) {
    const path = [];
    let current = unit(id);
    while (current) {
      path.unshift(current);
      current = current.parent_id ? unit(current.parent_id) : null;
    }
    return path;
  }

  function setFocusUnit(id) {
    if (!unit(id)) return;
    state.focusUnitId = id;
    state.focusRoleId = null;
    render();
  }

  function setFocusRole(id) {
    if (!role(id)) return;
    state.focusRoleId = id;
    render();
  }

  function countInside(id) {
    const directPeople = state.assignments.filter(x => x.unit_id === id).length;
    const children = childrenOf(id);
    return { children: children.length, people: directPeople };
  }

  function memberHTML(a) {
    const p = person(a.person_id);
    if (!p) return "";
    const title = a.role_label || role(a.role_id)?.title || "Thành viên";
    return `
      <article class="member">
        <div class="avatar">${esc(initials(p.name))}</div>
        <div>
          <strong>${esc(p.name)}</strong>
          <small>${esc(title)}${p.class_name ? " · " + esc(p.class_name) : ""}</small>
          ${a.status ? '<small>'+esc(a.status)+'</small>' : ""}
        </div>
      </article>`;
  }

  function renderBreadcrumbs() {
    const path = pathToUnit(state.focusUnitId);
    let html = "";
    path.forEach((u, i) => {
      if (i) html += "<span>›</span>";
      html += `<button type="button" data-crumb-unit="${esc(u.id)}">${esc(u.name)}</button>`;
    });
    if (state.focusRoleId) {
      html += "<span>›</span>";
      html += `<button type="button">${esc(role(state.focusRoleId)?.title || "")}</button>`;
    }
    breadcrumbs.innerHTML = html;
    breadcrumbs.querySelectorAll("[data-crumb-unit]").forEach(btn => {
      btn.addEventListener("click", () => setFocusUnit(btn.dataset.crumbUnit));
    });
    backButton.disabled = !state.focusRoleId && state.focusUnitId === "hdhs";
  }

  function renderRoleFocus() {
    const r = role(state.focusRoleId);
    const u = unit(r?.unit_id);
    if (!r || !u) return;
    const members = assignmentsOfRole(r.id);
    app.innerHTML = `
      <div class="map-shell">
        <section class="role-focus">
          <div class="kind">${esc(u.name)}</div>
          <h1>${esc(r.title)}</h1>
          <p>${esc(r.summary)}</p>
        </section>
        <section class="member-section">
          <h2 class="section-title">Người đảm nhiệm</h2>
          ${members.length
            ? '<div class="member-grid">'+members.map(memberHTML).join("")+'</div>'
            : '<div class="empty">Chưa có người được gán vào vị trí này.</div>'}
        </section>
      </div>`;
  }

  function rolePeopleLabel(roleId) {
    const names = assignmentsOfRole(roleId)
      .map(a => person(a.person_id)?.name)
      .filter(Boolean);
    return names.length ? names.join(" · ") : "Chưa phân công";
  }

  function renderLeadershipRole(r, index = 0) {
    const assigned = assignmentsOfRole(r.id);
    return `
      <button class="leadership-role" type="button" data-role="${esc(r.id)}" style="--i:${index}">
        <span class="leadership-title">${esc(r.title)}</span>
        <span class="leadership-person ${assigned.length ? "" : "is-empty"}">${esc(rolePeopleLabel(r.id))}</span>
        <span class="leadership-open" aria-hidden="true">↗</span>
      </button>`;
  }

  function renderOrgNode(child, className = "", index = 0) {
    const counts = countInside(child.id);
    const detail = [
      counts.children ? counts.children + " nhánh" : "",
      counts.people ? counts.people + " người" : ""
    ].filter(Boolean).join(" · ") || child.status || "";

    return `
      <button class="node ${className}" type="button" data-unit="${esc(child.id)}" style="--i:${index}">
        <span class="node-index">${String((+child.sort_order || index + 1)).padStart(2, "0")}</span>
        <div class="kind">${esc(labelKind(child.kind))}</div>
        <h2>${esc(child.name)}</h2>
        ${child.summary ? '<p>'+esc(child.summary)+'</p>' : ""}
        <div class="node-foot">
          <span class="count">${esc(detail)}</span>
          <span class="arrow" aria-hidden="true">↘</span>
        </div>
      </button>`;
  }

  function renderRootMap(children) {
    const executive = children.find(x => x.kind === "board");
    const councils = children.filter(x => ["assembly", "council"].includes(x.kind));
    const departments = children.filter(x => x.kind === "department");
    const rest = children.filter(x =>
      x !== executive && !["assembly", "council", "department"].includes(x.kind)
    );

    return `
      <section class="org-map root-map" aria-label="Sơ đồ các đơn vị trực thuộc Hội đồng Học sinh">
        ${executive ? `
          <div class="root-level root-level--executive">
            <div class="level-rail" aria-hidden="true"></div>
            ${renderOrgNode(executive, "node--executive", 0)}
          </div>` : ""}

        ${councils.length ? `
          <div class="root-level root-level--councils">
            <div class="level-rail" aria-hidden="true"></div>
            <div class="level-grid level-grid--councils">
              ${councils.map((child, i) => renderOrgNode(child, "node--council", i + 1)).join("")}
            </div>
          </div>` : ""}

        ${departments.length ? `
          <div class="root-level root-level--departments">
            <div class="level-rail" aria-hidden="true"></div>
            <div class="level-grid level-grid--departments">
              ${departments.map((child, i) => renderOrgNode(child, "node--department", i + 4)).join("")}
            </div>
          </div>` : ""}

        ${rest.length ? `
          <div class="root-level">
            <div class="level-grid level-grid--departments">
              ${rest.map((child, i) => renderOrgNode(child, "", i + 10)).join("")}
            </div>
          </div>` : ""}
      </section>`;
  }

  function renderBranchMap(children) {
    return `
      <section class="org-map branch-map" aria-label="Các đơn vị trực thuộc">
        <div class="branch-spine" aria-hidden="true"></div>
        <div class="branch-tree">
          ${children.map((child, i) =>
            renderOrgNode(
              child,
              `branch-node ${i % 2 ? "branch-node--right" : "branch-node--left"}`,
              i
            )
          ).join("")}
        </div>
      </section>`;
  }

  function renderUnitFocus() {
    const current = unit(state.focusUnitId);
    if (!current) return;

    const children = childrenOf(current.id);
    const roles = rolesOf(current.id);
    const directMembers = assignmentsOfUnit(current.id);
    const isRoot = current.id === "hdhs";

    const focusClasses = [
      "focus-node",
      isRoot ? "root" : "",
      current.kind === "board" ? "focus-node--executive" : ""
    ].filter(Boolean).join(" ");

    const leadership = roles.length ? `
      <aside class="leadership-panel">
        <div class="leadership-head">
          <span>Chức danh</span>
          <small>Tên người hiển thị trực tiếp · bấm để xem chi tiết</small>
        </div>
        <div class="leadership-list">
          ${roles.map(renderLeadershipRole).join("")}
        </div>
      </aside>` : "";

    const focusLayoutClass = roles.length
      ? "focus-layout focus-layout--with-leadership"
      : "focus-layout";

    app.innerHTML = `
      <div class="map-shell">
        <div class="${focusLayoutClass}">
          <section class="${focusClasses}">
            <div class="focus-marker" aria-hidden="true"></div>
            <div class="kind">${esc(labelKind(current.kind))}</div>
            <h1>${esc(current.name)}</h1>
            ${current.summary ? '<p>'+esc(current.summary)+'</p>' : ""}
            <div class="meta-line">
              ${current.status ? '<span class="meta-pill">'+esc(current.status)+'</span>' : ""}
              ${children.length ? '<span class="meta-pill">'+children.length+' đơn vị con</span>' : ""}
              ${directMembers.length ? '<span class="meta-pill">'+directMembers.length+' thành viên trực tiếp</span>' : ""}
            </div>
          </section>
          ${leadership}
        </div>

        ${children.length ? (isRoot ? renderRootMap(children) : renderBranchMap(children)) : ""}

        ${directMembers.length ? `
          <section class="member-section">
            <div class="section-heading">
              <h2>Thành viên trực tiếp</h2>
              <span>${directMembers.length} người</span>
            </div>
            <div class="member-grid">${directMembers.map(memberHTML).join("")}</div>
          </section>` : ""}

        ${!children.length && !roles.length && !directMembers.length
          ? '<div class="empty">Chưa có dữ liệu ở tầng này.</div>' : ""}
      </div>`;

    app.querySelectorAll("[data-unit]").forEach(btn =>
      btn.addEventListener("click", () => setFocusUnit(btn.dataset.unit))
    );
    app.querySelectorAll("[data-role]").forEach(btn =>
      btn.addEventListener("click", () => setFocusRole(btn.dataset.role))
    );
  }

  function render() {
    renderBreadcrumbs();
    if (state.focusRoleId) renderRoleFocus();
    else renderUnitFocus();
  }

  backButton.addEventListener("click", () => {
    if (state.focusRoleId) {
      state.focusRoleId = null;
      render();
      return;
    }
    const current = unit(state.focusUnitId);
    if (current?.parent_id) setFocusUnit(current.parent_id);
  });

  homeButton.addEventListener("click", () => setFocusUnit("hdhs"));

  loadData()
    .then(render)
    .catch(err => {
      console.error(err);
      app.innerHTML = '<div class="error">Không tải được dữ liệu sơ đồ.</div>';
    });
})();