"use client";
import React, { useState } from "react";
import { useTheme } from "@/hooks/ThemeContext";
import { FaEnvelope, FaGithub, FaLinkedin } from "react-icons/fa";

const Footer = ({
  onOpenContact,
  isContactOpen,
}: {
  onOpenContact?: () => void;
  isContactOpen?: boolean;
}) => {
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
          // Email wrapper is relative so the ContactForm can be positioned adjacent to it
          return (
            <div key={it.id} className="relative">
              <button
                onClick={() =>
                  onOpenContact
                    ? onOpenContact()
                    : (window.location.href =
                        "mailto:gmdumallay007101@gmail.com")
                }
                className={`flex items-center transition-all duration-300 cursor-pointer ${
                  isContactOpen ? "opacity-0 scale-95 pointer-events-none" : ""
                }`}
                aria-label="Open contact form"
                aria-expanded={isContactOpen ? true : false}
              >
                <span
                  className={`border border-gray-500 p-1 rounded flex items-center gap-1 ml-2 transition-all duration-300`}
                >
                  <span className="px-1">{it.icon}</span>
                  <span className="ml-1">gmdumallay007101@gmail.com</span>
                </span>
              </button>

              {/* Contact panel anchored here -- only rendered when open so it can't reserve space */}
            </div>
          );
        }

        const isHovered = hovered === it.id;
        const iconContainerClass = `flex items-center transition-all duration-300 ${
          isContactOpen
            ? "opacity-0 w-0 pointer-events-none overflow-hidden"
            : "opacity-100 w-auto"
        }`;

        return (
          <a
            key={it.id}
            href={it.link}
            onMouseEnter={() => setHovered(it.id)}
            onMouseLeave={() => setHovered(null)}
            className={iconContainerClass}
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
