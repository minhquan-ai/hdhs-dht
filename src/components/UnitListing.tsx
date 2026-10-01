import { useState, useMemo } from "react";
import type { EnrichedUnit } from "@/lib/data-loader";
import {
  IconUsers,
  IconSearch,
  IconX,
  IconIdCard,
  IconShield,
  IconFlame,
  IconSparkles,
  IconLayers,
  IconAward,
  IconAcademic,
  IconBuilding,
} from "@/components/icons";

interface UnitListingProps {
  units: EnrichedUnit[];
  onSelectUnit: (unit: EnrichedUnit) => void;
  selectedUnitId?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function UnitListing({
  units,
  onSelectUnit,
  selectedUnitId,
  searchQuery,
  onSearchChange,
}: UnitListingProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "Tất cả" },
    { id: "leadership", label: "Chỉ Đạo & Điều Hành" },
    { id: "departments", label: "Ban Chuyên Môn" },
    { id: "clubs", label: "Câu Lạc Bộ" },
    { id: "academic", label: "Đội Tuyển Học Thuật" },
    { id: "assembly", label: "Đại Diện Học Sinh" },
  ];

  function getKindMeta(kind: string, id: string) {
    if (kind === "root" || id === "truong-dht") {
      return {
        label: "Nhà trường",
        card: "border border-slate-300 dark:border-slate-700 border-l-4 border-l-slate-900 dark:border-l-slate-300 bg-white dark:bg-[#151c2e] hover:border-slate-400 dark:hover:border-slate-600 shadow-2xs hover:shadow-md",
        badge: "bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 border border-slate-900 dark:border-slate-700 font-semibold",
        iconBox: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200",
        icon: <IconBuilding className="w-3.5 h-3.5 text-slate-800 dark:text-slate-200" />,
        accent: "group-hover:text-slate-950 dark:group-hover:text-white",
      };
    }
    if (kind === "school-leadership" || id === "bgh") {
      return {
        label: "Ban Giám Hiệu",
        card: "border border-slate-200 dark:border-slate-800 border-l-4 border-l-rose-500 dark:border-l-rose-400 bg-white dark:bg-[#151c2e] hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-md",
        badge: "bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800/60 font-semibold",
        iconBox: "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400",
        icon: <IconShield className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" />,
        accent: "group-hover:text-rose-700 dark:group-hover:text-rose-400",
      };
    }
    if (kind === "school-organization" || id === "doan-truong" || id === "ban-trat-tu") {
      return {
        label: "Đoàn Trường",
        card: "border border-slate-200 dark:border-slate-800 border-l-4 border-l-sky-500 dark:border-l-sky-400 bg-white dark:bg-[#151c2e] hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-md",
        badge: "bg-sky-100 text-sky-800 border border-sky-300 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800/60 font-semibold",
        iconBox: "bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-400",
        icon: <IconFlame className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400" />,
        accent: "group-hover:text-sky-700 dark:group-hover:text-sky-400",
      };
    }
    if (kind === "student-council" || id === "hdhs" || kind === "board" || id === "thuong-truc") {
      return {
        label: "Thường Trực HĐHS",
        card: "border border-slate-200 dark:border-slate-800 border-l-4 border-l-emerald-600 dark:border-l-emerald-400 bg-white dark:bg-[#151c2e] hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-md",
        badge: "bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/60 font-semibold",
        iconBox: "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300",
        icon: <IconSparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />,
        accent: "group-hover:text-emerald-700 dark:group-hover:text-emerald-400",
      };
    }
    if (kind === "club" || id.includes("clb-")) {
      return {
        label: "Câu Lạc Bộ",
        card: "border border-slate-200 dark:border-slate-800 border-l-4 border-l-amber-500 dark:border-l-amber-400 bg-white dark:bg-[#151c2e] hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-md",
        badge: "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800/60 font-semibold",
        iconBox: "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-400",
        icon: <IconAward className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />,
        accent: "group-hover:text-amber-700 dark:group-hover:text-amber-400",
      };
    }
    if (["academic", "academic-hub", "academic-team"].includes(kind) || id.includes("hsg-") || id.includes("dt-")) {
      return {
        label: "Học Thuật",
        card: "border border-slate-200 dark:border-slate-800 border-l-4 border-l-indigo-600 dark:border-l-indigo-400 bg-white dark:bg-[#151c2e] hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-md",
        badge: "bg-indigo-100 text-indigo-900 border border-indigo-300 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800/60 font-semibold",
        iconBox: "bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-400",
        icon: <IconAcademic className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400" />,
        accent: "group-hover:text-indigo-700 dark:group-hover:text-indigo-400",
      };
    }
    if (["assembly", "group", "class"].includes(kind) || id === "dai-hoi" || id.startsWith("khoi-")) {
      return {
        label: "Đại Diện Khối / Lớp",
        card: "border border-slate-200 dark:border-slate-800 border-l-4 border-l-purple-600 dark:border-l-purple-400 bg-white dark:bg-[#151c2e] hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-md",
        badge: "bg-purple-100 text-purple-900 border border-purple-300 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800/60 font-semibold",
        iconBox: "bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-400",
        icon: <IconUsers className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />,
        accent: "group-hover:text-purple-700 dark:group-hover:text-purple-400",
      };
    }
    // Specific departments
    if (id === "ban-truyen-thong") {
      return {
        label: "Ban Chuyên Môn",
        card: "border border-slate-200 dark:border-slate-800 border-l-4 border-l-cyan-500 dark:border-l-cyan-400 bg-white dark:bg-[#151c2e] hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-md",
        badge: "bg-cyan-100 text-cyan-900 border border-cyan-300 dark:bg-cyan-950/70 dark:text-cyan-300 font-semibold",
        iconBox: "bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-400",
        icon: <IconLayers className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-400" />,
        accent: "group-hover:text-cyan-700 dark:group-hover:text-cyan-400",
      };
    }
    if (id === "ban-su-kien") {
      return {
        label: "Ban Chuyên Môn",
        card: "border border-slate-200 dark:border-slate-800 border-l-4 border-l-orange-500 dark:border-l-orange-400 bg-white dark:bg-[#151c2e] hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-md",
        badge: "bg-orange-100 text-orange-900 border border-orange-300 dark:bg-orange-950/70 dark:text-orange-300 font-semibold",
        iconBox: "bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-400",
        icon: <IconLayers className="w-3.5 h-3.5 text-orange-700 dark:text-orange-400" />,
        accent: "group-hover:text-orange-700 dark:group-hover:text-orange-400",
      };
    }
    if (id === "ban-nhan-su") {
      return {
        label: "Ban Chuyên Môn",
        card: "border border-slate-200 dark:border-slate-800 border-l-4 border-l-blue-600 dark:border-l-blue-400 bg-white dark:bg-[#151c2e] hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-md",
        badge: "bg-blue-100 text-blue-900 border border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 font-semibold",
        iconBox: "bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-400",
        icon: <IconLayers className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />,
        accent: "group-hover:text-blue-700 dark:group-hover:text-blue-400",
      };
    }
    if (id === "ban-hoc-tap") {
      return {
        label: "Ban Chuyên Môn",
        card: "border border-slate-200 dark:border-slate-800 border-l-4 border-l-violet-600 dark:border-l-violet-400 bg-white dark:bg-[#151c2e] hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-md",
        badge: "bg-violet-100 text-violet-900 border border-violet-300 dark:bg-violet-950/70 dark:text-violet-300 font-semibold",
        iconBox: "bg-violet-100 dark:bg-violet-950/80 text-violet-800 dark:text-violet-400",
        icon: <IconLayers className="w-3.5 h-3.5 text-violet-700 dark:text-violet-400" />,
        accent: "group-hover:text-violet-700 dark:group-hover:text-violet-400",
      };
    }
    if (id === "ban-hau-can") {
      return {
        label: "Ban Chuyên Môn",
        card: "border border-slate-200 dark:border-slate-800 border-l-4 border-l-teal-600 dark:border-l-teal-400 bg-white dark:bg-[#151c2e] hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-md",
        badge: "bg-teal-100 text-teal-900 border border-teal-300 dark:bg-teal-950/70 dark:text-teal-300 font-semibold",
        iconBox: "bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-400",
        icon: <IconLayers className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />,
        accent: "group-hover:text-teal-700 dark:group-hover:text-teal-400",
      };
    }
    return {
      label: "Ban Chuyên Môn",
      card: "border border-slate-200 dark:border-slate-800 border-l-4 border-l-slate-400 dark:border-l-slate-500 bg-white dark:bg-[#151c2e] hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-md",
      badge: "bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 font-semibold",
      iconBox: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
      icon: <IconLayers className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />,
      accent: "group-hover:text-slate-900 dark:group-hover:text-white",
    };
  }

  const filteredUnits = useMemo(() => {
    return units.filter((u) => {
      if (u.id === "truong-dht" || u.kind === "root") return false;

      // Filter by category
      if (activeCategory === "leadership") {
        if (!["school-leadership", "school-organization", "student-council", "board"].includes(u.kind) && u.id !== "hdhs")
          return false;
      } else if (activeCategory === "departments") {
        if (!["department", "oversight"].includes(u.kind) && !u.id.includes("ban-")) return false;
      } else if (activeCategory === "clubs") {
        if (u.kind !== "club" && !u.id.includes("clb-")) return false;
      } else if (activeCategory === "academic") {
        if (!["academic", "academic-hub", "academic-team"].includes(u.kind) && !u.id.includes("hsg-") && !u.id.includes("dt-"))
          return false;
      } else if (activeCategory === "assembly") {
        if (!["assembly", "group", "class"].includes(u.kind)) return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = u.name.toLowerCase().includes(query);
        const matchSummary = (u.summary || "").toLowerCase().includes(query);
        const matchLeader = (u.leaderName || "").toLowerCase().includes(query);
        const matchMembers = u.members.some((m) => m.person.name.toLowerCase().includes(query));
        return matchName || matchSummary || matchLeader || matchMembers;
      }

      return true;
    });
  }, [units, activeCategory, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-white/95 dark:bg-[#111726]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs transition-colors">
        {/* Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                activeCategory === cat.id
                  ? "bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 shadow-xs"
                  : "bg-slate-100/80 dark:bg-slate-800/70 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Tìm theo tên đơn vị, nhân sự..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-1.5 pl-8 pr-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-900 dark:focus:border-slate-400 transition"
          />
          <IconSearch className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-2" />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <IconX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Counter bar */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <span>Hiển thị <strong className="text-slate-800 dark:text-slate-200">{filteredUnits.length}</strong> đơn vị</span>
        <span>Bấm vào thẻ bất kỳ để xem hồ sơ chi tiết</span>
      </div>

      {/* Listing Content */}
      {filteredUnits.length === 0 ? (
        <div className="p-12 text-center bg-white/80 dark:bg-[#111726]/80 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
            Không tìm thấy đơn vị nào
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Không có kết quả khớp với "{searchQuery}".
          </p>
          <button
            onClick={() => {
              onSearchChange("");
              setActiveCategory("all");
            }}
            className="px-3.5 py-1.5 rounded-lg bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredUnits.map((unit) => {
            const meta = getKindMeta(unit.kind, unit.id);
            const isSelected = selectedUnitId === unit.id;

            return (
              <div
                key={unit.id}
                onClick={() => onSelectUnit(unit)}
                className={`group flex items-center justify-between gap-4 p-3.5 sm:px-4 border rounded-xl cursor-pointer transition select-none active:scale-[0.99] shadow-2xs ${
                  isSelected
                    ? "ring-2 ring-emerald-500 dark:ring-emerald-400 border-emerald-500 dark:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/40"
                    : meta.card
                }`}
              >
                {/* Left info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg ${meta.iconBox} flex items-center justify-center flex-shrink-0 transition-colors`}>
                    {meta.icon}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-semibold text-sm text-slate-950 dark:text-slate-100 ${meta.accent} transition`}>
                        {unit.name}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${meta.badge}`}>
                        {meta.label}
                      </span>
                      {unit.status && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium hidden sm:inline">
                          • {unit.status}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                      {unit.leaderName && (
                        <span>
                          Phụ trách: <strong className="text-slate-800 dark:text-slate-200 font-medium">{unit.leaderName}</strong>
                        </span>
                      )}
                      {unit.summary && (
                        <span className="text-slate-400 dark:text-slate-500 truncate max-w-xs hidden lg:inline">
                          {unit.summary}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {unit.memberCount > 0 ? `${unit.memberCount} nhân sự` : `${unit.roles.length} vị trí`}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                      {unit.id}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectUnit(unit);
                    }}
                    className="p-1.5 rounded-lg bg-black/5 dark:bg-white/10 group-hover:bg-slate-950 dark:group-hover:bg-slate-100 group-hover:text-white dark:group-hover:text-slate-950 text-slate-600 dark:text-slate-300 transition flex items-center gap-1.5 text-xs font-semibold px-2.5 active:scale-95"
                  >
                    <IconIdCard className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Hồ sơ</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
