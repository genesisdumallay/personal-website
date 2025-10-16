interface AboutMeProps {
  isDark: boolean;
}

const AboutMe = ({ isDark }: AboutMeProps) => {
  return (
    <div
      className={`flex items-center justify-center ${
        isDark ? "text-gray-200" : "text-gray-900"
      }`}
    >
      <div className="w-full max-w-[45rem] mx-auto px-4">
        <h1 className="text-4xl font-semibold mb-5 text-left">About Me</h1>
        <p>
          Hello! I am Genesis, a BSCSSE graduate from FEU Tech. I am based in
          Quezon City.
        </p>
      </div>
    </div>
  );
};

export default AboutMe;
