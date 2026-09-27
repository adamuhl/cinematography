import { defineArrayMember, defineField, defineType } from "sanity";

export const photographyGalleryType = defineType({
  name: "photographyGallery",
  title: "Photography Gallery",
  type: "document",
  fields: [
    defineField({
      name: "enabled",
      title: "Legacy photography visibility",
      type: "boolean",
      initialValue: true,
      hidden: true,
    }),
    defineField({
      name: "photos",
      title: "Photographs",
      type: "array",
      description: "Drag multiple image files here to upload a batch, then drag items to reorder them.",
      of: [
        defineArrayMember({
          name: "photograph",
          title: "Photograph",
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "title",
              title: "Photo title",
              type: "string",
              description: "Optional. Displayed beneath the photograph.",
            }),
            defineField({
              name: "alt",
              title: "Alternative text",
              type: "string",
              description: "Optional. Describe the photograph for visitors using assistive technology.",
            }),
            defineField({
              name: "presentation",
              title: "Presentation width",
              type: "string",
              initialValue: "wide",
              options: {
                layout: "radio",
                list: [
                  { title: "Full width", value: "wide" },
                  { title: "Standard", value: "standard" },
                  { title: "Portrait", value: "portrait" },
                ],
              },
            }),
          ],
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Photography Gallery" }) },
});
