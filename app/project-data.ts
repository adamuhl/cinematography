export const workCategories = ["FEATURED", "COMMERCIAL", "DOCUMENTARY", "NARRATIVE"] as const;

export type WorkCategory = (typeof workCategories)[number];
export type ProjectCategory = "DOCUMENTARY" | "COMMERCIAL" | "NARRATIVE" | "LYRICAL";

export type ProjectImage = {
  src: string;
  title?: string;
  alt: string;
  width: number;
  height: number;
  presentation?: "wide" | "standard" | "portrait";
};

export type ProjectDisplayImage = {
  src: string;
  srcSet?: string;
  wideSrc?: string;
  wideSrcSet?: string;
  alt: string;
  objectPosition?: string;
};

export type ProjectVideo = {
  title?: string;
  status?: "preparing" | "ready" | "errored";
  playbackId?: string;
  aspectRatio?: number;
  thumbnailTime?: number;
  poster?: string;
};

export type ProjectCredit = {
  label: string;
  value: string;
};

export type Project = {
  title: string;
  slug: string;
  detail?: string;
  cinematographyRole?: "directorOfPhotography" | "additionalCinematography";
  thumbnailSubheading?: string;
  thumbnailThirdLine?: string;
  categories: ProjectCategory[];
  showOnFrontPage: boolean;
  frontPageOrder: number;
  featured: boolean;
  featuredOrder: number;
  commercialOrder: number;
  documentaryOrder: number;
  narrativeOrder: number;
  enableHoverPreview?: boolean;
  hoverPreviewStartTime?: number;
  director?: string;
  productionCompany?: string;
  thumbnail?: ProjectDisplayImage;
  homepageImage?: ProjectDisplayImage;
  video?: ProjectVideo;
  videos?: ProjectVideo[];
  description?: string;
  credits?: ProjectCredit[];
  gallery?: ProjectImage[];
};
