import React, { useRef, useEffect, useMemo, useCallback } from "react";
import { useTheme } from "@/hooks/ThemeContext";

interface RoadmapItem {
  date?: string | number;
  [key: string]: unknown;
}

interface RoadmapProps {
  items: RoadmapItem[];
  activeYear?: number;
  onSelect?: (year: number | undefined) => void;
}

const Roadmap = ({ items, activeYear, onSelect }: RoadmapProps) => {
  const { isDark } = useTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (activeYear === undefined) return;
      const target = e.target as HTMLElement | null;
      if (!target || !containerRef.current) return;

      if (containerRef.current.contains(target)) {
        const clickedDot = target.closest("button[data-roadmap-dot]");
        if (clickedDot) return;
        onSelect?.(undefined);
        return;
      }

      onSelect?.(undefined);
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [activeYear, onSelect]);

  const years = useMemo(() => {
    const yearsSet = new Set<number>();
    items.forEach((item) => {
      const matches = item?.date?.toString().match(/\b(\d{4})\b/g);
      matches?.forEach((m) => yearsSet.add(parseInt(m, 10)));
    });
    return Array.from(yearsSet).sort((a, b) => a - b);
  }, [items]);

  const handleDotClick = useCallback(
    (e: React.MouseEvent, year: number) => {
      e.preventDefault();
      if (year === activeYear) {
        onSelect?.(undefined);
      } else {
        onSelect?.(year);
      }
    },
    [activeYear, onSelect]
  );

  const trackBg = isDark ? "bg-gray-700" : "bg-gray-300";
  const dotBorder = isDark ? "border-gray-500" : "border-gray-400";
  const dotBg = isDark ? "bg-gray-800" : "bg-white";
  const activeDotBg = isDark ? "bg-indigo-400" : "bg-indigo-600";

  return (
    <div className="w-full px-1 mb-10" ref={containerRef}>
      <div className="relative h-8 flex items-center">
        <div
          className={`absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-1 rounded ${trackBg}`}
        />

        <div className="relative z-10 flex items-center justify-start gap-x-24 pl-8 overflow-visible">
          {years.map((year) => {
            return (
              <div
                key={year}
                className="relative flex items-center justify-center h-8"
              >
                <button
                  data-roadmap-dot
                  onClick={(e) => handleDotClick(e, year)}
                  aria-label={`Go to ${year}`}
                  title={`Year ${year}`}
                  className="flex items-center justify-center h-8 w-8 focus:outline-none cursor-pointer group focus-visible:ring-2 focus-visible:ring-indigo-400"
                  aria-current={year === activeYear ? "true" : undefined}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 ${dotBorder} flex items-center justify-center transition-transform group-hover:scale-110 cursor-pointer ${
                      year === activeYear ? "scale-110" : ""
                    } ${dotBg}`}
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        year === activeYear
                          ? activeDotBg
                          : isDark
                          ? "bg-transparent group-hover:bg-indigo-300"
                          : "bg-transparent group-hover:bg-indigo-600"
                      }`}
                    />
                  </div>
                </button>

                <span
                  className={`absolute top-full mt-1 left-1/2 transform -translate-x-1/2 text-xs ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                  aria-hidden="true"
                >
                  {year}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
