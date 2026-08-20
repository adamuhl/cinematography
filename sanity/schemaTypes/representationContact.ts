import { defineField, defineType } from "sanity";

export const representationContactType = defineType({
  name: "representationContact",
  title: "Agency contact",
  type: "object",
  fields: [
    defineField({
      name: "department",
      title: "Department or work type",
      type: "string",
      description: "For example: Commercial, Film, or Music Video",
    }),
    defineField({ name: "name", title: "Representative name", type: "string" }),
    defineField({ name: "phone", title: "Phone", type: "string" }),
    defineField({ name: "email", title: "Email", type: "email" }),
  ],
  preview: {
    select: { title: "name", subtitle: "department" },
    prepare: ({ title, subtitle }) => ({ title: title || subtitle || "Agency contact", subtitle: title ? subtitle : undefined }),
  },
});
