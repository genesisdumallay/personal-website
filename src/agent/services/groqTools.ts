import { Project } from "../../models/types";

// Tool definitions in JSON Schema format for Groq API
export interface GroqToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
}

const PORTFOLIO_DATA: Project[] = [
  {
    slug: "trajector-company-handbook-chatbot",
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
      It uses retrieval augmented generation to query relevant information. With prompt engineering techniques,
      the chatbot's behavior is optimized to provide accurate and helpful responses based on the handbook content.`,
  },
  {
    slug: "gatherinmanila-event-recommendation-system",
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
  email: "gmdumallay007101@gmail.com",
  github: "github.com/genesisdumallay",
  linkedin: "linkedin.com/in/genesisdumallay",
  phonenumber: "+639777364652",
};

const ABOUT_ME = {
  name: "Genesis M. Dumallay",
  Age: "23",
  Work_Introduction: `
    Hello! I am Genesis. I am based in Quezon City. I'm a software developer, with my experience primarily in web development.
    I am an advocate to using AI for software automation solutions.
    As a Software Engineer, I try to solve problems through efficient, effective and clean solutions. I prefer being in backend development, enjoying tackling technical challenges.
  `,
  Outside_Work_Introduction: `
    I love cats and I play some video games, read online media or watch animes on my free times.
  `,
};

interface GetProjectByTechArgs {
  tech: string;
}

interface SendContactMessageArgs {
  message: string;
  email: string;
}

type ToolFunction = (args: unknown) => unknown;

export const groqToolsImplementation: Record<string, ToolFunction> = {
  getProjects: () => {
    return PORTFOLIO_DATA;
  },
  getProjectByTech: (args: unknown) => {
    const { tech } = args as GetProjectByTechArgs;
    const t = tech.toLowerCase();
    return PORTFOLIO_DATA.filter((p) =>
      p.techStack?.some((stack) => stack.toLowerCase().includes(t))
    );
  },
  getAboutMe: () => {
    return ABOUT_ME;
  },
  getContactInfo: () => {
    return CONTACT_INFO;
  },
  sendContactMessage: (args: unknown) => {
    const { message, email } = args as SendContactMessageArgs;
    console.log(`[MOCK EMAIL] To: Owner, From: ${email}, Body: ${message}`);
    return { success: true, message: "Message queued for delivery." };
  },
};

// Tool declarations in Groq format (JSON Schema)
export const groqToolDeclarations: GroqToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "getProjects",
      description:
        "Retrieves all projects in Genesis's portfolio. Use this when the user asks about projects, work, works, portfolio, what he has built, or what he has worked on.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getProjectByTech",
      description:
        "Searches for projects that use a specific technology (e.g., React, Python). Use this when the user asks for specific tech stack experience.",
      parameters: {
        type: "object",
        properties: {
          tech: {
            type: "string",
            description:
              "The technology to filter by (e.g., 'React', 'TypeScript').",
          },
        },
        required: ["tech"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getAboutMe",
      description:
        "Retrieves Genesis's personal information including his name, age, work background, and personal interests (like hobbies, interests outside work). Use this for questions about who Genesis is, his background, interests, or hobbies.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getContactInfo",
      description:
        "Retrieves public contact information like email, GitHub, and LinkedIn profiles.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "sendContactMessage",
      description:
        "Sends a message to the developer. Use this when the user explicitly wants to send a message or contact the developer directly.",
      parameters: {
        type: "object",
        properties: {
          email: {
            type: "string",
            description: "The user's email address for reply.",
          },
          message: {
            type: "string",
            description: "The body of the message to send.",
          },
        },
        required: ["email", "message"],
      },
    },
  },
];
