export const workCategories = ["FEATURED", "DOCUMENTARY", "COMMERCIAL", "NARRATIVE", "LYRICAL"] as const;

export type WorkCategory = (typeof workCategories)[number];
export type ProjectCategory = Exclude<WorkCategory, "FEATURED">;

export type ProjectImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  presentation?: "wide" | "standard" | "portrait";
};

export type ProjectVideo = {
  playbackId?: string;
  poster: string;
};

export type ProjectCredit = {
  label: string;
  value: string;
};

export type Project = {
  title: string;
  slug: string;
  detail: string;
  categories: ProjectCategory[];
  featured: boolean;
  featuredOrder: number;
  director?: string;
  productionCompany?: string;
  year: string;
  color: string;
  heroImage: string;
  video?: ProjectVideo;
  description?: string;
  credits?: ProjectCredit[];
  gallery?: ProjectImage[];
};

export const projects: Project[] = [
  {
    title: "OPEN WATER",
    slug: "open-water",
    detail: "Short Film",
    categories: ["NARRATIVE", "LYRICAL"],
    featured: true,
    featuredOrder: 1,
    director: "Mara Ellis",
    productionCompany: "North Coast Films",
    year: "2025",
    color: "ocean",
    heroImage: "/splash/project-open-water.jpg",
    video: { poster: "/splash/project-open-water.jpg" },
    description: "A quiet study of distance, endurance, and the shifting horizon.",
    credits: [
      { label: "Cinematography", value: "Adam Uhl" },
      { label: "Production Design", value: "Iris Bell" },
    ],
    gallery: [
      { src: "/splash/ambient-01.jpg", alt: "Open sea at dawn", width: 1200, height: 1200, presentation: "wide" },
      { src: "/splash/project-open-water.jpg", alt: "Swimmer crossing open water", width: 1200, height: 1200, presentation: "standard" },
      { src: "/splash/ambient-06.jpg", alt: "Rain-softened lights", width: 1200, height: 1200, presentation: "portrait" },
    ],
  },
  {
    title: "THE LONG WAY HOME",
    slug: "the-long-way-home",
    detail: "Documentary",
    categories: ["DOCUMENTARY", "LYRICAL"],
    featured: true,
    featuredOrder: 2,
    director: "Leah Moreno",
    productionCompany: "Field Office",
    year: "2024",
    color: "field",
    heroImage: "/splash/project-long-way-home.jpg",
    description: "An observational portrait of return, memory, and the landscapes held between them.",
    gallery: [
      { src: "/splash/ambient-02.jpg", alt: "Open rural landscape", width: 1200, height: 1200, presentation: "wide" },
      { src: "/splash/project-long-way-home.jpg", alt: "Traveler in a rural landscape", width: 1200, height: 1200, presentation: "standard" },
      { src: "/splash/ambient-05.jpg", alt: "Desert road at dusk", width: 1200, height: 1200, presentation: "wide" },
    ],
  },
  {
    title: "NIGHT SHIFT",
    slug: "night-shift",
    detail: "Brand Film",
    categories: ["COMMERCIAL"],
    featured: true,
    featuredOrder: 3,
    director: "Jon Bell",
    productionCompany: "Corner Store",
    year: "2025",
    color: "night",
    heroImage: "/splash/project-night-shift.jpg",
    video: { poster: "/splash/project-night-shift.jpg" },
    credits: [{ label: "Agency", value: "Independent" }],
  },
  {
    title: "BETWEEN STATIONS",
    slug: "between-stations",
    detail: "Short Film",
    categories: ["NARRATIVE"],
    featured: true,
    featuredOrder: 4,
    director: "Noah Kim",
    productionCompany: "Platform Pictures",
    year: "2024",
    color: "station",
    heroImage: "/splash/project-between-stations.jpg",
    video: { poster: "/splash/project-between-stations.jpg" },
    description: "Two strangers wait through the final service of the night.",
    gallery: [
      { src: "/splash/ambient-04.jpg", alt: "Empty train platform", width: 1200, height: 1200, presentation: "wide" },
      { src: "/splash/project-between-stations.jpg", alt: "Two figures waiting at a station", width: 1200, height: 1200, presentation: "standard" },
    ],
  },
  {
    title: "COMMON GROUND",
    slug: "common-ground",
    detail: "Documentary",
    categories: ["DOCUMENTARY"],
    featured: true,
    featuredOrder: 5,
    director: "Rina Patel",
    productionCompany: "Good Measure",
    year: "2023",
    color: "earth",
    heroImage: "/splash/project-common-ground.jpg",
    description: "A stills-led portrait of growers, shared labor, and a season of change.",
    credits: [{ label: "Photography", value: "Adam Uhl" }],
    gallery: [
      { src: "/splash/project-common-ground.jpg", alt: "Hands planting in dark soil", width: 1200, height: 1200, presentation: "wide" },
      { src: "/splash/ambient-02.jpg", alt: "Fields beneath an overcast sky", width: 1200, height: 1200, presentation: "standard" },
      { src: "/splash/ambient-05.jpg", alt: "Road crossing an open landscape", width: 1200, height: 1200, presentation: "portrait" },
    ],
  },
  {
    title: "AFTERLIGHT",
    slug: "afterlight",
    detail: "Campaign",
    categories: ["COMMERCIAL", "LYRICAL"],
    featured: true,
    featuredOrder: 6,
    director: "Elena Voss",
    productionCompany: "House of Motion",
    year: "2024",
    color: "light",
    heroImage: "/splash/project-afterlight.jpg",
    video: { poster: "/splash/project-afterlight.jpg" },
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
