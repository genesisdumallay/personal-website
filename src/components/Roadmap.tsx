import React, { useRef, useEffect, useMemo, useCallback, memo } from "react";
import { useTheme } from "@/hooks/ThemeContext";

interface RoadmapItem {
  date?: string | number;
}

interface RoadmapProps {
  items: RoadmapItem[];
  activeYear?: number;
  onSelect?: (year: number | undefined) => void;
  orientation?: "horizontal" | "vertical";
}

interface DotButtonProps {
  year: number;
  isActive: boolean;
  isDark: boolean;
  dotBorder: string;
  dotBg: string;
  activeDotBg: string;
  onClick: (e: React.MouseEvent, year: number) => void;
}

const DotButton = memo(function DotButton({
  year,
  isActive,
  isDark,
  dotBorder,
  dotBg,
  activeDotBg,
  onClick,
}: DotButtonProps) {
  return (
    <button
      data-roadmap-dot
      onClick={(e) => onClick(e, year)}
      aria-label={`Go to ${year}`}
      title={`Year ${year}`}
      className="flex items-center justify-center h-8 w-8 focus:outline-none cursor-pointer group focus-visible:ring-2 focus-visible:ring-indigo-400"
      aria-current={isActive ? "true" : undefined}
    >
      <div
        className={`w-5 h-5 rounded-full border-2 ${dotBorder} flex items-center justify-center transition-transform group-hover:scale-110 cursor-pointer ${
          isActive ? "scale-110" : ""
        } ${dotBg}`}
      >
        <div
          className={`w-2.5 h-2.5 rounded-full transition-colors ${
            isActive
              ? activeDotBg
              : isDark
              ? "bg-transparent group-hover:bg-indigo-300"
              : "bg-transparent group-hover:bg-indigo-600"
          }`}
        />
      </div>
    </button>
  );
});

const Roadmap = memo(function Roadmap({
  items,
  activeYear,
  onSelect,
  orientation = "vertical",
}: RoadmapProps) {
  const { isDark } = useTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isHorizontal = orientation === "horizontal";

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
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [items]);

  const handleDotClick = useCallback(
    (e: React.MouseEvent, year: number) => {
      e.preventDefault();
      onSelect?.(year === activeYear ? undefined : year);
    },
    [activeYear, onSelect]
  );

  const trackBg = isDark ? "bg-gray-700" : "bg-gray-300";
  const dotBorder = isDark ? "border-gray-500" : "border-gray-400";
  const dotBg = isDark ? "bg-gray-800" : "bg-white";
  const activeDotBg = isDark ? "bg-indigo-400" : "bg-indigo-600";
  const labelColor = isDark ? "text-gray-400" : "text-gray-500";

  const displayYears = isHorizontal ? [...years].reverse() : years;

  if (isHorizontal) {
    return (
      <div className="w-full py-4 px-2" ref={containerRef}>
        <div className="relative flex items-center">
          <div
            className={`absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-1 rounded ${trackBg}`}
          />
          <div className="relative z-10 flex items-center justify-start gap-x-8 sm:gap-x-12 px-4">
            {displayYears.map((year) => (
              <div
                key={year}
                className="relative flex flex-col items-center justify-center"
              >
                <DotButton
                  year={year}
                  isActive={year === activeYear}
                  isDark={isDark}
                  dotBorder={dotBorder}
                  dotBg={dotBg}
                  activeDotBg={activeDotBg}
                  onClick={handleDotClick}
                />
                <span
                  className={`absolute top-full mt-2 text-sm whitespace-nowrap ${labelColor}`}
                  aria-hidden="true"
                >
                  {year}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-24 h-fit py-1 px-1" ref={containerRef}>
      <div className="relative flex flex-col items-center min-h-[400px]">
        <div
          className={`absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 w-1 rounded ${trackBg}`}
        />
        <div className="relative z-10 flex flex-col items-center justify-start gap-y-16 py-6">
          {displayYears.map((year) => (
            <div
              key={year}
              className="relative flex items-center justify-center w-8"
            >
              <DotButton
                year={year}
                isActive={year === activeYear}
                isDark={isDark}
                dotBorder={dotBorder}
                dotBg={dotBg}
                activeDotBg={activeDotBg}
                onClick={handleDotClick}
              />
              <span
                className={`absolute left-full ml-3 text-sm whitespace-nowrap ${labelColor}`}
                aria-hidden="true"
              >
                {year}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default Roadmap;
