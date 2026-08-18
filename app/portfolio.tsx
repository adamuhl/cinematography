"use client";

import { useMemo, useState } from "react";

const categories = ["ALL", "DOCUMENTARY", "COMMERCIAL", "NARRATIVE"] as const;
type Category = (typeof categories)[number];
type View = "grid" | "list";

const projects: Array<{
  title: string;
  detail: string;
  category: Exclude<Category, "ALL">;
  year: string;
  color: string;
}> = [
  { title: "OPEN WATER", detail: "Short Film", category: "NARRATIVE", year: "2025", color: "ocean" },
  { title: "THE LONG WAY HOME", detail: "Documentary", category: "DOCUMENTARY", year: "2024", color: "field" },
  { title: "NIGHT SHIFT", detail: "Brand Film", category: "COMMERCIAL", year: "2025", color: "night" },
  { title: "BETWEEN STATIONS", detail: "Short Film", category: "NARRATIVE", year: "2024", color: "station" },
  { title: "COMMON GROUND", detail: "Documentary", category: "DOCUMENTARY", year: "2023", color: "earth" },
  { title: "AFTERLIGHT", detail: "Campaign", category: "COMMERCIAL", year: "2024", color: "light" },
];

export function Portfolio() {
  const [activeCategory, setActiveCategory] = useState<Category>("ALL");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState<View>("grid");

  const filteredProjects = useMemo(
    () => projects.filter((project) => activeCategory === "ALL" || project.category === activeCategory),
    [activeCategory],
  );

  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Adam Uhl, home">ADAM UHL</a>
        <a className="info-link" href="#info">INFO</a>
      </header>

      <section className="intro" id="top" aria-labelledby="page-title">
        <h1 id="page-title">CINEMATOGRAPHER</h1>
        <p>SELECTED MOTION PICTURE WORK</p>
      </section>

      <section className="work" aria-labelledby="selected-work-title">
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
            <div className="view-toggle" aria-label="Project view">
              <button type="button" className={view === "grid" ? "active" : ""} onClick={() => setView("grid")} aria-pressed={view === "grid"}>GRID</button>
              <span aria-hidden="true">/</span>
              <button type="button" className={view === "list" ? "active" : ""} onClick={() => setView("list")} aria-pressed={view === "list"}>LIST</button>
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

      <footer id="info">
        <p>ADAM UHL</p>
        <p>CINEMATOGRAPHER</p>
        <a href="mailto:hello@adamuhl.com">HELLO@ADAMUHL.COM</a>
        <span>© {new Date().getFullYear()}</span>
      </footer>
    </main>
  );
}
