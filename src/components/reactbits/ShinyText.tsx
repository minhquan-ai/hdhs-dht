import React from "react";

interface ShinyTextProps {
  text: string;
  className?: string;
  shimmerColor?: string;
}

export function ShinyText({
  text,
  className = "",
}: ShinyTextProps) {
  return (
    <span
      className={`inline-block bg-[linear-gradient(110deg,#1e293b,45%,#94a3b8,55%,#1e293b)] bg-[length:250%_100%] bg-clip-text text-transparent animate-shimmer font-bold ${className}`}
    >
      {text}
    </span>
  );
}
