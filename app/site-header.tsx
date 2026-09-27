"use client";

import Link from "next/link";

export const navigationSectionIds = ["work", "about", "contact"] as const;
export type NavigationSectionId = (typeof navigationSectionIds)[number] | "photos";
const homepageScrollKey = "adam-uhl-homepage-scroll";

type SiteHeaderProps = {
  activeSection?: NavigationSectionId | null;
  projectPage?: boolean;
  homeHref?: string;
  hideWordmark?: boolean;
  role?: string;
  showRole?: boolean;
  sections?: readonly NavigationSectionId[];
  sectionHrefs?: Partial<Record<NavigationSectionId, string>>;
};

export function SiteHeader({
  activeSection = null,
  projectPage = false,
  homeHref = "/",
  hideWordmark = false,
  role,
  showRole = false,
  sections = navigationSectionIds,
  sectionHrefs,
}: SiteHeaderProps) {
  const clearSavedHomepagePosition = () => window.sessionStorage.removeItem(homepageScrollKey);

  return (
    <header className={`site-header ${activeSection ? `active-section-${activeSection}` : ""} ${hideWordmark ? "wordmark-hidden" : ""}`}>
      {projectPage ? (
        <Link className="wordmark" href={homeHref} aria-label="Adam Uhl, home" onNavigate={clearSavedHomepagePosition}>
          <span>ADAM UHL</span>
          {role ? <span className={`wordmark-role ${showRole ? "visible" : ""}`}>{role}</span> : null}
        </Link>
      ) : (
        <a className="wordmark" href="#top" aria-label="Adam Uhl, home">
          <span>ADAM UHL</span>
          {role ? <span className={`wordmark-role ${showRole ? "visible" : ""}`}>{role}</span> : null}
        </a>
      )}
      {sections.length ? <nav className="index-nav" aria-label="Homepage sections">
        {sections.map((section) => {
          const className = activeSection === section ? "active" : "";
          const ariaCurrent = activeSection === section ? "location" : undefined;
          const label = section.toUpperCase();
          const customHref = sectionHrefs?.[section];

          if (customHref) {
            return (
              <Link key={section} href={customHref} className={className} aria-current={ariaCurrent}>
                {label}
              </Link>
            );
          }

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
      </nav> : null}
    </header>
  );
}
