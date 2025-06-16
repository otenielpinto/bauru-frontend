import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import ReactQueryProvider from "@/providers/react-query";

export const metadata: Metadata = {
  title: "Gestor de Custos",
  description:
    "Sistema de Gestão de Custos de Produtos - Controle completo de custos, precificação e análise de rentabilidade de produtos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <ReactQueryProvider>{children}</ReactQueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
