import React from 'react';

type ChatBubbleProps = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
};

export default function ChatBubble({ role, content }: ChatBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} py-1 px-2`}>
      <div
        className={`max-w-[78%] break-words px-3 py-2 rounded-lg shadow-sm leading-snug text-sm ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none'
        }`}>
        <span>{content}</span>
      </div>
    </div>
  );
}
