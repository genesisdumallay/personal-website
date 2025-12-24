import { FunctionDeclaration, Type } from "@google/genai";
import { Project } from "../../models/types";

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
    description: `An ai-powered chatbot that answers questions with the company handbook as the knowledge base. 
      It uses retrieval augmented generation to query relevant information. With prompt engineering tehchniques,
      the chatbot's behavior is optimized to provide accurate and helpful responses based on the handbook content.`,
  },
  {
    name: "GatherInManila: A Machine Learning Powered Event Recommendation System",
    techStack: ["Python", "Flask", "sklearn"],
    description: `
      A machine learning powered event recommendation system for events in Manila, Philippines. 
      Utilizes user preferences and event features to suggest personalized events.
      Uses cosine similarity and k-nearest neighbors algorithms to match users with relevant event profiles.
      The event data is sourced from online events posted from social media, namely, Facebook and Instagram.
      `,
  },
];

const CONTACT_INFO = {
  email: "gmdumallay007101@.gmail.com",
  github: "github.com/genesisdumallay",
  linkedin: "linkedin.com/in/genesisdumallay",
  phonenumber: "+639777364652",
};

// const ABOUT_ME = {
//   name: "Genesis M. Dumallay",
//   Age: "23",
//   Work_Introduction: `
//   Hello! I am Genesis. I am based in Quezon City. I'm a software developer, with my experience primarily in web development.
//   I am an advocate to using AI for software automation solutions.
//   As a Software Engineer, I try to solve problems through efficient, effective and clean solutions. I prefer being in backend development, enjoying tackling technical challenges.

//   `,
//   Outside_Work_Introduction: `
//   I love cats and I play some video games, read online media or watch animes on my free times.
//   `,
// };

// --- Tool Implementations ---

interface GetProjectByTechArgs {
  tech: string;
}

interface SendContactMessageArgs {
  message: string;
  email: string;
}

type ToolFunction = (args: unknown) => unknown;

export const toolsImplementation: Record<string, ToolFunction> = {
  getProjects: () => {
    return PORTFOLIO_DATA;
  },
  getProjectByTech: (args: unknown) => {
    const { tech } = args as GetProjectByTechArgs;
    const t = tech.toLowerCase();
    return PORTFOLIO_DATA.filter((p) =>
      p.techStack.some((stack) => stack.toLowerCase().includes(t))
    );
  },
  getContactInfo: () => {
    return CONTACT_INFO;
  },
  sendContactMessage: (args: unknown) => {
    const { message, email } = args as SendContactMessageArgs;
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
