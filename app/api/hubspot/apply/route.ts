import { NextRequest, NextResponse } from "next/server";
import type { FieldKey } from "../../../followpilot-types";
import { hubSpotFetch, hubSpotTokensFromRequest } from "../../../lib/hubspot";
import { dateToHubSpotTimestamp, findContactByEmail, getDealPipeline } from "../../../lib/review-test";

export const runtime = "nodejs";

type Change = { field: FieldKey; after: string };

function asChanges(value: unknown): Change[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const change = item as Partial<Change>;
    return typeof change.field === "string" && typeof change.after === "string"
      ? [{ field: change.field as FieldKey, after: change.after }]
      : [];
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { dealId?: unknown; contactEmail?: unknown; changes?: unknown };
    const dealId = typeof body.dealId === "string" ? body.dealId : "";
    const contactEmail = typeof body.contactEmail === "string" ? body.contactEmail : "";
    const changes = asChanges(body.changes);
    if (!dealId || !contactEmail || !changes.length) throw new Error("A matched contact, selected deal, and at least one approved change are required.");
    const tokens = await hubSpotTokensFromRequest(request);
    const contact = await findContactByEmail(tokens.accessToken, contactEmail);
    if (!contact.deals.some((deal) => deal.id === dealId)) throw new Error("The selected deal is not associated with the matched HubSpot contact.");
    const pipeline = await getDealPipeline(tokens.accessToken);
    const properties: Record<string, string> = {};
    const noteChanges: Change[] = [];
    const results: Array<{ field: FieldKey; ok: boolean; message: string }> = [];

    for (const change of changes) {
      if (change.field === "deal_stage") {
        if (!pipeline.stages.some((stage) => stage.id === change.after)) {
          results.push({ field: change.field, ok: false, message: "The proposed stage is not valid for this HubSpot pipeline." });
        } else {
          properties.dealstage = change.after;
        }
      } else if (change.field === "next_step") {
        properties.hs_next_step = change.after.slice(0, 2000);
      } else if (change.field === "close_date") {
        properties.closedate = dateToHubSpotTimestamp(change.after);
      } else if (change.field === "amount") {
        const amount = Number(change.after.replace(/[$,]/g, ""));
        if (!Number.isFinite(amount) || amount < 0) results.push({ field: change.field, ok: false, message: "Amount must be a positive number." });
        else properties.amount = String(amount);
      } else if (change.field === "notes") {
        noteChanges.push(change);
      }
    }

    if (Object.keys(properties).length) {
      const response = await hubSpotFetch(`/crm/v3/objects/deals/${encodeURIComponent(dealId)}`, tokens.accessToken, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ properties }),
      });
      if (!response.ok) throw new Error(`HubSpot could not update the selected deal (${response.status}).`);
      for (const field of changes) if (field.field !== "notes" && !results.some((result) => result.field === field.field)) results.push({ field: field.field, ok: true, message: "Applied to HubSpot." });
    }

    for (const change of noteChanges) {
      const note = await hubSpotFetch("/crm/v3/objects/notes", tokens.accessToken, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ properties: { hs_note_body: change.after, hs_timestamp: String(Date.now()) } }),
      });
      if (!note.ok) {
        results.push({ field: "notes", ok: false, message: "Note could not be created with the connected HubSpot account." });
        continue;
      }
      const created = await note.json() as { id: string };
      const association = await hubSpotFetch(`/crm/v4/objects/notes/${created.id}/associations/default/deals/${encodeURIComponent(dealId)}`, tokens.accessToken, { method: "PUT" });
      const contactAssociation = await hubSpotFetch(`/crm/v4/objects/notes/${created.id}/associations/default/contacts/${encodeURIComponent(contact.id)}`, tokens.accessToken, { method: "PUT" });
      results.push({ field: "notes", ok: association.ok && contactAssociation.ok, message: association.ok && contactAssociation.ok ? "Note added to the contact and deal." : "Note was created but could not be fully associated." });
    }

    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "HubSpot updates could not be applied." }, { status: 400 });
  }
}
