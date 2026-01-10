"use client";
import { useEffect, useState, useRef, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import { useTheme } from "@/hooks/ThemeContext";
import Header from "@/components/Header";
import { Project } from "@/models/types";
import { getProjectBySlug } from "@/data/projects";

interface TransitionData {
  projectSlug: string;
  sourceRect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  imageRect?: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

export default function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { isDark } = useTheme();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [initialPosition, setInitialPosition] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const finalImageRef = useRef<HTMLDivElement>(null);
  const flyingImageRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  const transitionDataRef = useRef<TransitionData | null>(null);
  if (transitionDataRef.current === null && typeof window !== "undefined") {
    const stored = sessionStorage.getItem("project_transition");
    if (stored) {
      const data: TransitionData = JSON.parse(stored);
      if (data.projectSlug === slug) {
        transitionDataRef.current = data;
        sessionStorage.removeItem("project_transition");
      }
    }
  }
  const transitionData = transitionDataRef.current;

  useEffect(() => {
    const foundProject = getProjectBySlug(slug);
    if (foundProject) {
      setProject(foundProject);
    }
    setIsLoading(false);
  }, [slug]);

  useEffect(() => {
    if (!transitionData) {
      setAnimationComplete(true);
      return;
    }
    const sourceRect = transitionData.imageRect || transitionData.sourceRect;
    setInitialPosition(sourceRect);
  }, [transitionData]);

  useEffect(() => {
    if (!transitionData || !project || !initialPosition || hasAnimated.current)
      return;

    const flyingEl = flyingImageRef.current;
    const finalEl = finalImageRef.current;

    if (!flyingEl || !finalEl) {
      setAnimationComplete(true);
      return;
    }

    const timer = setTimeout(() => {
      if (hasAnimated.current) return;
      hasAnimated.current = true;

      const endRect = finalEl.getBoundingClientRect();
      const sourceRect = initialPosition;
      const deltaX = endRect.left - sourceRect.left;
      const deltaY = endRect.top - sourceRect.top;
      const scaleX = endRect.width / sourceRect.width;
      const scaleY = endRect.height / sourceRect.height;

      flyingEl.style.transition =
        "transform 700ms cubic-bezier(0.2, 0.9, 0.2, 1), border-radius 700ms ease-out";
      flyingEl.style.transformOrigin = "top left";
      flyingEl.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`;
      flyingEl.style.borderRadius = "1rem";

      setTimeout(() => {
        setAnimationComplete(true);
      }, 750);
    }, 50);

    return () => clearTimeout(timer);
  }, [transitionData, project, initialPosition]);

  if (isLoading) {
    return (
      <main className="relative min-h-screen">
        <div className="flex items-center justify-center min-h-screen">
          <div
            className={`text-xl ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            Loading...
          </div>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="relative min-h-screen">
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <div
            className={`text-xl ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            Project not found
          </div>
          <Link
            href="/projects"
            className={`flex items-center gap-2 ${
              isDark ? "text-cyan-400" : "text-cyan-600"
            } hover:underline`}
          >
            <FaArrowLeft /> Back to projects
          </Link>
        </div>
      </main>
    );
  }

  const isAnimating = !animationComplete && transitionData;

  return (
    <main className="relative min-h-screen">
      {transitionData &&
        project?.image &&
        initialPosition &&
        !animationComplete && (
          <div
            ref={flyingImageRef}
            className={isDark ? "bg-[#4a4a4a]" : "bg-white"}
            style={{
              position: "fixed",
              top: initialPosition.top,
              left: initialPosition.left,
              width: initialPosition.width,
              height: initialPosition.height,
              zIndex: 9999,
              borderRadius: "0.5rem",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              pointerEvents: "none",
              padding: "8px",
            }}
          >
            <div className="relative w-full h-full rounded overflow-hidden">
              <Image
                src={project.image}
                alt={project.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}

      <header className="sticky top-0 left-0 right-0 z-40 backdrop-blur-sm">
        <div className="px-6 pt-3">
          <Header setToggleChat={() => {}} />
        </div>
      </header>

      <div className="pt-20 px-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className={`flex items-center gap-2 mb-8 ${
              isDark
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-600 hover:text-gray-800"
            } transition-colors`}
            style={{
              opacity: isAnimating ? 0 : 1,
              transition: "opacity 400ms ease-out",
              transitionDelay: "200ms",
            }}
          >
            <FaArrowLeft />
            Back
          </button>

          {project.image && (
            <div
              ref={finalImageRef}
              className={`relative w-full p-3 rounded-2xl mb-8
                ${isDark ? "bg-[#4a4a4a]" : "bg-white"}`}
              style={{
                visibility: isAnimating ? "hidden" : "visible",
              }}
            >
              <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}

          <div
            className="flex flex-col gap-4 mb-8"
            style={{
              opacity: isAnimating ? 0 : 1,
              transform: isAnimating ? "translateY(20px)" : "translateY(0)",
              transition: "opacity 400ms ease-out, transform 400ms ease-out",
              transitionDelay: "100ms",
            }}
          >
            <div className="flex items-start justify-between flex-wrap gap-4">
              <h1
                className={`text-4xl font-bold ${
                  isDark ? "text-gray-100" : "text-gray-900"
                }`}
              >
                {project.name}
              </h1>

              {project.date && (
                <span
                  className={`text-sm px-3 py-1 rounded-full ${
                    isDark
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {project.date}
                </span>
              )}
            </div>

            {project.github && (
              <a
                href={`https://github.com/${project.github.owner}/${project.github.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 text-sm ${
                  isDark ? "text-cyan-400" : "text-cyan-600"
                } hover:underline`}
              >
                <FaGithub />
                {project.github.owner}/{project.github.repo}
                <FaExternalLinkAlt className="text-xs" />
              </a>
            )}
          </div>

          <div
            className="mb-8"
            style={{
              opacity: isAnimating ? 0 : 1,
              transform: isAnimating ? "translateY(20px)" : "translateY(0)",
              transition: "opacity 400ms ease-out, transform 400ms ease-out",
              transitionDelay: "200ms",
            }}
          >
            <p
              className={`text-lg leading-relaxed whitespace-pre-line ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {project.fullDescription || project.description}
            </p>
          </div>

          {project.tags && project.tags.length > 0 && (
            <div
              className="mb-8"
              style={{
                opacity: isAnimating ? 0 : 1,
                transform: isAnimating ? "translateY(20px)" : "translateY(0)",
                transition: "opacity 400ms ease-out, transform 400ms ease-out",
                transitionDelay: "300ms",
              }}
            >
              <h3
                className={`text-sm font-medium mb-3 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className={`text-sm px-3 py-1 rounded-full ${
                      isDark
                        ? "bg-gray-700 text-cyan-400"
                        : "bg-gray-200 text-cyan-600"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
