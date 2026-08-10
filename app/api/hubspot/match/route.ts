import { NextRequest, NextResponse } from "next/server";
import { hubSpotTokensFromRequest } from "../../../lib/hubspot";
import { findContactByEmail } from "../../../lib/review-test";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { contactEmail?: unknown };
    const contactEmail = typeof body.contactEmail === "string" ? body.contactEmail : "";
    const tokens = await hubSpotTokensFromRequest(request);
    const contact = await findContactByEmail(tokens.accessToken, contactEmail);
    return NextResponse.json({ contact });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "HubSpot contact could not be matched." }, { status: 400 });
  }
}
