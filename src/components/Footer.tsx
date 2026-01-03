"use client";
import React, { useState, useCallback, useMemo, memo } from "react";
import { useTheme } from "@/hooks/ThemeContext";
import { FaEnvelope, FaGithub, FaLinkedin } from "react-icons/fa";

interface FooterProps {
  onOpenContact?: () => void;
  isContactOpen?: boolean;
}

const ICON_SIZE = 20;

const Footer = memo(function Footer({
  onOpenContact,
  isContactOpen,
}: FooterProps) {
  const { isDark } = useTheme();
  const [hovered, setHovered] = useState<string | null>(null);

  const handleEmailClick = useCallback(() => {
    if (onOpenContact) {
      onOpenContact();
    } else {
      window.location.href = "mailto:gmdumallay007101@gmail.com";
    }
  }, [onOpenContact]);

  const socialItems = useMemo(
    () => [
      {
        id: "github",
        icon: <FaGithub size={ICON_SIZE} />,
        link: "https://github.com/genesisdumallay",
        label: "GitHub",
      },
      {
        id: "linkedin",
        icon: <FaLinkedin size={ICON_SIZE} />,
        link: "https://www.linkedin.com/in/genesis-dumallay-565398356",
        label: "LinkedIn",
      },
    ],
    []
  );

  const iconContainerClass = `flex items-center transition-all duration-300 ${
    isContactOpen
      ? "opacity-0 w-0 pointer-events-none overflow-hidden"
      : "opacity-100 w-auto"
  }`;

  return (
    <div
      className={`${
        isDark ? "text-gray-200" : "text-gray-900"
      } flex flex-wrap items-center justify-center gap-4 w-full max-w-3xl mx-auto p-2 pt-4 mt-2 border-t border-gray-400`}
    >
      <div className="relative">
        <button
          onClick={handleEmailClick}
          className={`flex items-center transition-all duration-300 cursor-pointer ${
            isContactOpen ? "opacity-0 scale-95 pointer-events-none" : ""
          }`}
          aria-label="Open contact form"
          aria-expanded={isContactOpen}
        >
          <span className="border border-gray-500 p-1 rounded flex items-center gap-1 ml-2 transition-all duration-300">
            <span className="px-1">
              <FaEnvelope size={ICON_SIZE} />
            </span>
            <span className="ml-1 hidden sm:inline-block max-w-[200px] truncate">
              Connect With Me
            </span>
          </span>
        </button>
      </div>

      {socialItems.map((it) => {
        const isHovered = hovered === it.id;
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
});

export default Footer;
