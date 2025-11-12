import type { Metadata } from "next";
import "./globals.css";
import DifyChatButton from "./components/DifyChatButton";

export const metadata: Metadata = {
  title: "DXC Cloud nIrvanA",
  description: "Plataforma unificada de desarrollo Cloud impulsada por IA | Developed by DXC Iberia Cloud Team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        {children}
        <DifyChatButton />
      </body>
    </html>
  );
}
