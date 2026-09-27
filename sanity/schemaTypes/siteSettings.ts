import { defineArrayMember, defineField, defineType } from "sanity";

const restrainedPortableText = defineArrayMember({
  type: "block",
  styles: [{ title: "Normal", value: "normal" }],
  lists: [],
  marks: {
    decorators: [{ title: "Italic", value: "em" }],
    annotations: [
      {
        name: "link",
        title: "Link",
        type: "object",
        fields: [defineField({ name: "href", title: "URL", type: "url" })],
      },
    ],
  },
});

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "pages", title: "Pages", default: true },
    { name: "about", title: "About" },
    { name: "contact", title: "Contact" },
    { name: "social", title: "Social" },
    { name: "representation", title: "Representation" },
  ],
  fields: [
    defineField({
      name: "showPhotosPage",
      title: "Show photos page",
      type: "boolean",
      description: "Show the Photos link and make the public photography page available.",
      group: "pages",
      initialValue: true,
    }),
    defineField({ name: "aboutHeading", title: "About heading", type: "string", group: "about" }),
    defineField({ name: "name", title: "Name", type: "string", group: "about" }),
    defineField({ name: "role", title: "Role", type: "string", group: "about", description: "For example: Cinematographer" }),
    defineField({ name: "aboutText", title: "About text", type: "array", group: "about", of: [restrainedPortableText] }),
    defineField({
      name: "portrait",
      title: "Portrait",
      type: "image",
      group: "about",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alternative text", type: "string" })],
    }),
    defineField({ name: "location", title: "Location", type: "string", group: "about" }),
    defineField({ name: "contactHeading", title: "Contact heading", type: "string", group: "contact" }),
    defineField({ name: "contactText", title: "Contact introduction", type: "array", group: "contact", of: [restrainedPortableText] }),
    defineField({ name: "email", title: "Email", type: "email", group: "contact" }),
    defineField({ name: "phone", title: "Phone", type: "string", group: "contact" }),
    defineField({ name: "instagramUrl", title: "Instagram URL", type: "url", group: "social" }),
    defineField({ name: "vimeoUrl", title: "Vimeo URL", type: "url", group: "social" }),
    defineField({ name: "imdbUrl", title: "IMDb URL", type: "url", group: "social" }),
    defineField({
      name: "representationAgencies",
      title: "Representation agencies",
      type: "array",
      group: "representation",
      description: "Add each agency once, then add one or more individual contacts within it.",
      of: [defineArrayMember({ type: "representationAgency" })],
    }),
    defineField({
      name: "representation",
      title: "Legacy representation entries",
      type: "array",
      group: "representation",
      description: "Existing entries are preserved here. Move them into Representation agencies when convenient.",
      of: [defineArrayMember({ type: "representation" })],
    }),
  ],
  preview: { prepare: () => ({ title: "Site Settings" }) },
});
