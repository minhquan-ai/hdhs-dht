import { useRef, useEffect, useState } from "react";

interface TabItem {
  id: string;
  label: string;
}

interface AnimatedTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function AnimatedTabs({ tabs, activeTab, onChange, className = "" }: AnimatedTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const activeButton = containerRef.current.querySelector<HTMLButtonElement>(
      `[data-tab-id="${activeTab}"]`
    );

    if (activeButton) {
      setIndicatorStyle({
        left: activeButton.offsetLeft,
        width: activeButton.offsetWidth,
      });
    }
  }, [activeTab, tabs]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center gap-1.5 p-1.5 rounded-full bg-stone-100/90 border border-stone-200/80 backdrop-blur-md overflow-x-auto no-scrollbar shadow-inner ${className}`}
    >
      {/* Smooth sliding pill indicator */}
      <div
        className="absolute top-1.5 bottom-1.5 rounded-full bg-slate-950 shadow-md transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
        }}
      />

      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            data-tab-id={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative z-10 px-4 sm:px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors duration-200 whitespace-nowrap ${
              isActive
                ? "text-white"
                : "text-stone-600 hover:text-slate-950"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
