import { defineArrayMember, defineField, defineType } from "sanity";

export const representationAgencyType = defineType({
  name: "representationAgency",
  title: "Representation agency",
  type: "object",
  fields: [
    defineField({ name: "agencyName", title: "Agency name", type: "string" }),
    defineField({ name: "territory", title: "Territory or region", type: "string" }),
    defineField({ name: "websiteUrl", title: "Agency website", type: "url" }),
    defineField({
      name: "contacts",
      title: "Contacts",
      type: "array",
      of: [defineArrayMember({ type: "representationContact" })],
    }),
  ],
  preview: {
    select: { title: "agencyName", subtitle: "territory" },
    prepare: ({ title, subtitle }) => ({ title: title || subtitle || "Representation agency", subtitle: title ? subtitle : undefined }),
  },
});
