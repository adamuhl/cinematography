import { NextResponse } from "next/server";
import { createReelSession, passwordsMatch, reelCookieName } from "../../../../reel-auth";
import { getPrivateReel } from "../../../../../sanity/lib/projects";

type RouteContext = { params: Promise<{ slug: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const reel = await getPrivateReel(slug);
  const formData = await request.formData();
  const password = String(formData.get("password") || "");
  const destination = new URL(`/reel/${encodeURIComponent(slug)}`, request.url);

  if (!reel || (reel.passwordHash && !passwordsMatch(password, reel.passwordHash))) {
    destination.searchParams.set("error", "password");
    return NextResponse.redirect(destination, 303);
  }

  const session = createReelSession(slug);
  const response = NextResponse.redirect(destination, 303);
  response.cookies.set(reelCookieName(slug), session.value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: `/reel/${slug}`,
    maxAge: session.maxAge,
  });
  return response;
}
