"use client";
import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FaFolderOpen, FaArrowLeft } from "react-icons/fa";
import { useTheme } from "@/hooks/ThemeContext";
import Header from "@/components/Header";
import ProjectCard from "@/components/ProjectCard";
import { Project } from "@/models/types";
import { getAllProjects } from "@/data/projects";

export default function ProjectsPage() {
  const { isDark } = useTheme();
  const router = useRouter();

  const projects = useMemo(() => getAllProjects(), []);

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
    <main className="relative min-h-screen">
      <header className="sticky top-0 left-0 right-0 z-50 backdrop-blur-sm">
        <div className="px-6 pt-3">
          <Header setToggleChat={() => {}} />
        </div>
      </header>

      <div className="pt-20 px-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.push("/")}
            className={`flex items-center gap-2 mb-8 ${
              isDark
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-600 hover:text-gray-800"
            } transition-colors`}
          >
            <FaArrowLeft />
            Back to Home
          </button>

          <div className="flex items-center gap-3 mb-8">
            <FaFolderOpen
              className={`text-2xl ${
                isDark ? "text-yellow-400" : "text-yellow-600"
              }`}
            />
            <h1
              className={`text-3xl font-bold ${
                isDark ? "text-gray-100" : "text-gray-900"
              }`}
            >
              Projects
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project._id} className="flex justify-center">
                <ProjectCard project={project} onNavigate={handleNavigate} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
