"use client";
import { memo, useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaArrowRight } from "react-icons/fa";
import { useTheme } from "@/hooks/ThemeContext";
import ProjectCard from "./ProjectCard";
import { Project } from "@/models/types";
import { DUMMY_PROJECTS } from "@/data/projects";

const FeaturedProjects = memo(function FeaturedProjects() {
  const { isDark } = useTheme();
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const projects = useMemo(() => [...DUMMY_PROJECTS, ...DUMMY_PROJECTS], []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let animationId: number;
    let lastTime = 0;
    const scrollSpeed = 0.5;

    const animate = (currentTime: number) => {
      if (!isPaused) {
        const delta = lastTime ? currentTime - lastTime : 0;
        const scrollAmount = (delta / 16) * scrollSpeed;

        container.scrollLeft += scrollAmount;

        const halfWidth = container.scrollWidth / 2;
        if (container.scrollLeft >= halfWidth) {
          container.scrollLeft = 0;
        }
      }
      lastTime = currentTime;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPaused]);

  const handleNavigate = useCallback(
    (project: Project, cardRect: DOMRect, imageRect: DOMRect) => {
      sessionStorage.setItem(
        "project_transition",
        JSON.stringify({
          projectSlug: project.slug,
          sourceRect: {
            top: cardRect.top,
            left: cardRect.left,
            width: cardRect.width,
            height: cardRect.height,
          },
          imageRect: {
            top: imageRect.top,
            left: imageRect.left,
            width: imageRect.width,
            height: imageRect.height,
          },
        })
      );

      router.push(`/project/${project.slug}`);
    },
    [router]
  );

  return (
    <div
      className={`flex items-center justify-center ${
        isDark ? "text-gray-200" : "text-gray-900"
      }`}
    >
      <div className="w-full max-w-[48rem] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2
            className={`text-2xl font-semibold ${
              isDark ? "text-gray-200" : "text-gray-800"
            }`}
          >
            Things I&apos;ve worked on!
          </h2>

          {/* <Link
            href="/projects"
            className={`flex items-center gap-2 text-sm hover:underline
              ${
                isDark
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-600 hover:text-gray-800"
              }`}
          >
            View all <FaArrowRight className="text-xs" />
          </Link> */}
        </div>

        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            ref={scrollContainerRef}
            className="flex items-center justify-center py-8"
            style={{
              maskImage:
                "linear-gradient(to right, transparent, black 20px, black calc(100% - 20px), transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 20px, black calc(100% - 20px), transparent)",
            }}
          >
            {/* {projects.map((project, idx) => (
              <ProjectCard
                key={`${project._id}-${idx}`}
                project={project}
                onNavigate={handleNavigate}
              />
            ))} */}
            <p className="text-center italic">
              In development, i just want to tell you im working on it!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default FeaturedProjects;
