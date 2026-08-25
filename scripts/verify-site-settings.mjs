import assert from "node:assert/strict";
import { normalizeSiteSettings } from "../sanity/lib/site-settings.ts";

const imageConfig = { projectId: "it9hjken", dataset: "production" };

assert.equal(normalizeSiteSettings(null, imageConfig), null, "Missing settings should remain absent.");

const emptyBlock = { _type: "block", children: [{ _type: "span", text: "  \n " }] };
const linkedBlock = {
  _type: "block",
  children: [{ _type: "span", text: "Available worldwide.", marks: ["contact-link"] }],
  markDefs: [{ _key: "contact-link", _type: "link", href: "https://example.com/contact" }],
};
const italicBlock = {
  _type: "block",
  children: [{ _type: "span", text: "Second paragraph.", marks: ["em"] }],
};

const nameAndEmptyBlocks = normalizeSiteSettings({
  name: "Adam Uhl",
  contactText: [emptyBlock, { _type: "block", children: [] }],
}, imageConfig);
assert.equal(nameAndEmptyBlocks?.name, "Adam Uhl");
assert.equal(nameAndEmptyBlocks?.contactText, undefined);

const populatedIntroduction = normalizeSiteSettings({
  contactText: [emptyBlock, linkedBlock, { _type: "block", children: [] }, italicBlock],
}, imageConfig);
assert.deepEqual(
  populatedIntroduction?.contactText,
  [linkedBlock, italicBlock],
  "Empty blocks should be removed without changing populated blocks or their marks.",
);

const noIntroduction = normalizeSiteSettings({ name: "Adam Uhl" }, imageConfig);
assert.equal(noIntroduction?.contactText, undefined, "No introduction should remain absent.");

const aboutOnly = normalizeSiteSettings({
  aboutHeading: "Biography",
  name: "Adam Uhl",
  aboutText: [{ _type: "block", children: [{ _type: "span", text: "Long-form about copy." }] }],
}, imageConfig);
assert.equal(aboutOnly?.name, "Adam Uhl");
assert.equal(aboutOnly?.email, undefined);
assert.equal(aboutOnly?.portrait, undefined);

const contactOnly = normalizeSiteSettings({ email: "hello@example.com", phone: "(555) 010-2020" }, imageConfig);
assert.equal(contactOnly?.email, "hello@example.com");
assert.equal(contactOnly?.name, undefined);
assert.equal(contactOnly?.representation, undefined);

const complete = normalizeSiteSettings({
  aboutHeading: "About",
  name: "Adam Uhl",
  role: "Cinematographer",
  location: "New York",
  portrait: {
    alt: "Portrait of Adam Uhl",
    asset: {
      _id: "image-259f3bdd20bfca024839e0d2c425ed86178d91e6-1920x1080-jpg",
      url: "https://cdn.sanity.io/images/it9hjken/production/259f3bdd20bfca024839e0d2c425ed86178d91e6-1920x1080.jpg",
      metadata: { dimensions: { width: 1920, height: 1080 } },
    },
    hotspot: { x: 0.5, y: 0.5, width: 0.5, height: 1 },
  },
  contactHeading: "Contact",
  contactText: [{ _type: "block", children: [{ _type: "span", text: "Available worldwide." }] }],
  email: "hello@example.com",
  phone: "+1 555 010 2020",
  instagramUrl: "https://instagram.com/example",
  vimeoUrl: "https://vimeo.com/example",
  imdbUrl: "https://imdb.com/name/example",
  representationAgencies: [
    {
      agencyName: "Example Agency",
      territory: "US",
      websiteUrl: "https://example.com",
      contacts: [
        { department: "Commercial", name: "Alex Agent", email: "alex.agent.with.a.long.address@example.com" },
        { department: "Film", name: "Jamie Agent", phone: "+1 555 010 3030" },
      ],
    },
    { agencyName: "Second Agency", territory: "UK", contacts: [{ name: "Morgan Agent" }] },
  ],
  representation: [
    { territory: "US", name: "Example Agency", email: "agent@example.com", websiteUrl: "https://example.com" },
    {},
  ],
}, imageConfig);
assert.equal(complete?.portrait?.width, 640);
assert.equal(complete?.portrait?.alt, "Portrait of Adam Uhl");
assert.equal(complete?.representationAgencies?.length, 2);
assert.equal(complete?.representationAgencies?.[0].contacts?.length, 2);
assert.equal(complete?.representation?.length, 1);

console.log("Site settings states verified.");
