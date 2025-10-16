interface ExperienceProps {
  isDark: boolean;
}

const Experience = ({ isDark }: ExperienceProps) => {
  return (
    <div
      className={`flex items-center justify-center ${
        isDark ? "text-gray-200" : "text-gray-900"
      }`}
    >
      <div className="w-full max-w-[45rem] mx-auto px-4">
        <h1 className="text-4xl font-semibold mb-5 text-left">Experience</h1>
      </div>
    </div>
  );
};

export default Experience;
