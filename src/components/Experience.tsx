import { useState, useCallback, useMemo, useEffect } from "react";
import { useTheme } from "@/hooks/ThemeContext";
import ExperienceCard from "./ExperienceCard";
import Roadmap from "./Roadmap";
import { Experience as ExperienceType } from "@/models/types";

const STORAGE_KEY = "cached_experiences";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const Experience = () => {
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
          const now = Date.now();

          if (now - timestamp < CACHE_DURATION) {
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
            JSON.stringify({
              data: result.data,
              timestamp: Date.now(),
            })
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
    setSelectedYear(year === undefined ? undefined : year);
    setExpandedIndex(null);
  }, []);

  const handleCardToggle = useCallback((idx: number) => {
    setExpandedIndex((current) => (current === idx ? null : idx));
  }, []);

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

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center min-h-[400px] ${
          isDark ? "text-gray-200" : "text-gray-900"
        }`}
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
        className={`flex items-center justify-center min-h-[400px] ${
          isDark ? "text-gray-200" : "text-gray-900"
        }`}
      >
        <div className="text-center">
          <div className="text-red-500 text-xl">Error loading experiences</div>
          <div className="text-sm mt-2">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center ${
        isDark ? "text-gray-200" : "text-gray-900"
      }`}
    >
      <div className="w-full max-w-[48rem] mx-auto px-4">
        <h1 className="text-4xl font-semibold mb-5 text-left">Experience</h1>
        <Roadmap
          items={experiences}
          activeYear={selectedYear}
          onSelect={handleYearSelect}
        />
        <div className="flex flex-col gap-5">
          {selectedYear === undefined ? (
            expandedIndex === null ? (
              experiences.map((exp, idx) => (
                <ExperienceCard
                  key={exp._id || idx}
                  experienceTitle={exp.title}
                  experienceContext={exp.context}
                  experienceDate={exp.date}
                  experienceDescription={exp.description}
                  experienceDetails={exp.details}
                  experienceArticle={exp.article}
                  techStack={exp.techStack}
                  isExpanded={false}
                  onToggle={() => handleCardToggle(idx)}
                />
              ))
            ) : (
              <ExperienceCard
                key={experiences[expandedIndex]._id || expandedIndex}
                experienceTitle={experiences[expandedIndex].title}
                experienceContext={experiences[expandedIndex].context}
                experienceDate={experiences[expandedIndex].date}
                experienceDescription={experiences[expandedIndex].description}
                experienceDetails={experiences[expandedIndex].details}
                experienceArticle={experiences[expandedIndex].article}
                techStack={experiences[expandedIndex].techStack}
                isExpanded={true}
                onToggle={() => handleCardToggle(expandedIndex)}
              />
            )
          ) : (
            filteredExperiences.map((exp) => {
              const idx = experiences.indexOf(exp);
              return (
                <ExperienceCard
                  key={exp._id || idx}
                  experienceTitle={exp.title}
                  experienceContext={exp.context}
                  experienceDate={exp.date}
                  experienceDescription={exp.description}
                  experienceDetails={exp.details}
                  experienceArticle={exp.article}
                  techStack={exp.techStack}
                  isExpanded={expandedIndex === idx}
                  onToggle={() => handleCardToggle(idx)}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Experience;
