import "./globals.css";
import InputBarProvider from "@/hooks/InputBarContext";
import ThemeProvider from "@/hooks/ThemeContext";

export const metadata = {
  title: "Genesis Dumallay",
  description: "Personal portfolio website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">  
      <body>
        <InputBarProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </InputBarProvider>
      </body>
    </html>
  );
}
