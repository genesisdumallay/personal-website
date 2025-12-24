import { useState, useCallback, useMemo } from "react";
import { useTheme } from "@/hooks/ThemeContext";
import ExperienceCard from "./ExperienceCard";
import Roadmap from "./Roadmap";

const EXPERIENCES = [
  {
    title: "Project Manager, Tech Lead",
    context: "Thesis",
    date: "2024 - 2025",
    description:
      "Lead a software development team as PM and Tech Lead, throughout software development lifecycle.",
    details: [
      "Developed an event recommendation application that scrapes Manila City events and recommends them based on event and in-app user data.",
      "Designed and developed the application's system architecture. Defining system process and logic flow.",
      "Implemented a content-based event recommender using Min-Max scaling, a weighted preference score, cosine similarity, and K-Nearest Neighbors to rank personalized events.",
    ],
  },
  {
    title: "Software Engineer Intern",
    context: "GlobalTek BPO Inc.",
    date: "Apr. 20, 2025 - Dec. 29, 2025",
    description:
      "Developed and maintained internal software apps, tools and projects",
    details: [
      "Refactored an entire project codebase including frontend and backend, improving codebase readability, separation of concerns, maintinability, website loading speed and performance load.",
      "Worked with Amazon Web Services ( AWS ) in maintaining existing projects and developing and integrating agentic AI into projects and automating work processes.",
      "Helped assure codebase quality and maintenance for company projects by developing project unit tests. Improving codebase quality, maintenance, and streamlined development flow.",
      "Worked with a software development team using Agile methodologies, sprint planning, and code reviews to ensure timely delivery of software solutions.",
    ],
  },
];

const Experience = () => {
  const { isDark } = useTheme();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    undefined
  );

  const handleYearSelect = useCallback((year: number | undefined) => {
    setSelectedYear(year === undefined ? undefined : year);
    setExpandedIndex(null);
  }, []);

  const handleCardToggle = useCallback((idx: number) => {
    setExpandedIndex((current) => (current === idx ? null : idx));
  }, []);

  const filteredExperiences = useMemo(() => {
    if (selectedYear === undefined) return EXPERIENCES;

    return EXPERIENCES.filter((exp) => {
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
  }, [selectedYear]);

  return (
    <div
      className={`flex items-center justify-center ${
        isDark ? "text-gray-200" : "text-gray-900"
      }`}
    >
      <div className="w-full max-w-[48rem] mx-auto px-4">
        <h1 className="text-4xl font-semibold mb-5 text-left">Experience</h1>
        <Roadmap
          items={EXPERIENCES}
          activeYear={selectedYear}
          onSelect={handleYearSelect}
        />
        <div className="flex flex-col gap-5">
          {selectedYear === undefined ? (
            expandedIndex === null ? (
              EXPERIENCES.map((exp, idx) => (
                <ExperienceCard
                  key={idx}
                  experienceTitle={exp.title}
                  experienceContext={exp.context}
                  experienceDate={exp.date}
                  experienceDescription={exp.description}
                  experienceDetails={exp.details}
                  isExpanded={false}
                  onToggle={() => handleCardToggle(idx)}
                />
              ))
            ) : (
              <ExperienceCard
                key={expandedIndex}
                experienceTitle={EXPERIENCES[expandedIndex].title}
                experienceContext={EXPERIENCES[expandedIndex].context}
                experienceDate={EXPERIENCES[expandedIndex].date}
                experienceDescription={EXPERIENCES[expandedIndex].description}
                experienceDetails={EXPERIENCES[expandedIndex].details}
                isExpanded={true}
                onToggle={() => handleCardToggle(expandedIndex)}
              />
            )
          ) : (
            filteredExperiences.map((exp) => {
              const idx = EXPERIENCES.indexOf(exp);
              return (
                <ExperienceCard
                  key={idx}
                  experienceTitle={exp.title}
                  experienceContext={exp.context}
                  experienceDate={exp.date}
                  experienceDescription={exp.description}
                  experienceDetails={exp.details}
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
