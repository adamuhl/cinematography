import { createImageUrlBuilder } from "@sanity/image-url";
import type {
  PortableTextBlock,
  Representation,
  RepresentationAgency,
  SiteSettings,
} from "../../app/site-settings";

type SanityImageAsset = {
  _id?: string;
  url?: string;
  metadata?: { dimensions?: { width?: number; height?: number } };
} | null;

type SanityPortrait = {
  alt?: string;
  asset?: SanityImageAsset;
  crop?: { top?: number; bottom?: number; left?: number; right?: number } | null;
  hotspot?: { x?: number; y?: number; height?: number; width?: number } | null;
} | null;

export type SanitySiteSettings = {
  showPhotosPage?: boolean;
  aboutHeading?: string;
  name?: string;
  role?: string;
  aboutText?: PortableTextBlock[];
  portrait?: SanityPortrait;
  location?: string;
  contactHeading?: string;
  contactText?: PortableTextBlock[];
  email?: string;
  phone?: string;
  instagramUrl?: string;
  vimeoUrl?: string;
  imdbUrl?: string;
  representationAgencies?: RepresentationAgency[];
  representation?: Representation[];
} | null;

function optionalText(value?: string) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function normalizePortableText(value?: PortableTextBlock[]) {
  const populatedBlocks = value?.filter((block) =>
    (block.children ?? []).some((span) => span.text.trim().length > 0),
  );

  return populatedBlocks?.length ? populatedBlocks : undefined;
}

export function normalizeSiteSettings(
  settings: SanitySiteSettings,
  imageConfig: { projectId: string; dataset: string },
): SiteSettings | null {
  if (!settings) return null;

  const portrait = settings.portrait;
  const portraitAsset = portrait?.asset;
  const portraitUrl = portrait && portraitAsset?._id
    ? createImageUrlBuilder(imageConfig).image(portrait).width(640).height(800).fit("crop").auto("format").url()
    : undefined;
  const representation = (settings.representation ?? []).flatMap((entry) => {
    const normalized = {
      territory: optionalText(entry.territory),
      name: optionalText(entry.name),
      email: optionalText(entry.email),
      phone: optionalText(entry.phone),
      websiteUrl: optionalText(entry.websiteUrl),
    };
    return Object.values(normalized).some(Boolean) ? [normalized] : [];
  });
  const representationAgencies = (settings.representationAgencies ?? []).flatMap((agency) => {
    const contacts = (agency.contacts ?? []).flatMap((contact) => {
      const normalizedContact = {
        department: optionalText(contact.department),
        name: optionalText(contact.name),
        email: optionalText(contact.email),
        phone: optionalText(contact.phone),
      };
      return Object.values(normalizedContact).some(Boolean) ? [normalizedContact] : [];
    });
    const normalizedAgency = {
      agencyName: optionalText(agency.agencyName),
      territory: optionalText(agency.territory),
      websiteUrl: optionalText(agency.websiteUrl),
      contacts: contacts.length ? contacts : undefined,
    };
    return Object.values(normalizedAgency).some(Boolean) ? [normalizedAgency] : [];
  });

  return {
    showPhotosPage: settings.showPhotosPage ?? true,
    aboutHeading: optionalText(settings.aboutHeading),
    name: optionalText(settings.name),
    role: optionalText(settings.role),
    aboutText: normalizePortableText(settings.aboutText),
    portrait: portraitUrl
      ? {
          src: portraitUrl,
          alt: optionalText(settings.portrait?.alt) ?? "",
          width: 640,
          height: 800,
        }
      : undefined,
    location: optionalText(settings.location),
    contactHeading: optionalText(settings.contactHeading),
    contactText: normalizePortableText(settings.contactText),
    email: optionalText(settings.email),
    phone: optionalText(settings.phone),
    instagramUrl: optionalText(settings.instagramUrl),
    vimeoUrl: optionalText(settings.vimeoUrl),
    imdbUrl: optionalText(settings.imdbUrl),
    representationAgencies: representationAgencies.length ? representationAgencies : undefined,
    representation: representation.length ? representation : undefined,
  };
}
