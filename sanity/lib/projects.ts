import "server-only";

import {
  type Project,
  type ProjectCategory,
  type ProjectImage,
} from "../../app/project-data";
import { sanityClient } from "./client";
import { dataset, projectId } from "../env";
import { homepageQuery, projectBySlugQuery, projectSlugsQuery, projectsQuery } from "./queries";
import { normalizeSiteSettings, type SanitySiteSettings } from "./site-settings";

type SanityAsset = {
  url?: string;
  metadata?: { dimensions?: { width?: number; height?: number; aspectRatio?: number } };
} | null;

export type SanityProject = {
  _id: string;
  title?: string;
  slug?: string;
  year?: number | string | null;
  projectType?: string;
  categories?: string[];
  showOnFrontPage?: boolean;
  frontPageOrder?: number;
  featured?: boolean;
  featuredOrder?: number;
  homepageOrder?: number;
  enableHoverPreview?: boolean;
  hoverPreviewStartTime?: number;
  thumbnail?: SanityAsset;
  muxVideo?: {
    status?: "preparing" | "ready" | "errored";
    dataStatus?: "preparing" | "ready" | "errored";
    playbackId?: string;
    thumbTime?: number;
    aspectRatio?: string;
    playbackIds?: { id?: string; policy?: "public" | "signed" }[];
  };
  director?: string;
  productionCompany?: string;
  description?: string;
  credits?: { label?: string; value?: string }[];
  gallery?: {
    alt?: string;
    presentation?: ProjectImage["presentation"];
    order?: number;
    legacyImage?: SanityAsset;
    directImage?: SanityAsset;
  }[];
};

const validCategories = new Set<ProjectCategory>(["DOCUMENTARY", "COMMERCIAL", "NARRATIVE", "LYRICAL"]);

function imageDimensions(asset: SanityAsset) {
  return {
    width: asset?.metadata?.dimensions?.width ?? 1600,
    height: asset?.metadata?.dimensions?.height ?? 900,
  };
}

function parseAspectRatio(value?: string) {
  if (!value) return undefined;
  const [width, height] = value.split(":").map(Number);
  if (!Number.isFinite(width) || !Number.isFinite(height) || height <= 0) return undefined;
  return width / height;
}

function normalizeProject(project: SanityProject): Project | null {
  if (!project.title || !project.slug) return null;

  const categories = (project.categories ?? [])
    .filter((category): category is ProjectCategory => validCategories.has(category as ProjectCategory));
  const gallery = (project.gallery ?? []).flatMap((still) => {
    const image = still.directImage ?? still.legacyImage;
    if (!image?.url) return [];
    return [{
      src: image.url,
      alt: still.alt ?? "",
      ...imageDimensions(image),
      presentation: still.presentation,
    }];
  });
  const muxStatus = project.muxVideo?.dataStatus ?? project.muxVideo?.status;
  const playbackIds = project.muxVideo?.playbackIds;
  const publicPlaybackId = playbackIds?.find(({ policy }) => policy === "public")?.id;
  const playbackId = publicPlaybackId ?? (playbackIds?.length ? undefined : project.muxVideo?.playbackId);

  return {
    title: project.title.toUpperCase(),
    slug: project.slug,
    detail: project.projectType,
    categories,
    showOnFrontPage: project.showOnFrontPage ?? false,
    frontPageOrder: project.frontPageOrder ?? project.homepageOrder ?? 9999,
    featured: project.featured ?? false,
    featuredOrder: project.featuredOrder ?? project.homepageOrder ?? 9999,
    enableHoverPreview: project.enableHoverPreview ?? false,
    hoverPreviewStartTime: Number.isFinite(project.hoverPreviewStartTime)
      ? Math.max(0, project.hoverPreviewStartTime ?? 0)
      : undefined,
    director: project.director,
    productionCompany: project.productionCompany,
    year: project.year == null ? undefined : String(project.year),
    heroImage: project.thumbnail?.url,
    video: project.muxVideo
      ? {
          status: muxStatus,
          playbackId,
          aspectRatio: parseAspectRatio(project.muxVideo.aspectRatio),
          thumbnailTime: project.muxVideo.thumbTime,
        }
      : undefined,
    description: project.description,
    credits: (project.credits ?? []).flatMap((credit) =>
      credit.label && credit.value ? [{ label: credit.label, value: credit.value }] : [],
    ),
    gallery: gallery.length ? gallery : undefined,
  };
}

async function fetchSanityProjects() {
  try {
    const result = await sanityClient.fetch<SanityProject[]>(projectsQuery, {}, { next: { revalidate: 60 } });
    return result.map(normalizeProject).filter((project): project is Project => project !== null);
  } catch {
    return [];
  }
}

export async function getProjects() {
  return fetchSanityProjects();
}

export async function getHomepageContent() {
  try {
    const result = await sanityClient.fetch<{
      projects: SanityProject[];
      siteSettings: SanitySiteSettings;
    }>(homepageQuery, {}, { next: { revalidate: 60 } });
    const sanityProjects = result.projects
      .map(normalizeProject)
      .filter((project): project is Project => project !== null);

    return {
      projects: sanityProjects,
      siteSettings: normalizeSiteSettings(result.siteSettings, { projectId, dataset }) ?? {},
    };
  } catch {
    return { projects: [], siteSettings: {} };
  }
}

export async function getProject(slug: string) {
  try {
    const result = await sanityClient.fetch<SanityProject | null>(
      projectBySlugQuery,
      { slug },
      { next: { revalidate: 60 } },
    );
    const project = result ? normalizeProject(result) : null;
    return project;
  } catch {
    return null;
  }
}

export async function getProjectSlugs() {
  try {
    const sanitySlugs = await sanityClient.fetch<string[]>(projectSlugsQuery, {}, { next: { revalidate: 60 } });
    return Array.from(new Set(sanitySlugs));
  } catch {
    return [];
  }
}
