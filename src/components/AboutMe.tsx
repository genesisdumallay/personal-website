"use client";
import React, { useEffect, useRef, useState, useCallback, memo } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useTheme } from "@/hooks/ThemeContext";

const FUN_FACT_IMAGE = "/icons8-github.svg";

const AboutMe = memo(function AboutMe() {
  const { isDark } = useTheme();
  const [showSvg, setShowSvg] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const fadeTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);

  const handleShow = useCallback(() => {
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);

    setShowSvg(true);
    setFadeOut(false);

    fadeTimer.current = window.setTimeout(() => setFadeOut(true), 2500);
    hideTimer.current = window.setTimeout(() => {
      setShowSvg(false);
      setFadeOut(false);
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = FUN_FACT_IMAGE;
    document.head.appendChild(link);

    return () => {
      link.remove();
    };
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleShow();
      }
    },
    [handleShow]
  );

  return (
    <>
      <div className={`${isDark ? "text-gray-200" : "text-gray-900"}`}>
        <p className="leading-relaxed text-justify">
          Hello! I am Genesis. I am based in Quezon City. I&#39;m a software
          developer, with my experience primarily in web development. I am an
          advocate to using AI for software automation solutions. As a Software
          Engineer, I try to solve problems through efficient, effective and
          clean solutions.{" "}
          <span
            className="font-semibold text-lg md:text-xl cursor-pointer underline underline-offset-2 hover:opacity-95 focus:outline-none focus-visible:underline"
            role="button"
            tabIndex={0}
            onClick={handleShow}
            onKeyDown={handleKeyDown}
          >
            Fun fact!
          </span>
        </p>
      </div>

      {showSvg &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 backdrop-blur-md ${
              isDark ? "bg-slate-900/60" : "bg-white/30"
            } ${fadeOut ? "opacity-0" : "opacity-100"}`}
          >
            <div className="flex flex-col items-center gap-4 pointer-events-none">
              <Image
                src={FUN_FACT_IMAGE}
                alt="decoration"
                width={192}
                height={192}
                className={`${
                  isDark ? "filter invert" : ""
                } transition duration-200`}
              />
              <p
                className={`${
                  isDark ? "text-white" : "text-gray-900"
                } text-3xl md:text-4xl font-semibold`}
              >
                I love cats!
              </p>
            </div>
          </div>,
          document.body
        )}
    </>
  );
});

export default AboutMe;
