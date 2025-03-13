"use client";
import { useState } from "react";
import { Inter } from "next/font/google";
import TypingText from "@/components/TypingRole";
import ContactForm from "@/components/ContactForm";
import FloatingPoints from "@/components/FloatingPoints";
import FloatingPointsDark from "@/components/FloatingPointsDark";
import { getIsDarkMode, setIsDarkMode } from "../../stateContext/GlobalState.js";
import { FaGithub, FaLinkedin, FaEnvelope, FaFileAlt, FaMoon, FaSun } from "react-icons/fa";



const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "600"] });

export default function Home() {
  const [isDark, setIsDark] = useState(getIsDarkMode());

  const toggleDarkMode = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    setIsDarkMode(newValue);
  };

  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const iconStyle = { color: isDark? "f2f2f2" : "#555", size: "1.5rem" };

  return (
    <main className={inter.className} style={{ margin: "0", padding: "0", position: "relative", minHeight: "100vh" }}>
      <div className="absolute top-0 left-0 w-full h-full -z-10">
  {isDark ? <FloatingPointsDark /> : <FloatingPoints />}
</div>

      {/* Nav Bar */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
          padding: "1rem 10vw",
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.05)",
          zIndex: 1000,
        }}
      >
        <div style={{ display: "flex", gap: "2.5rem", alignItems: "center" }}>
          {/* Dark Mode Toggle */}
          <div onClick={toggleDarkMode} style={{ cursor: "pointer" }}>
            {isDark ? <FaSun {...iconStyle} /> : <FaMoon {...iconStyle} />}
          </div>

          {[
            { id: "email", icon: <FaEnvelope {...iconStyle} />, label: "Email Me", link: "#contact-section" },
            { id: "github", icon: <FaGithub {...iconStyle} />, label: "GitHub", link: "https://github.com/genesisdumallay" },
            { id: "linkedin", icon: <FaLinkedin {...iconStyle} />, label: "LinkedIn", link: "www.linkedin.com/in/genesis-dumallay-565398356" },
            { id: "resume", icon: <FaFileAlt {...iconStyle} />, label: "Download Resume", link: "Dumallay, Genesis M..pdf" }
          ].map(({ id, icon, label, link }) => (
            <div
              key={id}
              onMouseEnter={() => setHoveredIcon(id)}
              onMouseLeave={() => setHoveredIcon(null)}
              onClick={() => setHoveredIcon(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: hoveredIcon === id ? "0.75rem" : "0rem",
                transition: "gap 0.2s ease-in-out",
              }}
            >
              {hoveredIcon === id && (
                <span
                  style={{
                    fontWeight: "bold",
                    color: isDark ? "#dbd9d9" : "#555",
                    fontSize: "1.1rem",
                    whiteSpace: "nowrap",
                    opacity: 1,
                    transition: "opacity 0.2s ease-in-out",
                  }}
                >
                  {label}
                </span>
              )}
              <a href={link || "#"} target={link?.startsWith("#") ? "_self" : "_blank"} rel="noopener noreferrer">
                {icon}
              </a>
            </div>
          ))}
        </div>
      </nav>

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
      `}</style>

      {/* Content Wrapper */}
      <div style={{ position: "relative", zIndex: 1, paddingTop: "5rem" }}>
        {/* About Me Section */}
        <section
          style={{
            minHeight: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            color: isDark ? "#d2d2d2" : "#333333",
          }}
        >
          <div
            style={{
              width: "clamp(45ch, 60%, 75ch)",
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <h1
              style={{
                fontWeight: "bold",
                fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
                marginTop: "10vh",
              }}
            >
              Genesis Dumallay
            </h1>
            <TypingText />
            <h2
              style={{
                fontWeight: 600,
                fontSize: "clamp(1.5rem, 3vw, 2.0rem)",
                marginTop: "clamp(4rem, 5vw, 4rem)",
                marginBottom: "clamp(1rem, 5vw, 1rem)",
              }}
            >
              About Me
            </h2>
            <p
              style={{
                fontWeight: 500,
                lineHeight: "1.8",
                textAlign: "justify",
                textWrap: "balance",
                wordBreak: "break-word",
              }}
            >
              Hello! I am Genesis,  and currently pursuing a Bachelor&apos;s in Computer Science at FEU Institute of Technology. I&apos;m an aspiring
              software engineer, certified in Java, Python, CCNA, and DevNet. With some experience in both front-end and
              back-end development, with a particular focus in back-end work. However, I enjoy full-stack
              development and am always open to learning and contributing to both ends of the stack.
            </p>
            <p
              style={{
                fontWeight: 500,
                lineHeight: "1.8",
                textAlign: "justify",
                textWrap: "balance",
                marginTop: "3vh",
                marginBottom: "16.5vh",
                wordBreak: "break-word",
              }}
            >
              I have a particular interest in software automation, making software solutions for repetitive tasks, saving
              time and resources, and increasing efficiency. I also have a particular interest in analyzing data and artificial
              intelligence, and aspire to develop technologies that enhance human-computer interaction and decision-making.
            </p>
          </div>
        </section>
      </div>

      <div id="contact-section" className={isDark ? "force-white dark-buttons" : "force-black light-buttons"}>
        <ContactForm />
      </div>

    </main>
  );
}
