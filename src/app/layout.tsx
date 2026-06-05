import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Panel Licitaciones Sanasalud",
  description: "Monitor de licitaciones públicas de salud",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0, background: "#f5f4f0" }}>
        {children}
      </body>
    </html>
  );
}
