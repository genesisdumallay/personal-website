import { Project } from "@/models/types";

export const DUMMY_PROJECTS: Project[] = [
  {
    _id: "1",
    slug: "distributed-scheduler",
    name: "Distributed Scheduler",
    description:
      "A highly-scalable distributed task scheduler with fault-tolerant execution, priority queues, and real-time monitoring dashboard.",
    fullDescription:
      "A comprehensive distributed task scheduling system built from the ground up. Features include automatic failover, task prioritization, worker health monitoring, and a beautiful real-time dashboard for observing task execution across the cluster.\n\nThe system is designed to handle millions of tasks per day with minimal latency. It uses a leader-follower architecture for high availability and implements optimistic locking for concurrent task assignments.",
    techStack: ["golang", "redis", "docker", "kubernetes"],
    tags: ["golang", "distributed-systems", "scheduler", "redis"],
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
    github: { owner: "genesis", repo: "distributed-scheduler" },
    contributors: 12,
    date: "December 2025",
    featured: true,
  },
  {
    _id: "2",
    slug: "neural-canvas",
    name: "Neural Canvas",
    description:
      "An AI-powered creative tool that transforms sketches into stunning artwork using state-of-the-art diffusion models.",
    fullDescription:
      "Neural Canvas is an innovative application that leverages cutting-edge AI models to transform simple sketches into professional-quality artwork. Users can choose from various artistic styles, adjust parameters in real-time, and export their creations in multiple formats.\n\nThe tool supports multiple input methods including mouse, tablet, and touch, with pressure sensitivity for more natural drawing experiences.",
    techStack: ["python", "pytorch", "react", "typescript"],
    tags: ["python", "ai", "machine-learning", "react"],
    image:
      "https://images.unsplash.com/photo-1547954575-855750c57bd3?w=800&q=80",
    github: { owner: "genesis", repo: "neural-canvas" },
    contributors: 8,
    date: "October 2025",
    featured: true,
  },
  {
    _id: "3",
    slug: "realtime-collab",
    name: "Realtime Collab",
    description:
      "A collaborative workspace platform enabling real-time document editing, video conferencing, and project management.",
    fullDescription:
      "Realtime Collab brings teams together with seamless real-time document collaboration, integrated video calls, task management, and smart notifications. Built with operational transformation for conflict-free editing.\n\nThe platform includes rich text editing, code syntax highlighting, embedded media support, and version history with the ability to restore previous document states.",
    techStack: ["typescript", "next.js", "websocket", "postgresql"],
    tags: ["typescript", "collaboration", "websocket", "next.js"],
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
    github: { owner: "genesis", repo: "realtime-collab" },
    contributors: 15,
    date: "August 2025",
    featured: false,
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return DUMMY_PROJECTS.find((p) => p.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return DUMMY_PROJECTS.filter((p) => p.featured);
}

export function getAllProjects(): Project[] {
  return DUMMY_PROJECTS;
}
