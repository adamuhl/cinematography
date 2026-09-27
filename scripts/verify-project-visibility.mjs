import assert from "node:assert/strict";
import { getFeaturedProjects, getFrontPageProjects, getHomeScreenImage } from "../app/project-visibility.ts";

const project = (title, showOnFrontPage, featured, order, overrides = {}) => ({
  title,
  slug: title.toLowerCase().replaceAll(" ", "-"),
  categories: [],
  showOnFrontPage,
  frontPageOrder: order,
  featured,
  featuredOrder: order,
  thumbnail: { src: `/test/${order}.jpg`, alt: "" },
  ...overrides,
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

const workImage = { src: "/work.jpg", alt: "Work crop" };
const homeImage = { src: "/home.jpg", alt: "Home crop" };
assert.equal(getHomeScreenImage(project("Different images", true, false, 1, { thumbnail: workImage, homepageImage: homeImage })), homeImage);
assert.equal(getHomeScreenImage(project("Thumbnail only", true, false, 1, { thumbnail: workImage })), workImage);
assert.equal(getHomeScreenImage(project("Home only", true, false, 1, { thumbnail: undefined, homepageImage: homeImage })), homeImage);
assert.equal(getHomeScreenImage(project("Neither", true, false, 1, { thumbnail: undefined, homepageImage: undefined })), undefined);
assert.deepEqual(
  getFeaturedProjects(projects).map(({ title }) => title),
  ["Both", "Featured only"],
);

console.log("Project visibility combinations verified.");
