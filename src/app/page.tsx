"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import FloatingPoints from "@/components/FloatingPoints";
import Footer from "@/components/Footer";
import LandingPage from "@/components/LandingPage";
import Header from "@/components/Header";
import AboutMe from "@/components/AboutMe";
import Experience from "@/components/Experience";
import ContactForm from "@/components/ContactForm";
import { useTheme } from "@/hooks/ThemeContext";

export default function Home() {
  const { isDark } = useTheme();
  const [toggleChat, setToggleChat] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [showContact, setShowContact] = useState(false);
  const contactRef = useRef<HTMLDivElement | null>(null);

  const handleToggleContact = useCallback(() => {
    setShowContact((s) => !s);
  }, []);

  const handleCloseContact = useCallback(() => {
    setShowContact(false);
  }, []);

  useEffect(() => {
    if (showContact && contactRef.current) {
      contactRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      const t = setTimeout(() => {
        const focusable = contactRef.current?.querySelector<
          HTMLInputElement | HTMLTextAreaElement | HTMLElement
        >('input[name="email"], input, textarea, button, [tabindex]');
        (focusable as HTMLElement | null)?.focus();
      }, 360);

      return () => clearTimeout(t);
    }
  }, [showContact]);

  return (
    <main className="relative min-h-screen font-sans">
      <div className="absolute inset-0 -z-10">
        <FloatingPoints isDark={isDark} />
      </div>

      <header className="sticky top-0 left-0 right-0 z-50 backdrop-blur-sm">
        <div className="px-6 pt-3">
          <Header setToggleChat={setToggleChat} />
        </div>
      </header>

      <div className="pt-20 px-6">
        <section id="landing-page-section" className="mt-20">
          <LandingPage
            toggleChat={toggleChat}
            typingText={typingText}
            setToggleChat={setToggleChat}
            setTypingText={setTypingText}
          ></LandingPage>
        </section>

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
            <div
              className={`relative flex flex-wrap items-center gap-6 w-full max-w-4xl transition-all duration-300 justify-center`}
            >
              <div className={`flex items-center gap-6 z-10`}>
                <Footer
                  onOpenContact={handleToggleContact}
                  isContactOpen={showContact}
                />
              </div>

              {showContact && (
                <div
                  ref={contactRef}
                  className="w-full flex justify-center mt-4"
                >
                  <ContactForm onClose={handleCloseContact} />
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
