import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { KageLandingPage } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";
import "./site.css";

const FILES = [
  "/database/units.csv",
  "/database/subunits.csv",
  "/database/academic_teams.csv",
  "/database/roles.csv",
  "/database/people.csv",
  "/database/assignments.csv",
];
const collator = new Intl.Collator("vi", { sensitivity: "base", numeric: true });

function parseCSV(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
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
  const headers = rows[0].map(v => v.trim());
  return rows.slice(1)
    .filter(values => values.some(v => String(v || "").trim()))
    .map(values => Object.fromEntries(headers.map((header, i) => [header, String(values[i] || "").trim()])));
}

async function loadCSV(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error("Không đọc được dữ liệu công khai.");
  return parseCSV(await response.text());
}

function normalize(value) {
  return String(value || "").normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLocaleLowerCase("vi");
}

function initials(name) {
  return String(name || "").trim().split(/\s+/).filter(Boolean).slice(-2)
    .map(part => Array.from(part)[0] || "").join("").toLocaleUpperCase("vi");
}

function roleName(assignment, roleById) {
  return roleById.get(assignment.role_id)?.title || assignment.role_label || "Thành viên";
}

function usePublicData() {
  const [state, setState] = useState({ loading: true, error: "", data: null });
  useEffect(() => {
    let alive = true;
    Promise.all(FILES.map(loadCSV)).then(([units, subunits, academic, roles, people, assignments]) => {
      if (!alive) return;
      setState({
        loading: false,
        error: "",
        data: { units, subunits, academic, roles, people, assignments, allUnits: [...units, ...subunits, ...academic] },
      });
    }).catch(error => alive && setState({ loading: false, error: error.message, data: null }));
    return () => { alive = false; };
  }, []);
  return state;
}

function useCinematicEnabled() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const width = matchMedia("(min-width: 960px)");
    const fine = matchMedia("(pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      const saveData = Boolean(navigator.connection?.saveData);
      const weakCpu = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
      setEnabled(width.matches && fine.matches && !reduced.matches && !saveData && !weakCpu);
    };
    update();
    [width, fine, reduced].forEach(m => m.addEventListener?.("change", update));
    return () => [width, fine, reduced].forEach(m => m.removeEventListener?.("change", update));
  }, []);
  return enabled;
}

function KageBackdrop({ enabled }) {
  const frameRef = useRef(null);
  const prepareFrame = useCallback(frame => {
    frameRef.current = frame;
    const doc = frame.contentDocument;
    if (!doc || doc.getElementById("dht-kage-adaptation")) return;
    const style = doc.createElement("style");
    style.id = "dht-kage-adaptation";
    style.textContent = `
      html,body{background:#071017!important}
      .nav,.rail,.cursor,.menu,.foot-base{display:none!important}
      .page{visibility:hidden!important;pointer-events:none!important}
      #gl{visibility:visible!important;position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;max-width:none!important;max-height:none!important;opacity:.82!important;filter:saturate(.72) hue-rotate(326deg) contrast(1.06)!important}
      body:after{content:"";position:fixed;inset:0;z-index:8;pointer-events:none;background:radial-gradient(circle at 78% 20%,rgba(224,35,28,.14),transparent 35%),linear-gradient(180deg,rgba(3,10,16,.08),rgba(3,10,16,.6))}
    `;
    doc.head.appendChild(style);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const sync = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const frame = frameRef.current;
        const doc = frame?.contentDocument;
        const win = frame?.contentWindow;
        if (!doc || !win) return;
        const outerMax = Math.max(1, document.documentElement.scrollHeight - innerHeight);
        const innerMax = Math.max(0, doc.documentElement.scrollHeight - win.innerHeight);
        win.scrollTo(0, (scrollY / outerMax) * innerMax);
      });
    };
    addEventListener("scroll", sync, { passive: true });
    addEventListener("resize", sync);
    sync();
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", sync);
      removeEventListener("resize", sync);
    };
  }, [enabled]);

  if (!enabled) return <div className="ambient-fallback" aria-hidden="true" />;
  return (
    <div className="cinematic-backdrop" aria-hidden="true">
      <KageLandingPage
        headingFont="onest"
        bodyFont="onest"
        headingWeight="400"
        bodyWeight="300"
        primaryColor="#e0231c"
        headingSize={46}
        bodySize={17}
        headingLetterSpacing={-0.012}
        applyScene={prepareFrame}
      />
      <div className="cinematic-veil" />
    </div>
  );
}

function SectionLabel({ index, children }) {
  return <div className="section-label"><span>{String(index).padStart(2, "0")}</span><span>{children}</span></div>;
}

function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#top">
        <span className="brand-mark">DHT</span>
        <span className="brand-copy"><strong>Hội đồng Học sinh</strong><small>THPT Đặng Huy Trứ</small></span>
      </a>
      <nav className="desktop-nav">
        <a href="#about">Giới thiệu</a><a href="#structure">Cơ cấu</a><a href="#units">Đơn vị</a><a href="#people">Con người</a>
      </nav>
      <a className="directory-link" href="#people">Danh bạ <span>↘</span></a>
    </header>
  );
}

function Hero({ data }) {
  const peopleCount = data?.people?.length ?? 0;
  const hdhsCount = data?.units?.filter(x => x.parent_id === "hdhs").length ?? 0;
  const clubCount = data?.subunits?.filter(x => x.parent_id === "hoi-dong-clb").length ?? 0;
  return (
    <section className="hero section-shell" id="top">
      <div className="hero-kicker"><span className="live-dot" />Hồ sơ công khai · 2026–2027</div>
      <div className="hero-grid">
        <div>
          <p className="eyebrow">Student Council · Đặng Huy Trứ</p>
          <h1><span>Hội đồng</span><span className="hero-accent">Học sinh.</span></h1>
          <p className="hero-lede">Một bản đồ sống về con người, câu lạc bộ và các đơn vị đang kết nối học sinh trong trường.</p>
          <div className="hero-actions"><a className="button primary" href="#structure">Khám phá cơ cấu</a><a className="button ghost" href="#people">Tìm một người</a></div>
        </div>
        <div className="hero-side">
          <div className="hero-orbit" aria-hidden="true"><span /><span /><span /><b>DHT</b></div>
          <div className="hero-stats">
            <div><strong>{peopleCount || "—"}</strong><span>hồ sơ công khai</span></div>
            <div><strong>{hdhsCount || "—"}</strong><span>đơn vị HĐHS</span></div>
            <div><strong>{clubCount || "—"}</strong><span>CLB trong mô hình</span></div>
          </div>
        </div>
      </div>
      <div className="scroll-cue"><span>Cuộn để khám phá</span><i /></div>
    </section>
  );
}

function About() {
  return (
    <section className="content-section section-shell" id="about">
      <SectionLabel index={1}>HĐHS là gì?</SectionLabel>
      <div className="statement-grid">
        <h2>Kết nối để học sinh <em>tìm thấy nhau</em> và làm được việc thật.</h2>
        <div className="statement-copy">
          <p>HĐHS DHT được xây như một lớp kết nối giữa học sinh, các Ban, Hội đồng và câu lạc bộ. Website không thay nhà trường hay Đoàn trường, mà giúp nhìn rõ ai đang ở đâu, phụ trách gì và có thể phối hợp với nhau như thế nào.</p>
          <div className="principles"><span>Con người trước tính năng</span><span>Dữ liệu có nguồn</span><span>Quyền riêng tư mặc định</span></div>
        </div>
      </div>
    </section>
  );
}

function UnitPanel({ unit, data, onPerson }) {
  if (!unit) return null;
  const peopleById = new Map(data.people.map(x => [x.id, x]));
  const roleById = new Map(data.roles.map(x => [x.id, x]));
  const children = data.allUnits.filter(x => x.parent_id === unit.id).sort((a,b)=>(+a.sort_order||999)-(+b.sort_order||999));
  const members = data.assignments.filter(x => x.unit_id === unit.id).map(assignment => ({
    assignment, person: peopleById.get(assignment.person_id), role: roleName(assignment, roleById),
  })).filter(x => x.person).sort((a,b)=>(+a.assignment.sort_order||999)-(+b.assignment.sort_order||999)||collator.compare(a.person.name,b.person.name));

  return (
    <aside className="unit-panel">
      <div className="unit-panel-head"><span>{unit.kind || "Đơn vị"}</span><span className="status-pill">{unit.status || "Đang cập nhật"}</span></div>
      <h3>{unit.name}</h3><p>{unit.summary || "Thông tin chi tiết đang được tiếp tục xác minh."}</p>
      {!!children.length && <div className="unit-panel-block"><small>Đơn vị / nhóm trực thuộc</small><div className="chip-list">{children.map(x => <span key={x.id}>{x.name}</span>)}</div></div>}
      {!!members.length && <div className="unit-panel-block"><small>Nhân sự công khai</small><div className="mini-people">
        {members.slice(0,8).map(({ assignment, person, role }) => <button key={assignment.id} type="button" onClick={()=>onPerson(person)}>
          <b>{initials(person.name)}</b><span><strong>{person.name}</strong><small>{role} · {person.class_name ? "Lớp "+person.class_name : "Học sinh"}</small></span>
        </button>)}
      </div></div>}
    </aside>
  );
}

function Structure({ data, onPerson }) {
  const [selectedId, setSelectedId] = useState("ban-truyen-thong");
  if (!data) return null;
  const unitById = new Map(data.allUnits.map(x => [x.id, x]));
  const hdhsUnits = data.units.filter(x => x.parent_id === "hdhs").sort((a,b)=>(+a.sort_order||999)-(+b.sort_order||999));
  return (
    <section className="content-section section-shell" id="structure">
      <SectionLabel index={2}>Cơ cấu tổ chức</SectionLabel>
      <div className="section-heading"><div><p className="eyebrow">Organization map</p><h2>Không phải một kim tự tháp quyền lực.</h2></div><p>BGH, Đoàn trường và HĐHS được đặt trong cùng bối cảnh cấp trường. Bên dưới HĐHS là các đầu mối kết nối học sinh theo chức năng.</p></div>
      <div className="school-map">
        <div className="school-root"><small>Cấp trường</small><strong>THPT Đặng Huy Trứ</strong></div>
        <div className="school-branches">
          <div className="school-node"><span>01</span><strong>BGH</strong><small>Ban Giám hiệu</small></div>
          <div className="school-node"><span>02</span><strong>Đoàn trường</strong><small>Tổ chức Đoàn</small></div>
          <div className="school-node focus"><span>03</span><strong>Hội đồng Học sinh</strong><small>Hệ thống kết nối học sinh</small></div>
        </div>
      </div>
      <div className="structure-workspace">
        <div className="unit-grid">{hdhsUnits.map((unit,index) => <button type="button" className={"unit-card "+(selectedId===unit.id?"active":"")} key={unit.id} onClick={()=>setSelectedId(unit.id)}>
          <span className="unit-index">{String(index+1).padStart(2,"0")}</span><strong>{unit.name}</strong><small>{unit.summary}</small><i>{unit.status || "Đang cập nhật"}</i>
        </button>)}</div>
        <UnitPanel unit={unitById.get(selectedId)} data={data} onPerson={onPerson} />
      </div>
    </section>
  );
}

function Units({ data }) {
  if (!data) return null;
  const clubs = data.subunits.filter(x => x.parent_id === "hoi-dong-clb").sort((a,b)=>(+a.sort_order||999)-(+b.sort_order||999));
  const media = data.subunits.filter(x => x.parent_id === "ban-truyen-thong").sort((a,b)=>(+a.sort_order||999)-(+b.sort_order||999));
  return (
    <section className="content-section section-shell" id="units">
      <SectionLabel index={3}>Các đơn vị</SectionLabel>
      <div className="section-heading wide"><div><p className="eyebrow">Network, not silos</p><h2>Mỗi đơn vị giữ chuyên môn. HĐHS tạo đường nối.</h2></div></div>
      <div className="unit-showcase">
        <Showcase number="06" kicker="Hội đồng CLB" title="Các câu lạc bộ" items={clubs} className="clubs" />
        <Showcase number="04" kicker="Ban Truyền thông" title="Nhóm chuyên môn" items={media} className="media" />
      </div>
    </section>
  );
}

function Showcase({ number, kicker, title, items, className }) {
  return <article className={"showcase-card "+className}><div className="showcase-number">{number}</div><div><span className="showcase-kicker">{kicker}</span><h3>{title}</h3><div className="showcase-list">{items.map(item=><div key={item.id}><strong>{item.name}</strong><small>{item.summary || item.status}</small></div>)}</div></div></article>;
}

function PersonModal({ person, data, onClose }) {
  useEffect(() => {
    if (!person) return;
    const handler = e => e.key === "Escape" && onClose();
    addEventListener("keydown", handler);
    return () => removeEventListener("keydown", handler);
  }, [person, onClose]);
  if (!person || !data) return null;
  const unitById = new Map(data.allUnits.map(x=>[x.id,x]));
  const roleById = new Map(data.roles.map(x=>[x.id,x]));
  const assignments = data.assignments.filter(x=>x.person_id===person.id).sort((a,b)=>(+a.sort_order||999)-(+b.sort_order||999));
  return <div className="modal-shell" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><section className="person-modal" role="dialog" aria-modal="true" aria-label={"Thông tin "+person.name}>
    <button className="modal-close" type="button" onClick={onClose} aria-label="Đóng">×</button>
    <div className="person-modal-avatar">{initials(person.name)}</div><p className="eyebrow">Hồ sơ công khai</p><h3>{person.name}</h3><p className="person-class">{person.class_name ? "Lớp "+person.class_name : "Học sinh"}</p>
    <div className="person-role-list">{assignments.map(a=><div key={a.id}><span>{unitById.get(a.unit_id)?.name || "Đơn vị"}</span><strong>{roleName(a,roleById)}</strong>{a.status&&<small>{a.status}</small>}</div>)}</div>
    <p className="privacy-note">Trang công khai chỉ hiển thị thông tin tổ chức cần thiết. Thông tin liên hệ và dữ liệu nội bộ không được đưa lên đây.</p>
  </section></div>;
}

function People({ data, onPerson }) {
  const [query,setQuery]=useState(""), [unitId,setUnitId]=useState(""), [className,setClassName]=useState(""), [role,setRole]=useState(""), [limit,setLimit]=useState(18);
  const model = useMemo(() => {
    if (!data) return { results:[], units:[], classes:[], roles:[] };
    const unitById=new Map(data.allUnits.map(x=>[x.id,x])), roleById=new Map(data.roles.map(x=>[x.id,x])), byPerson=new Map();
    data.assignments.forEach(a=>{ if(!byPerson.has(a.person_id))byPerson.set(a.person_id,[]); byPerson.get(a.person_id).push(a); });
    const q=normalize(query);
    const results=data.people.map(person=>{
      const assignments=byPerson.get(person.id)||[], roles=assignments.map(a=>roleName(a,roleById)), unitNames=assignments.map(a=>unitById.get(a.unit_id)?.name||"");
      return {person,assignments,roles,unitNames};
    }).filter(x=>x.assignments.length && (!className||x.person.class_name===className) && (!unitId||x.assignments.some(a=>a.unit_id===unitId)) && (!role||x.roles.includes(role)) && (!q||normalize([x.person.name,x.person.class_name,...x.roles,...x.unitNames].join(" ")).includes(q)))
      .sort((a,b)=>collator.compare(a.person.name,b.person.name));
    const used=[...new Set(data.assignments.map(a=>a.unit_id))];
    return {
      results,
      units:used.map(id=>unitById.get(id)).filter(Boolean).sort((a,b)=>collator.compare(a.name,b.name)),
      classes:[...new Set(data.people.map(p=>p.class_name).filter(Boolean))].sort(collator.compare),
      roles:[...new Set(data.assignments.map(a=>roleName(a,roleById)))].sort(collator.compare),
    };
  },[data,query,unitId,className,role]);
  if(!data)return null;
  const reset=()=>{setQuery("");setUnitId("");setClassName("");setRole("");setLimit(18);};
  return <section className="content-section section-shell people-section" id="people">
    <SectionLabel index={4}>Con người</SectionLabel>
    <div className="section-heading"><div><p className="eyebrow">Public directory</p><h2>Tìm người, không phải mò sơ đồ.</h2></div><p>Tra theo tên không dấu, lớp, đơn vị hoặc vai trò. Một người chỉ có một hồ sơ dù tham gia nhiều nhóm.</p></div>
    <div className="directory-toolbar">
      <label className="search-box"><span>⌕</span><input value={query} onChange={e=>{setQuery(e.target.value);setLimit(18)}} placeholder="Tìm tên, lớp, đơn vị, vai trò…" /></label>
      <div className="filters">
        <select value={unitId} onChange={e=>{setUnitId(e.target.value);setLimit(18)}}><option value="">Tất cả đơn vị</option>{model.units.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select>
        <select value={className} onChange={e=>{setClassName(e.target.value);setLimit(18)}}><option value="">Tất cả lớp</option>{model.classes.map(x=><option key={x} value={x}>Lớp {x}</option>)}</select>
        <select value={role} onChange={e=>{setRole(e.target.value);setLimit(18)}}><option value="">Tất cả vai trò</option>{model.roles.map(x=><option key={x} value={x}>{x}</option>)}</select>
      </div>
      <div className="result-bar"><strong>{model.results.length}</strong><span>người phù hợp</span>{(query||unitId||className||role)&&<button type="button" onClick={reset}>Xóa bộ lọc</button>}</div>
    </div>
    <div className="people-grid">{model.results.slice(0,limit).map(({person,assignments,roles,unitNames})=><button className="person-card" type="button" key={person.id} onClick={()=>onPerson(person)}>
      <span className="person-card-avatar">{initials(person.name)}</span><span className="person-card-main"><strong>{person.name}</strong><small>{person.class_name?"Lớp "+person.class_name:"Học sinh"}</small></span>
      <span className="person-card-meta"><b>{roles[0]||"Thành viên"}</b><small>{unitNames[0]||"HĐHS DHT"}{assignments.length>1?" +"+(assignments.length-1):""}</small></span><span className="person-card-arrow">↗</span>
    </button>)}</div>
    {!model.results.length&&<div className="empty-state">Không tìm thấy hồ sơ phù hợp với bộ lọc này.</div>}
    {limit<model.results.length&&<button className="load-more" type="button" onClick={()=>setLimit(v=>v+18)}>Hiện thêm {Math.min(18,model.results.length-limit)} người</button>}
  </section>;
}

function Connect({ data }) {
  return <section className="connect-section section-shell" id="connect">
    <SectionLabel index={5}>Kết nối</SectionLabel>
    <div className="connect-copy"><p className="eyebrow">One school · many paths</p><h2>Mỗi node là một người.<br/>Giá trị nằm ở <em>đường nối.</em></h2><p>Website Pha 1 dừng ở việc làm rõ cơ cấu và con người. Những tính năng khác chỉ được thêm khi có nhu cầu thật từ hoạt động của học sinh.</p><a className="button primary" href="#top">Quay về đầu trang ↑</a></div>
    <div className="network-art" aria-hidden="true">{Array.from({length:18},(_,i)=><span key={i} style={{"--i":i}}/>)}<b>DHT</b></div>
    <footer className="site-footer"><span>HĐHS DHT · 2026–2027</span><span>Dữ liệu công khai · không chứa thông tin liên hệ cá nhân</span><span>{data?.people?.length||"—"} hồ sơ</span></footer>
  </section>;
}

function MobileDock() {
  return <nav className="mobile-dock"><a href="#top"><span>⌂</span><small>Đầu trang</small></a><a href="#structure"><span>⌘</span><small>Cơ cấu</small></a><a href="#units"><span>◫</span><small>Đơn vị</small></a><a href="#people"><span>◎</span><small>Con người</small></a></nav>;
}

function App() {
  const {loading,error,data}=usePublicData();
  const cinematic=useCinematicEnabled();
  const [person,setPerson]=useState(null);
  return <>
    <KageBackdrop enabled={cinematic}/><div className="site-noise" aria-hidden="true"/><Header/>
    <main><Hero data={data}/><About/>
      {loading&&<div className="data-state section-shell">Đang đọc dữ liệu tổ chức…</div>}
      {error&&<div className="data-state error section-shell">{error}</div>}
      <Structure data={data} onPerson={setPerson}/><Units data={data}/><People data={data} onPerson={setPerson}/><Connect data={data}/>
    </main>
    <MobileDock/><PersonModal person={person} data={data} onClose={()=>setPerson(null)}/>
  </>;
}

createRoot(document.getElementById("app")).render(<App/>);
