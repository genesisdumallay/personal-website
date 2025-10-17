import ExperienceCard from "./ExperienceCard";

interface ExperienceProps {
  isDark: boolean;
}

const Experience = ({ isDark }: ExperienceProps) => {
  const experiences = [
    {
      title: "Thesis | Project Manager, Tech Lead",
      description:
        "Lead a software development team as PM and Tech Lead, throughout software development lifecycle.",
      details: ["test1", "test2"],
    },
    {
      title: "GlobalTek BPO Inc. | Software Engineer Intern",
      description:
        "Developed and maintained internal software apps, tools and projects",
      details: ["test1", "test2"],
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
        <div className="flex flex-row gap-3">
          {experiences.map((exp, idx) => (
            <ExperienceCard
              key={idx}
              experienceTitle={exp.title}
              experienceDescription={exp.description}
              experienceDetails={exp.details}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Experience;
