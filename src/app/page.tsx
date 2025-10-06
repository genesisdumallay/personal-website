"use client";
import { useState } from "react";
import TypingText from "@/components/TypingRole";
import ContactForm from "@/components/ContactForm";
import FloatingPoints from "@/components/FloatingPoints";
import FloatingPointsDark from "@/components/FloatingPointsDark";
import { getIsDarkMode, setIsDarkMode } from "../../stateContext/GlobalState.js";
import { FaEnvelope, FaFileAlt, FaGithub, FaLinkedin, FaMoon, FaSun, FaUser } from "react-icons/fa";
import InputBar from "@/components/InputBar";
import ChatWindow from "@/components/chatWindow";

export default function Home() {
  const [isDark, setIsDark] = useState(getIsDarkMode());
  const [toggleChat, setToggleChat] = useState(false);
  const [typingText, setTypingText] = useState("");

  const toggleDarkMode = () => {
    const v = !isDark;
    setIsDark(v);
    setIsDarkMode(v);
  };

  const [hovered, setHovered] = useState<string | null>(null);

  const iconStyle = { size: 20 };

  return (
    <main className="relative min-h-screen font-sans">
      <div className="absolute inset-0 -z-10">{isDark ? <FloatingPointsDark /> : <FloatingPoints />}</div>


      <div className="flex items-center justify-center gap-6 border rounded w-max mx-auto p-2 mt-2 border-gray-300">
          <button onClick={toggleDarkMode} aria-label="toggle theme" className="p-1">
            {isDark ? <FaSun {...iconStyle} /> : <FaMoon {...iconStyle} />}
          </button>

          {[
            { id: "email", icon: <FaEnvelope {...iconStyle} />, link: "#contact-section", label: "Email" },
            { id: "github", icon: <FaGithub {...iconStyle} />, link: "https://github.com/genesisdumallay", label: "GitHub" },
            { id: "linkedin", icon: <FaLinkedin {...iconStyle} />, link: "https://www.linkedin.com/in/genesis-dumallay-565398356", label: "LinkedIn" },
            { id: "resume", icon: <FaFileAlt {...iconStyle} />, link: "/Dumallay, Genesis M..pdf", label: "Resume" },
            { id: "aboutme", icon: <FaUser {...iconStyle} />, link: "#aboutme-section", label: "About Me" }
          ].map((it) => (
            <a
              key={it.id}
              href={it.link}
              onMouseEnter={() => setHovered(it.id)}
              onMouseLeave={() => setHovered(null)}
              className="flex items-center gap-2"
            >
              {hovered === it.id && <span className="text-sm">{it.label}</span>}
              <span>{it.icon}</span>
            </a>
          ))}

          <button
            className="border-l px-3 py-1 hover:bg-gray-200"
            onClick={async () => {
              setToggleChat(true);
            }}
          >
            Chat
          </button>
        </div>



      <div className="pt-20 px-6">

        <section className={`min-h-[60vh] flex items-center justify-center ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
          

          {toggleChat && <ChatWindow toggleChat={setToggleChat} />}

          <div className="max-w-4xl">
            <h1 className="text-4xl font-bold">Genesis Dumallay</h1>
            
            <TypingText onChange={(t: string) => setTypingText(t)} />
            <InputBar placeholder={typingText || "Type here..."} isDark={isDark} setToggleChat={setToggleChat}/>
          </div>
        </section>

        <section id="contact-section" className="py-12 flex justify-center">
          <ContactForm isDark={isDark} />
        </section>
      </div>
    </main>
  );
}
