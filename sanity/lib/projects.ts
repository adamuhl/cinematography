import "server-only";

import { createImageUrlBuilder } from "@sanity/image-url";
import {
  type Project,
  type ProjectCategory,
  type ProjectImage,
  type ProjectDisplayImage,
} from "../../app/project-data";
import { sanityClient } from "./client";
import { dataset, projectId } from "../env";
import { homepageQuery, privateReelBySlugQuery, projectBySlugQuery, projectSlugsQuery, projectsQuery } from "./queries";
import { normalizeSiteSettings, type SanitySiteSettings } from "./site-settings";

type SanityAsset = {
  _id?: string;
  url?: string;
  metadata?: { dimensions?: { width?: number; height?: number; aspectRatio?: number } };
} | null;

type SanityProjectImage = {
  alt?: string;
  asset?: SanityAsset;
  crop?: { top?: number; bottom?: number; left?: number; right?: number } | null;
  hotspot?: { x?: number; y?: number; height?: number; width?: number } | null;
} | null | undefined;

type SanityPhotography = {
  enabled?: boolean;
  photos?: {
    title?: string;
    alt?: string;
    presentation?: ProjectImage["presentation"];
    asset?: SanityAsset;
  }[];
} | null;

type SanityMuxVideo = {
  status?: "preparing" | "ready" | "errored";
  dataStatus?: "preparing" | "ready" | "errored";
  playbackId?: string;
  thumbTime?: number;
  aspectRatio?: string;
  playbackIds?: { id?: string; policy?: "public" | "signed" }[];
};

export type SanityProject = {
  _id: string;
  title?: string;
  slug?: string;
  projectType?: string;
  cinematographyRole?: "directorOfPhotography" | "additionalCinematography";
  thumbnailSubheading?: string;
  thumbnailThirdLine?: string;
  categories?: string[];
  showOnFrontPage?: boolean;
  frontPageOrder?: number;
  featured?: boolean;
  featuredOrder?: number;
  commercialOrder?: number;
  documentaryOrder?: number;
  narrativeOrder?: number;
  homepageOrder?: number;
  publishOnSite?: boolean;
  enableHoverPreview?: boolean;
  hoverPreviewStartTime?: number;
  thumbnail?: SanityProjectImage;
  homepageImage?: SanityProjectImage;
  muxVideo?: SanityMuxVideo;
  videos?: { title?: string; muxVideo?: SanityMuxVideo; poster?: SanityProjectImage }[];
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
const imageBuilder = createImageUrlBuilder({ projectId, dataset });

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

function normalizeVideo(video?: SanityMuxVideo, title?: string, poster?: SanityProjectImage) {
  if (!video) return undefined;
  const status = video.dataStatus ?? video.status;
  const playbackIds = video.playbackIds;
  const publicPlaybackId = playbackIds?.find(({ policy }) => policy === "public")?.id;
  const playbackId = publicPlaybackId ?? (playbackIds?.length ? undefined : video.playbackId);

  return {
    title: title?.trim() || undefined,
    status,
    playbackId,
    aspectRatio: parseAspectRatio(video.aspectRatio),
    thumbnailTime: video.thumbTime,
    poster: poster?.asset?._id
      ? imageBuilder.image(poster).width(1600).auto("format").url()
      : undefined,
  };
}

function imagePosition(image: SanityProjectImage) {
  const hotspot = image?.hotspot;
  if (!hotspot) return undefined;
  const crop = image?.crop;
  const visibleWidth = 1 - (crop?.left ?? 0) - (crop?.right ?? 0);
  const visibleHeight = 1 - (crop?.top ?? 0) - (crop?.bottom ?? 0);
  const x = visibleWidth > 0 ? (hotspot.x ?? 0.5) - (crop?.left ?? 0) : 0.5;
  const y = visibleHeight > 0 ? (hotspot.y ?? 0.5) - (crop?.top ?? 0) : 0.5;
  const percent = (value: number, visibleSize: number) =>
    `${Math.min(100, Math.max(0, value / visibleSize * 100)).toFixed(2)}%`;
  return `${percent(x, visibleWidth)} ${percent(y, visibleHeight)}`;
}

function normalizeDisplayImage(
  image: SanityProjectImage,
  usage: "work" | "home",
): ProjectDisplayImage | undefined {
  if (!image?.asset?._id) return undefined;
  const sourceWidth = image.asset.metadata?.dimensions?.width ?? 1600;
  const visibleWidth = Math.max(0, 1 - (image.crop?.left ?? 0) - (image.crop?.right ?? 0));
  const usableWidth = Math.max(1, Math.floor(sourceWidth * visibleWidth));
  const requestedWidths = usage === "work"
    ? [640, 960, 1280]
    : [960, 1440, 1920, 2560, 3200, 3840];
  const widths = Array.from(new Set([
    ...requestedWidths.filter((width) => width < usableWidth),
    Math.min(requestedWidths.at(-1) ?? usableWidth, usableWidth),
  ])).sort((a, b) => a - b);
  const url = (width: number, aspectRatio = 16 / 9) => {
    let builder = imageBuilder.image(image).width(width).auto("format");
    if (usage === "work") builder = builder.height(Math.round(width / aspectRatio)).fit("crop");
    else builder = builder.quality(90);
    return builder.url();
  };
  const srcSet = (aspectRatio?: number) => widths
    .map((width) => `${url(width, aspectRatio)} ${width}w`)
    .join(", ");

  return {
    src: url(Math.min(usage === "work" ? 960 : 1920, usableWidth)),
    srcSet: srcSet(),
    wideSrc: usage === "work" ? url(1280, 2.5) : undefined,
    wideSrcSet: usage === "work" ? srcSet(2.5) : undefined,
    alt: image.alt?.trim() ?? "",
    objectPosition: imagePosition(image),
  };
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
  const videos = (project.videos ?? []).flatMap((item) => {
    const video = normalizeVideo(item.muxVideo, item.title, item.poster);
    return video ? [video] : [];
  });
  const legacyVideo = normalizeVideo(project.muxVideo);
  const allVideos = videos.length ? videos : legacyVideo ? [legacyVideo] : [];

  return {
    title: project.title.toUpperCase(),
    slug: project.slug,
    detail: project.projectType,
    cinematographyRole: project.cinematographyRole ?? "directorOfPhotography",
    thumbnailSubheading: project.thumbnailSubheading?.trim() || undefined,
    thumbnailThirdLine: project.thumbnailThirdLine?.trim() || undefined,
    categories,
    showOnFrontPage: project.showOnFrontPage ?? false,
    frontPageOrder: project.frontPageOrder ?? project.homepageOrder ?? 9999,
    featured: project.featured ?? false,
    featuredOrder: project.featuredOrder ?? project.homepageOrder ?? 9999,
    commercialOrder: project.commercialOrder ?? 9999,
    documentaryOrder: project.documentaryOrder ?? 9999,
    narrativeOrder: project.narrativeOrder ?? 9999,
    enableHoverPreview: project.enableHoverPreview ?? false,
    hoverPreviewStartTime: Number.isFinite(project.hoverPreviewStartTime)
      ? Math.max(0, project.hoverPreviewStartTime ?? 0)
      : undefined,
    director: project.director,
    productionCompany: project.productionCompany,
    thumbnail: normalizeDisplayImage(project.thumbnail, "work"),
    homepageImage: normalizeDisplayImage(project.homepageImage, "home"),
    video: allVideos[0],
    videos: allVideos.length ? allVideos : undefined,
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
      photography: SanityPhotography;
    }>(homepageQuery, {}, { next: { revalidate: 60 } });
    const sanityProjects = result.projects
      .map(normalizeProject)
      .filter((project): project is Project => project !== null);
    const siteSettings = normalizeSiteSettings(result.siteSettings, { projectId, dataset }) ?? {};
    const photographyEnabled = siteSettings.showPhotosPage !== false;

    return {
      projects: sanityProjects,
      siteSettings,
      photographyEnabled,
      photography: !photographyEnabled
        ? []
        : (result.photography?.photos ?? []).flatMap((photo) => {
            if (!photo.asset?.url) return [];
            return [{
              src: photo.asset.url,
              title: photo.title?.trim() || undefined,
              alt: photo.alt ?? "",
              ...imageDimensions(photo.asset),
              presentation: photo.presentation,
            }];
          }),
    };
  } catch {
    return { projects: [], siteSettings: {}, photographyEnabled: false, photography: [] };
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

export type PrivateReel = {
  title: string;
  intro?: string;
  passwordHash?: string;
  projects: Project[];
};

export async function getPrivateReel(slug: string): Promise<PrivateReel | null> {
  try {
    const result = await sanityClient.fetch<{
      title?: string;
      intro?: string;
      active?: boolean;
      expiresAt?: string;
      passwordHash?: string;
      projects?: SanityProject[];
    } | null>(privateReelBySlugQuery, { slug }, { cache: "no-store" });

    const expired = result?.expiresAt && new Date(result.expiresAt).getTime() <= Date.now();
    if (!result?.title || result.active === false || expired) return null;

    return {
      title: result.title,
      intro: result.intro,
      passwordHash: result.passwordHash,
      projects: (result.projects ?? []).map(normalizeProject).filter((project): project is Project => project !== null),
    };
  } catch {
    return null;
  }
}
