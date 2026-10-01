import React, { useState, useMemo } from "react";
import type { EnrichedUnit } from "@/lib/data-loader";
import {
  IconBuilding,
  IconShield,
  IconFlame,
  IconSparkles,
  IconLayers,
  IconAward,
  IconAcademic,
  IconUsers,
  IconIdCard,
  IconSearch,
  IconChevronDown,
  IconChevronRight,
  IconX,
} from "@/components/icons";

interface OrgTreeProps {
  rootUnits: EnrichedUnit[];
  allUnits: EnrichedUnit[];
  onSelectUnit: (unit: EnrichedUnit) => void;
  selectedUnitId?: string;
}

// Harmonious branch styling with crisp color definition for Light and Dark modes
function getUnitTheme(unit: EnrichedUnit) {
  // 1. Trường THPT Đặng Huy Trứ (Root)
  if (unit.id === "truong-dht" || unit.kind === "root") {
    return {
      card: "border border-slate-300 dark:border-slate-700 border-l-4 border-l-slate-900 dark:border-l-slate-300 bg-white dark:bg-[#151c2e] shadow-sm hover:shadow-md",
      badge: "bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 border border-slate-900 dark:border-slate-700",
      iconBox: "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200",
      accent: "group-hover:text-slate-950 dark:group-hover:text-white",
    };
  }
  // 2. Ban Giám Hiệu (BGH)
  if (unit.id === "bgh" || unit.kind === "school-leadership") {
    return {
      card: "border border-slate-200 dark:border-slate-800 border-l-4 border-l-rose-500 dark:border-l-rose-400 bg-white dark:bg-[#151c2e] shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700",
      badge: "bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800/60 font-semibold",
      iconBox: "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300",
      accent: "group-hover:text-rose-700 dark:group-hover:text-rose-400",
    };
  }
  // 3. Đoàn Trường / Ban Trật Tự
  if (unit.id === "doan-truong" || unit.id === "ban-trat-tu" || unit.kind === "school-organization") {
    return {
      card: "border border-slate-200 dark:border-slate-800 border-l-4 border-l-sky-500 dark:border-l-sky-400 bg-white dark:bg-[#151c2e] shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700",
      badge: "bg-sky-100 text-sky-800 border border-sky-300 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800/60 font-semibold",
      iconBox: "bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300",
      accent: "group-hover:text-sky-700 dark:group-hover:text-sky-400",
    };
  }
  // 4. Hội Đồng Học Sinh (HĐHS) & Thường Trực
  if (unit.id === "hdhs" || unit.id === "thuong-truc" || unit.kind === "student-council" || unit.kind === "board") {
    return {
      card: "border border-slate-200 dark:border-slate-800 border-l-4 border-l-emerald-600 dark:border-l-emerald-400 bg-white dark:bg-[#151c2e] shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700",
      badge: "bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/60 font-semibold",
      iconBox: "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300",
      accent: "group-hover:text-emerald-700 dark:group-hover:text-emerald-400",
    };
  }
  // 5. Câu Lạc Bộ
  if (unit.id.startsWith("clb-") || unit.kind === "club") {
    return {
      card: "border border-slate-200 dark:border-slate-800 border-l-4 border-l-amber-500 dark:border-l-amber-400 bg-white dark:bg-[#151c2e] shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700",
      badge: "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800/60 font-semibold",
      iconBox: "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300",
      accent: "group-hover:text-amber-700 dark:group-hover:text-amber-400",
    };
  }
  // 6. Đội Học Thuật
  if (unit.id.startsWith("hsg-") || unit.kind === "academic-team" || unit.kind === "academic" || unit.kind === "academic-hub") {
    return {
      card: "border border-slate-200 dark:border-slate-800 border-l-4 border-l-indigo-600 dark:border-l-indigo-400 bg-white dark:bg-[#151c2e] shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700",
      badge: "bg-indigo-100 text-indigo-900 border border-indigo-300 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800/60 font-semibold",
      iconBox: "bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300",
      accent: "group-hover:text-indigo-700 dark:group-hover:text-indigo-400",
    };
  }
  // 7. Đại Diện Lớp & Khối
  if (unit.id === "dai-hoi" || unit.id.startsWith("khoi-") || unit.kind === "assembly" || unit.kind === "group" || unit.kind === "class") {
    return {
      card: "border border-slate-200 dark:border-slate-800 border-l-4 border-l-purple-600 dark:border-l-purple-400 bg-white dark:bg-[#151c2e] shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700",
      badge: "bg-purple-100 text-purple-900 border border-purple-300 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800/60 font-semibold",
      iconBox: "bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300",
      accent: "group-hover:text-purple-700 dark:group-hover:text-purple-400",
    };
  }
  // 8. Ban Chuyên Môn - Distinct per department!
  if (unit.id === "ban-truyen-thong") {
    return {
      card: "border border-slate-200 dark:border-slate-800 border-l-4 border-l-cyan-500 dark:border-l-cyan-400 bg-white dark:bg-[#151c2e] shadow-2xs hover:shadow-md",
      badge: "bg-cyan-100 text-cyan-900 border border-cyan-300 dark:bg-cyan-950/70 dark:text-cyan-300 font-semibold",
      iconBox: "bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300",
      accent: "group-hover:text-cyan-700 dark:group-hover:text-cyan-400",
    };
  }
  if (unit.id === "ban-su-kien") {
    return {
      card: "border border-slate-200 dark:border-slate-800 border-l-4 border-l-orange-500 dark:border-l-orange-400 bg-white dark:bg-[#151c2e] shadow-2xs hover:shadow-md",
      badge: "bg-orange-100 text-orange-900 border border-orange-300 dark:bg-orange-950/70 dark:text-orange-300 font-semibold",
      iconBox: "bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-400",
      accent: "group-hover:text-orange-700 dark:group-hover:text-orange-400",
    };
  }
  if (unit.id === "ban-nhan-su") {
    return {
      card: "border border-slate-200 dark:border-slate-800 border-l-4 border-l-blue-600 dark:border-l-blue-400 bg-white dark:bg-[#151c2e] shadow-2xs hover:shadow-md",
      badge: "bg-blue-100 text-blue-900 border border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 font-semibold",
      iconBox: "bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-400",
      accent: "group-hover:text-blue-700 dark:group-hover:text-blue-400",
    };
  }
  if (unit.id === "ban-hoc-tap") {
    return {
      card: "border border-slate-200 dark:border-slate-800 border-l-4 border-l-violet-600 dark:border-l-violet-400 bg-white dark:bg-[#151c2e] shadow-2xs hover:shadow-md",
      badge: "bg-violet-100 text-violet-900 border border-violet-300 dark:bg-violet-950/70 dark:text-violet-300 font-semibold",
      iconBox: "bg-violet-100 dark:bg-violet-950/80 text-violet-800 dark:text-violet-400",
      accent: "group-hover:text-violet-700 dark:group-hover:text-violet-400",
    };
  }
  if (unit.id === "ban-hau-can") {
    return {
      card: "border border-slate-200 dark:border-slate-800 border-l-4 border-l-teal-600 dark:border-l-teal-400 bg-white dark:bg-[#151c2e] shadow-2xs hover:shadow-md",
      badge: "bg-teal-100 text-teal-900 border border-teal-300 dark:bg-teal-950/70 dark:text-teal-300 font-semibold",
      iconBox: "bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-400",
      accent: "group-hover:text-teal-700 dark:group-hover:text-teal-400",
    };
  }
  // Generic department fallback
  return {
    card: "border border-slate-200 dark:border-slate-800 border-l-4 border-l-slate-400 dark:border-l-slate-500 bg-white dark:bg-[#151c2e] shadow-2xs hover:shadow-md",
    badge: "bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 font-semibold",
    iconBox: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
    accent: "group-hover:text-slate-900 dark:group-hover:text-white",
  };
}

export function OrgTree({ allUnits, onSelectUnit, selectedUnitId }: OrgTreeProps) {
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"all" | "departments" | "clubs" | "academic" | "classes">("all");
  const [expandedGrade, setExpandedGrade] = useState<string | null>(null);

  const unitMap = useMemo(() => {
    return new Map<string, EnrichedUnit>(allUnits.map((u) => [u.id, u]));
  }, [allUnits]);

  // Primary Anchor Units
  const schoolRoot = unitMap.get("truong-dht");
  const bgh = unitMap.get("bgh");
  const doanTruong = unitMap.get("doan-truong");
  const banTratTu = unitMap.get("ban-trat-tu");
  const hdhs = unitMap.get("hdhs");
  const thuongTruc = unitMap.get("thuong-truc");
  const assembly = unitMap.get("dai-hoi");

  // Functional Blocks
  const departments = useMemo(() => {
    return allUnits.filter(
      (u) =>
        (u.kind === "department" || u.id.startsWith("ban-")) &&
        u.id !== "ban-trat-tu"
    );
  }, [allUnits]);

  const clubs = useMemo(() => {
    return allUnits.filter((u) => u.kind === "club" || u.id.startsWith("clb-"));
  }, [allUnits]);

  const academicTeams = useMemo(() => {
    return allUnits.filter(
      (u) =>
        u.kind === "academic-team" ||
        u.kind === "academic" ||
        u.id.startsWith("hsg-")
    );
  }, [allUnits]);

  const grades = useMemo(() => {
    return ["khoi-10", "khoi-11", "khoi-12"]
      .map((id) => unitMap.get(id))
      .filter(Boolean) as EnrichedUnit[];
  }, [unitMap]);

  // Check search filter match
  const matchesSearch = (unit?: EnrichedUnit) => {
    if (!unit) return false;
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      unit.name.toLowerCase().includes(q) ||
      (unit.leaderName && unit.leaderName.toLowerCase().includes(q)) ||
      unit.id.toLowerCase().includes(q)
    );
  };

  // Reusable Harmonious Node Card
  function UnitCard({
    unit,
    badge,
    icon,
  }: {
    unit: EnrichedUnit;
    badge?: string;
    icon?: React.ReactNode;
  }) {
    const theme = getUnitTheme(unit);
    const isSelected = selectedUnitId === unit.id;
    const isMatched = matchesSearch(unit);

    return (
      <div
        onClick={() => onSelectUnit(unit)}
        className={`group relative rounded-xl border p-3.5 transition-all duration-150 ease-out cursor-pointer select-none active:scale-[0.99] ${
          isSelected
            ? "ring-2 ring-emerald-500 dark:ring-emerald-400 border-emerald-500 dark:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-sm"
            : theme.card
        } ${isMatched ? "opacity-100" : "opacity-30"}`}
      >
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            {icon && (
              <div className={`w-5 h-5 rounded-md ${theme.iconBox} flex items-center justify-center flex-shrink-0 transition-colors`}>
                {icon}
              </div>
            )}
            <span
              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border truncate ${theme.badge}`}
            >
              {badge || unit.status || "Đơn vị"}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectUnit(unit);
            }}
            className="w-5 h-5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 dark:text-slate-500 group-hover:text-slate-950 dark:group-hover:text-white flex items-center justify-center transition flex-shrink-0"
            title="Xem hồ sơ chi tiết"
          >
            <IconIdCard className="w-3.5 h-3.5" />
          </button>
        </div>

        <h4 className={`font-semibold text-xs sm:text-sm text-slate-950 dark:text-slate-100 ${theme.accent} transition leading-snug line-clamp-1 mb-1`}>
          {unit.name}
        </h4>

        {unit.leaderName ? (
          <div className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1 mb-2">
            Phụ trách: <strong className="text-slate-800 dark:text-slate-200 font-medium">{unit.leaderName}</strong>
          </div>
        ) : (
          <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">
            {unit.summary || "Đơn vị cơ cấu HĐHS"}
          </div>
        )}

        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <IconUsers className="w-2.5 h-2.5 text-slate-400 dark:text-slate-500" />
            {unit.memberCount > 0 ? `${unit.memberCount} nhân sự` : `${unit.roles.length} vị trí`}
          </span>
          <span className="font-mono text-[9px] text-slate-400 dark:text-slate-500 uppercase">
            {unit.id}
          </span>
        </div>
      </div>
    );
  }

  // Vertical Connector Line
  const Connector = () => (
    <div className="flex justify-center my-2">
      <div className="w-px h-6 bg-slate-300 dark:bg-slate-700" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Top Filter Bar: Simple & Focused */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white/95 dark:bg-[#111726]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs transition-colors">
        {/* Branch Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "Toàn bộ cơ cấu" },
            { id: "departments", label: `Ban Chuyên Môn (${departments.length})` },
            { id: "clubs", label: `Câu Lạc Bộ (${clubs.length})` },
            { id: "academic", label: `Đội Học Thuật (${academicTeams.length})` },
            { id: "classes", label: "Đại Diện Lớp (41)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                activeTab === tab.id
                  ? "bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 shadow-xs"
                  : "bg-slate-100/80 dark:bg-slate-800/70 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Lọc nhanh đơn vị trong cây..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full px-3 py-1.5 pl-8 pr-7 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-900 dark:focus:border-slate-400 transition"
          />
          <IconSearch className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-2" />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter("")}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <IconX className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Hierarchy Container */}
      <div className="p-4 sm:p-6 bg-white/95 dark:bg-[#111726]/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-xs transition-colors">
        {/* ================= LEVEL 1: NÚT GỐC NHÀ TRƯỜNG ================= */}
        {schoolRoot && (
          <div className="max-w-md mx-auto">
            <UnitCard
              unit={schoolRoot}
              badge="Nút Gốc · Cấp Chủ Quản"
              icon={<IconBuilding className="w-3.5 h-3.5 text-slate-800 dark:text-slate-200" />}
            />
          </div>
        )}

        <Connector />

        {/* ================= LEVEL 2: CHỈ ĐẠO & PHỐI HỢP ================= */}
        <div className="space-y-2">
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/70 px-2.5 py-0.5 rounded-full">
              Cấp Chỉ Đạo & Phối Hợp
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto pt-1">
            {/* Ban Giám Hiệu */}
            {bgh && (
              <UnitCard
                unit={bgh}
                badge="Chỉ Đạo & Phê Duyệt"
                icon={<IconShield className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" />}
              />
            )}

            {/* Đoàn Trường & Ban Trật Tự */}
            {doanTruong && (
              <div className="space-y-2">
                <UnitCard
                  unit={doanTruong}
                  badge="Định Hướng Phong Trào"
                  icon={<IconFlame className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400" />}
                />
                {banTratTu && (
                  <div className="pl-3 border-l-2 border-sky-300/80 dark:border-sky-800/60">
                    <UnitCard
                      unit={banTratTu}
                      badge="Giám sát nề nếp"
                      icon={<IconShield className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400" />}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <Connector />

        {/* ================= LEVEL 3: HỘI ĐỒNG HỌC SINH (HĐHS) ================= */}
        <div className="space-y-2">
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
              Tổ Chức Tự Quản Học Sinh
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto pt-1">
            {hdhs && (
              <UnitCard
                unit={hdhs}
                badge="Đại Diện Học Sinh"
                icon={<IconSparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />}
              />
            )}

            {thuongTruc && (
              <UnitCard
                unit={thuongTruc}
                badge="Thường Trực Điều Hành"
                icon={<IconSparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />}
              />
            )}
          </div>
        </div>

        <Connector />

        {/* ================= LEVEL 4: CÁC KHỐI TRỰC THUỘC ================= */}
        <div className="space-y-6 pt-1">
          {/* 1. KHỐI BAN CHUYÊN MÔN */}
          {(activeTab === "all" || activeTab === "departments") && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <IconLayers className="w-4 h-4 text-cyan-700 dark:text-cyan-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-950 dark:text-slate-100">
                    Khối Ban Chuyên Môn
                  </h3>
                </div>
                <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  {departments.length} Ban
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {departments.map((dept) => (
                  <UnitCard
                    key={dept.id}
                    unit={dept}
                    badge={dept.name}
                    icon={<IconLayers className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 2. KHỐI CÂU LẠC BỘ */}
          {(activeTab === "all" || activeTab === "clubs") && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <IconAward className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-950 dark:text-slate-100">
                    Khối Câu Lạc Bộ
                  </h3>
                </div>
                <span className="text-[10px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200/70 dark:border-amber-800/40">
                  {clubs.length} Câu Lạc Bộ
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {clubs.map((club) => (
                  <UnitCard
                    key={club.id}
                    unit={club}
                    badge="Câu Lạc Bộ"
                    icon={<IconAward className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 3. KHỐI ĐỘI TUYỂN HỌC THUẬT */}
          {(activeTab === "all" || activeTab === "academic") && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <IconAcademic className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-950 dark:text-slate-100">
                    Khối Đội Tuyển Học Thuật
                  </h3>
                </div>
                <span className="text-[10px] font-semibold text-indigo-800 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-full border border-indigo-200/70 dark:border-indigo-800/40">
                  {academicTeams.length} Đội Tuyển
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {academicTeams.map((team) => (
                  <UnitCard
                    key={team.id}
                    unit={team}
                    badge="Đội Học Thuật"
                    icon={<IconAcademic className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400" />}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 4. KHỐI ĐẠI HỘI & 41 LỚP HỌC */}
          {(activeTab === "all" || activeTab === "classes") && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <IconUsers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-950 dark:text-slate-100">
                    Khối Đại Diện Học Sinh & Lớp Học
                  </h3>
                </div>
                <span className="text-[10px] font-semibold text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-full border border-purple-200/70 dark:border-purple-800/40">
                  41 Lớp qua 3 Khối
                </span>
              </div>

              {/* Đại hội Đại biểu */}
              {assembly && (
                <div className="max-w-md mx-auto mb-3">
                  <UnitCard
                    unit={assembly}
                    badge="Cơ quan quyền lực cao nhất"
                    icon={<IconUsers className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />}
                  />
                </div>
              )}

              {/* 3 Khối Lớp */}
              <div className="space-y-2">
                {grades.map((grade) => {
                  const isGradeExpanded = expandedGrade === grade.id;
                  const classCount = grade.subUnits.length;

                  return (
                    <div
                      key={grade.id}
                      className="rounded-xl border border-purple-200/70 dark:border-purple-900/40 bg-purple-50/20 dark:bg-purple-950/15 overflow-hidden transition-colors"
                    >
                      <div
                        onClick={() =>
                          setExpandedGrade(isGradeExpanded ? null : grade.id)
                        }
                        className="flex items-center justify-between p-3 cursor-pointer hover:bg-purple-100/50 dark:hover:bg-purple-900/30 transition select-none"
                      >
                        <div className="flex items-center gap-2">
                          {isGradeExpanded ? (
                            <IconChevronDown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          ) : (
                            <IconChevronRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          )}
                          <span className="text-xs font-bold text-slate-950 dark:text-slate-100">
                            {grade.name}
                          </span>
                          <span className="text-[10px] text-purple-700 dark:text-purple-300 font-medium">
                            ({classCount} lớp)
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectUnit(grade);
                          }}
                          className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 hover:underline"
                        >
                          Hồ sơ khối
                        </button>
                      </div>

                      {/* Expanded Class Chips */}
                      {isGradeExpanded && (
                        <div className="p-3 pt-0 border-t border-purple-200/50 dark:border-purple-900/40">
                          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-1.5 pt-2.5">
                            {grade.subUnits.map((child) => (
                              <button
                                key={child.id}
                                onClick={() => onSelectUnit(child)}
                                className={`px-2 py-1.5 rounded-lg border text-center text-xs font-medium transition active:scale-95 ${
                                  selectedUnitId === child.id
                                    ? "bg-purple-600 text-white border-purple-600 dark:bg-purple-600 dark:text-white"
                                    : "bg-white dark:bg-slate-900 border-purple-200 dark:border-purple-900/60 text-slate-800 dark:text-slate-200 hover:border-purple-400 dark:hover:border-purple-600"
                                }`}
                              >
                                {child.name.replace(`Khối ${grade.name.slice(-2)} - `, "")}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
