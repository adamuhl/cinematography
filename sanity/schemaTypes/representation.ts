import { defineField, defineType } from "sanity";

export const representationType = defineType({
  name: "representation",
  title: "Representation",
  type: "object",
  fields: [
    defineField({ name: "territory", title: "Territory or label", type: "string" }),
    defineField({ name: "name", title: "Company or representative", type: "string" }),
    defineField({ name: "email", title: "Email", type: "email" }),
    defineField({ name: "phone", title: "Phone", type: "string" }),
    defineField({ name: "websiteUrl", title: "Website URL", type: "url" }),
  ],
  preview: {
    select: { title: "name", subtitle: "territory" },
    prepare: ({ title, subtitle }) => ({ title: title || subtitle || "Representation", subtitle: title ? subtitle : undefined }),
  },
});
