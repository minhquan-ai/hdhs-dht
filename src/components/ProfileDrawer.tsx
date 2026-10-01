import { useEffect } from "react";
import type { EnrichedUnit, Person } from "@/lib/data-loader";
import {
  IconX,
  IconArrowLeft,
  IconArrowUpRight,
  IconShield,
  IconFlame,
  IconSparkles,
  IconLayers,
  IconAward,
  IconAcademic,
  IconBuilding,
  IconUsers,
  IconIdCard,
} from "@/components/icons";

interface ProfileDrawerProps {
  unit: EnrichedUnit | null;
  selectedPerson: Person | null;
  onClose: () => void;
  onSelectPerson: (person: Person) => void;
  onBackToUnit: () => void;
  onSelectUnitById: (unitId: string) => void;
  allUnits: EnrichedUnit[];
}

export function ProfileDrawer({
  unit,
  selectedPerson,
  onClose,
  onSelectPerson,
  onBackToUnit,
  onSelectUnitById,
  allUnits,
}: ProfileDrawerProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!unit && !selectedPerson) return null;

  function getInitials(name: string) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (name[0] || "•").toUpperCase();
  }

  function getKindMeta(kind: string, id: string) {
    if (kind === "root" || id === "truong-dht")
      return { label: "Nhà trường", color: "bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 border-slate-700", icon: <IconBuilding className="w-3.5 h-3.5 text-slate-800 dark:text-slate-200" /> };
    if (kind === "school-leadership" || id === "bgh")
      return { label: "Ban Giám Hiệu", color: "bg-rose-100/90 text-rose-900 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30", icon: <IconShield className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" /> };
    if (kind === "school-organization" || id === "doan-truong" || id === "ban-trat-tu")
      return { label: "Đoàn Trường", color: "bg-sky-100/90 text-sky-900 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30", icon: <IconFlame className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400" /> };
    if (kind === "student-council" || id === "hdhs" || kind === "board" || id === "thuong-truc")
      return { label: "Thường Trực HĐHS", color: "bg-emerald-100/90 text-emerald-900 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40", icon: <IconSparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" /> };
    if (kind === "club" || id.includes("clb-"))
      return { label: "Câu Lạc Bộ", color: "bg-amber-100/90 text-amber-900 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30", icon: <IconAward className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" /> };
    if (["academic", "academic-hub", "academic-team"].includes(kind) || id.includes("hsg-"))
      return { label: "Học Thuật", color: "bg-indigo-100/90 text-indigo-900 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30", icon: <IconAcademic className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400" /> };
    if (["assembly", "group", "class"].includes(kind) || id === "dai-hoi" || id.startsWith("khoi-"))
      return { label: "Đại Diện Khối / Lớp", color: "bg-purple-100/90 text-purple-900 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30", icon: <IconUsers className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" /> };
    return { label: "Ban Chuyên Môn", color: "bg-cyan-100/90 text-cyan-900 border-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30", icon: <IconLayers className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-400" /> };
  }

  // Find parent unit name
  const parentUnit = unit?.parent_id ? allUnits.find((u) => u.id === unit.parent_id) : null;

  // Find all assignments for selected person
  const personAssignments = selectedPerson
    ? allUnits.flatMap((u) =>
        u.members
          .filter((m) => m.person.id === selectedPerson.id)
          .map((m) => ({ unit: u, roleTitle: m.roleTitle, assignment: m.assignment }))
      )
    : [];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-950/40 dark:bg-black/70 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Floating Card Drawer */}
      <aside className="fixed top-3 right-3 bottom-3 w-[420px] max-w-[calc(100vw-24px)] z-50 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/98 dark:bg-[#111726]/98 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-250 ease-out select-none text-slate-950 dark:text-slate-100 transition-colors">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 bg-white/90 dark:bg-[#111726]/90">
          <div className="flex items-center gap-2">
            {selectedPerson && unit ? (
              <button
                onClick={onBackToUnit}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition flex items-center gap-1 text-xs font-semibold"
                title="Quay lại hồ sơ đơn vị"
              >
                <IconArrowLeft className="w-3.5 h-3.5" />
                <span className="truncate max-w-[150px]">{unit.name}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                <IconIdCard className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>{selectedPerson ? "Hồ Sơ Nhân Sự" : "Hồ Sơ Đơn Vị"}</span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition active:scale-90"
            title="Đóng hồ sơ"
          >
            <IconX className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Drawer Body Scrollable */}
        <div className="p-5 sm:p-6 space-y-6 flex-1 overflow-y-auto">
          {/* VIEW 1: PERSON PROFILE */}
          {selectedPerson ? (
            <div className="space-y-6">
              {/* Person Header Card */}
              <div className="flex items-center gap-3.5 p-4 rounded-xl bg-stone-50 dark:bg-zinc-900/80 border border-stone-200/80 dark:border-zinc-800">
                <div className="w-13 h-13 rounded-xl bg-slate-950 dark:bg-zinc-100 text-white dark:text-zinc-950 font-serif font-bold text-base flex items-center justify-center shadow-xs flex-shrink-0">
                  {getInitials(selectedPerson.name)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-950 dark:text-zinc-100">
                    {selectedPerson.name}
                  </h2>
                  <div className="text-xs font-medium text-stone-600 dark:text-zinc-400 mt-0.5">
                    {selectedPerson.class_name ? `Lớp ${selectedPerson.class_name}` : "Học sinh THPT Đặng Huy Trứ"}
                  </div>
                  <div className="text-[11px] font-mono text-stone-400 dark:text-zinc-500 mt-0.5">
                    Mã định danh: {selectedPerson.id}
                  </div>
                </div>
              </div>

              {/* Person Assignments */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-400 mb-2.5">
                  Phân công & Chức vụ ({personAssignments.length})
                </h3>
                <div className="space-y-2">
                  {personAssignments.map((pa, idx) => (
                    <div
                      key={idx}
                      onClick={() => onSelectUnitById(pa.unit.id)}
                      className="p-3.5 rounded-xl border border-stone-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 hover:border-slate-800 dark:hover:border-zinc-600 cursor-pointer transition flex items-center justify-between gap-3 group"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-950 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition">
                          {pa.unit.name}
                        </div>
                        <div className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
                          Chức danh: <strong className="text-slate-800 dark:text-zinc-200 font-medium">{pa.roleTitle}</strong>
                        </div>
                      </div>
                      <IconArrowUpRight className="w-4 h-4 text-stone-400 dark:text-zinc-500 group-hover:text-slate-950 dark:group-hover:text-zinc-100 transition flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : unit ? (
            /* VIEW 2: UNIT PROFILE */
            <div className="space-y-6">
              {/* Unit Header */}
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getKindMeta(unit.kind, unit.id).color}`}>
                    {getKindMeta(unit.kind, unit.id).icon}
                    {getKindMeta(unit.kind, unit.id).label}
                  </span>
                  {unit.status && (
                    <span className="text-xs font-medium text-stone-600 dark:text-zinc-300 bg-stone-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full border border-stone-200 dark:border-zinc-700">
                      {unit.status}
                    </span>
                  )}
                  <span className="text-xs font-mono text-stone-400 dark:text-zinc-500 ml-auto">
                    Mã: {unit.id}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-slate-950 dark:text-zinc-100 leading-tight mb-2">
                  {unit.name}
                </h2>

                {parentUnit && (
                  <div className="text-xs text-stone-500 dark:text-zinc-400 flex items-center gap-1">
                    <span>Trực thuộc:</span>
                    <button
                      onClick={() => onSelectUnitById(parentUnit.id)}
                      className="font-semibold text-slate-800 dark:text-zinc-200 hover:underline"
                    >
                      {parentUnit.name}
                    </button>
                  </div>
                )}
              </div>

              {/* Summary / Purpose */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-zinc-900/80 border border-stone-200/80 dark:border-zinc-800">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-400 mb-1.5">
                  Mục đích & Chức năng
                </h3>
                <p className="text-xs sm:text-sm text-stone-700 dark:text-zinc-300 leading-relaxed font-normal">
                  {unit.summary || "Đơn vị thực hiện các nhiệm vụ theo kế hoạch hoạt động của Hội đồng Học sinh THPT Đặng Huy Trứ."}
                </p>
              </div>

              {/* Sub-Units (if any) */}
              {unit.subUnits && unit.subUnits.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-400 mb-2.5">
                    Đơn vị trực thuộc ({unit.subUnits.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {unit.subUnits.map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => onSelectUnitById(sub.id)}
                        className="p-2.5 rounded-lg border border-stone-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 hover:border-slate-800 dark:hover:border-zinc-600 cursor-pointer transition text-xs font-semibold text-slate-950 dark:text-zinc-100 flex items-center justify-between group"
                      >
                        <span className="group-hover:text-emerald-700 dark:group-hover:text-emerald-400 truncate">{sub.name}</span>
                        <IconArrowUpRight className="w-3.5 h-3.5 text-stone-400 dark:text-zinc-500 group-hover:text-slate-950 dark:group-hover:text-zinc-100 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Roles in Unit */}
              {unit.roles.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-400 mb-2.5">
                    Chức danh biên chế ({unit.roles.length})
                  </h3>
                  <div className="space-y-1.5">
                    {unit.roles.map((r) => (
                      <div key={r.id} className="p-2.5 rounded-lg bg-stone-50 dark:bg-zinc-900/80 border border-stone-200/70 dark:border-zinc-800 text-xs">
                        <div className="font-semibold text-slate-950 dark:text-zinc-100">{r.title}</div>
                        {r.summary && (
                          <div className="text-stone-500 dark:text-zinc-400 mt-0.5">{r.summary}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assigned Members */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-400">
                    Nhân sự chính thức ({unit.members.length})
                  </h3>
                  <span className="text-[11px] text-stone-400 dark:text-zinc-500">Bấm tên để xem hồ sơ</span>
                </div>

                {unit.members.length === 0 ? (
                  <div className="p-4 rounded-lg bg-stone-50 dark:bg-zinc-900/80 border border-dashed border-stone-200 dark:border-zinc-800 text-center text-xs text-stone-500 dark:text-zinc-400">
                    Chưa có nhân sự công khai được phân công cho đơn vị này.
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100 dark:divide-zinc-800/80 border border-stone-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    {unit.members.map((m, idx) => (
                      <div
                        key={idx}
                        onClick={() => onSelectPerson(m.person)}
                        className="p-3 flex items-center justify-between gap-3 bg-white dark:bg-zinc-900/90 hover:bg-stone-50 dark:hover:bg-zinc-800/80 cursor-pointer transition select-none group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-950 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold text-[10px] flex items-center justify-center">
                            {getInitials(m.person.name)}
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-slate-950 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition">
                              {m.person.name}
                            </div>
                            <div className="text-[10px] text-stone-400 dark:text-zinc-500">
                              {m.person.class_name ? `Lớp ${m.person.class_name}` : "Học sinh"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 text-[11px] font-medium border border-stone-200 dark:border-zinc-700">
                            {m.roleTitle}
                          </span>
                          <IconArrowUpRight className="w-3.5 h-3.5 text-stone-400 dark:text-zinc-500 group-hover:text-slate-950 dark:group-hover:text-zinc-100 transition" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Drawer Footer */}
        <div className="p-3.5 sm:p-4 border-t border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-900/90 flex items-center justify-between gap-2">
          {unit && (
            <a
              href={`./people/?unit=${unit.id}`}
              className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              Xem trong Danh bạ <IconArrowUpRight className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            onClick={onClose}
            className="ml-auto px-4 py-1.5 bg-slate-950 dark:bg-zinc-100 text-white dark:text-zinc-950 rounded-lg text-xs font-semibold hover:bg-slate-800 dark:hover:bg-zinc-200 transition active:scale-95"
          >
            Đóng
          </button>
        </div>
      </aside>
    </>
  );
}
