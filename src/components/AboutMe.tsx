interface AboutMeProps {
  isDark: boolean;
}

const AboutMe = ({ isDark }: AboutMeProps) => {
  return (
    <div
      className={`min-h-[60vh] flex items-center justify-center flex-col ${
        isDark ? "text-gray-200" : "text-gray-900"
      }`}
    >
      <h1 className="max-w-4xl text-4xl font-bold text-center mb-5">
        About Me
      </h1>
      <p>
        Hello! I am Genesis, a BSCSSE graduate from FEU Tech. I am based in
        Quezon City.
      </p>
    </div>
  );
};

export default AboutMe;
