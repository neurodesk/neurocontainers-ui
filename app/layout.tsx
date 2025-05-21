import type { Metadata } from "next";
import "./globals.css";
import { GeistMono, GeistSans } from "@/components/fonts";

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
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
