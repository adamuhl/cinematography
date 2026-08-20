import { defineQuery } from "next-sanity";

const projectFields = `
  _id,
  title,
  "slug": slug.current,
  year,
  projectType,
  categories,
  showOnFrontPage,
  frontPageOrder,
  featured,
  featuredOrder,
  homepageOrder,
  "thumbnail": thumbnail.asset->{url, metadata{dimensions}},
  "muxVideo": muxVideo.asset->{
    status,
    playbackId,
    thumbTime,
    "dataStatus": data.status,
    "aspectRatio": data.aspect_ratio,
    "playbackIds": data.playback_ids[]{id, policy}
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
  "projects": *[_type == "project" && defined(slug.current)] | order(coalesce(frontPageOrder, featuredOrder, homepageOrder, 9999) asc, title asc) {
    ${projectFields}
  },
  "siteSettings": *[_type == "siteSettings" && _id == "siteSettings"][0] {
    ${siteSettingsFields}
  }
}`);

export const projectsQuery = defineQuery(`
  *[_type == "project" && defined(slug.current)] | order(coalesce(frontPageOrder, featuredOrder, homepageOrder, 9999) asc, title asc) {
    ${projectFields}
  }
`);

export const projectBySlugQuery = defineQuery(`
  *[_type == "project" && slug.current == $slug][0] {
    ${projectFields}
  }
`);

export const projectSlugsQuery = defineQuery(`
  *[_type == "project" && defined(slug.current)].slug.current
`);
