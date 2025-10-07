"use client";
import { useState } from "react";
import TypingText from "@/components/TypingRole";
import ContactForm from "@/components/ContactForm";
import FloatingPoints from "@/components/FloatingPoints";
import FloatingPointsDark from "@/components/FloatingPointsDark";
import { getIsDarkMode, setIsDarkMode } from "../../stateContext/GlobalState.js";
import { FaEnvelope, FaFileAlt, FaGithub, FaLinkedin, FaMoon, FaSun, FaUser, FaTerminal } from "react-icons/fa";
import InputBar from "@/components/InputBar";
import ChatWindow from "@/components/chatWindow";
import Footer from "@/components/Footer";

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


      <div className="flex items-center justify-center gap-6 border rounded w-max mx-auto p-2 mt-3 border-gray-300">
          <button onClick={toggleDarkMode} aria-label="toggle theme" className="p-1">
            {isDark ? <FaSun {...iconStyle} /> : <FaMoon {...iconStyle} />}
          </button>

          {[
            { id: "resume", icon: <FaFileAlt {...iconStyle} />, link: "/Dumallay, Genesis M..pdf", label: "Resume" },
            { id: "aboutme", icon: <FaUser {...iconStyle} />, link: "#aboutme-section", label: "About Me" },
            { id: "experience", icon: <FaTerminal {...iconStyle} />, link: "#experience-section", label: "Experience" }
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
            <h1 className="text-4xl font-bold text-center">Genesis Dumallay</h1>
            <p className="text-2xl font-bold text-gray-600 mt-1 mb-7 text-center">Software Engineer</p>
            <p className="text-gray-600 mt-1 mb-7 text-center">Chat with my assistant if you want to know more about me and explore my site with its help.</p>
            
            <TypingText onChange={(t: string) => setTypingText(t)} />
            <InputBar
              placeholder={typingText || "Type here..."}
              isDark={isDark}
              setToggleChat={setToggleChat}
              className="mx-auto block w-full max-w-2xl"
            />
          </div>
        </section>

        <section id="contact-section" className="fixed bottom-0 left-0 right-0 mt-30 mb-5 flex justify-center">
          <Footer></Footer>
          {/* <ContactForm isDark={isDark} /> */}
        </section>
      </div>
    </main>
  );
}
