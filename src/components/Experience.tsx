import { useState, useCallback, useMemo, useEffect, memo } from "react";
import { useTheme } from "@/hooks/ThemeContext";
import ExperienceCard from "./ExperienceCard";
import Roadmap from "./Roadmap";
import { Experience as ExperienceType } from "@/models/types";

const STORAGE_KEY = "cached_experiences";
const CACHE_DURATION = 24 * 60 * 60 * 1000;

const Experience = memo(function Experience() {
  const { isDark } = useTheme();
  const [experiences, setExperiences] = useState<ExperienceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const cachedData = sessionStorage.getItem(STORAGE_KEY);

        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setExperiences(data);
            setIsLoading(false);
            return;
          }
        }

        const response = await fetch("/api/experiences");

        if (!response.ok) {
          throw new Error("Failed to fetch experiences");
        }

        const result = await response.json();

        if (result.success && result.data) {
          setExperiences(result.data);
          sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ data: result.data, timestamp: Date.now() })
          );
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching experiences:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  const handleYearSelect = useCallback((year: number | undefined) => {
    setSelectedYear(year);
    setExpandedIndex(null);
  }, []);

  const handleCardToggle = useCallback((idx: number) => {
    setExpandedIndex((current) => (current === idx ? null : idx));
  }, []);

  // Create a map for O(1) index lookups
  const experienceIndexMap = useMemo(() => {
    const map = new Map<string | undefined, number>();
    experiences.forEach((exp, idx) => {
      map.set(exp._id, idx);
    });
    return map;
  }, [experiences]);

  const filteredExperiences = useMemo(() => {
    if (selectedYear === undefined) return experiences;

    return experiences.filter((exp) => {
      const matches =
        exp?.date
          ?.toString()
          .match(/\b(\d{4})\b/g)
          ?.map((m) => parseInt(m, 10)) ?? [];
      if (matches.length === 0) return false;
      const min = Math.min(...matches);
      const max = Math.max(...matches);
      return selectedYear >= min && selectedYear <= max;
    });
  }, [selectedYear, experiences]);

  const textColorClass = isDark ? "text-gray-200" : "text-gray-900";

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center min-h-[400px] ${textColorClass}`}
      >
        <div className="text-center">
          <div className="animate-pulse text-xl">Loading experiences...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center min-h-[400px] ${textColorClass}`}
      >
        <div className="text-center">
          <div className="text-red-500 text-xl">Error loading experiences</div>
          <div className="text-sm mt-2">{error}</div>
        </div>
      </div>
    );
  }

  const renderExperienceCards = () => {
    if (selectedYear === undefined) {
      if (expandedIndex === null) {
        return experiences.map((exp, idx) => (
          <ExperienceCard
            key={exp._id || idx}
            experienceTitle={exp.title}
            experienceContext={exp.context}
            experienceDate={exp.date}
            experienceDescription={exp.description}
            experienceDetails={exp.details}
            experienceArticle={exp.article}
            isExpanded={false}
            onToggle={() => handleCardToggle(idx)}
          />
        ));
      }

      const exp = experiences[expandedIndex];
      return (
        <ExperienceCard
          key={exp._id || expandedIndex}
          experienceTitle={exp.title}
          experienceContext={exp.context}
          experienceDate={exp.date}
          experienceDescription={exp.description}
          experienceDetails={exp.details}
          experienceArticle={exp.article}
          isExpanded={true}
          onToggle={() => handleCardToggle(expandedIndex)}
        />
      );
    }

    return filteredExperiences.map((exp) => {
      const idx = experienceIndexMap.get(exp._id) ?? -1;
      return (
        <ExperienceCard
          key={exp._id || idx}
          experienceTitle={exp.title}
          experienceContext={exp.context}
          experienceDate={exp.date}
          experienceDescription={exp.description}
          experienceDetails={exp.details}
          experienceArticle={exp.article}
          isExpanded={expandedIndex === idx}
          onToggle={() => handleCardToggle(idx)}
        />
      );
    });
  };

  return (
    <div className={`flex items-center justify-center ${textColorClass}`}>
      <div className="w-full max-w-[48rem] mx-auto px-4 sm:px-6">
        <h1 className="text-4xl font-semibold mb-8 text-left">Experience</h1>
        <div className="lg:hidden mb-8 flex justify-center">
          <Roadmap
            items={experiences}
            activeYear={selectedYear}
            onSelect={handleYearSelect}
            orientation="horizontal"
          />
        </div>
        <div className="flex gap-6 relative">
          <div className="flex-1 flex flex-col gap-5 items-center lg:items-stretch">
            {renderExperienceCards()}
          </div>
          <div className="hidden lg:block">
            <Roadmap
              items={experiences}
              activeYear={selectedYear}
              onSelect={handleYearSelect}
              orientation="vertical"
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default Experience;
