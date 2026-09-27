"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { getHoverPreviewConfig } from "./project-hover-preview";
import { ProjectHoverPreviewPlayer } from "./project-hover-preview-player";
import { workCategories, type Project, type ProjectImage, type WorkCategory } from "./project-data";
import { getFeaturedProjects, getFrontPageProjects, getHomeScreenImage } from "./project-visibility";
import { normalizePortableText, type PortableTextBlock, type PortableTextSpan, type SiteSettings } from "./site-settings";
import { SiteHeader, type NavigationSectionId } from "./site-header";

const majorSectionIds = ["top", "work", "photos", "about", "contact"] as const;
type MajorSectionId = (typeof majorSectionIds)[number];

const homepageScrollKey = "adam-uhl-homepage-scroll";
const homepageCategoryKey = "adam-uhl-homepage-category";

function spanText(text: string) {
  const lines = text.split("\n");
  return lines.flatMap((line, index) => index ? [<br key={`break-${index}`} />, line] : [line]);
}

function RichText({ value }: { value?: PortableTextBlock[] }) {
  const populatedBlocks = normalizePortableText(value);
  if (!populatedBlocks) return null;

  return (
    <div className="rich-text">
      {populatedBlocks.map((block, blockIndex) => (
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

export function Portfolio({
  projects,
  siteSettings,
  photography = [],
  workLayout = "grid",
}: {
  projects: Project[];
  siteSettings: SiteSettings;
  photography?: ProjectImage[];
  workLayout?: "grid" | "full-bleed" | "hybrid";
}) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<WorkCategory>("FEATURED");
  const [activeSection, setActiveSection] = useState<NavigationSectionId | null>(null);
  const [showHomepageRole, setShowHomepageRole] = useState(true);
  const [hideWorkWordmark, setHideWorkWordmark] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [hoveredProjectTitle, setHoveredProjectTitle] = useState<string | null>(null);
  const [focusedProjectTitle, setFocusedProjectTitle] = useState<string | null>(null);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [supportsHoverPreview, setSupportsHoverPreview] = useState(false);
  const [activePreviewSlug, setActivePreviewSlug] = useState<string | null>(null);
  const [openingProjectSlug, setOpeningProjectSlug] = useState<string | null>(null);
  const previewTimer = useRef<number | null>(null);
  const pendingPreviewSlug = useRef<string | null>(null);
  const navigationTimer = useRef<number | null>(null);
  const aboutText = useMemo(() => normalizePortableText(siteSettings.aboutText), [siteSettings.aboutText]);
  const contactText = useMemo(() => normalizePortableText(siteSettings.contactText), [siteSettings.contactText]);

  const workProjects = useMemo(() => projects.filter((project) => Boolean(project.thumbnail)), [projects]);
  const availableCategories = useMemo(
    () => workCategories.filter((category) => category === "FEATURED"
      ? getFeaturedProjects(workProjects).length > 0
      : workProjects.some((project) => project.categories.includes(category))),
    [workProjects],
  );
  const visibleCategory = availableCategories.includes(activeCategory)
    ? activeCategory
    : availableCategories[0];
  const filteredProjects = useMemo(() => {
    if (!visibleCategory) return [];
    if (visibleCategory === "FEATURED") return getFeaturedProjects(workProjects);
    const orderField = visibleCategory === "COMMERCIAL"
      ? "commercialOrder"
      : visibleCategory === "DOCUMENTARY"
        ? "documentaryOrder"
        : "narrativeOrder";
    return workProjects
      .filter((project) => project.categories.includes(visibleCategory))
      .sort((a, b) => a[orderField] - b[orderField] || a.title.localeCompare(b.title));
  }, [visibleCategory, workProjects]);
  const useFullBleedProjects = workLayout === "full-bleed"
    || (workLayout === "hybrid" && visibleCategory === "FEATURED");
  const showProjectAnnotations = useFullBleedProjects || workLayout === "hybrid";
  const frontPageProjects = useMemo(
    () => getFrontPageProjects(projects).filter((project) => Boolean(getHomeScreenImage(project))),
    [projects],
  );
  const ambientSlides = useMemo(
    () => frontPageProjects.flatMap((project) => {
      const image = getHomeScreenImage(project);
      return image ? [image] : [];
    }),
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
    siteSettings.name || contactText?.length || siteSettings.email || siteSettings.phone
      || siteSettings.instagramUrl || siteSettings.vimeoUrl || siteSettings.imdbUrl,
  );
  const hasRepresentationContent = representationAgencies.length > 0;
  const hasAboutContent = Boolean(
    siteSettings.name || siteSettings.role || aboutText?.length
      || siteSettings.portrait || siteSettings.location,
  );
  const hasPhotographyContent = workLayout !== "grid" && photography.length > 0;
  const hasContactContent = Boolean(
    hasPersonalContent || hasRepresentationContent,
  );
  const navigationSections = [
    ...(workProjects.length ? ["work" as const] : []),
    ...(hasPhotographyContent ? ["photos" as const] : []),
    ...(hasAboutContent ? ["about" as const] : []),
    ...(hasContactContent ? ["contact" as const] : []),
  ];
  const selectCategory = (category: WorkCategory) => {
    setActiveCategory(category);
    try {
      window.sessionStorage.setItem(homepageCategoryKey, category);
    } catch {
      // Category switching should still work when browser storage is unavailable.
    }
    window.requestAnimationFrame(() => {
      document.getElementById("work")?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  };
  const rememberHomepagePosition = () => {
    try {
      window.sessionStorage.setItem(homepageScrollKey, String(window.scrollY));
    } catch {
      // Navigation should still work when browser storage is unavailable.
    }
  };
  const openProject = (event: ReactMouseEvent<HTMLAnchorElement>, slug: string) => {
    rememberHomepagePosition();
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    setOpeningProjectSlug(slug);
    navigationTimer.current = window.setTimeout(() => {
      router.push(`/work/${slug}`, { scroll: false });
    }, reducedMotion ? 0 : 180);
  };
  const stopPreview = (slug: string) => {
    if (pendingPreviewSlug.current === slug) {
      if (previewTimer.current !== null) window.clearTimeout(previewTimer.current);
      previewTimer.current = null;
      pendingPreviewSlug.current = null;
    }
    setActivePreviewSlug((current) => current === slug ? null : current);
  };
  const schedulePreview = (project: Project) => {
    const preview = getHoverPreviewConfig(project);
    if (!supportsHoverPreview || reducedMotion || !preview) return;

    if (previewTimer.current !== null) window.clearTimeout(previewTimer.current);
    setActivePreviewSlug(null);
    pendingPreviewSlug.current = project.slug;
    previewTimer.current = window.setTimeout(() => {
      if (pendingPreviewSlug.current === project.slug) setActivePreviewSlug(project.slug);
      previewTimer.current = null;
      pendingPreviewSlug.current = null;
    }, 200);
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
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollSnapType = "none";
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, scrollY);
    const restorePosition = window.setTimeout(() => window.scrollTo(0, scrollY), 100);
    const restoreBehavior = window.setTimeout(() => {
      root.style.scrollBehavior = previousScrollBehavior;
    }, 150);
    const restoreSnap = () => {
      root.style.scrollSnapType = previousSnapType;
    };
    const armSnapRestore = window.setTimeout(() => {
      window.sessionStorage.removeItem(homepageScrollKey);
      window.addEventListener("scroll", restoreSnap, { once: true, passive: true });
    }, 1500);

    return () => {
      window.clearTimeout(restorePosition);
      window.clearTimeout(restoreBehavior);
      window.clearTimeout(armSnapRestore);
      if (restoreCategory !== undefined) window.cancelAnimationFrame(restoreCategory);
      window.removeEventListener("scroll", restoreSnap);
      root.style.scrollSnapType = previousSnapType;
      root.style.scrollBehavior = previousScrollBehavior;
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => {
      setReducedMotion(mediaQuery.matches);
      if (!mediaQuery.matches) return;
      if (previewTimer.current !== null) window.clearTimeout(previewTimer.current);
      previewTimer.current = null;
      pendingPreviewSlug.current = null;
      setActivePreviewSlug(null);
    };
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
    const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updatePointerSupport = () => {
      setSupportsHoverPreview(pointerQuery.matches);
      if (pointerQuery.matches) return;
      if (previewTimer.current !== null) window.clearTimeout(previewTimer.current);
      previewTimer.current = null;
      pendingPreviewSlug.current = null;
      setActivePreviewSlug(null);
    };

    updatePointerSupport();
    pointerQuery.addEventListener("change", updatePointerSupport);
    return () => pointerQuery.removeEventListener("change", updatePointerSupport);
  }, []);

  useEffect(() => () => {
    if (previewTimer.current !== null) window.clearTimeout(previewTimer.current);
    if (navigationTimer.current !== null) window.clearTimeout(navigationTimer.current);
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
    let frame: number | null = null;

    const updateActiveSection = () => {
      frame = null;
      const probe = window.innerHeight * 0.35;
      const current = sections.find((section) => {
        const bounds = section.getBoundingClientRect();
        return bounds.top <= probe && bounds.bottom > probe;
      });

      if (current) {
        const id = current.id as MajorSectionId;
        setActiveSection(id === "top" ? null : id);
      }
      setShowHomepageRole(current?.id === "top");
      const workSection = sections.find((section) => section.id === "work");
      setHideWorkWordmark(current?.id === "work" && (workSection?.getBoundingClientRect().top ?? 0) < -24);
    };

    const scheduleUpdate = () => {
      if (frame === null) frame = window.requestAnimationFrame(updateActiveSection);
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    updateActiveSection();
    const delayedUpdate = window.setTimeout(updateActiveSection, 150);

    return () => {
      window.clearTimeout(delayedUpdate);
      if (frame !== null) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  return (
    <main className={workLayout === "full-bleed" ? "portfolio-full-bleed" : workLayout === "hybrid" ? "portfolio-hybrid" : undefined}>
      <SiteHeader
        activeSection={activeSection}
        hideWordmark={workLayout === "hybrid" && hideWorkWordmark}
        sections={navigationSections}
        sectionHrefs={workLayout !== "grid" ? { photos: "/photos" } : undefined}
        role={workLayout !== "grid" ? "DIRECTOR OF PHOTOGRAPHY" : undefined}
        showRole={workLayout !== "grid" && showHomepageRole}
      />

      <section
        className="intro"
        id="top"
        aria-labelledby={frontPageProjects.length ? "page-title" : undefined}
        aria-label={frontPageProjects.length ? undefined : "Homepage"}
      >
        <div className="splash-media" aria-hidden="true">
          {ambientSlides.map((slide, index) => (
            <img
              key={slide.src}
              className={`splash-slide ${index === slideIndex ? "active" : ""}`}
              src={slide.src}
              srcSet={slide.srcSet}
              sizes="100vw"
              style={{ objectPosition: slide.objectPosition }}
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "low"}
              alt=""
            />
          ))}
          {frontPageProjects.map((project) => {
            const image = getHomeScreenImage(project);
            if (!image) return null;
            return (
              <img
                key={project.slug}
                className={`splash-preview ${activeSplashProjectTitle === project.title ? "active" : ""}`}
                src={image.src}
                srcSet={image.srcSet}
                sizes="100vw"
                style={{ objectPosition: image.objectPosition }}
                loading="lazy"
                fetchPriority="low"
                alt=""
              />
            );
          })}
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

      {workProjects.length ? <section className={`work ${useFullBleedProjects ? "featured-layout" : ""}`} id="work" aria-label="Work">
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

        <div className="projects" aria-live="polite" key={visibleCategory}>
          {filteredProjects.map((project, index) => {
            const hoverPreview = getHoverPreviewConfig(project);
            const thumbnailSubheading = showProjectAnnotations ? project.thumbnailSubheading : undefined;
            const thumbnailThirdLine = showProjectAnnotations ? project.thumbnailThirdLine : undefined;
            const previewIsActive = supportsHoverPreview && !reducedMotion
              && activePreviewSlug === project.slug && hoverPreview;

            return (
              <article className={`project ${openingProjectSlug === project.slug ? "opening" : ""}`} key={project.title} style={{ "--delay": `${index * 35}ms` } as React.CSSProperties}>
                <Link
                  className="project-link"
                  href={`/work/${project.slug}`}
                  prefetch
                  scroll={false}
                  onClick={(event) => openProject(event, project.slug)}
                  onMouseEnter={() => schedulePreview(project)}
                  onMouseLeave={() => stopPreview(project.slug)}
                  onFocus={() => schedulePreview(project)}
                  onBlur={() => stopPreview(project.slug)}
                >
                  <div className="project-image" role="img" aria-label={project.thumbnail?.alt || `Artwork for ${project.title}`}>
                    <img
                      src={useFullBleedProjects ? project.thumbnail!.wideSrc ?? project.thumbnail!.src : project.thumbnail!.src}
                      srcSet={useFullBleedProjects ? project.thumbnail!.wideSrcSet ?? project.thumbnail!.srcSet : project.thumbnail!.srcSet}
                      sizes="(max-width: 700px) calc(100vw - 20px), 50vw"
                      style={{ objectPosition: project.thumbnail!.objectPosition }}
                      alt=""
                    />
                    {previewIsActive ? (
                      <ProjectHoverPreviewPlayer
                        playbackId={hoverPreview.playbackId}
                        startTime={hoverPreview.startTime}
                        title={project.title}
                      />
                    ) : null}
                  </div>
                  <div className="project-meta">
                    <h3>{project.title}</h3>
                    {showProjectAnnotations && project.cinematographyRole === "additionalCinematography" ? (
                      <p className="project-role">Additional Cinematography</p>
                    ) : null}
                    {thumbnailSubheading ? <p className="project-subheading">{thumbnailSubheading}</p> : null}
                    {thumbnailThirdLine ? <p className="project-third-line">{thumbnailThirdLine}</p> : null}
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
            <RichText value={aboutText} />
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
                <RichText value={contactText} />
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
