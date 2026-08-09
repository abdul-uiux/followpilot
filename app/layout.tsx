import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastProvider } from "./components/toast-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FollowPilot · CRM review",
  description: "Review prepared post-call CRM updates with clear evidence and control.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full">
        <ToastProvider>{children}</ToastProvider>
        <script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>
      </body>
    </html>
  );
}
