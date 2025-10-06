import React from 'react';
import { useInputBar } from '@/hooks/InputBarContext';

interface searchBarProps {
  setToggleChat?: (v: boolean) => void;
  isDark: boolean;
  placeholder?: string;
  onSend?: (v: string) => void;
}

const InputBar = ({ isDark, setToggleChat, placeholder, onSend }: searchBarProps) => {
  const {value, setValue} = useInputBar();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (setToggleChat) setToggleChat(true);
      if (onSend) onSend((e.target as HTMLInputElement).value);
    }
  };

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder ?? 'Type here...'}
      aria-label="main-input"
      className={`w-full max-w-md p-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors mb-6 ${isDark ? 'border-gray-600 text-gray-100 bg-transparent placeholder-gray-400' : 'border-gray-300 text-gray-900 bg-white/80 placeholder-gray-500'}`}
    />
  );
};

export default InputBar;