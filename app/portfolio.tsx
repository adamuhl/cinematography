"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { workCategories, type Project, type WorkCategory } from "./project-data";
import { getFeaturedProjects, getFrontPageProjects } from "./project-visibility";
import type { PortableTextBlock, PortableTextSpan, SiteSettings } from "./site-settings";
import { navigationSectionIds, SiteHeader, type NavigationSectionId } from "./site-header";

const majorSectionIds = ["top", "work", "about", "contact"] as const;
type MajorSectionId = (typeof majorSectionIds)[number];

const homepageScrollKey = "adam-uhl-homepage-scroll";
const homepageCategoryKey = "adam-uhl-homepage-category";

function spanText(text: string) {
  const lines = text.split("\n");
  return lines.flatMap((line, index) => index ? [<br key={`break-${index}`} />, line] : [line]);
}

function RichText({ value }: { value?: PortableTextBlock[] }) {
  if (!value?.length) return null;

  return (
    <div className="rich-text">
      {value.map((block, blockIndex) => (
        <p key={block._key ?? `block-${blockIndex}`}>
          {(block.children ?? []).map((span: PortableTextSpan, spanIndex) => {
            let content: ReactNode = spanText(span.text);
            for (const mark of span.marks ?? []) {
              if (mark === "em") {
                content = <em>{content}</em>;
                continue;
              }
              const link = block.markDefs?.find((definition) => definition._key === mark);
              if (link?.href) {
                content = <a href={link.href} target="_blank" rel="noreferrer">{content}</a>;
              }
            }
            return <span key={span._key ?? `span-${spanIndex}`}>{content}</span>;
          })}
        </p>
      ))}
    </div>
  );
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href} target="_blank" rel="noreferrer">{children}</a>;
}

export function Portfolio({ projects, siteSettings }: { projects: Project[]; siteSettings: SiteSettings }) {
  const [activeCategory, setActiveCategory] = useState<WorkCategory>("FEATURED");
  const [activeSection, setActiveSection] = useState<NavigationSectionId | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [hoveredProjectTitle, setHoveredProjectTitle] = useState<string | null>(null);
  const [focusedProjectTitle, setFocusedProjectTitle] = useState<string | null>(null);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  const displayableProjects = useMemo(() => projects.filter((project) => Boolean(project.heroImage)), [projects]);
  const availableCategories = useMemo(
    () => workCategories.filter((category) => category === "FEATURED"
      ? getFeaturedProjects(displayableProjects).length > 0
      : displayableProjects.some((project) => project.categories.includes(category))),
    [displayableProjects],
  );
  const visibleCategory = availableCategories.includes(activeCategory)
    ? activeCategory
    : availableCategories[0];
  const filteredProjects = useMemo(() => {
    if (!visibleCategory) return [];
    if (visibleCategory === "FEATURED") return getFeaturedProjects(displayableProjects);
    return displayableProjects.filter((project) => project.categories.includes(visibleCategory));
  }, [visibleCategory, displayableProjects]);
  const frontPageProjects = useMemo(
    () => getFrontPageProjects(displayableProjects),
    [displayableProjects],
  );
  const ambientSlides = useMemo(
    () => frontPageProjects.flatMap((project) => project.heroImage ? [project.heroImage] : []),
    [frontPageProjects],
  );
  const activeSplashProjectTitle = hoveredProjectTitle ?? focusedProjectTitle;
  const representationAgencies = siteSettings.representationAgencies?.length
    ? siteSettings.representationAgencies
    : siteSettings.representation?.map((entry) => ({
        agencyName: entry.name,
        territory: entry.territory,
        websiteUrl: entry.websiteUrl,
        contacts: entry.email || entry.phone
          ? [{ department: undefined, name: undefined, email: entry.email, phone: entry.phone }]
          : undefined,
      })) ?? [];
  const hasPersonalContent = Boolean(
    siteSettings.name || siteSettings.contactText?.length || siteSettings.email || siteSettings.phone
      || siteSettings.instagramUrl || siteSettings.vimeoUrl || siteSettings.imdbUrl,
  );
  const hasRepresentationContent = representationAgencies.length > 0;
  const hasAboutContent = Boolean(
    siteSettings.name || siteSettings.role || siteSettings.aboutText?.length
      || siteSettings.portrait || siteSettings.location,
  );
  const hasContactContent = Boolean(
    hasPersonalContent || hasRepresentationContent,
  );
  const navigationSections = [
    ...(displayableProjects.length ? ["work" as const] : []),
    ...(hasAboutContent ? ["about" as const] : []),
    ...(hasContactContent ? ["contact" as const] : []),
  ];
  const selectCategory = (category: WorkCategory) => {
    window.sessionStorage.setItem(homepageCategoryKey, category);
    setActiveCategory(category);
  };
  const rememberHomepagePosition = () => {
    window.sessionStorage.setItem(homepageScrollKey, String(window.scrollY));
  };

  useLayoutEffect(() => {
    const savedPosition = window.sessionStorage.getItem(homepageScrollKey);
    const savedCategory = window.sessionStorage.getItem(homepageCategoryKey) as WorkCategory | null;
    let restoreCategory: number | undefined;

    if (savedCategory && workCategories.includes(savedCategory)) {
      restoreCategory = window.requestAnimationFrame(() => setActiveCategory(savedCategory));
    }

    if (savedPosition === null) {
      return () => {
        if (restoreCategory !== undefined) window.cancelAnimationFrame(restoreCategory);
      };
    }
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
      if (restoreCategory !== undefined) window.cancelAnimationFrame(restoreCategory);
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
    if (!pageVisible || activeSplashProjectTitle || reducedMotion || ambientSlides.length < 2) return;

    const interval = window.setInterval(() => {
      setSlideIndex((current) => (current + 1) % ambientSlides.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [pageVisible, activeSplashProjectTitle, reducedMotion, ambientSlides.length]);

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
      <SiteHeader activeSection={activeSection} sections={navigationSections} />

      <section
        className="intro"
        id="top"
        aria-labelledby={frontPageProjects.length ? "page-title" : undefined}
        aria-label={frontPageProjects.length ? undefined : "Homepage"}
      >
        <div className="splash-media" aria-hidden="true">
          {ambientSlides.map((slide, index) => (
            <img
              key={slide}
              className={`splash-slide ${index === slideIndex ? "active" : ""}`}
              src={slide}
              alt=""
            />
          ))}
          {frontPageProjects.filter((project) => project.heroImage).map((project) => (
            <img
              key={project.slug}
              className={`splash-preview ${activeSplashProjectTitle === project.title ? "active" : ""}`}
              src={project.heroImage}
              alt=""
            />
          ))}
          <div className="splash-shade" />
        </div>

        {frontPageProjects.length ? <div className="splash-menu">
          <h1 id="page-title">SELECTED WORK</h1>
          <div
            className="splash-projects"
            onMouseLeave={() => setHoveredProjectTitle(null)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setFocusedProjectTitle(null);
            }}
          >
            {frontPageProjects.map((project) => (
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
        </div> : null}
      </section>

      {displayableProjects.length ? <section className="work" id="work" aria-label="Work">
        <nav className="work-category-nav" aria-label="Project categories">
          <ul>
            {availableCategories.map((category) => (
              <li key={category}>
                <button
                  type="button"
                  className={visibleCategory === category ? "active" : ""}
                  onClick={() => selectCategory(category)}
                  aria-pressed={visibleCategory === category}
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="projects" aria-live="polite">
          {filteredProjects.map((project, index) => {
            const detail = [project.detail, project.year].filter(Boolean).join(" / ");

            return (
              <article className="project" key={project.title} style={{ "--delay": `${index * 35}ms` } as React.CSSProperties}>
                <Link className="project-link" href={`/work/${project.slug}`} scroll={false} onClick={rememberHomepagePosition}>
                  <div className="project-image" role="img" aria-label={`Artwork for ${project.title}`}>
                    <img src={project.heroImage!} alt="" />
                  </div>
                  <div className="project-meta">
                    <h3>{project.title}</h3>
                    {detail ? <p>{detail}</p> : null}
                    {project.categories[0] ? <span>{project.categories[0]}</span> : null}
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </section> : null}

      {hasAboutContent ? <section className="about" id="about" aria-labelledby="about-title">
        <div className={`about-inner ${siteSettings.portrait ? "has-portrait" : ""}`}>
          <div className="about-copy">
            <h2 id="about-title">{siteSettings.aboutHeading ?? "ABOUT"}</h2>
            <RichText value={siteSettings.aboutText} />
            {siteSettings.name || siteSettings.role || siteSettings.location ? (
              <div className="about-meta">
                {siteSettings.name ? <p>{siteSettings.name}</p> : null}
                {siteSettings.role ? <p>{siteSettings.role}</p> : null}
                {siteSettings.location ? <p>{siteSettings.location}</p> : null}
              </div>
            ) : null}
          </div>
          {siteSettings.portrait ? (
            <img
              className="about-portrait"
              src={siteSettings.portrait.src}
              alt={siteSettings.portrait.alt}
              width={siteSettings.portrait.width}
              height={siteSettings.portrait.height}
            />
          ) : null}
        </div>
      </section> : null}

      {hasContactContent ? <section className={`contact ${hasPersonalContent || hasRepresentationContent ? "has-directory" : "empty"}`} id="contact" aria-labelledby="contact-title">
        <h2 className="visually-hidden" id="contact-title">{siteSettings.contactHeading ?? "CONTACT"}</h2>
        {hasPersonalContent || hasRepresentationContent ? (
          <div className={`contact-directory ${hasPersonalContent ? "has-personal" : ""} ${hasRepresentationContent ? "has-representation" : ""}`}>
            {hasPersonalContent ? (
              <div className="personal-directory">
                <h3>PERSONAL</h3>
                {siteSettings.name ? <p className="personal-name">{siteSettings.name}</p> : null}
                <RichText value={siteSettings.contactText} />
                <div className="contact-methods">
                  {siteSettings.email ? <a href={`mailto:${siteSettings.email}`}>{siteSettings.email}</a> : null}
                  {siteSettings.phone ? <a href={`tel:${siteSettings.phone.replace(/[^\d+]/g, "")}`}>{siteSettings.phone}</a> : null}
                  {siteSettings.instagramUrl ? <ExternalLink href={siteSettings.instagramUrl}>Instagram</ExternalLink> : null}
                  {siteSettings.vimeoUrl ? <ExternalLink href={siteSettings.vimeoUrl}>Vimeo</ExternalLink> : null}
                  {siteSettings.imdbUrl ? <ExternalLink href={siteSettings.imdbUrl}>IMDb</ExternalLink> : null}
                </div>
              </div>
            ) : null}
            {hasRepresentationContent ? (
              <div className="representation-directory">
                <h3>REPRESENTATION</h3>
                <div className="representation-agencies">
                  {representationAgencies.map((agency, agencyIndex) => {
                    const agencyLabel = [agency.agencyName, agency.territory].filter(Boolean).join(" / ");
                    return (
                      <section className="representation-agency" key={`${agencyLabel || "agency"}-${agencyIndex}`}>
                        {agency.websiteUrl ? (
                          <ExternalLink href={agency.websiteUrl}>{agencyLabel || "Agency website"}</ExternalLink>
                        ) : agencyLabel ? <p className="agency-name">{agencyLabel}</p> : null}
                        {agency.contacts?.length ? (
                          <div className="agency-contacts">
                            {agency.contacts.map((contact, contactIndex) => {
                              const contactLabel = [contact.department, contact.name].filter(Boolean).join(" / ");
                              return (
                                <div className="agency-contact" key={`${contactLabel || "contact"}-${contactIndex}`}>
                                  {contactLabel ? <p>{contactLabel}</p> : null}
                                  {contact.phone ? <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}>{contact.phone}</a> : null}
                                  {contact.email ? <a href={`mailto:${contact.email}`}>{contact.email}</a> : null}
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
                      </section>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
        <span className="contact-copyright">© {new Date().getFullYear()}</span>
      </section> : null}
    </main>
  );
}
