"use client";

import { useLayoutEffect } from "react";

export function ProjectScrollTop() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return null;
}
