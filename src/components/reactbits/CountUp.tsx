import { useEffect, useState } from "react";

interface CountUpProps {
  to: number;
  duration?: number;
  className?: string;
}

export function CountUp({ to, duration = 1200, className = "" }: CountUpProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * to));

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setCount(to);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [to, duration]);

  return <span className={className}>{count}</span>;
}
