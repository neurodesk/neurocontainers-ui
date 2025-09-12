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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function getTheme() {
                  try {
                    const stored = localStorage.getItem('neurocontainers-theme');
                    if (stored && ['light', 'dark', 'system'].includes(stored)) {
                      if (stored === 'system') {
                        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                      }
                      return stored;
                    }
                  } catch (e) {}
                  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                
                const theme = getTheme();
                document.documentElement.classList.add(theme);
                document.documentElement.setAttribute('data-theme', theme);
              })();
            `
          }}
        />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
        style={{
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)'
        }}
      >
        <ThemeProvider defaultTheme="system" storageKey="neurocontainers-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
