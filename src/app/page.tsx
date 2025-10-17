"use client";
import { useState, useEffect } from "react";
import FloatingPoints from "@/components/FloatingPoints";
import FloatingPointsDark from "@/components/FloatingPointsDark";
import {
  getIsDarkMode,
  setIsDarkMode,
} from "../../stateContext/GlobalState.js";
import Footer from "@/components/Footer";
import LandingPage from "@/components/LandingPage";
import Header from "@/components/Header";
import AboutMe from "@/components/AboutMe";
import Experience from "@/components/Experience";

export default function Home() {
  const [isDark, setIsDark] = useState(getIsDarkMode());
  const [toggleChat, setToggleChat] = useState(false);
  const [typingText, setTypingText] = useState("");

  const toggleDarkMode = () => {
    const v = !isDark;
    setIsDark(v);
    setIsDarkMode(v);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [isDark]);

  return (
    <main className="relative min-h-screen font-sans">
      <div className="absolute inset-0 -z-10">
        {isDark ? <FloatingPointsDark /> : <FloatingPoints />}
      </div>

      <header
        className={`sticky top-0 left-0 right-0 z-50 backdrop-blur-sm ${
          isDark ? "bg-gray-900/60" : "bg-white/60"
        }`}
      >
        <div className="px-6 pt-3">
          <Header
            isDark={isDark}
            toggleDarkMode={toggleDarkMode}
            setIsDark={setIsDark}
            setToggleChat={setToggleChat}
          />
        </div>
      </header>

      <div className="pt-20 px-6">
        <section id="landing-page-section" className="mt-20">
          <LandingPage
            isDark={isDark}
            toggleChat={toggleChat}
            typingText={typingText}
            setIsDark={setIsDark}
            setToggleChat={setToggleChat}
            setTypingText={setTypingText}
          ></LandingPage>
        </section>

        <div className="bg-transparent backdrop-blur">
          <section id="about-me-section" className="mt-80">
            <AboutMe isDark={isDark} />
          </section>

          <section id="experience-section" className="mt-80">
            <Experience isDark={isDark} />
          </section>

          <section
            id="contact-section"
            className="mt-30 mb-5 flex justify-center"
          >
            <Footer isDark={isDark}></Footer>
            {/* <ContactForm isDark={isDark} /> */}
          </section>
        </div>
      </div>
    </main>
  );
}
