"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaReply } from "react-icons/fa";
import { useTheme } from "@/hooks/ThemeContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AboutPage() {
  const { isDark } = useTheme();

  return (
    <main className="relative min-h-screen font-sans">
      <header className="sticky top-0 left-0 right-0 z-50 backdrop-blur-sm">
        <div className="px-6 pt-3">
          <Header setToggleChat={() => {}} />
        </div>
      </header>

      <div
        className={`pt-20 px-6 min-h-screen flex items-center justify-center ${
          isDark ? "text-gray-200" : "text-gray-900"
        }`}
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-6">
            <h1
              className={`text-5xl font-bold ${
                isDark ? "text-gray-100" : "text-gray-900"
              }`}
            >
              About Me
            </h1>
            <span
              className={`text-lg hidden sm:inline ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              |
            </span>
            <Link
              href="/"
              className={`sm:ml-3 text-lg underline underline-offset-2 inline-flex items-center gap-1 cursor-pointer transition-colors ${
                isDark
                  ? "text-blue-400 hover:text-blue-300"
                  : "text-blue-600 hover:text-blue-700"
              }`}
            >
              <FaReply className="text-[1.05rem]" />
              Return to home page
            </Link>
          </div>

          <div className="space-y-4 text-lg">
            <p>
              Hello, I&#39;m Genesis Dumallay, i'm currently looking into making
              a personal project primarily focused on automation.
            </p>

            <p>
              My experience primary lies in backend development. I always strive
              to make clean and efficient solutions
            </p>

            <p>
              Outside of software development, I like to take walks, to clear my
              mind and relax. I play video games, mostly gacha ones. Lastly, I
              love playing with my cat!
            </p>
          </div>

          <div className="mt-6 flex justify-start">
            <div className="rounded-lg overflow-hidden">
              <Image
                src="/cat.png"
                alt="Cat"
                width={320}
                height={240}
                className="object-contain shadow-md"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-auto">
        <Footer />
      </footer>
    </main>
  );
}
