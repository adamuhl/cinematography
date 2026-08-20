import { defineField, defineType } from "sanity";

export const creditType = defineType({
  name: "credit",
  title: "Credit",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Role", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "value", title: "Name / company", type: "string", validation: (rule) => rule.required() }),
  ],
  preview: { select: { title: "label", subtitle: "value" } },
});
