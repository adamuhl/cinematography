"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const categories = ["ALL", "DOCUMENTARY", "COMMERCIAL", "NARRATIVE"] as const;
type Category = (typeof categories)[number];
type View = "grid" | "list";
const sectionIds = ["work", "about", "contact"] as const;
type SectionId = (typeof sectionIds)[number];

const ambientSlides = [
  "/splash/ambient-01.jpg",
  "/splash/ambient-02.jpg",
  "/splash/ambient-03.jpg",
  "/splash/ambient-04.jpg",
  "/splash/ambient-05.jpg",
  "/splash/ambient-06.jpg",
];

function GridIcon() {
  return (
    <svg viewBox="0 0 14 14" aria-hidden="true" focusable="false">
      <rect x="1" y="1" width="4.5" height="4.5" />
      <rect x="8.5" y="1" width="4.5" height="4.5" />
      <rect x="1" y="8.5" width="4.5" height="4.5" />
      <rect x="8.5" y="8.5" width="4.5" height="4.5" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 14 14" aria-hidden="true" focusable="false">
      <line x1="1" y1="2" x2="13" y2="2" />
      <line x1="1" y1="7" x2="13" y2="7" />
      <line x1="1" y1="12" x2="13" y2="12" />
    </svg>
  );
}

const projects: Array<{
  title: string;
  detail: string;
  category: Exclude<Category, "ALL">;
  year: string;
  color: string;
  href: string;
  splashImage: string;
}> = [
  { title: "OPEN WATER", detail: "Short Film", category: "NARRATIVE", year: "2025", color: "ocean", href: "#work", splashImage: "/splash/project-open-water.jpg" },
  { title: "THE LONG WAY HOME", detail: "Documentary", category: "DOCUMENTARY", year: "2024", color: "field", href: "#work", splashImage: "/splash/project-long-way-home.jpg" },
  { title: "NIGHT SHIFT", detail: "Brand Film", category: "COMMERCIAL", year: "2025", color: "night", href: "#work", splashImage: "/splash/project-night-shift.jpg" },
  { title: "BETWEEN STATIONS", detail: "Short Film", category: "NARRATIVE", year: "2024", color: "station", href: "#work", splashImage: "/splash/project-between-stations.jpg" },
  { title: "COMMON GROUND", detail: "Documentary", category: "DOCUMENTARY", year: "2023", color: "earth", href: "#work", splashImage: "/splash/project-common-ground.jpg" },
  { title: "AFTERLIGHT", detail: "Campaign", category: "COMMERCIAL", year: "2024", color: "light", href: "#work", splashImage: "/splash/project-afterlight.jpg" },
];

export function Portfolio() {
  const [activeCategory, setActiveCategory] = useState<Category>("ALL");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState<View>("grid");
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [hoveredProjectTitle, setHoveredProjectTitle] = useState<string | null>(null);
  const [focusedProjectTitle, setFocusedProjectTitle] = useState<string | null>(null);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const navigationTarget = useRef<SectionId | null>(null);
  const navigationTimer = useRef<number | null>(null);

  const filteredProjects = useMemo(
    () => projects.filter((project) => activeCategory === "ALL" || project.category === activeCategory),
    [activeCategory],
  );
  const activeSplashProjectTitle = hoveredProjectTitle ?? focusedProjectTitle;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches);
    const updateVisibility = () => setPageVisible(!document.hidden);

    updateMotionPreference();
    updateVisibility();
    mediaQuery.addEventListener("change", updateMotionPreference);
    document.addEventListener("visibilitychange", updateVisibility);

    return () => {
      mediaQuery.removeEventListener("change", updateMotionPreference);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (!pageVisible || activeSplashProjectTitle || reducedMotion) return;

    const interval = window.setInterval(() => {
      setSlideIndex((current) => (current + 1) % ambientSlides.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [pageVisible, activeSplashProjectTitle, reducedMotion]);

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);
    const visibleRatios = new Map<SectionId, number>();

    const updateActiveSection = () => {
      if (navigationTarget.current) return;

      const visibleSection = Array.from(visibleRatios.entries())
        .sort((a, b) => b[1] - a[1])[0];

      if (visibleSection) setActiveSection(visibleSection[0]);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id as SectionId;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
            visibleRatios.set(id, entry.intersectionRatio);
          } else {
            visibleRatios.delete(id);
          }
        });
        updateActiveSection();
      },
      { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] },
    );

    const syncActiveHash = () => {
      const hash = window.location.hash.slice(1) as SectionId;
      if (sectionIds.includes(hash)) {
        navigationTarget.current = hash;
        setActiveSection(hash);

        if (navigationTimer.current !== null) window.clearTimeout(navigationTimer.current);
        navigationTimer.current = window.setTimeout(() => {
          navigationTarget.current = null;
          updateActiveSection();
        }, 3200);
      }
    };

    const cancelNavigationTarget = () => {
      if (!navigationTarget.current) return;
      navigationTarget.current = null;
      if (navigationTimer.current !== null) window.clearTimeout(navigationTimer.current);
      updateActiveSection();
    };

    sections.forEach((section) => observer.observe(section));
    window.addEventListener("hashchange", syncActiveHash);
    window.addEventListener("wheel", cancelNavigationTarget, { passive: true });
    window.addEventListener("touchstart", cancelNavigationTarget, { passive: true });
    window.addEventListener("keydown", cancelNavigationTarget);
    syncActiveHash();

    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", syncActiveHash);
      window.removeEventListener("wheel", cancelNavigationTarget);
      window.removeEventListener("touchstart", cancelNavigationTarget);
      window.removeEventListener("keydown", cancelNavigationTarget);
      if (navigationTimer.current !== null) window.clearTimeout(navigationTimer.current);
    };
  }, []);

  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Adam Uhl, home">ADAM UHL</a>
        <nav className="index-nav" aria-label="Homepage sections">
          {sectionIds.map((section) => (
            <a
              key={section}
              href={`#${section}`}
              className={activeSection === section ? "active" : ""}
              aria-current={activeSection === section ? "location" : undefined}
            >
              {section.toUpperCase()}
            </a>
          ))}
        </nav>
      </header>

      <section className="intro" id="top" aria-labelledby="page-title">
        <div className="splash-media" aria-hidden="true">
          {ambientSlides.map((slide, index) => (
            <img
              key={slide}
              className={`splash-slide ${index === slideIndex ? "active" : ""}`}
              src={slide}
              alt=""
            />
          ))}
          {projects.map((project) => (
            <img
              key={project.splashImage}
              className={`splash-preview ${activeSplashProjectTitle === project.title ? "active" : ""}`}
              src={project.splashImage}
              alt=""
            />
          ))}
          <div className="splash-shade" />
        </div>

        <div className="splash-menu">
          <h1 id="page-title">SELECTED WORK</h1>
          <div
            className="splash-projects"
            onMouseLeave={() => setHoveredProjectTitle(null)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setFocusedProjectTitle(null);
            }}
          >
            {projects.map((project) => (
              <a
                key={project.title}
                href={project.href}
                onMouseEnter={() => setHoveredProjectTitle(project.title)}
                onFocus={() => setFocusedProjectTitle(project.title)}
              >
                {project.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="work" id="work" aria-labelledby="selected-work-title">
        <div className="work-heading">
          <h2 id="selected-work-title">SELECTED WORK</h2>
          <div className="controls">
            <button
              className="filters-trigger"
              type="button"
              aria-expanded={filtersOpen}
              aria-controls="project-filters"
              onClick={() => setFiltersOpen((open) => !open)}
            >
              FILTERS <span aria-hidden="true">{filtersOpen ? "−" : "+"}</span>
            </button>
            <div className="view-toggle" role="group" aria-label="Project view">
              <button type="button" aria-label="Grid view" className={view === "grid" ? "active" : ""} onClick={() => setView("grid")} aria-pressed={view === "grid"}>
                <GridIcon />
              </button>
              <button type="button" aria-label="List view" className={view === "list" ? "active" : ""} onClick={() => setView("list")} aria-pressed={view === "list"}>
                <ListIcon />
              </button>
            </div>
          </div>
        </div>

        <div className={`filters ${filtersOpen ? "open" : ""}`} id="project-filters" aria-hidden={!filtersOpen}>
          <div className="filters-inner">
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={activeCategory === category ? "active" : ""}
                onClick={() => setActiveCategory(category)}
                tabIndex={filtersOpen ? 0 : -1}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className={`projects ${view}`} aria-live="polite">
          {filteredProjects.map((project, index) => (
            <article className="project" key={project.title} style={{ "--delay": `${index * 35}ms` } as React.CSSProperties}>
              <div className={`project-image ${project.color}`} role="img" aria-label={`Placeholder artwork for ${project.title}`}>
                <span>IMAGE FORTHCOMING</span>
              </div>
              <div className="project-meta">
                <h3>{project.title}</h3>
                <p>{project.detail} / {project.year}</p>
                <span>{project.category}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="about" id="about" aria-labelledby="about-title">
        <h2 id="about-title">ABOUT</h2>
        <div className="about-details">
          <p>ADAM UHL</p>
          <p>CINEMATOGRAPHER</p>
        </div>
      </section>

      <section className="contact" id="contact" aria-labelledby="contact-title">
        <h2 id="contact-title">CONTACT</h2>
        <div className="contact-details">
          <a href="mailto:hello@adamuhl.com">HELLO@ADAMUHL.COM</a>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </section>
    </main>
  );
}
