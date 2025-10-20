import React, { useState } from "react";
import { useTheme } from "@/hooks/ThemeContext";
import { FaFileAlt, FaMoon, FaSun, FaUser, FaTerminal } from "react-icons/fa";

interface HeaderProps {
  setToggleChat: (v: boolean) => void;
}

const Header = ({ setToggleChat }: HeaderProps) => {
  const { isDark, toggleDark } = useTheme();
  const iconStyle = { size: 20 };
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div
      className={`${
        isDark ? "text-gray-200" : "text-gray-900"
      } flex flex-row gap-2`}
    >
      <div className="flex items-center justify-center gap-6 border rounded w-max p-2 mt-3 border-gray-300 ml-auto">
        {/* Visible toggle switch for light/dark mode */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDark}
            aria-pressed={isDark}
            className={`relative inline-flex items-center h-6 rounded-full w-12 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              isDark ? "bg-gray-600" : "bg-gray-300"
            }`}
          >
            {/* Sun icon on the left inside the track */}
            <FaSun
              {...iconStyle}
              className={`absolute left-1 top-1/2 transform -translate-y-1/2 pointer-events-none ${
                isDark ? "opacity-40" : "opacity-100"
              }`}
            />

            {/* Moon icon on the right inside the track */}
            <FaMoon
              {...iconStyle}
              className={`absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none ${
                isDark ? "opacity-100" : "opacity-40"
              }`}
            />

            {/* Toggle knob */}
            <span
              className={`inline-block w-5 h-5 bg-white rounded-full transform transition-transform ${
                isDark ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-center gap-6 border rounded w-max p-2 mt-3 border-gray-300 mr-auto">
        {(
          [
            {
              id: "resume",
              icon: <FaFileAlt {...iconStyle} />,
              link: "/Dumallay, Genesis M..pdf",
              label: "Resume",
            },
            {
              id: "aboutme",
              icon: <FaUser {...iconStyle} />,
              link: "#about-me-section",
              label: "About Me",
              onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault();

                const section = document.querySelector("#about-me-section");
                if (section) {
                  section.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                }
              },
            },
            {
              id: "experience",
              icon: <FaTerminal {...iconStyle} />,
              link: "#experience-section",
              label: "Experience",
              onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault();

                const section = document.querySelector("#experience-section");
                if (section) {
                  section.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                }
              },
            },
          ] as Array<{
            id: string;
            icon: React.ReactNode;
            link: string;
            label: string;
            onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
          }>
        ).map((it) => {
          const isHovered = hovered === it.id;
          return (
            <a
              key={it.id}
              href={it.link}
              onMouseEnter={() => setHovered(it.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={(e) => it.onClick && it.onClick(e)}
              className="flex items-center"
            >
              <span
                className="text-sm inline-block overflow-hidden transition-all duration-300 ease-out"
                style={{
                  maxWidth: isHovered ? "160px" : "0px",
                  opacity: isHovered ? 1 : 0,
                  transform: `translateX(${isHovered ? 0 : -4}px)`,
                  whiteSpace: "nowrap",
                }}
                aria-hidden={!isHovered}
              >
                {it.label}
              </span>
              <span className={isHovered ? "ml-2" : ""}>{it.icon}</span>
            </a>
          );
        })}

        <button
          className={`border-l px-3 py-1 hover:bg-gray-200 ${
            isDark ? "text-gray-200" : "text-gray-900"
          }`}
          onClick={async () => {
            setToggleChat(true);
          }}
        >
          Chat
        </button>
      </div>
    </div>
  );
};

export default Header;
