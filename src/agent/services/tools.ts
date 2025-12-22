import { FunctionDeclaration, Type } from "@google/genai";
import { Project } from "../../models/types";

// --- Mock Data ---
const PORTFOLIO_DATA: Project[] = [
  {
    name: "Trajector Company Handbook Chatbot",
    techStack: [
      "AWS Lambda",
      "AWS Bedrock",
      "AWS S3",
      "Retrieval Augmented Generation",
      "TypeScript",
      "React",
    ],
    description:
      "An ai-powered chatbot that answers questions with the company handbook as the knowledge base and using retrieval augmented generation to query relevant information.",
  },
  {
    name: "GatherInManila: A Machine Learning Powered Event Recommendation System",
    techStack: ["Python", "Flask", "sklearn"],
    description: `
      A machine learning powered event recommendation system for events in Manila, Philippines. 
      Utilized user preferences and event features to suggest personalized events.
      Using cosine similarity and k-nearest neighbors algorithms to match users with relevant event profiles.
      `,
  },
];

const CONTACT_INFO = {
  email: "gmdumallay007101@.gmail.com",
  github: "github.com/genesisdumallay",
  linkedin: "linkedin.com/in/genesisdumallay",
};

const ABOUT_ME = {
  name: "Genesis M. Dumallay",
  Age: "23",
  Introduction: `
  I am a Bachelor's of Science in Computer Science with specialization in Software Engineering Graduating Student at FEU institute of Technology.
  I am from Quezon City
  `,
};

// --- Tool Implementations ---

// Map of tool names to their executable JavaScript functions
export const toolsImplementation: Record<string, (args: any) => any> = {
  getProjects: () => {
    return PORTFOLIO_DATA;
  },
  getProjectByTech: ({ tech }: { tech: string }) => {
    const t = tech.toLowerCase();
    return PORTFOLIO_DATA.filter((p) =>
      p.techStack.some((stack) => stack.toLowerCase().includes(t))
    );
  },
  getContactInfo: () => {
    return CONTACT_INFO;
  },
  sendContactMessage: ({
    message,
    email,
  }: {
    message: string;
    email: string;
  }) => {
    // Mock sending an email
    console.log(`[MOCK EMAIL] To: Owner, From: ${email}, Body: ${message}`);
    return { success: true, message: "Message queued for delivery." };
  },
};

// --- Tool Declarations (Schema) ---

export const toolDeclarations: FunctionDeclaration[] = [
  {
    name: "getProjects",
    description:
      "Retrieves a list of all projects in the developer's portfolio. Use this when the user asks about 'projects', 'work', or 'portfolio' in general.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: "getProjectByTech",
    description:
      "Searches for projects that use a specific technology (e.g., React, Python). Use this when the user asks for specific tech stack experience.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        tech: {
          type: Type.STRING,
          description:
            "The technology to filter by (e.g., 'React', 'TypeScript').",
        },
      },
      required: ["tech"],
    },
  },
  {
    name: "getContactInfo",
    description:
      "Retrieves public contact information like email, GitHub, and LinkedIn profiles.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: "sendContactMessage",
    description:
      "Sends a message to the developer. Use this when the user explicitly wants to send a message or contact the developer directly.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        email: {
          type: Type.STRING,
          description: "The user's email address for reply.",
        },
        message: {
          type: Type.STRING,
          description: "The body of the message to send.",
        },
      },
      required: ["email", "message"],
    },
  },
];
