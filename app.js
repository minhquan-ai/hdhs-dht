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
    focusUnitId: "truong-dht",
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
      root:"Trường",
      "school-leadership":"BGH",
      "school-organization":"Đoàn trường",
      "student-council":"Hội đồng Học sinh",
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
      team:"Tổ",
      class:"Lớp"
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

  function navigate(unitId, roleId = null) {
    if (!unit(unitId)) return;
    const params = new URLSearchParams({ unit: unitId });
    if (roleId) params.set('role', roleId);
    if (location.hash.slice(1) === params.toString()) return;
    history.pushState(null, '', '#' + params.toString());
    readRoute();
  }

  let activeTransition;
  const topbar = document.querySelector('.topbar');
  let scrollAnchor = window.scrollY;
  let scrollFrame = 0;
  function showTopbar() {
    topbar.classList.remove('topbar--hidden');
    scrollAnchor = Math.max(0, window.scrollY);
  }
  new ResizeObserver(() => {
    document.documentElement.style.setProperty('--topbar-height', topbar.offsetHeight + 'px');
  }).observe(topbar);
  topbar.addEventListener('focusin', showTopbar);
  window.addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      const y = Math.max(0, Math.min(window.scrollY, document.documentElement.scrollHeight - innerHeight));
      const delta = y - scrollAnchor;
      if (y < topbar.offsetHeight || topbar.contains(document.activeElement)) showTopbar();
      else if (Math.abs(delta) >= 10) {
        topbar.classList.toggle('topbar--hidden', delta > 0);
        scrollAnchor = y;
      }
    });
  }, { passive:true });
  window.addEventListener('resize', () => activeTransition?.skipTransition());

  function readRoute() {
    const params = new URLSearchParams(location.hash.slice(1));
    const selectedRole = role(params.get('role'));
    state.focusUnitId = selectedRole?.unit_id || (unit(params.get('unit')) ? params.get('unit') : state.units.find(u => !u.parent_id).id);
    state.focusRoleId = null;
    const routePath = pathToUnit(state.focusUnitId);
    routePath.forEach(u => expandedMapUnits.set(u.id, true));
    const groupedNode = routePath.find(u => ['board','assembly','council','department'].includes(u.kind));
    if (groupedNode) expandedMapUnits.set('group:' + groupedNode.kind, true);
    const sharedName = selectedRole ? 'role-' + selectedRole.id : 'unit-' + state.focusUnitId;
    const selectedLabel = app.querySelector(`[data-unit="${CSS.escape(state.focusUnitId)}"] [style*="view-transition-name"]`);
    if (selectedLabel && !selectedRole) selectedLabel.style.viewTransitionName = sharedName;
    // Animate only the selected node; other names must not cross-fade independently.
    app.querySelectorAll('[style*="view-transition-name"]').forEach(el => {
      if (el.style.viewTransitionName !== sharedName) el.style.viewTransitionName = 'none';
    });
    const update = () => {
      render();
      app.querySelectorAll('[style*="view-transition-name"]').forEach(el => {
        if (el.style.viewTransitionName !== sharedName) el.style.viewTransitionName = 'none';
      });
      window.scrollTo(0, 0);
      showTopbar();
      app.querySelector('h1')?.focus({ preventScroll: true });
      if (selectedRole) showRole(selectedRole.id);
    };
    activeTransition?.skipTransition();
    renderBreadcrumbs();
    update();
  }

  function rolesHTML(id, compact = false) {
    const roles = rolesOf(id);
    if (!roles.length) return '';
    const visible = compact ? roles.slice(0, 1) : roles;
    return `<div class="roles ${compact ? 'roles--compact' : ''}">${visible.map(r => {
      const names = assignmentsOfRole(r.id).map(a => person(a.person_id)?.name).filter(Boolean);
      return `<button class="role-link" data-role="${esc(r.id)}"><span class="role-title">${esc(r.title)}</span><strong class="${names.length ? '' : 'unassigned'}">${esc(names.join(' · ') || 'Chưa phân công')}</strong><span class="link-arrow" aria-hidden="true">↗</span></button>`;
    }).join('')}${compact && roles.length > 1 ? `<button class="more-roles" data-unit="${esc(id)}">Xem ${roles.length} chức danh <span aria-hidden="true">→</span></button>` : ''}</div>`;
  }

  function memberHTML(a) {
    const p = person(a.person_id);
    if (!p) return '';
    return `<button class="member" data-person="${esc(p.id)}"><span class="avatar" aria-hidden="true">${esc(initials(p.name))}</span><span><strong>${esc(p.name)}</strong><small>${esc(a.role_label || role(a.role_id)?.title || 'Thành viên')}${p.class_name ? ' · ' + esc(p.class_name) : ''}</small><small>${esc(a.status)}</small></span><span class="link-arrow" aria-hidden="true">↗</span></button>`;
  }

  function nodeHTML(u, index) {
    const children = childrenOf(u.id);
    const executive = u.kind === 'board';
    const major = ['assembly', 'council'].includes(u.kind);
    return `<li class="branch ${executive ? 'branch--executive' : major ? 'branch--major' : 'branch--minor'}" style="--i:${index}">
      <article class="unit-node">
        <div class="unit-identity">
          <button class="unit-open" data-unit="${esc(u.id)}"><span class="eyebrow">${esc(labelKind(u.kind))}</span><span class="unit-name" style="view-transition-name:unit-${esc(u.id)}">${esc(u.name)}</span><span class="node-arrow" aria-hidden="true">↗</span></button>
        </div>
        ${rolesHTML(u.id, !executive)}
        ${children.length ? `<div class="descendants"><ul aria-label="Đơn vị thuộc ${esc(u.name)}">${children.map(child => `<li><button data-unit="${esc(child.id)}"><span style="view-transition-name:unit-${esc(child.id)}">${esc(child.name)}</span><span aria-hidden="true">→</span></button></li>`).join('')}</ul></div>` : ''}
      </article>
    </li>`;
  }

  function renderBreadcrumbs() {
    const path = pathToUnit(state.focusUnitId);
    breadcrumbs.innerHTML = path.map((u, i) => `<li><button data-unit="${esc(u.id)}" ${!state.focusRoleId && i === path.length - 1 ? 'aria-current="page"' : ''}>${esc(u.name)}</button></li>`).join('') + (state.focusRoleId ? `<li><span aria-current="page">${esc(role(state.focusRoleId).title)}</span></li>` : '');
    backButton.disabled = !state.focusRoleId && !unit(state.focusUnitId)?.parent_id;
    document.querySelector('[data-mobile-back]').disabled = backButton.disabled;
    const overview = document.querySelector('[data-mobile-home]');
    if (backButton.disabled) overview.setAttribute('aria-current', 'page');
    else overview.removeAttribute('aria-current');
  }

  const expandedMapUnits = new Map();
  function locationMapHTML() {
    const path = new Set(pathToUnit(state.focusUnitId).map(u => u.id));
    const root = state.units.find(u => !u.parent_id);
    function groupedChildren(children) {
      const groups = [
        ['board', 'Điều hành'], ['assembly', 'Đại hội'],
        ['council', 'Các Hội đồng'], ['department', 'Các Ban chuyên môn']
      ];
      const known = new Set(groups.map(([kind]) => kind));
      const buckets = groups.map(([kind, label]) => [kind, label, children.filter(u => u.kind === kind)]);
      buckets.push(['other', 'Đơn vị khác', children.filter(u => !known.has(u.kind))]);
      return buckets.filter(([, , units]) => units.length).map(([kind, label, units]) => {
        const key = 'group:' + kind;
        const expanded = expandedMapUnits.get(key) ?? (!matchMedia('(max-width:700px)').matches || units.some(u => path.has(u.id)) || kind === 'board');
        return `<li class="map-group"><button type="button" class="map-group-button" data-map-toggle="${key}" aria-expanded="${expanded}"><span>${label}</span><small>${units.length}</small><span class="group-chevron" aria-hidden="true"></span></button>${expanded ? `<ul>${units.map(branch).join('')}</ul>` : ''}</li>`;
      }).join('');
    }
    function branch(u) {
      const current = u.id === state.focusUnitId;
      const children = childrenOf(u.id);
      const expanded = expandedMapUnits.get(u.id) ?? path.has(u.id);
      return `<li class="${path.has(u.id) ? 'map-path' : ''}"><div class="map-row" ${current ? 'aria-current="location"' : ''}><button type="button" data-map-unit="${esc(u.id)}" title="Đi đến ${esc(u.name)}"><span class="map-dot" aria-hidden="true"></span><span>${esc(u.name)}</span></button>${children.length ? `<button type="button" class="map-toggle" data-map-toggle="${esc(u.id)}" aria-expanded="${expanded}" aria-label="Mở hoặc thu nhánh ${esc(u.name)}"><span aria-hidden="true">${expanded ? '⌄' : '›'}</span></button>` : ''}</div>${expanded && children.length ? `<ul>${u.id === 'hdhs' ? groupedChildren(children) : children.map(branch).join('')}</ul>` : ''}</li>`;
    }
    return `<nav class="location-map" aria-label="Bản đồ vị trí trong cơ cấu"><ul>${branch(root)}</ul></nav>`;
  }

  function render() {
    const previousMap = app.querySelector('.desktop-location .location-map');
    const previousMapScroll = previousMap?.scrollTop || 0;
    renderBreadcrumbs();
    const current = unit(state.focusUnitId);
    const currentRole = role(state.focusRoleId);
    const children = currentRole ? [] : childrenOf(current.id);
    const members = currentRole ? assignmentsOfRole(currentRole.id) : assignmentsOfUnit(current.id);
    const root = !current.parent_id && !currentRole;
    const depth = pathToUnit(current.id).length;
    const hdhsRoot = current.id === 'hdhs' && !currentRole;
    const groupedContent = hdhsRoot ? [['board','Điều hành'],['assembly','Đại hội'],['council','Các Hội đồng'],['department','Các Ban chuyên môn'],['other','Đơn vị khác']].map(([kind,label]) => {
      const units = children.filter(u => kind === 'other' ? !['board','assembly','council','department'].includes(u.kind) : u.kind === kind);
      return units.length ? '<section class="content-group"><h2 class="content-group-title">' + label + '<span>' + units.length + '</span></h2><ul class="tree">' + units.map(nodeHTML).join('') + '</ul></section>' : '';
    }).join('') : root ? '<section class="content-group"><h2 class="content-group-title">Các đơn vị chính<span>' + children.length + '</span></h2><ul class="tree">' + children.map(nodeHTML).join('') + '</ul></section>' : '';
    app.innerHTML = `
      <div class="org-layout ${root ? 'org-layout--root' : ''} ${!children.length ? 'org-layout--leaf' : ''}">
        <section class="origin ${current.kind === 'board' ? 'origin--executive' : ''}">
          <div class="origin-content"><span class="section-number">${String(depth).padStart(2, '0')} / ${esc(currentRole ? 'Chức danh' : labelKind(current.kind))}</span>
          <h1 tabindex="-1" style="view-transition-name:${currentRole ? 'role-' + esc(currentRole.id) : 'unit-' + esc(current.id)}">${esc(currentRole?.title || current.name)}</h1>
          <p class="origin-summary">${esc(currentRole?.summary || current.summary)}</p>
          <div class="origin-meta">${!currentRole && current.status ? `<span class="status-dot">${esc(current.status)}</span>` : ''}${children.length ? `<span>${children.length} đơn vị trực thuộc</span>` : ''}</div>
          ${currentRole ? `<button class="text-link" data-unit="${esc(current.id)}">← ${esc(current.name)}</button>` : ''}
          <section class="desktop-location" aria-label="Duyệt cơ cấu">${locationMapHTML()}</section>
          <button type="button" class="location-trigger" data-open-map aria-haspopup="dialog"><span class="location-trigger-copy"><strong>Duyệt cơ cấu</strong><small>Mở cây đơn vị</small></span><span aria-hidden="true">↗</span></button>
          </div>
        </section>
        <div class="org-content">
          ${!currentRole && rolesOf(current.id).length ? `<section class="role-branch" aria-label="Chức danh của ${esc(current.name)}"><h2>Chức danh</h2>${rolesHTML(current.id)}</section>` : ''}
          ${(root || hdhsRoot) ? groupedContent : children.length ? `<ul class="tree" aria-label="Các đơn vị trực thuộc ${esc(current.name)}">${children.map(nodeHTML).join('')}</ul>` : ''}
          ${members.length ? `<section class="members-section"><div class="section-heading"><h2>${currentRole ? 'Người đảm nhiệm' : 'Thành viên'}</h2><span>${new Set(members.map(a => a.person_id)).size} người</span></div><div class="member-list">${members.map(memberHTML).join('')}</div></section>` : ''}
          ${!children.length && !members.length && (currentRole || !rolesOf(current.id).length) ? `<div class="empty"><span class="eyebrow">${currentRole ? 'Người đảm nhiệm' : 'Thông tin đơn vị'}</span><h2>${currentRole ? 'Chưa phân công' : 'Chưa có dữ liệu chi tiết'}</h2><p>${currentRole ? 'Vị trí này chưa có người đảm nhiệm trong dữ liệu hiện tại.' : 'Các đơn vị con và thành viên sẽ hiển thị khi có dữ liệu được xác nhận.'}</p></div>` : ''}
        </div>
      </div>`;
    // On touch, expand only the branch the reader chooses, without shrinking the desktop map.
    if (matchMedia('(max-width: 700px)').matches) app.querySelectorAll('details').forEach(d => d.open = false);
    document.title = `${currentRole?.title || current.name} · Sơ đồ HĐHS DHT`;
    const active = app.querySelector('.location-map [aria-current="location"]');
    const map = app.querySelector('.location-map');
    if (previousMap && map && matchMedia('(min-width:701px)').matches && previousMap.querySelector(`[data-map-unit="${CSS.escape(state.focusUnitId)}"]`)) {
      map.replaceWith(previousMap);
      previousMap.querySelectorAll('.map-row').forEach(row => {
        const id = row.querySelector('[data-map-unit]')?.dataset.mapUnit;
        if (id === state.focusUnitId) row.setAttribute('aria-current', 'location');
        else row.removeAttribute('aria-current');
        row.parentElement.classList.toggle('map-path', pathToUnit(state.focusUnitId).some(u => u.id === id));
      });
      previousMap.scrollTop = previousMapScroll;
    } else if (map && previousMap) {
      map.scrollTop = previousMapScroll;
      const selected = map.querySelector('[aria-current="location"]');
      if (selected) {
        const bounds = map.getBoundingClientRect(), node = selected.getBoundingClientRect();
        if (node.top < bounds.top || node.bottom > bounds.bottom) map.scrollTop += node.top - bounds.top - map.clientHeight / 2;
      }
    }
  }

  const dialog = document.querySelector('#personDialog');
  function showPerson(id) {
    const p = person(id);
    if (!p) return;
    const assignments = state.assignments.filter(a => a.person_id === id);
    dialog.querySelector('.person-content').innerHTML = `<span class="eyebrow">Thành viên</span><h2 id="personTitle">${esc(p.name)}</h2>${p.class_name ? `<p>Lớp ${esc(p.class_name)}</p>` : ''}<h3>Phân công</h3><ul class="person-assignments">${assignments.map(a => `<li><strong>${esc(unit(a.unit_id)?.name)}</strong><span>${esc(a.role_label || role(a.role_id)?.title || 'Thành viên')}</span><small>${esc(a.status)}</small></li>`).join('')}</ul>`;
    dialog.showModal();
  }
  async function animateList(list, opening) {
    if (!list || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const height = list.getBoundingClientRect().height;
    list.style.overflow = 'hidden';
    const frames = [{height:'0px',opacity:0},{height:height + 'px',opacity:1}];
    try {
      await list.animate(opening ? frames : frames.reverse(), {
        duration:220, easing:'cubic-bezier(.22,1,.36,1)', fill:'both'
      }).finished;
    } finally {
      list.getAnimations().forEach(animation => animation.cancel());
      list.style.removeProperty('overflow');
    }
  }
  document.addEventListener('click', async event => {
    const summary = event.target.closest('.descendants > summary');
    if (summary) {
      event.preventDefault();
      const details = summary.parentElement;
      if (details.dataset.animating) return;
      details.dataset.animating = 'true';
      const opening = !details.open;
      if (opening) details.open = true;
      await animateList(details.querySelector('ul'), opening);
      if (!opening) details.open = false;
      delete details.dataset.animating;
      return;
    }
    const target = event.target.closest('button');
    if (!target) return;
    if (target.hasAttribute('data-mobile-home')) { homeButton.click(); return; }
    if (target.hasAttribute('data-mobile-back')) { backButton.click(); return; }
    if (target.hasAttribute('data-open-map')) {
      mapDialog.querySelector('.map-popup-content').innerHTML = locationMapHTML();
      mapDialog.showModal();
      const active = mapDialog.querySelector('[aria-current="location"]');
      active?.scrollIntoView({ block:'center' });
      return;
    }
    if (target.dataset.mapToggle) {
      const id = target.dataset.mapToggle;
      if (!id.startsWith('group:') && !childrenOf(id).length) return;
      const container = target.closest('.map-popup-content, .desktop-location');
      if (container.dataset.animating) return;
      const opening = target.getAttribute('aria-expanded') !== 'true';
      container.dataset.animating = 'true';
      if (!opening) await animateList(target.closest('li').querySelector(':scope > ul'), false);
      if (!container.isConnected) return;
      expandedMapUnits.set(id, opening);
      const map = container.querySelector('.location-map');
      const scroll = map.scrollTop;
      map.outerHTML = locationMapHTML();
      container.querySelector('.location-map').scrollTop = scroll;
      container.querySelector(`[data-map-toggle="${CSS.escape(id)}"]`)?.focus({preventScroll:true});
      const list = container.querySelector(`[data-map-toggle="${CSS.escape(id)}"]`)?.closest('li').querySelector(':scope > ul');
      if (opening) await animateList(list, true);
      delete container.dataset.animating;
      return;
    }
    if (target.dataset.mapUnit) {
      if (mapDialog.open) mapDialog.close();
      navigate(target.dataset.mapUnit);
      return;
    }
    if (target.dataset.unit) navigate(target.dataset.unit);
    if (target.dataset.role) showRole(target.dataset.role);
    if (target.dataset.person) showPerson(target.dataset.person);
  });
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  const mapDialog = document.querySelector('#mapDialog');
  mapDialog.querySelector('.dialog-close').addEventListener('click', () => mapDialog.close());
  mapDialog.addEventListener('click', event => { if (event.target === mapDialog) mapDialog.close(); });
  const roleDialog = document.querySelector('#roleDialog');
  function showRole(id) {
    const r = role(id);
    if (!r) return;
    const members = assignmentsOfRole(id);
    roleDialog.querySelector('.role-content').innerHTML = `<span class="eyebrow">${esc(unit(r.unit_id)?.name)}</span><h2 id="roleTitle">${esc(r.title)}</h2><p class="role-description">${esc(r.summary)}</p><h3>Người đảm nhiệm</h3>${members.length ? `<div class="popup-members">${members.map(memberHTML).join('')}</div>` : '<p class="role-vacant">Chưa phân công</p>'}`;
    if (!roleDialog.open) roleDialog.showModal();
  }
  roleDialog.querySelector('.dialog-close').addEventListener('click', () => roleDialog.close());
  roleDialog.addEventListener('click', event => { if (event.target === roleDialog) roleDialog.close(); });
  roleDialog.addEventListener('close', () => {
    const params = new URLSearchParams(location.hash.slice(1));
    if (params.has('role')) {
      params.delete('role');
      history.replaceState(null, '', '#' + params.toString());
    }
  });
  backButton.addEventListener('click', () => {
    if (state.focusRoleId) navigate(state.focusUnitId);
    else if (unit(state.focusUnitId)?.parent_id) navigate(unit(state.focusUnitId).parent_id);
  });
  homeButton.addEventListener('click', () => navigate(state.units.find(u => !u.parent_id).id));
  window.addEventListener('hashchange', readRoute);
  loadData().then(readRoute).catch(err => {
    console.error(err);
    app.innerHTML = '<div class="empty"><h1>Không tải được sơ đồ</h1><p>Vui lòng kiểm tra kết nối rồi tải lại trang.</p><button onclick="location.reload()">Thử lại</button></div>';
  });
})();
