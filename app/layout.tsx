import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adam Uhl — Cinematographer",
  description: "Selected cinematography work by Adam Uhl.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
