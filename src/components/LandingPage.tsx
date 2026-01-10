import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import ChatWindow from "./chatWindow";
import TypingText from "./TypingRole";
import InputBar from "./InputBar";
import AboutMe from "./AboutMe";

import { useTheme } from "@/hooks/ThemeContext";
import { useInputBar } from "@/hooks/InputBarContext";
import { useAgentContext } from "@/hooks/AgentContext";

interface LandingPageProps {
  toggleChat: boolean;
  typingText: string;
  setToggleChat: (v: boolean) => void;
  setTypingText: (t: string) => void;
}

const LandingPage = memo(function LandingPage({
  toggleChat,
  typingText,
  setToggleChat,
  setTypingText,
}: LandingPageProps) {
  const { isDark } = useTheme();
  const [showEntrance, setShowEntrance] = useState(false);

  const { sendMessage } = useAgentContext();
  const { clear } = useInputBar();

  const handleInputSend = useCallback(
    (msg: string) => {
      setToggleChat(true);
      sendMessage(msg);
      clear();
    },
    [setToggleChat, sendMessage, clear]
  );
  const [entranceComplete, setEntranceComplete] = useState(false);
  const [entranceTransitionEnded, setEntranceTransitionEnded] = useState(false);
  const finalHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const animRef = useRef<HTMLHeadingElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const [animVisible, setAnimVisible] = useState(false);

  const moveHeadingToFinal = useCallback(() => {
    if (!animRef.current || !finalHeadingRef.current) {
      setAnimVisible(false);
      setEntranceComplete(true);
      return;
    }

    const el = animRef.current;
    const backdrop = backdropRef.current;
    const startRect = el.getBoundingClientRect();
    const endRect = finalHeadingRef.current.getBoundingClientRect();
    const deltaX = endRect.left - startRect.left;
    const deltaY = endRect.top - startRect.top;
    const scale = endRect.height / startRect.height;

    if (backdrop) {
      backdrop.style.transition = "opacity 700ms ease-out";
      backdrop.style.opacity = "0";
    }

    el.style.left = `${startRect.left}px`;
    el.style.top = `${startRect.top}px`;
    el.style.transform = "none";
    el.getBoundingClientRect();

    el.style.transition = "transform 900ms cubic-bezier(.2,.9,.2,1)";
    el.style.transformOrigin = "top left";
    el.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale})`;

    setTimeout(() => {
      setAnimVisible(false);
      setTimeout(() => {
        setEntranceComplete(true);
        setTimeout(() => setEntranceTransitionEnded(true), 2000);
      }, 50);
    }, 950);
  }, []);

  useEffect(() => {
    const entranceShown = sessionStorage.getItem("entrance_shown");

    if (!entranceShown) {
      setShowEntrance(true);
      setAnimVisible(true);
      sessionStorage.setItem("entrance_shown", "true");

      const timer = setTimeout(moveHeadingToFinal, 1200);
      return () => clearTimeout(timer);
    } else {
      setEntranceComplete(true);
      setEntranceTransitionEnded(true);
    }
  }, [moveHeadingToFinal]);

  const transitionClass =
    entranceComplete && !entranceTransitionEnded
      ? "transition-all duration-1000 ease-out"
      : "";

  return (
    <>
      {showEntrance && !entranceComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div
            ref={backdropRef}
            className={`absolute inset-0 backdrop-blur-3xl bg-[var(--backdrop-bg)]`}
          />
          {animVisible && (
            <h1
              ref={animRef}
              style={{
                position: "fixed",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 60,
                willChange: "transform",
              }}
              className={`font-semibold mb-2 text-[var(--site-heading)] text-6xl`}
            >
              Hi, I&#39;m Genesis!
            </h1>
          )}
        </div>
      )}

      <div
        className={`flex items-center justify-center text-[var(--site-text)]`}
      >
        {toggleChat && <ChatWindow toggleChat={setToggleChat} />}

        <div className={`w-full max-w-[48rem] mx-auto px-4 ${transitionClass}`}>
          <div className={`w-full ${transitionClass} text-left`}>
            <h1
              ref={finalHeadingRef}
              style={{
                visibility: showEntrance && animVisible ? "hidden" : "visible",
              }}
              className={`font-semibold mb-2 ${transitionClass} text-[var(--site-heading)] text-6xl`}
            >
              Hi, I&#39;m Genesis!
            </h1>

            <div
              className={`${
                entranceComplete && !entranceTransitionEnded
                  ? "transition-all duration-1000 delay-300"
                  : ""
              } ${
                showEntrance && !entranceComplete
                  ? "opacity-0 translate-y-4"
                  : "opacity-100 translate-y-0"
              }`}
            >
              <p className="text-2xl mt-1 mb-7 ml-1">
                Software Engineer |{" "}
                <Link
                  href="/about"
                  className="underline underline-offset-2 inline-flex items-center gap-1 text-[1.05rem]"
                >
                  more about me <FaArrowRight className="text-[1.05rem]" />
                </Link>
              </p>
              <TypingText onChange={(t: string) => setTypingText(t)} />

              <div id="about-me-section" className="mt-6 mb-6">
                <AboutMe />
              </div>

              <p
                className={`mt-4 mb-4 ml-1 text-sm text-[var(--site-text)] opacity-80`}
              >
                Chat with my assistant if you want to know more about me with
                its help.
              </p>

              <InputBar
                placeholder={typingText || "Type here..."}
                setToggleChat={setToggleChat}
                onSend={handleInputSend}
                className="mx-auto block"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default LandingPage;
