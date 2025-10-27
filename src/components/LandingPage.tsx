import ChatWindow from "./chatWindow";
import TypingText from "./TypingRole";
import InputBar from "./InputBar";

import { useTheme } from "@/hooks/ThemeContext";

interface LandingPageProps {
  toggleChat: boolean;
  typingText: string;
  setToggleChat: (v: boolean) => void;
  setTypingText: (t: string) => void;
}

const LandingPage = ({
  toggleChat,
  typingText,
  setToggleChat,
  setTypingText,
}: LandingPageProps) => {
  const { isDark } = useTheme();
  return (
    <div
      className={`flex items-center justify-center ${
        isDark ? "text-gray-200" : "text-gray-900"
      }`}
    >
      {toggleChat && <ChatWindow toggleChat={setToggleChat} />}

      <div className="w-full max-w-[45rem] mx-auto px-4">
        <h1
          className={`text-6xl font-semibold mb-2 ${
            isDark ? "text-gray-300" : "text-gray-800"
          }`}
        >
          Hi, I&#39;m Genesis!
        </h1>
        <p className="text-2xl mt-1 mb-7 ml-1">Software Engineer</p>
        <p className="mt-1 mb-7 ml-1">
          Chat with my assistant if you want to know more about me and explore
          my site with its help.
        </p>

        <TypingText onChange={(t: string) => setTypingText(t)} />
        <InputBar
          placeholder={typingText || "Type here..."}
          setToggleChat={setToggleChat}
          className="mx-auto block"
        />
      </div>
    </div>
  );
};

export default LandingPage;
