import { NextRequest, NextResponse } from "next/server";
import { hubSpotTokensFromRequest } from "../../../lib/hubspot";
import { createSyntheticTestRecord } from "../../../lib/review-test";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const tokens = await hubSpotTokensFromRequest(request);
    const fixture = await createSyntheticTestRecord(tokens);
    return NextResponse.json({ fixture });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "HubSpot test record could not be created." }, { status: 400 });
  }
}
