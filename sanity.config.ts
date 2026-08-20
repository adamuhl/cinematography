"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { muxInput } from "sanity-plugin-mux-input";
import { dataset, projectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemaTypes";

export default defineConfig({
  name: "default",
  title: "Adam Uhl Portfolio",
  basePath: "/studio",
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .id("siteSettings")
              .title("Site Settings")
              .child(S.document().schemaType("siteSettings").documentId("siteSettings").title("Site Settings")),
            S.divider(),
            S.documentTypeListItem("project").title("Projects"),
          ]),
    }),
    muxInput(),
  ],
  schema: { types: schemaTypes },
  document: {
    actions: (previousActions, context) =>
      context.schemaType === "siteSettings"
        ? previousActions.filter(({ action }) => action !== "delete" && action !== "duplicate")
        : previousActions,
    newDocumentOptions: (previousOptions) =>
      previousOptions.filter(({ templateId }) => templateId !== "siteSettings"),
  },
});
