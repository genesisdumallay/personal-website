import "./globals.css";
import InputBarProvider from "@/hooks/InputBarContext";
import ThemeProvider from "@/hooks/ThemeContext";
import AgentProvider from "@/hooks/AgentContext";
import AppBackground from "@/components/AppBackground";

export const metadata = {
  title: "Genesis Dumallay",
  description: "Personal portfolio website",
  icons: {
    icon: "/SiteTab.svg",
  },
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ colorScheme: "light dark" }}>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body>
        <InputBarProvider>
          <AgentProvider>
            <ThemeProvider>
              <AppBackground />
              {children}
            </ThemeProvider>
          </AgentProvider>
        </InputBarProvider>
      </body>
    </html>
  );
}
