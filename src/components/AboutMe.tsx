import { useTheme } from "@/hooks/ThemeContext";

const AboutMe = () => {
  const { isDark } = useTheme();
  return (
    <div
      className={`flex items-center justify-center ${
        isDark ? "text-gray-200" : "text-gray-900"
      }`}
    >
      <div className="w-full max-w-[48rem] mx-auto px-4">
        <h1 className="text-4xl font-semibold mb-5 text-left">About Me</h1>
        <p className="leading-relaxed text-justify">
          Hello! I am Genesis. I am based in Quezon City. I&#39;m a software
          developer, with my experience primarily in web development. I am an
          advocate to using AI for software automation solutions. As a Software
          Engineer, I solve problems through efficient, effective and clean
          solutions.
        </p>
      </div>
    </div>
  );
};

export default AboutMe;
