import assert from "node:assert/strict";
import { getFeaturedProjects, getFrontPageProjects } from "../app/project-visibility.ts";

const project = (title, showOnFrontPage, featured, order) => ({
  title,
  slug: title.toLowerCase().replaceAll(" ", "-"),
  categories: [],
  showOnFrontPage,
  frontPageOrder: order,
  featured,
  featuredOrder: order,
  color: "none",
});

const projects = [
  project("Front page only", true, false, 2),
  project("Featured only", false, true, 2),
  project("Both", true, true, 1),
  project("Neither", false, false, 1),
];

assert.deepEqual(
  getFrontPageProjects(projects).map(({ title }) => title),
  ["Both", "Front page only"],
);
assert.deepEqual(
  getFeaturedProjects(projects).map(({ title }) => title),
  ["Both", "Featured only"],
);

console.log("Project visibility combinations verified.");
