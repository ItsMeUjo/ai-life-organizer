import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Life Organizer",
  description: "Organize your life with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
