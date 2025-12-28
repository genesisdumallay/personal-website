import React, { useState, useEffect, useRef } from "react";
import ChatWindow from "./chatWindow";
import TypingText from "./TypingRole";
import InputBar from "./InputBar";

import { useTheme } from "@/hooks/ThemeContext";

interface LandingPageProps {
  toggleChat: boolean;
  typingText: string;
  setToggleChat: (v: boolean) => void;
  setTypingText: (t: string) => void;
}

const LandingPage = ({
  toggleChat,
  typingText,
  setToggleChat,
  setTypingText,
}: LandingPageProps) => {
  const { isDark } = useTheme();
  const [showEntrance, setShowEntrance] = useState(false);
  const [entranceComplete, setEntranceComplete] = useState(false);
  const [entranceTransitionEnded, setEntranceTransitionEnded] = useState(false);
  const finalHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const animRef = useRef<HTMLHeadingElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const [animVisible, setAnimVisible] = useState(false);

  useEffect(() => {
    const hasShownEntrance = false;

    if (!hasShownEntrance) {
      setShowEntrance(true);
      setAnimVisible(true);

      const timer = setTimeout(() => {
        moveHeadingToFinal();
      }, 1200);

      return () => clearTimeout(timer);
    } else {
      setEntranceComplete(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moveHeadingToFinal = () => {
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

    // Calculate scale based on size difference
    const scale = endRect.height / startRect.height;

    if (backdrop) {
      backdrop.style.transition = "opacity 700ms ease-out";
      backdrop.style.opacity = "0";
    }

    el.style.left = `${startRect.left}px`;
    el.style.top = `${startRect.top}px`;
    el.style.transform = "none";

    // Force reflow so browser registers the new position
    el.getBoundingClientRect();

    el.style.transition = "transform 900ms cubic-bezier(.2,.9,.2,1)";
    el.style.transformOrigin = "top left";
    el.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale})`;

    setTimeout(() => {
      setAnimVisible(false);
      setEntranceComplete(true);

      setTimeout(() => {
        setEntranceTransitionEnded(true);
      }, 2000);
    }, 950);
  };

  return (
    <>
      {showEntrance && !entranceComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div
            ref={backdropRef}
            className="absolute inset-0 backdrop-blur-3xl bg-black/60"
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
              className={`font-semibold mb-2 ${
                isDark ? "text-gray-300" : "text-gray-800"
              } text-6xl`}
            >
              Hi, I&#39;m Genesis!
            </h1>
          )}
        </div>
      )}

      <div
        className={`flex items-center justify-center ${
          isDark ? "text-gray-200" : "text-gray-900"
        }`}
      >
        {toggleChat && <ChatWindow toggleChat={setToggleChat} />}

        <div
          className={`w-full max-w-[45rem] mx-auto px-4 ${
            entranceComplete && !entranceTransitionEnded
              ? "transition-all duration-1000 ease-out"
              : ""
          }`}
        >
          <div
            className={`w-full ${
              entranceComplete && !entranceTransitionEnded
                ? "transition-all duration-1000 ease-out"
                : ""
            } text-left`}
          >
            <h1
              ref={finalHeadingRef}
              style={{
                visibility: showEntrance && animVisible ? "hidden" : "visible",
              }}
              className={`font-semibold mb-2 ${
                entranceComplete && !entranceTransitionEnded
                  ? "transition-all duration-1000 ease-out"
                  : ""
              } ${isDark ? "text-gray-300" : "text-gray-800"} ${"text-6xl"}`}
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
              <p className="text-2xl mt-1 mb-7 ml-1">Software Engineer</p>
              <p className="mt-1 mb-7 ml-1">
                Chat with my assistant if you want to know more about me and
                explore my site with its help. (CHATBOT WORK IN PROGRESS)
              </p>

              <TypingText onChange={(t: string) => setTypingText(t)} />
              <InputBar
                placeholder={typingText || "Type here..."}
                setToggleChat={setToggleChat}
                className="mx-auto block"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
