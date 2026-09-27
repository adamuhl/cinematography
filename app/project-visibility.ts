import type { Project } from "./project-data";

export function getHomeScreenImage(project: Project) {
  return project.homepageImage ?? project.thumbnail;
}

export function getFrontPageProjects(projects: Project[]) {
  return projects
    .filter((project) => project.showOnFrontPage)
    .sort((a, b) => a.frontPageOrder - b.frontPageOrder);
}

export function getFeaturedProjects(projects: Project[]) {
  return projects
    .filter((project) => project.featured)
    .sort((a, b) => a.featuredOrder - b.featuredOrder);
}
