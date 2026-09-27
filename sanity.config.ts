"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { muxInput } from "sanity-plugin-mux-input";
import { apiVersion, dataset, projectId } from "./sanity/env";
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
            S.listItem()
              .id("projects")
              .title("Projects")
              .child(
                S.list()
                  .title("Projects")
                  .items([
                    S.listItem()
                      .id("publicProjects")
                      .title("Public Projects")
                      .child(
                        S.documentList()
                          .title("Public Projects")
                          .schemaType("project")
                          .apiVersion(apiVersion)
                          .filter('_type == "project" && coalesce(publishOnSite, true) == true'),
                      ),
                    S.listItem()
                      .id("nonPublicProjects")
                      .title("Non-Public Projects")
                      .child(
                        S.documentList()
                          .title("Non-Public Projects")
                          .schemaType("project")
                          .apiVersion(apiVersion)
                          .filter('_type == "project" && publishOnSite == false'),
                      ),
                  ]),
              ),
            S.documentTypeListItem("privateReel").title("Private Reels"),
            S.divider(),
            S.listItem()
              .id("photographyGallery")
              .title("Photography Gallery")
              .child(S.document().schemaType("photographyGallery").documentId("photographyGallery").title("Photography Gallery")),
          ]),
    }),
    muxInput(),
  ],
  schema: { types: schemaTypes },
  document: {
    actions: (previousActions, context) =>
      context.schemaType === "siteSettings" || context.schemaType === "photographyGallery"
        ? previousActions.filter(({ action }) => action !== "delete" && action !== "duplicate")
        : previousActions,
    newDocumentOptions: (previousOptions) =>
      previousOptions.filter(({ templateId }) => templateId !== "siteSettings" && templateId !== "photographyGallery"),
  },
});
