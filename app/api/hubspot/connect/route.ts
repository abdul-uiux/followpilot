import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { hubSpotConfig, hubSpotScopes, hubSpotStateCookie } from "../../../lib/hubspot";

export const runtime = "nodejs";

const hubSpotReturnToCookie = "followpilot_hubspot_return_to";

function safeReturnTo(value: string | null) {
  return value === "/onboarding" || value === "/" ? value : "/integrations";
}

export async function GET(request: NextRequest) {
  const { clientId, redirectUri } = hubSpotConfig();
  const state = randomUUID();
  const authorizeUrl = new URL("https://app.hubspot.com/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", hubSpotScopes.join(" "));
  authorizeUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(hubSpotStateCookie, state, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 10 * 60 });
  response.cookies.set(hubSpotReturnToCookie, safeReturnTo(request.nextUrl.searchParams.get("returnTo")), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 10 * 60 });
  return response;
}
