import React from "react";
import ReactMarkdown from "react-markdown";

type ChatBubbleProps = {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
  isStreaming?: boolean;
};

const ChatBubble = React.memo<ChatBubbleProps>(function ChatBubble({
  role,
  content,
  isStreaming = false,
}) {
  const isUser = role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} py-1 px-2`}
    >
      <div
        className={`max-w-[78%] break-words px-3 py-2 rounded-lg shadow-sm leading-snug text-sm ${
          isUser
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none"
        }`}
      >
        {isUser ? (
          <span>{content}</span>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal ml-4 mb-2">{children}</ol>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc ml-4 mb-2">{children}</ul>
                ),
                li: ({ children }) => <li className="mb-1">{children}</li>,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
        {isStreaming && (
          <span className="inline-block w-1 h-4 ml-1 bg-current animate-pulse" />
        )}
      </div>
    </div>
  );
});

export default ChatBubble;
