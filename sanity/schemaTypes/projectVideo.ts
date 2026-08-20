import { defineField, defineType } from "sanity";

export const projectVideoType = defineType({
  name: "projectVideo",
  title: "Video",
  type: "object",
  fields: [
    defineField({
      name: "url",
      title: "Direct video URL",
      type: "url",
      description: "A browser-playable URL. Leave empty when using a playback ID.",
      validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
    }),
    defineField({ name: "playbackId", title: "Playback ID", type: "string", description: "Reserved for future Mux playback." }),
    defineField({
      name: "aspectRatio",
      title: "Aspect ratio",
      type: "number",
      description: "Frame width divided by height, for example 2.39 or 1.7778.",
      validation: (rule) => rule.positive().precision(4),
    }),
    defineField({ name: "poster", title: "Poster image", type: "image" }),
  ],
});
