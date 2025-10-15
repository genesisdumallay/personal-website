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

export default function Home() {
  const [isDark, setIsDark] = useState(getIsDarkMode());
  const [toggleChat, setToggleChat] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
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

      <Header
        isDark={isDark}
        toggleDarkMode={toggleDarkMode}
        setIsDark={setIsDark}
        setToggleChat={setToggleChat}
        setShowAbout={setShowAbout}
      />

      <div className="pt-20 px-6">
        {showAbout ? (
          <section id="aboutme-section">
            <AboutMe isDark={isDark} />
          </section>
        ) : (
          <LandingPage
            isDark={isDark}
            toggleChat={toggleChat}
            typingText={typingText}
            setIsDark={setIsDark}
            setToggleChat={setToggleChat}
            setTypingText={setTypingText}
          ></LandingPage>
        )}

        <section
          id="contact-section"
          className="fixed bottom-0 left-0 right-0 mt-30 mb-5 flex justify-center"
        >
          <Footer></Footer>
          {/* <ContactForm isDark={isDark} /> */}
        </section>
      </div>
    </main>
  );
}
