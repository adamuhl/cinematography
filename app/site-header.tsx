"use client";

import Link from "next/link";

export const navigationSectionIds = ["work", "about", "contact"] as const;
export type NavigationSectionId = (typeof navigationSectionIds)[number];
const homepageScrollKey = "adam-uhl-homepage-scroll";

type SiteHeaderProps = {
  activeSection?: NavigationSectionId | null;
  projectPage?: boolean;
};

export function SiteHeader({ activeSection = null, projectPage = false }: SiteHeaderProps) {
  const clearSavedHomepagePosition = () => window.sessionStorage.removeItem(homepageScrollKey);

  return (
    <header className="site-header">
      {projectPage ? (
        <Link className="wordmark" href="/" aria-label="Adam Uhl, home" onNavigate={clearSavedHomepagePosition}>ADAM UHL</Link>
      ) : (
        <a className="wordmark" href="#top" aria-label="Adam Uhl, home">ADAM UHL</a>
      )}
      <nav className="index-nav" aria-label="Homepage sections">
        {navigationSectionIds.map((section) => {
          const className = activeSection === section ? "active" : "";
          const ariaCurrent = activeSection === section ? "location" : undefined;
          const label = section.toUpperCase();

          return projectPage ? (
            <Link key={section} href={`/#${section}`} className={className} aria-current={ariaCurrent} onNavigate={clearSavedHomepagePosition}>
              {label}
            </Link>
          ) : (
            <a key={section} href={`#${section}`} className={className} aria-current={ariaCurrent}>
              {label}
            </a>
          );
        })}
      </nav>
    </header>
  );
}
