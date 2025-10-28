import React, { useState } from "react";
import { useTheme } from "@/hooks/ThemeContext";
import { FaEnvelope, FaGithub, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  const { isDark } = useTheme();
  const [hovered, setHovered] = useState<string | null>(null);
  const iconStyle = { size: 20 };

  return (
    <div
      className={`${
        isDark ? "text-gray-200" : "text-gray-900"
      } flex items-center justify-center gap-6 w-max mx-auto p-2 pt-4 mt-2 border-t border-gray-400`}
    >
      {[
        {
          id: "email",
          icon: <FaEnvelope {...iconStyle} />,
          link: "",
          label: "Email",
        },
        {
          id: "github",
          icon: <FaGithub {...iconStyle} />,
          link: "https://github.com/genesisdumallay",
          label: "GitHub",
        },
        {
          id: "linkedin",
          icon: <FaLinkedin {...iconStyle} />,
          link: "https://www.linkedin.com/in/genesis-dumallay-565398356",
          label: "LinkedIn",
        },
      ].map((it) => {
        if (it.id === "email") {
          return (
            <a
              key={it.id}
              href={`mailto:gdumallay007101@gmail.com`}
              className="flex items-center"
            >
              <span className="border border-gray-500 p-1 rounded flex items-center gap-1 ml-2">
                <span className="px-1">{it.icon}</span>
                <span className="ml-1">gdumallay007101@gmail.com</span>
              </span>
            </a>
          );
        }

        const isHovered = hovered === it.id;
        return (
          <a
            key={it.id}
            href={it.link}
            onMouseEnter={() => setHovered(it.id)}
            onMouseLeave={() => setHovered(null)}
            className="flex items-center"
          >
            <span
              className="text-sm inline-block overflow-hidden transition-all duration-300 ease-out"
              style={{
                maxWidth: isHovered ? "120px" : "0px",
                opacity: isHovered ? 1 : 0,
                transform: `translateX(${isHovered ? 0 : -4}px)`,
                whiteSpace: "nowrap",
              }}
              aria-hidden={!isHovered}
            >
              {it.label}
            </span>

            <span className={isHovered ? "ml-2" : "ml-0"}>{it.icon}</span>
          </a>
        );
      })}
    </div>
  );
};

export default Footer;
