"use client";
import { memo, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "@/hooks/ThemeContext";
import { Project } from "@/models/types";

interface ProjectCardProps {
  project: Project;
  onNavigate?: (
    project: Project,
    cardRect: DOMRect,
    imageRect: DOMRect
  ) => void;
}

const ProjectCard = memo(function ProjectCard({
  project,
  onNavigate,
}: ProjectCardProps) {
  const { isDark } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleClick = useCallback(() => {
    if (cardRef.current && imageRef.current && onNavigate) {
      const cardRect = cardRef.current.getBoundingClientRect();
      const imageRect = imageRef.current.getBoundingClientRect();
      onNavigate(project, cardRect, imageRect);
    } else {
      router.push(`/project/${project.slug}`);
    }
  }, [project, onNavigate, router]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex flex-col rounded-2xl p-5 w-[380px] min-w-[380px] cursor-pointer
        border border-transparent hover:border-gray-500
        transition-all duration-200 ease-out
        bg-[var(--project-card-bg)] force-project
        ${isHovered ? "scale-[1.02]" : ""}`}
    >
      {/* Image Container */}
      <div
        ref={imageRef}
        className={`relative w-full p-2 rounded-lg mb-4
          bg-[var(--project-image-bg)] force-project-image`}
      >
        <div className="relative w-full aspect-[16/10] rounded overflow-hidden">
          {project.image && (
            <Image
              src={project.image}
              alt={project.name}
              fill
              className="object-cover"
              sizes="380px"
            />
          )}
        </div>
      </div>

      {/* Project Info */}
      <div className="flex flex-col gap-2">
        <h3
          className={`text-lg font-medium ${
            isDark ? "text-gray-200" : "text-gray-800"
          }`}
        >
          {project.name}
        </h3>

        <p
          className={`text-sm line-clamp-2 ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {project.description}
        </p>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {project.tags.slice(0, 5).map((tag, idx) => (
              <span
                key={idx}
                className={`text-xs px-2 py-1 rounded-md
                  ${
                    isDark
                      ? "bg-gray-700 text-cyan-400"
                      : "bg-gray-200 text-cyan-600"
                  }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default ProjectCard;
