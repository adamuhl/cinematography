import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://adamuhl.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Adam Uhl — Cinematographer",
    template: "%s — Adam Uhl",
  },
  description: "Selected documentary, commercial, and narrative cinematography by Adam Uhl.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Adam Uhl — Cinematographer",
    title: "Adam Uhl — Cinematographer",
    description: "Selected documentary, commercial, and narrative cinematography by Adam Uhl.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adam Uhl — Cinematographer",
    description: "Selected documentary, commercial, and narrative cinematography by Adam Uhl.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Adam Uhl",
    url: siteUrl,
    jobTitle: "Cinematographer",
    sameAs: [
      "https://www.instagram.com/adamuhl/",
      "https://www.imdb.com/name/nm4752338/",
    ],
  };

  return (
    <html lang="en">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
