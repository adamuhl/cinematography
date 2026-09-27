import { defineQuery } from "next-sanity";

const projectFields = `
  _id,
  title,
  "slug": slug.current,
  projectType,
  cinematographyRole,
  thumbnailSubheading,
  thumbnailThirdLine,
  categories,
  showOnFrontPage,
  frontPageOrder,
  featured,
  featuredOrder,
  commercialOrder,
  documentaryOrder,
  narrativeOrder,
  homepageOrder,
  publishOnSite,
  enableHoverPreview,
  hoverPreviewStartTime,
  thumbnail{
    alt,
    crop,
    hotspot,
    asset->{_id, url, metadata{dimensions}}
  },
  homepageImage{
    alt,
    crop,
    hotspot,
    asset->{_id, url, metadata{dimensions}}
  },
  "muxVideo": muxVideo.asset->{
    status,
    playbackId,
    thumbTime,
    "dataStatus": data.status,
    "aspectRatio": data.aspect_ratio,
    "playbackIds": data.playback_ids[]{id, policy}
  },
  videos[]{
    title,
    poster{
      crop,
      hotspot,
      asset->{_id, url}
    },
    "muxVideo": muxVideo.asset->{
      status,
      playbackId,
      thumbTime,
      "dataStatus": data.status,
      "aspectRatio": data.aspect_ratio,
      "playbackIds": data.playback_ids[]{id, policy}
    }
  },
  director,
  productionCompany,
  description,
  credits[]{label, value},
  gallery[] | order(coalesce(order, 9999) asc){
    alt,
    presentation,
    order,
    "legacyImage": image.asset->{url, metadata{dimensions}},
    "directImage": asset->{url, metadata{dimensions}}
  }
`;

const siteSettingsFields = `
  showPhotosPage,
  aboutHeading,
  name,
  role,
  aboutText,
  portrait{
    alt,
    crop,
    hotspot,
    asset->{_id, url, metadata{dimensions}}
  },
  location,
  contactHeading,
  contactText,
  email,
  phone,
  instagramUrl,
  vimeoUrl,
  imdbUrl,
  representationAgencies[]{
    agencyName,
    territory,
    websiteUrl,
    contacts[]{department, name, email, phone}
  },
  representation[]{territory, name, email, phone, websiteUrl}
`;

export const homepageQuery = defineQuery(`{
  "projects": *[_type == "project" && !(_id in path("drafts.**")) && defined(slug.current) && coalesce(publishOnSite, true)] | order(coalesce(frontPageOrder, featuredOrder, homepageOrder, 9999) asc, title asc) {
    ${projectFields}
  },
  "siteSettings": *[_type == "siteSettings" && _id == "siteSettings"][0] {
    ${siteSettingsFields}
  },
  "photography": *[_type == "photographyGallery" && _id == "photographyGallery"][0] {
    enabled,
    photos[]{
      title,
      alt,
      presentation,
      asset->{url, metadata{dimensions}}
    }
  }
}`);

export const projectsQuery = defineQuery(`
  *[_type == "project" && !(_id in path("drafts.**")) && defined(slug.current) && coalesce(publishOnSite, true)] | order(coalesce(frontPageOrder, featuredOrder, homepageOrder, 9999) asc, title asc) {
    ${projectFields}
  }
`);

export const projectBySlugQuery = defineQuery(`
  *[_type == "project" && !(_id in path("drafts.**")) && slug.current == $slug && coalesce(publishOnSite, true)][0] {
    ${projectFields}
  }
`);

export const projectSlugsQuery = defineQuery(`
  *[_type == "project" && !(_id in path("drafts.**")) && defined(slug.current) && coalesce(publishOnSite, true)].slug.current
`);

export const privateReelBySlugQuery = defineQuery(`
  *[_type == "privateReel" && !(_id in path("drafts.**")) && slug.current == $slug][0] {
    title,
    intro,
    active,
    expiresAt,
    passwordHash,
    projects[]->{
      ${projectFields}
    }
  }
`);
