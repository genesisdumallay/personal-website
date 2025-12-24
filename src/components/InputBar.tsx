import React, { useCallback } from "react";
import { useInputBar } from "@/hooks/InputBarContext";
import { useTheme } from "@/hooks/ThemeContext";

interface searchBarProps {
  setToggleChat?: (v: boolean) => void;
  placeholder?: string;
  onSend?: (v: string) => void;
  className?: string;
}

const InputBar = ({
  setToggleChat,
  placeholder,
  onSend,
  className,
}: searchBarProps) => {
  const { value, setValue } = useInputBar();
  const { isDark } = useTheme();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        if (setToggleChat) setToggleChat(true);
        if (onSend) onSend((e.target as HTMLInputElement).value);
      }
    },
    [setToggleChat, onSend]
  );

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder ?? "Type here..."}
      aria-label="main-input"
      className={`max-w-[46rem] w-full p-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors mb-6 ${
        isDark
          ? "border-gray-600 text-gray-100 bg-transparent placeholder-gray-400"
          : "border-gray-300 text-gray-900 bg-white/80 placeholder-gray-500"
      } ${className}`}
    />
  );
};

export default InputBar;
