"use client";

import imageUrlBuilder from "@sanity/image-url";
import type { ImageValue, ObjectInputProps } from "sanity";
import { dataset, projectId } from "../env";

const builder = imageUrlBuilder({ projectId, dataset });

export function FeaturedThumbnailInput(props: ObjectInputProps<ImageValue>) {
  const value = props.value as ImageValue | undefined;
  const previewUrl = value?.asset
    ? builder.image(value).width(1400).height(560).fit("crop").auto("format").url()
    : undefined;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {previewUrl ? (
        <div style={{ border: "1px solid var(--card-border-color)", borderRadius: 3, padding: 12 }}>
          <div style={{ display: "grid", gap: 12 }}>
            <strong style={{ fontSize: 13 }}>Actual Featured crop — 2.5:1</strong>
            <div style={{ aspectRatio: "2.5 / 1", overflow: "hidden", background: "#000", outline: "2px solid rgba(255,255,255,.9)" }}>
              <img
                src={previewUrl}
                alt="Current 2.5 to 1 featured crop preview"
                style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <span style={{ fontSize: 12, opacity: 0.65 }}>Everything inside the white frame appears on the Featured page. The checkerboard in Sanity’s editor is only unused preview space.</span>
          </div>
        </div>
      ) : null}
      {props.renderDefault(props)}
    </div>
  );
}
