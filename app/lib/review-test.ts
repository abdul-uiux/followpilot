import { hubSpotFetch } from "./hubspot";
import type { CrmValue, FixtureRecord, FieldKey } from "../followpilot-types";

export const fixtureRules: Record<FieldKey, string> = {
  deal_stage: "Advance the deal only when the customer explicitly agrees to the next commercial step.",
  next_step: "Record a concrete next action only when an owner or timing is stated in the transcript.",
  close_date: "Change the close date only when the customer explicitly gives a different specific date.",
  amount: "Change amount only when the customer explicitly agrees to a different commercial value.",
  notes: "Append only material customer facts explicitly stated in the transcript.",
};

type HubSpotStage = { id: string; label: string; displayOrder?: number };
type HubSpotPipeline = { id: string; label: string; stages: HubSpotStage[] };

export type DealFixture = FixtureRecord & {
  hubspot: { contactId: string; dealId: string; pipelineId: string; stages: Array<{ id: string; label: string }> };
};

export type HubSpotDealMatch = { id: string; name: string; stage: string; amount: string; closeDate: string; updatedAt: string };
export type HubSpotContactMatch = { id: string; email: string; name: string; deals: HubSpotDealMatch[] };

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asHubSpotId(value: unknown) {
  if (typeof value === "string" || typeof value === "number") return String(value);
  return "";
}

function asMoney(value: unknown): CrmValue {
  const amount = Number(value);
  return Number.isFinite(amount) ? { currency: "USD", value: amount } : { currency: "USD", value: 0 };
}

function dateValue(value: unknown) {
  const time = Number(value);
  if (!Number.isFinite(time) || time <= 0) return "";
  return new Date(time).toISOString().slice(0, 10);
}

async function hubSpotJson<T>(path: string, accessToken: string, init?: RequestInit): Promise<T> {
  const response = await hubSpotFetch(path, accessToken, init);
  if (!response.ok) throw new Error(`HubSpot request failed (${response.status}).`);
  return response.json() as Promise<T>;
}

export async function getDealPipeline(accessToken: string) {
  const value = await hubSpotJson<{ results?: HubSpotPipeline[] }>("/crm/v3/pipelines/deals", accessToken);
  const pipeline = value.results?.find((item) => item.stages?.length) ?? value.results?.[0];
  if (!pipeline?.stages?.length) throw new Error("No HubSpot deal pipeline is available.");
  return {
    id: pipeline.id,
    label: pipeline.label,
    stages: [...pipeline.stages]
      .sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0))
      .map(({ id, label }) => ({ id, label })),
  };
}

export async function getDealFixture(accessToken: string, dealId: string, contactId = "", contactName = "Connected contact"): Promise<DealFixture> {
  const [pipeline, deal] = await Promise.all([
    getDealPipeline(accessToken),
    hubSpotJson<{ id: string; properties?: Record<string, unknown> }>(
      `/crm/v3/objects/deals/${encodeURIComponent(dealId)}?properties=dealname,dealstage,amount,closedate,hs_next_step`,
      accessToken,
    ),
  ]);
  const properties = deal.properties ?? {};
  const stageId = asString(properties.dealstage);
  const fields: Record<FieldKey, CrmValue> = {
    deal_stage: stageId,
    next_step: asString(properties.hs_next_step, "No next step recorded"),
    close_date: dateValue(properties.closedate),
    amount: asMoney(properties.amount),
    notes: "No FollowPilot note has been added yet.",
  };

  return {
    case_id: `hubspot-${deal.id}`,
    data_classification: "connected_crm",
    reference_status: "Connected HubSpot record",
    opportunity: {
      id: deal.id,
      name: asString(properties.dealname, "Untitled deal"),
      company: contactName,
      status: "open",
      owner: { name: "HubSpot", role: "connected CRM" },
      fields,
    },
    user_provided_context: null,
    fixture_rules: fixtureRules,
    hubspot: { contactId, dealId: deal.id, pipelineId: pipeline.id, stages: pipeline.stages },
  };
}

export async function findContactByEmail(accessToken: string, email: string): Promise<HubSpotContactMatch> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) throw new Error("Enter the HubSpot contact email to continue.");
  const search = await hubSpotJson<{ results?: Array<{ id: string; properties?: Record<string, unknown> }> }>("/crm/v3/objects/contacts/search", accessToken, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName: "email", operator: "EQ", value: normalizedEmail }] }],
      properties: ["firstname", "lastname", "email"],
      limit: 2,
    }),
  });
  const contact = search.results?.[0];
  if (!contact) throw new Error("No HubSpot contact matches that email.");
  if ((search.results?.length ?? 0) > 1) throw new Error("More than one HubSpot contact matches that email. Use a unique email.");
  const properties = contact.properties ?? {};
  const associations = await hubSpotJson<{ results?: Array<{ toObjectId?: string | number }> }>(`/crm/v4/objects/contacts/${encodeURIComponent(contact.id)}/associations/deals?limit=100`, accessToken);
  let dealIds = (associations.results ?? []).map((item) => asHubSpotId(item.toObjectId)).filter(Boolean);

  // The v3 association endpoint is retained as a compatibility fallback. Some
  // connected portals return v4 association IDs as numbers, while others only
  // expose the existing relationship through the v3 result shape.
  if (!dealIds.length) {
    const legacyAssociations = await hubSpotJson<{ results?: Array<{ id?: string | number }> }>(`/crm/v3/objects/contacts/${encodeURIComponent(contact.id)}/associations/deals?limit=100`, accessToken);
    dealIds = (legacyAssociations.results ?? []).map((item) => asHubSpotId(item.id)).filter(Boolean);
  }
  const deals = await Promise.all(dealIds.map(async (dealId) => {
    const deal = await hubSpotJson<{ id: string; properties?: Record<string, unknown> }>(`/crm/v3/objects/deals/${encodeURIComponent(dealId)}?properties=dealname,dealstage,amount,closedate,hs_lastmodifieddate`, accessToken);
    const values = deal.properties ?? {};
    return { id: deal.id, name: asString(values.dealname, "Untitled deal"), stage: asString(values.dealstage), amount: asString(values.amount), closeDate: dateValue(values.closedate), updatedAt: asString(values.hs_lastmodifieddate) };
  }));
  const name = [asString(properties.firstname), asString(properties.lastname)].filter(Boolean).join(" ") || normalizedEmail;
  return { id: contact.id, email: asString(properties.email, normalizedEmail), name, deals: deals.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)) };
}

export function dateToHubSpotTimestamp(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.valueOf())) throw new Error("Close date must use YYYY-MM-DD.");
  return String(date.valueOf());
}
