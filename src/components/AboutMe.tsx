"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useTheme } from "@/hooks/ThemeContext";

const AboutMe = () => {
  const { isDark } = useTheme();
  const [showSvg, setShowSvg] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const fadeTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);

  const FUN_FACT_IMAGE = "/icons8-github.svg";
  const preloadLinkRef = useRef<HTMLLinkElement | null>(null);
  const preloadedImgRef = useRef<HTMLImageElement | null>(null);

  const handleShow = useCallback(() => {
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);

    setShowSvg(true);
    setFadeOut(false);

    fadeTimer.current = window.setTimeout(() => setFadeOut(true), 3000);
    hideTimer.current = window.setTimeout(() => {
      setShowSvg(false);
      setFadeOut(false);
    }, 3500);
  }, []);

  useEffect(() => {
    return () => {
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const href = FUN_FACT_IMAGE;

    if (!document.querySelector(`link[rel="preload"][href="${href}"]`)) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = href;
      document.head.appendChild(link);
      preloadLinkRef.current = link;
    }

    const img = new window.Image();
    img.src = href;
    preloadedImgRef.current = img;

    return () => {
      if (preloadLinkRef.current) {
        preloadLinkRef.current.remove();
        preloadLinkRef.current = null;
      }
      preloadedImgRef.current = null;
    };
  }, []);

  return (
    <div
      className={`flex items-center justify-center ${
        isDark ? "text-gray-200" : "text-gray-900"
      }`}
    >
      <div className="w-full max-w-[48rem] mx-auto px-4">
        <h1 className="text-4xl font-semibold mb-5 text-left">About Me</h1>
        <p className="leading-relaxed text-justify">
          Hello! I am Genesis. I am based in Quezon City. I&#39;m a software
          developer, with my experience primarily in web development. I am an
          advocate to using AI for software automation solutions. As a Software
          Engineer, I try to solve problems through efficient, effective and
          clean solutions. I prefer being in backend develpoment, enjoying
          tackling technical challenges.{" "}
          <span
            className="font-semibold text-lg md:text-xl cursor-pointer underline underline-offset-2 hover:opacity-95 focus:outline-none focus-visible:underline"
            role="button"
            tabIndex={0}
            onClick={handleShow}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleShow();
              }
            }}
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
                src="/icons8-github.svg"
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
    </div>
  );
};

export default AboutMe;
