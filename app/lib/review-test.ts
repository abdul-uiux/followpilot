import { hubSpotFetch, type HubSpotTokens } from "./hubspot";
import type { CrmValue, FixtureRecord, FieldKey } from "../followpilot-types";

export const testRecordPrefix = "FollowPilot test";

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

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
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
  if (!pipeline?.stages?.length) throw new Error("No HubSpot deal pipeline is available for the test record.");
  return {
    id: pipeline.id,
    label: pipeline.label,
    stages: [...pipeline.stages]
      .sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0))
      .map(({ id, label }) => ({ id, label })),
  };
}

export async function getDealFixture(accessToken: string, dealId: string, contactId = ""): Promise<DealFixture> {
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
    notes: "No FollowPilot test note has been added yet.",
  };

  return {
    case_id: `hubspot-${deal.id}`,
    data_classification: "entirely_synthetic",
    reference_status: "Synthetic HubSpot test record",
    opportunity: {
      id: deal.id,
      name: asString(properties.dealname, `${testRecordPrefix} deal`),
      company: testRecordPrefix,
      status: "open",
      owner: { name: "FollowPilot test", role: "automation" },
      fields,
    },
    user_provided_context: null,
    fixture_rules: fixtureRules,
    hubspot: { contactId, dealId: deal.id, pipelineId: pipeline.id, stages: pipeline.stages },
  };
}

export async function createSyntheticTestRecord(tokens: HubSpotTokens) {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const pipeline = await getDealPipeline(tokens.accessToken);
  const firstStage = pipeline.stages[0];
  const closeDate = Date.UTC(2026, 8, 30).toString();
  const contact = await hubSpotJson<{ id: string }>("/crm/v3/objects/contacts", tokens.accessToken, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      properties: {
        firstname: "FollowPilot",
        lastname: `Test ${timestamp}`,
        email: `followpilot.test.${timestamp}@example.test`,
        company: testRecordPrefix,
      },
    }),
  });
  const deal = await hubSpotJson<{ id: string }>("/crm/v3/objects/deals", tokens.accessToken, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      properties: {
        dealname: `${testRecordPrefix} · Gemini review ${timestamp}`,
        pipeline: pipeline.id,
        dealstage: firstStage.id,
        amount: "48000",
        closedate: closeDate,
        hs_next_step: "Technical evaluation with the synthetic test team",
      },
    }),
  });
  await hubSpotJson(`/crm/v4/objects/contacts/${contact.id}/associations/default/deals/${deal.id}`, tokens.accessToken, { method: "PUT" });
  return getDealFixture(tokens.accessToken, deal.id, contact.id);
}

export function dateToHubSpotTimestamp(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.valueOf())) throw new Error("Close date must use YYYY-MM-DD.");
  return String(date.valueOf());
}
