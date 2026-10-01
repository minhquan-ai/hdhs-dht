import React, { useRef, useState } from "react";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  spotlightColor?: string;
  borderColor?: string;
  className?: string;
  children: React.ReactNode;
}

export function SpotlightCard({
  spotlightColor = "rgba(15, 23, 42, 0.04)",
  borderColor = "rgba(15, 23, 42, 0.15)",
  className = "",
  children,
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative overflow-hidden rounded-xl border border-stone-200/80 bg-white/95 p-6 backdrop-blur-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:border-slate-800/40 hover:shadow-[0_12px_28px_-6px_rgba(15,23,42,0.08),0_4px_12px_-2px_rgba(15,23,42,0.03)] active:scale-[0.985] active:brightness-[0.99] select-none ${className}`}
      style={{
        // @ts-expect-error custom css variables
        "--mouse-x": "50%",
        "--mouse-y": "50%",
      }}
      {...props}
    >
      {/* Outer border glow follow */}
      <div
        className="pointer-events-none absolute -inset-[1px] rounded-xl opacity-0 transition-opacity duration-250"
        style={{
          opacity,
          background: `radial-gradient(350px circle at var(--mouse-x) var(--mouse-y), ${borderColor}, transparent 70%)`,
        }}
      />

      {/* Inner surface soft light */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-250"
        style={{
          opacity,
          background: `radial-gradient(450px circle at var(--mouse-x) var(--mouse-y), ${spotlightColor}, transparent 80%)`,
        }}
      />

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col justify-between h-full">
        {children}
      </div>
    </div>
  );
}
