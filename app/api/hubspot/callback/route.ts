import { NextRequest, NextResponse } from "next/server";
import { exchangeHubSpotCode, hubSpotStateCookie, hubSpotTokenCookie, sealHubSpotTokens, tokenCookieOptions } from "../../../lib/hubspot";

export const runtime = "nodejs";
const hubSpotReturnToCookie = "followpilot_hubspot_return_to";

function safeReturnTo(value: string | undefined) {
  return value === "/onboarding" || value === "/" ? value : "/integrations";
}

export async function GET(request: NextRequest) {
  const redirect = new URL(safeReturnTo(request.cookies.get(hubSpotReturnToCookie)?.value), request.url);
  const error = request.nextUrl.searchParams.get("error");
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get(hubSpotStateCookie)?.value;

  if (error || !code || !state || state !== expectedState) {
    redirect.searchParams.set("hubspot", "error");
    const response = NextResponse.redirect(redirect);
    response.cookies.delete(hubSpotStateCookie);
    response.cookies.delete(hubSpotReturnToCookie);
    return response;
  }

  try {
    const tokens = await exchangeHubSpotCode(code);
    redirect.searchParams.set("hubspot", "connected");
    const response = NextResponse.redirect(redirect);
    response.cookies.set(hubSpotTokenCookie, sealHubSpotTokens(tokens), tokenCookieOptions);
    response.cookies.delete(hubSpotStateCookie);
    response.cookies.delete(hubSpotReturnToCookie);
    return response;
  } catch {
    redirect.searchParams.set("hubspot", "error");
    const response = NextResponse.redirect(redirect);
    response.cookies.delete(hubSpotStateCookie);
    response.cookies.delete(hubSpotReturnToCookie);
    return response;
  }
}
