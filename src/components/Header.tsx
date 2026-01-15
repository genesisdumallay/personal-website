import React, { useCallback, useMemo, memo } from "react";
import Link from "next/link";
import { useTheme } from "@/hooks/ThemeContext";
import { FaMoon, FaSun } from "react-icons/fa";

interface HeaderProps {
  setToggleChat: (v: boolean) => void;
}

interface NavItem {
  id: string;
  link: string;
  label: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const Header = memo(function Header({ setToggleChat }: HeaderProps) {
  const { isDark, toggleDark } = useTheme();

  const scrollToSection = useCallback((sectionId: string) => {
    const section = document.querySelector(sectionId);
    section?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const handleExperienceClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      scrollToSection("#experience-section");
    },
    [scrollToSection]
  );

  const handleChatClick = useCallback(() => {
    setToggleChat(true);
  }, [setToggleChat]);

  const navItems: NavItem[] = useMemo(
    () => [
      {
        id: "resume",
        link: "/Genesis_Dumallay_Software_Engineer_2026.pdf",
        label: "Resume",
      },
      { id: "aboutme", link: "/about", label: "About" },
      {
        id: "experience",
        link: "#experience-section",
        label: "Experience",
        onClick: handleExperienceClick,
      },
    ],
    [handleExperienceClick]
  );

  const linkClassName = `text-xs sm:text-sm md:text-base font-medium transition-colors hover:text-[var(--nav-hover)]`;

  const containerClassName = `flex items-center justify-center gap-3 sm:gap-6 border rounded w-max p-1 sm:p-2 mt-3 border-[var(--input-border)]`;

  return (
    <div
      className={`text-[var(--site-text)] flex flex-row gap-2 w-full justify-center px-3 sm:px-6`}
    >
      <div className={containerClassName}>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDark}
            aria-pressed={isDark}
            className={`relative inline-flex items-center h-6 rounded-full w-12 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer ${
              isDark ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <FaSun
              className={`absolute left-1 top-1/2 transform -translate-y-1/2 pointer-events-none text-[12px] sm:text-[20px] ${
                isDark ? "opacity-40" : "opacity-100"
              }`}
            />
            <FaMoon
              className={`absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none text-[12px] sm:text-[20px] ${
                isDark ? "opacity-100" : "opacity-40"
              }`}
            />
            <span
              className={`inline-block w-5 h-5 bg-white rounded-full transform transition-transform ${
                isDark ? "translate-x-5 sm:translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
      <div className={containerClassName}>
        {navItems.map((it) => {
          const isPdf = it.link.toLowerCase().endsWith(".pdf");
          return it.onClick ? (
            <a
              key={it.id}
              href={it.link}
              onClick={it.onClick}
              className={linkClassName}
            >
              {it.label}
            </a>
          ) : isPdf ? (
            <Link
              key={it.id}
              href={it.link}
              prefetch={false}
              className={linkClassName}
              target="_blank"
              rel="noopener noreferrer"
            >
              {it.label}
            </Link>
          ) : (
            <Link key={it.id} href={it.link} className={linkClassName}>
              {it.label}
            </Link>
          );
        })}

        <button
          className={`border-l px-2 sm:px-3 py-1 text-xs sm:text-sm transition-colors cursor-pointer ${
            isDark
              ? "text-gray-200 border-gray-700 hover:bg-gray-800"
              : "text-gray-900 border-gray-300 hover:bg-gray-200"
          }`}
          onClick={handleChatClick}
        >
          Chat
        </button>
      </div>
    </div>
  );
});

export default Header;
