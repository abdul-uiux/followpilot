import { NextRequest, NextResponse } from "next/server";
import { hubSpotFetch, hubSpotIsConfigured, hubSpotTokenCookie, refreshHubSpotTokens, sealHubSpotTokens, tokenCookieOptions, unsealHubSpotTokens } from "../../../lib/hubspot";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!hubSpotIsConfigured()) return NextResponse.json({ configured: false, connected: false });
  const savedTokens = request.cookies.get(hubSpotTokenCookie)?.value;
  const tokens = savedTokens ? unsealHubSpotTokens(savedTokens) : null;
  if (!tokens) return NextResponse.json({ configured: true, connected: false });

  try {
    const refreshedTokens = await refreshHubSpotTokens(tokens);
    const profileResponse = await hubSpotFetch("/integrations/v1/me", refreshedTokens.accessToken);
    if (!profileResponse.ok) throw new Error("HubSpot did not accept the connection.");
    const profile = await profileResponse.json() as { portalId?: number; user?: string; userId?: number };
    const response = NextResponse.json({ configured: true, connected: true, portalId: profile.portalId ?? null, user: profile.user ?? null });
    if (refreshedTokens.accessToken !== tokens.accessToken) response.cookies.set(hubSpotTokenCookie, sealHubSpotTokens(refreshedTokens), tokenCookieOptions);
    return response;
  } catch {
    const response = NextResponse.json({ configured: true, connected: false, expired: true });
    response.cookies.delete(hubSpotTokenCookie);
    return response;
  }
}

export async function DELETE() {
  const response = NextResponse.json({ connected: false });
  response.cookies.delete(hubSpotTokenCookie);
  return response;
}
