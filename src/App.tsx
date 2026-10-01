import { useState, useMemo, useEffect, useRef } from "react";
import { loadStaticData, type EnrichedUnit, type Person } from "@/lib/data-loader";
import { OrgTree } from "@/components/OrgTree";
import { UnitListing } from "@/components/UnitListing";
import { ProfileDrawer } from "@/components/ProfileDrawer";
import {
  IconSitemap,
  IconListDetails,
  IconUsers,
  IconShield,
  IconSun,
  IconMoon,
} from "@/components/icons";

export default function App() {
  const { rootUnits, enrichedUnits, people } = useMemo(() => loadStaticData(), []);

  // Theme state: default to 'dark' to solve bright/washed-out feedback, persisted in localStorage
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("hdhs_theme");
    return (saved as "dark" | "light") || "dark";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("hdhs_theme", theme);
  }, [theme]);

  // View mode: 'tree' (Sơ đồ cây) or 'list' (Danh sách liệt kê)
  const [viewMode, setViewMode] = useState<"tree" | "list">("tree");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<EnrichedUnit | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  // Smooth animated pill state for switcher
  const treeBtnRef = useRef<HTMLButtonElement>(null);
  const listBtnRef = useRef<HTMLButtonElement>(null);
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  useEffect(() => {
    const updatePill = () => {
      const target = viewMode === "tree" ? treeBtnRef.current : listBtnRef.current;
      if (target) {
        setPillStyle({
          left: target.offsetLeft,
          width: target.offsetWidth,
          opacity: 1,
        });
      }
    };

    updatePill();
    const timer = setTimeout(updatePill, 30);
    window.addEventListener("resize", updatePill);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePill);
    };
  }, [viewMode]);

  // Keyboard shortcut (/ to focus search if in list mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && viewMode !== "list") {
        e.preventDefault();
        setViewMode("list");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode]);

  const handleSelectUnit = (unit: EnrichedUnit) => {
    setSelectedPerson(null);
    setSelectedUnit(unit);
  };

  const handleSelectPerson = (person: Person) => {
    setSelectedPerson(person);
  };

  const handleCloseDrawer = () => {
    setSelectedUnit(null);
    setSelectedPerson(null);
  };

  const handleBackToUnit = () => {
    setSelectedPerson(null);
  };

  const handleSelectUnitById = (unitId: string) => {
    const found = enrichedUnits.find((u) => u.id === unitId);
    if (found) {
      setSelectedPerson(null);
      setSelectedUnit(found);
    }
  };

  return (
    <div className={`relative min-h-screen font-sans selection:bg-emerald-500 selection:text-white flex flex-col transition-colors duration-250 ${
      theme === "dark" ? "dark bg-[#0B0F19] text-slate-100" : "bg-[#F1F5F9] text-slate-900"
    }`}>
      {/* Canvas Background Dot Grid */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-40 transition-opacity"
        style={{
          backgroundImage: theme === "dark"
            ? "radial-gradient(#1e293b 1px, transparent 1px)"
            : "radial-gradient(#94a3b8 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* FLOATING HUD CONTROLS (TOPBAR-LESS ARCHITECTURE) */}
      <div className="fixed top-3 inset-x-0 z-30 pointer-events-none px-3 sm:px-6">
        <div className="max-w-5xl w-full mx-auto flex items-center justify-between gap-2">
          {/* Top-Left: Minimal Brand Pill */}
          <div className="pointer-events-auto flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/95 dark:bg-[#111726]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors">
            <span className="w-5 h-5 rounded-md bg-slate-950 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold text-[10px] flex items-center justify-center font-serif">
              D
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-950 dark:text-slate-100">HĐHS DHT</span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">2026–2027</span>
            </div>
          </div>

          {/* Top-Center: Floating Pill Switcher (Primary View Switcher with Smooth Sliding Animation) */}
          <div className="relative pointer-events-auto flex items-center p-1 rounded-full bg-white/95 dark:bg-[#111726]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-md transition-colors">
            {/* Smooth Sliding Pill Indicator */}
            <div
              className="absolute top-1 bottom-1 rounded-full bg-slate-950 dark:bg-zinc-100 shadow-xs pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                left: `${pillStyle.left}px`,
                width: `${pillStyle.width}px`,
                opacity: pillStyle.opacity,
              }}
            />

            <button
              ref={treeBtnRef}
              onClick={() => setViewMode("tree")}
              className={`relative z-10 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200 select-none active:scale-95 ${
                viewMode === "tree"
                  ? "text-white dark:text-zinc-950"
                  : "text-stone-600 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-zinc-100"
              }`}
            >
              <IconSitemap className="w-3.5 h-3.5" />
              <span>Sơ đồ cây</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-medium transition-colors duration-200 ${
                  viewMode === "tree"
                    ? "bg-slate-800 dark:bg-zinc-300 text-stone-300 dark:text-zinc-950"
                    : "bg-stone-100 dark:bg-zinc-800 text-stone-500 dark:text-zinc-400"
                }`}
              >
                {enrichedUnits.length}
              </span>
            </button>

            <button
              ref={listBtnRef}
              onClick={() => setViewMode("list")}
              className={`relative z-10 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200 select-none active:scale-95 ${
                viewMode === "list"
                  ? "text-white dark:text-zinc-950"
                  : "text-stone-600 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-zinc-100"
              }`}
            >
              <IconListDetails className="w-3.5 h-3.5" />
              <span>Danh sách liệt kê</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-medium transition-colors duration-200 ${
                  viewMode === "list"
                    ? "bg-slate-800 dark:bg-zinc-300 text-stone-300 dark:text-zinc-950"
                    : "bg-stone-100 dark:bg-zinc-800 text-stone-500 dark:text-zinc-400"
                }`}
              >
                {people.length}
              </span>
            </button>
          </div>

          {/* Top-Right: Fast Navigation Links & Theme Switcher */}
          <div className="pointer-events-auto flex items-center gap-1.5">
            {/* Theme Toggle (Dark / Light) */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/95 dark:bg-[#111726]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white shadow-xs transition active:scale-95"
              title={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
            >
              {theme === "dark" ? (
                <>
                  <IconSun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline text-[11px]">Sáng</span>
                </>
              ) : (
                <>
                  <IconMoon className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden md:inline text-[11px]">Tối</span>
                </>
              )}
            </button>

            <a
              href="./people/"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/95 dark:bg-[#111726]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white shadow-xs transition"
            >
              <IconUsers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Danh bạ</span>
            </a>
            <a
              href="./admin/"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/95 dark:bg-[#111726]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white shadow-xs transition"
            >
              <IconShield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quản trị</span>
            </a>
          </div>
        </div>
      </div>

      {/* MAIN WORKSPACE CANVAS (BALANCED CLEAN WIDTH) */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-18 pb-12">
        {/* Workspace Title & Stats Summary */}
        <div className="mb-5 pb-3 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-950 dark:text-slate-100 tracking-tight">
              {viewMode === "tree" ? "Sơ đồ Cây Phân Cấp Cơ Cấu" : "Danh Mục Liệt Kê Các Đơn Vị"}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {viewMode === "tree"
                ? "Mô hình quan hệ phân cấp tổ chức Nhà trường, Đoàn trường và Hội đồng Học sinh DHT"
                : "Tra cứu toàn diện các đơn vị, ban chuyên môn, câu lạc bộ và đội tuyển"}
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="px-2.5 py-1 rounded-md bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 font-medium shadow-2xs">
              {enrichedUnits.length} Đơn vị
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 font-medium shadow-2xs">
              {people.length} Nhân sự
            </span>
          </div>
        </div>

        {/* VIEW 1: SƠ ĐỒ CÂY */}
        {viewMode === "tree" && (
          <OrgTree
            rootUnits={rootUnits}
            allUnits={enrichedUnits}
            onSelectUnit={handleSelectUnit}
            selectedUnitId={selectedUnit?.id}
          />
        )}

        {/* VIEW 2: LIỆT KÊ */}
        {viewMode === "list" && (
          <UnitListing
            units={enrichedUnits}
            onSelectUnit={handleSelectUnit}
            selectedUnitId={selectedUnit?.id}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}
      </main>

      {/* FEATURE 3: TÍNH NĂNG HỒ SƠ (RIGHT SLIDE-OVER PROFILE DRAWER) */}
      <ProfileDrawer
        unit={selectedUnit}
        selectedPerson={selectedPerson}
        onClose={handleCloseDrawer}
        onSelectPerson={handleSelectPerson}
        onBackToUnit={handleBackToUnit}
        onSelectUnitById={handleSelectUnitById}
        allUnits={enrichedUnits}
      />

      {/* Minimal Utility Bottom Line */}
      <footer className="relative z-10 border-t border-stone-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-[#08090d]/80 backdrop-blur-sm py-3 px-4 sm:px-8 text-[11px] text-stone-400 dark:text-zinc-500 text-center">
        Hội đồng Học sinh THPT Đặng Huy Trứ · Niên khóa 2026–2027 · Dữ liệu bảo vệ quyền riêng tư
      </footer>
    </div>
  );
}
