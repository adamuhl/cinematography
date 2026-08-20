import { creditType } from "./credit";
import { projectType } from "./project";
import { projectStillType } from "./projectStill";
import { projectVideoType } from "./projectVideo";
import { representationType } from "./representation";
import { representationAgencyType } from "./representationAgency";
import { representationContactType } from "./representationContact";
import { siteSettingsType } from "./siteSettings";

export const schemaTypes = [
  siteSettingsType,
  projectType,
  representationAgencyType,
  representationContactType,
  representationType,
  creditType,
  projectStillType,
  projectVideoType,
];
