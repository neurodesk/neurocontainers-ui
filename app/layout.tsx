import type { Metadata } from "next";
import "./globals.css";
import { GeistMono, GeistSans } from "@/components/fonts";
import { ThemeProvider } from "@/lib/ThemeContext";

export const metadata: Metadata = {
  title: "Neurocontainers Builder",
  description: "Build neurocontainers with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <ThemeProvider defaultTheme="system" storageKey="neurocontainers-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
