import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/global.css";
import "../styles/proposal.css";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import IndexedDBProvider from "../components/IndexedDBProvider";
import ErrorBoundary from "../components/ErrorBoundary";
import { ThemeProvider } from "../context/ThemeContext";
import DataConsistencyChecker from "../components/DataConsistencyChecker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Votex - AI-Enhanced Voting System",
  description: "A collaborative platform where humans and AI can propose and vote on ideas",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="scroll-smooth" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
        style={{
          fontFamily: "var(--font-geist-sans)",
        }}
      >
        <ErrorBoundary>
          <IndexedDBProvider>
            <ThemeProvider>
              <div className="min-h-screen flex flex-col">
                <Navigation />
                <div className="flex-grow">
                  {children}
                </div>
                <Footer />
                {/* Hidden component that checks and maintains data consistency */}
                <DataConsistencyChecker />
              </div>
            </ThemeProvider>
          </IndexedDBProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
