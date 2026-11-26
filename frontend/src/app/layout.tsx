import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { ApolloWrapper } from "@/context/ApolloWrapper";

export const metadata: Metadata = {
  title: "DevPilot — AI-Powered Developer Platform",
  description: "Next-generation developer platform for code quality, security, and accessibility auditing with AI remediation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-[#f4f6fb] dark:bg-[#090b10] text-slate-900 dark:text-slate-100 transition-colors">
        <ThemeProvider>
          <AuthProvider>
            <ApolloWrapper>
              {children}
            </ApolloWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
