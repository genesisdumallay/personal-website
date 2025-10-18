import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/hooks/ThemeContext";

interface ExperienceCardProps {
  experienceTitle: string;
  experienceContext: string;
  experienceDate?: string;
  experienceDescription: string;
  experienceDetails?: string[];
  isExpanded?: boolean;
  onToggle?: () => void;
}

const ExperienceCard = ({
  experienceTitle,
  experienceContext,
  experienceDate,
  experienceDescription,
  experienceDetails,
  isExpanded = false,
  onToggle,
}: ExperienceCardProps) => {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [measuredHeight, setMeasuredHeight] = useState<number>(0);
  const [isHoveredOrFocused, setIsHoveredOrFocused] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    if (isExpanded && contentRef.current) {
      setMeasuredHeight(contentRef.current.scrollHeight);
    }
  }, [isExpanded]);

  const containerClass = `flex flex-col rounded-2xl md:rounded-3xl p-10 w-full min-h-[10rem] md:max-w-none overflow-hidden transition-transform duration-150 ease-out ${
    isExpanded ? "md:col-span-2" : "md:max-w-[22.5rem]"
  } ${isDark ? "bg-gray-800" : "bg-gray-100"}`;

  return (
    <div
      className={containerClass}
      role={onToggle ? "button" : undefined}
      tabIndex={onToggle ? 0 : undefined}
      onClick={() => onToggle && onToggle()}
      aria-pressed={isExpanded}
      onMouseEnter={() => setIsHoveredOrFocused(true)}
      onMouseLeave={() => setIsHoveredOrFocused(false)}
      onFocus={() => setIsHoveredOrFocused(true)}
      onBlur={() => setIsHoveredOrFocused(false)}
      style={{ transform: isHoveredOrFocused ? "scale(1.02)" : undefined }}
    >
      <div className="min-h-[72px]">
        <div
          className={`text-lg ${isDark ? "text-gray-200" : "text-gray-800"}`}
        >
          {experienceTitle}
        </div>
        <div
          className={`text-sm ${isDark ? "text-gray-200" : "text-gray-600"}`}
        >
          {experienceContext}
        </div>
        <div
          className={`text-sm ${isDark ? "text-gray-200" : "text-gray-500"}`}
        >
          {experienceDate}
        </div>
      </div>
      <div
        className={`text-sm mt-5 ${isDark ? "text-gray-200" : "text-gray-600"}`}
      >
        {experienceDescription}
      </div>
      <div
        ref={contentRef}
        style={{
          maxHeight: isExpanded ? measuredHeight : 0,
          transition: isExpanded ? "max-height 500ms ease" : undefined,
          overflow: "hidden",
        }}
        className="text-gray-600 mt-2"
        aria-hidden={!isExpanded}
      >
        <ul className="list-disc list-outside pl-5 space-y-1 text-sm">
          {experienceDetails?.map((d, i) => (
            <li
              key={i}
              className={`text-sm break-words ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              {d}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto pt-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle && onToggle();
          }}
          className={`font-semibold hover:underline text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded ${
            isDark ? "text-gray-100" : "text-gray-800"
          }`}
          aria-expanded={isExpanded}
        >
          {isExpanded ? "See Less" : "See More"}
        </button>
      </div>
    </div>
  );
};

export default ExperienceCard;
