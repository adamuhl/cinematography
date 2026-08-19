"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { projects, workCategories, type WorkCategory } from "./project-data";
import { navigationSectionIds, SiteHeader, type NavigationSectionId } from "./site-header";

const majorSectionIds = ["top", "work", "about", "contact"] as const;
type MajorSectionId = (typeof majorSectionIds)[number];

const ambientSlides = [
  "/splash/ambient-01.jpg",
  "/splash/ambient-02.jpg",
  "/splash/ambient-03.jpg",
  "/splash/ambient-04.jpg",
  "/splash/ambient-05.jpg",
  "/splash/ambient-06.jpg",
];

let preservedWorkCategory: WorkCategory = "FEATURED";
const homepageScrollKey = "adam-uhl-homepage-scroll";
const homepageCategoryKey = "adam-uhl-homepage-category";

export function Portfolio() {
  const [activeCategory, setActiveCategory] = useState<WorkCategory>(() => preservedWorkCategory);
  const [activeSection, setActiveSection] = useState<NavigationSectionId | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [hoveredProjectTitle, setHoveredProjectTitle] = useState<string | null>(null);
  const [focusedProjectTitle, setFocusedProjectTitle] = useState<string | null>(null);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  const filteredProjects = useMemo(() => {
    if (activeCategory === "FEATURED") {
      return projects
        .filter((project) => project.featured)
        .sort((a, b) => a.featuredOrder - b.featuredOrder)
        .slice(0, 8);
    }

    return projects.filter((project) => project.categories.includes(activeCategory));
  }, [activeCategory]);
  const activeSplashProjectTitle = hoveredProjectTitle ?? focusedProjectTitle;
  const selectCategory = (category: WorkCategory) => {
    preservedWorkCategory = category;
    window.sessionStorage.setItem(homepageCategoryKey, category);
    setActiveCategory(category);
  };
  const rememberHomepagePosition = () => {
    window.sessionStorage.setItem(homepageScrollKey, String(window.scrollY));
  };

  useLayoutEffect(() => {
    const savedPosition = window.sessionStorage.getItem(homepageScrollKey);
    const savedCategory = window.sessionStorage.getItem(homepageCategoryKey) as WorkCategory | null;

    if (savedCategory && workCategories.includes(savedCategory)) {
      preservedWorkCategory = savedCategory;
      setActiveCategory(savedCategory);
    }

    if (savedPosition === null) return;
    const scrollY = Number(savedPosition);
    if (!Number.isFinite(scrollY)) {
      window.sessionStorage.removeItem(homepageScrollKey);
      return;
    }

    const root = document.documentElement;
    const previousSnapType = root.style.scrollSnapType;
    root.style.scrollSnapType = "none";
    const restorePosition = window.setTimeout(() => window.scrollTo(0, scrollY), 100);
    const restoreSnap = () => {
      root.style.scrollSnapType = previousSnapType;
    };
    const armSnapRestore = window.setTimeout(() => {
      window.sessionStorage.removeItem(homepageScrollKey);
      window.addEventListener("scroll", restoreSnap, { once: true, passive: true });
    }, 1500);

    return () => {
      window.clearTimeout(restorePosition);
      window.clearTimeout(armSnapRestore);
      window.removeEventListener("scroll", restoreSnap);
      root.style.scrollSnapType = previousSnapType;
    };
  }, []);

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
    const sections = majorSectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);
    const visibleRatios = new Map<MajorSectionId, number>();

    const updateActiveSection = () => {
      const visibleSection = Array.from(visibleRatios.entries())
        .sort((a, b) => b[1] - a[1])[0];

      if (visibleSection) {
        setActiveSection(visibleSection[0] === "top" ? null : visibleSection[0]);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id as MajorSectionId;
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
      const hash = window.location.hash.slice(1);
      if (hash === "top" || hash === "") {
        setActiveSection(null);
      } else if (navigationSectionIds.includes(hash as NavigationSectionId)) {
        setActiveSection(hash as NavigationSectionId);
      }
    };

    sections.forEach((section) => observer.observe(section));
    window.addEventListener("hashchange", syncActiveHash);
    syncActiveHash();

    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", syncActiveHash);
    };
  }, []);

  return (
    <main>
      <SiteHeader activeSection={activeSection} />

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
              key={project.heroImage}
              className={`splash-preview ${activeSplashProjectTitle === project.title ? "active" : ""}`}
              src={project.heroImage}
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
              <Link
                key={project.title}
                href={`/work/${project.slug}`}
                scroll={false}
                onClick={rememberHomepagePosition}
                onMouseEnter={() => setHoveredProjectTitle(project.title)}
                onFocus={() => setFocusedProjectTitle(project.title)}
              >
                {project.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="work" id="work" aria-label="Work">
        <nav className="work-category-nav" aria-label="Project categories">
          <ul>
            {workCategories.map((category) => (
              <li key={category}>
                <button
                  type="button"
                  className={activeCategory === category ? "active" : ""}
                  onClick={() => selectCategory(category)}
                  aria-pressed={activeCategory === category}
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="projects" aria-live="polite">
          {filteredProjects.map((project, index) => (
            <article className="project" key={project.title} style={{ "--delay": `${index * 35}ms` } as React.CSSProperties}>
              <Link className="project-link" href={`/work/${project.slug}`} scroll={false} onClick={rememberHomepagePosition}>
                <div className={`project-image ${project.color}`} role="img" aria-label={`Placeholder artwork for ${project.title}`}>
                  <span>IMAGE FORTHCOMING</span>
                </div>
                <div className="project-meta">
                  <h3>{project.title}</h3>
                  <p>{project.detail} / {project.year}</p>
                  <span>{project.categories[0]}</span>
                </div>
              </Link>
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
