import ChatWindow from "./chatWindow";
import TypingText from "./TypingRole";
import InputBar from "./InputBar";

interface LandingPageProps {
  isDark: boolean;
  toggleChat: boolean;
  typingText: string;
  setToggleChat: (v: boolean) => void;
  setIsDark: (isDark: boolean) => void;
  setTypingText: (t: string) => void;
}

const LandingPage = ({
  isDark,
  toggleChat,
  typingText,
  setToggleChat,
  setTypingText,
}: LandingPageProps) => {
  return (
    <div
      className={`flex items-center justify-center ${
        isDark ? "text-gray-200" : "text-gray-900"
      }`}
    >
      {toggleChat && <ChatWindow toggleChat={setToggleChat} isDark={isDark} />}

      <div className="w-full max-w-[45rem] mx-auto px-4">
        <h1 className="text-4xl font-semibold text-center">
          Hi, I&#39;m Genesis!
        </h1>
        <p className="text-2xl mt-1 mb-7 text-center">Software Engineer</p>
        <p className="mt-1 mb-7 text-center">
          Chat with my assistant if you want to know more about me and explore
          my site with its help.
        </p>

        <TypingText onChange={(t: string) => setTypingText(t)} />
        <InputBar
          placeholder={typingText || "Type here..."}
          isDark={isDark}
          setToggleChat={setToggleChat}
          className="mx-auto block"
        />
      </div>
    </div>
  );
};

export default LandingPage;
