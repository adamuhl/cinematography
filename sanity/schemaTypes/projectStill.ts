import { defineField, defineType } from "sanity";

export const projectStillType = defineType({
  name: "projectStill",
  title: "Project still",
  type: "object",
  fields: [
    defineField({ name: "image", title: "Image", type: "image", validation: (rule) => rule.required() }),
    defineField({
      name: "alt",
      title: "Alternative text",
      type: "string",
      description: "Optional. Describe the image for visitors using assistive technology.",
    }),
    defineField({
      name: "presentation",
      title: "Presentation width",
      type: "string",
      initialValue: "wide",
      options: {
        layout: "radio",
        list: [
          { title: "Wide", value: "wide" },
          { title: "Standard", value: "standard" },
          { title: "Portrait", value: "portrait" },
        ],
      },
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description: "Lower numbers appear first. Array order breaks ties.",
      validation: (rule) => rule.integer().min(0),
    }),
  ],
  preview: { select: { title: "alt", media: "image", subtitle: "presentation" } },
});
