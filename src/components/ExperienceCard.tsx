import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/hooks/ThemeContext";
import React from "react";
import Image from "next/image";

interface ExperienceCardProps {
  experienceTitle: string;
  experienceContext: string;
  experienceDate?: string;
  experienceDescription: string;
  experienceDetails?: string[];
  experienceArticle?: string;
  techStack?: string[];
  isExpanded?: boolean;
  onToggle?: () => void;
  maxTechStackLength: number;
}

const ExperienceCard = React.memo<ExperienceCardProps>(function ExperienceCard({
  experienceTitle,
  experienceContext,
  experienceDate,
  experienceDescription,
  experienceDetails,
  experienceArticle,
  techStack,
  isExpanded = false,
  onToggle,
  maxTechStackLength,
}) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [measuredHeight, setMeasuredHeight] = useState<number>(0);
  const [isHoveredOrFocused, setIsHoveredOrFocused] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    if (isExpanded && contentRef.current) {
      setMeasuredHeight(contentRef.current.scrollHeight);
    }
  }, [isExpanded]);

  const containerClass = `flex flex-col rounded-2xl md:rounded-3xl p-10 py-6 w-full min-h-[10rem] max-w-full overflow-hidden border border-transparent hover:border-gray-500 transition-transform transition-colors duration-150 ease-out ${
    isDark ? "bg-gray-800" : "bg-[#e6e6e6]"
  }`;

  return (
    <div
      className={containerClass}
      role={onToggle ? "button" : undefined}
      tabIndex={onToggle ? 0 : undefined}
      onClick={() => onToggle?.()}
      aria-pressed={isExpanded}
      onMouseEnter={() => setIsHoveredOrFocused(true)}
      onMouseLeave={() => setIsHoveredOrFocused(false)}
      onFocus={() => setIsHoveredOrFocused(true)}
      onBlur={() => setIsHoveredOrFocused(false)}
      style={{ transform: isHoveredOrFocused ? "scale(1.02)" : undefined }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <div className="min-w-0 space-y-1">
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
        </div>
        {experienceDate && (
          <div
            className={`text-sm ${
              isDark ? "text-gray-200" : "text-gray-500"
            } whitespace-nowrap`}
          >
            {experienceDate}
          </div>
        )}
      </div>

      {techStack && techStack.length > 0 && (
        <div className="relative overflow-hidden mt-4 mb-2 w-full mask-fade">
          <div
            className="flex gap-8 animate-scroll w-max"
            style={{
              animationDuration: `${
                25 * (techStack.length / maxTechStackLength)
              }s`,
            }}
          >
            {[...techStack, ...techStack, ...techStack].map((tech, index) => (
              <div
                key={`${tech}-${index}`}
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
              >
                <Image
                  src={`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${tech.toLowerCase()}/${tech.toLowerCase()}-original.svg`}
                  alt={tech}
                  width={32}
                  height={32}
                  className="tech-icon"
                  unoptimized
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;

                    const VARIANTS = [
                      "original",
                      "original-wordmark",
                      "plain",
                      "plain-wordmark",
                      "line",
                      "line-wordmark",
                    ];

                    const base = `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${tech.toLowerCase()}/${tech.toLowerCase()}-`;

                    const triedRaw = target.dataset.iconTried;
                    const tried: string[] = triedRaw
                      ? JSON.parse(triedRaw)
                      : [];

                    const m = target.src.match(/-([a-z0-9-]+)\.svg$/i);
                    if (m && m[1] && !tried.includes(m[1])) tried.push(m[1]);
                    const next = VARIANTS.find((v) => !tried.includes(v));

                    if (next) {
                      tried.push(next);
                      target.dataset.iconTried = JSON.stringify(tried);
                      target.src = base + next + ".svg";
                      return;
                    }

                    target.style.visibility = "hidden";
                    target.alt = "";
                  }}
                />
                <span
                  className={`text-[10px] font-semibold uppercase tracking-tighter ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {tech}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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

        {experienceArticle && (
          <div
            className={`mt-3 text-sm ${
              isDark ? "text-gray-300" : "text-gray-700"
            } whitespace-pre-line`}
          >
            {experienceArticle}
          </div>
        )}
      </div>

      <div className="mt-auto pt-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle?.();
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
});

export default ExperienceCard;
