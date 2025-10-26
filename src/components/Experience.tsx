import { useState } from "react";
import { useTheme } from "@/hooks/ThemeContext";
import ExperienceCard from "./ExperienceCard";

const Experience = () => {
  const { isDark } = useTheme();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const experiences = [
    {
      title: "Project Manager, Tech Lead",
      context: "Thesis",
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
      date: "April 20, 2025 - Current",
      description:
        "Developed and maintained internal software apps, tools and projects",
      details: [
        "Refactored an entire project codebase including frontend and backend, improving codebase readability, separation of concerns, maintinability, website loading speed and performance load.",
        "Worked with AWS services in developing new and maitaining existing internal projects.",
        "Helped maintain existing internal projects by developing user-requested new features, improving website performance speed and fortifying endpoints security.",
        "Worked with a software development using Agile methodologies, sprint planning, and code reviews to ensure timely delivery of software solutions.",
      ],
    },
  ];
  return (
    <div
      className={`flex items-center justify-center ${
        isDark ? "text-gray-200" : "text-gray-900"
      }`}
    >
      <div className="w-full max-w-[48rem] mx-auto px-4">
        <h1 className="text-4xl font-semibold mb-5 text-left">Experience</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {expandedIndex === null ? (
            experiences.map((exp, idx) => (
              <ExperienceCard
                key={idx}
                experienceTitle={exp.title}
                experienceContext={exp.context}
                experienceDate={exp.date}
                experienceDescription={exp.description}
                experienceDetails={exp.details}
                isExpanded={false}
                onToggle={() => setExpandedIndex(idx)}
              />
            ))
          ) : (
            <ExperienceCard
              key={expandedIndex}
              experienceTitle={experiences[expandedIndex].title}
              experienceContext={experiences[expandedIndex].context}
              experienceDate={experiences[expandedIndex].date}
              experienceDescription={experiences[expandedIndex].description}
              experienceDetails={experiences[expandedIndex].details}
              isExpanded={true}
              onToggle={() => setExpandedIndex(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Experience;
