import type { Metadata } from "next";

import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Academie en ligne",
  description: "Plateforme de cours en ligne",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          <Navbar />

          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
