"use client";
import { useState } from "react";
import FloatingPoints from "@/components/FloatingPoints";
import FloatingPointsDark from "@/components/FloatingPointsDark";
import Footer from "@/components/Footer";
import LandingPage from "@/components/LandingPage";
import Header from "@/components/Header";
import AboutMe from "@/components/AboutMe";
import Experience from "@/components/Experience";
import { useTheme } from "@/hooks/ThemeContext";

export default function Home() {
  const { isDark } = useTheme();
  const [toggleChat, setToggleChat] = useState(false);
  const [typingText, setTypingText] = useState("");

  return (
    <main className="relative min-h-screen font-sans">
      <div className="absolute inset-0 -z-10">
        {isDark ? <FloatingPointsDark /> : <FloatingPoints />}
      </div>

      <header className="sticky top-0 left-0 right-0 z-50 backdrop-blur-sm">
        <div className="px-6 pt-3">
          <Header setToggleChat={setToggleChat} />
        </div>
      </header>

      <div className="pt-20 px-6">
        {/* <div className="backdrop-blur-[2px] bg-white/10 dark:bg-black/20"> */}
        <section id="landing-page-section" className="mt-20">
          <LandingPage
            toggleChat={toggleChat}
            typingText={typingText}
            setToggleChat={setToggleChat}
            setTypingText={setTypingText}
          ></LandingPage>
        </section>
        {/* </div> */}

        <div className="bg-transparent backdrop-blur">
          <section id="about-me-section" className="mt-80">
            <AboutMe />
          </section>

          <section id="experience-section" className="mt-30">
            <Experience />
          </section>

          <section
            id="contact-section"
            className="mt-30 mb-5 flex justify-center"
          >
            <Footer></Footer>
            {/* <ContactForm isDark={isDark} /> */}
          </section>
        </div>
      </div>
    </main>
  );
}
