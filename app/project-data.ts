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
  status?: "preparing" | "ready" | "errored";
  playbackId?: string;
  aspectRatio?: number;
  thumbnailTime?: number;
};

export type ProjectCredit = {
  label: string;
  value: string;
};

export type Project = {
  title: string;
  slug: string;
  detail?: string;
  categories: ProjectCategory[];
  showOnFrontPage: boolean;
  frontPageOrder: number;
  featured: boolean;
  featuredOrder: number;
  director?: string;
  productionCompany?: string;
  year?: string;
  heroImage?: string;
  video?: ProjectVideo;
  description?: string;
  credits?: ProjectCredit[];
  gallery?: ProjectImage[];
};
