export type PortableTextSpan = {
  _key?: string;
  _type: "span";
  text: string;
  marks?: string[];
};

export type PortableTextLink = {
  _key: string;
  _type: "link";
  href?: string;
};

export type PortableTextBlock = {
  _key?: string;
  _type: "block";
  children?: PortableTextSpan[];
  markDefs?: PortableTextLink[];
};

export type Representation = {
  territory?: string;
  name?: string;
  email?: string;
  phone?: string;
  websiteUrl?: string;
};

export type RepresentationContact = {
  department?: string;
  name?: string;
  email?: string;
  phone?: string;
};

export type RepresentationAgency = {
  agencyName?: string;
  territory?: string;
  websiteUrl?: string;
  contacts?: RepresentationContact[];
};

export type SiteSettings = {
  showPhotosPage?: boolean;
  aboutHeading?: string;
  name?: string;
  role?: string;
  aboutText?: PortableTextBlock[];
  portrait?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
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
};

export function normalizePortableText(value?: PortableTextBlock[]) {
  const populatedBlocks = value?.filter((block) =>
    (block.children ?? []).some((span) => span.text.trim().length > 0),
  );

  return populatedBlocks?.length ? populatedBlocks : undefined;
}
