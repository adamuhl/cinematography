import { defineArrayMember, defineField, defineType } from "sanity";
import { ReelPasswordInput } from "../components/reel-password-input";

export const privateReelType = defineType({
  name: "privateReel",
  title: "Private Reel",
  type: "document",
  fields: [
    defineField({
      name: "internalName",
      title: "Internal name",
      type: "string",
      description: "Only used in Sanity, such as Nike agency reel — September 2026.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Page title",
      type: "string",
      description: "The title your recipient sees.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Private link",
      type: "slug",
      options: { source: "internalName", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "intro", title: "Introductory note", type: "text", rows: 3 }),
    defineField({
      name: "projects",
      title: "Projects",
      type: "array",
      description: "Select projects from your library and drag them into the desired order.",
      of: [defineArrayMember({ type: "reference", to: [{ type: "project" }] })],
      validation: (rule) => rule.required().min(1).unique(),
    }),
    defineField({
      name: "passwordHash",
      title: "Password",
      type: "string",
      description: "Optional. Leave blank for a direct-access link. The password itself is never stored; only a one-way fingerprint is saved.",
      components: { input: ReelPasswordInput },
    }),
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      description: "Turn this off to disable the link immediately.",
      initialValue: true,
    }),
    defineField({
      name: "expiresAt",
      title: "Expiration",
      type: "datetime",
      description: "Optional. The reel becomes unavailable after this date and time.",
    }),
  ],
  preview: {
    select: { title: "internalName", subtitle: "title", active: "active" },
    prepare: ({ title, subtitle, active }) => ({
      title,
      subtitle: `${active === false ? "INACTIVE · " : ""}${subtitle || ""}`,
    }),
  },
});
