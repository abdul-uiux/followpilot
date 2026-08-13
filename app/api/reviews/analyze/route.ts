import { NextRequest, NextResponse } from "next/server";
import type { CrmValue, ExpectedResult, FieldKey, FieldResult, OutcomeState, RiskLevel } from "../../../followpilot-types";
import { hubSpotTokensFromRequest } from "../../../lib/hubspot";
import { findContactByEmail, fixtureRules, getDealFixture } from "../../../lib/review-test";

export const runtime = "nodejs";

const fields: FieldKey[] = ["deal_stage", "next_step", "close_date", "amount", "notes"];
const outcomes: OutcomeState[] = ["proposed_change", "no_change", "unable_to_determine", "conflict"];
const risks: RiskLevel[] = ["low", "medium", "high"];

type GeminiField = {
  outcome_state: OutcomeState;
  proposed_value: string | number | null;
  evidence: Array<{ excerpt: string; speaker: string; timestamp: string; interpretation: "explicit" | "inferred" }>;
  reason: string;
  risk_level: RiskLevel;
};

type GeminiOutput = { result_label: string; fields: Record<FieldKey, GeminiField> };

const fieldSchema = {
  type: "object",
  properties: {
    outcome_state: { type: "string", enum: outcomes },
    proposed_value: { type: ["string", "number", "null"] },
    evidence: {
      type: "array",
      items: {
        type: "object",
        properties: {
          excerpt: { type: "string" },
          speaker: { type: "string" },
          timestamp: { type: "string" },
          interpretation: { type: "string", enum: ["explicit", "inferred"] },
        },
        required: ["excerpt", "speaker", "timestamp", "interpretation"],
      },
    },
    reason: { type: "string" },
    risk_level: { type: "string", enum: risks },
  },
  required: ["outcome_state", "proposed_value", "evidence", "reason", "risk_level"],
};

function responseSchema() {
  return {
    type: "object",
    properties: {
      result_label: { type: "string" },
      fields: {
        type: "object",
        properties: Object.fromEntries(fields.map((field) => [field, fieldSchema])),
        required: fields,
      },
    },
    required: ["result_label", "fields"],
  };
}

function isGeminiField(value: unknown): value is GeminiField {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<GeminiField>;
  return Boolean(
    item.outcome_state && outcomes.includes(item.outcome_state) &&
      item.risk_level && risks.includes(item.risk_level) &&
      Array.isArray(item.evidence) && typeof item.reason === "string",
  );
}

function normalizeValue(field: FieldKey, value: GeminiField["proposed_value"], stages: Array<{ id: string }>): CrmValue {
  if (value === null) return null;
  if (field === "amount") {
    const amount = Number(value);
    return Number.isFinite(amount) && amount >= 0 ? { currency: "USD", value: amount } : null;
  }
  if (field === "deal_stage") return typeof value === "string" && stages.some((stage) => stage.id === value) ? value : null;
  if (field === "close_date") return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function safeResult(field: FieldKey, value: GeminiField, currentValue: CrmValue, stages: Array<{ id: string }>): FieldResult {
  const proposed = normalizeValue(field, value.proposed_value, stages);
  const validProposal = value.outcome_state !== "proposed_change" || proposed !== null;
  const outcome = validProposal ? value.outcome_state : "unable_to_determine";
  return {
    outcome_state: outcome,
    current_value: currentValue,
    proposed_value: outcome === "proposed_change" ? proposed : null,
    customer_statement_evidence: value.evidence.slice(0, 3).map((evidence) => ({
      excerpt: evidence.excerpt.slice(0, 500),
      speaker: evidence.speaker || "Unknown speaker",
      timestamp: evidence.timestamp || "Not provided",
      interpretation: evidence.interpretation,
    })),
    decision_context: { user_provided_context: null, existing_crm_value: currentValue, fixture_rule: fixtureRules[field] },
    reason: value.reason.slice(0, 700),
    expected_user_action: outcome === "proposed_change" ? "approve_or_reject" : "acknowledge_no_change",
    risk_level: value.risk_level,
  };
}

function parseGeminiResponse(value: unknown): GeminiOutput {
  if (!value || typeof value !== "object") throw new Error("Gemini returned an empty analysis.");
  const output = value as { output_text?: unknown; candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = typeof output.output_text === "string"
    ? output.output_text
    : output.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("");
  if (!text) throw new Error("Gemini did not return review data.");
  return JSON.parse(text) as GeminiOutput;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { transcript?: unknown; dealId?: unknown; contactEmail?: unknown };
    const transcript = typeof body.transcript === "string" ? body.transcript.trim() : "";
    const dealId = typeof body.dealId === "string" ? body.dealId : "";
    const contactEmail = typeof body.contactEmail === "string" ? body.contactEmail : "";
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Add GEMINI_API_KEY to .env.local before analysing a meeting transcript.");
    if (!transcript || !dealId || !contactEmail) throw new Error("A transcript, matched contact, and selected HubSpot deal are required.");
    if (transcript.length > 30_000) throw new Error("Keep the transcript under 30,000 characters.");

    const tokens = await hubSpotTokensFromRequest(request);
    const contact = await findContactByEmail(tokens.accessToken, contactEmail);
    if (!contact.deals.some((deal) => deal.id === dealId)) throw new Error("Select a deal associated with the matched HubSpot contact.");
    const fixture = await getDealFixture(tokens.accessToken, dealId, contact.id, contact.name);
    const stageList = fixture.hubspot.stages.map((stage) => `${stage.label}: ${stage.id}`).join("\n");
    const prompt = `You are FollowPilot's CRM review assistant. Analyse the meeting transcript against the selected HubSpot deal. Do not invent facts. Propose changes only where explicit transcript evidence supports them. For ambiguous or absent evidence use no_change, unable_to_determine, or conflict.\n\nCurrent HubSpot deal:\n${JSON.stringify(fixture.opportunity.fields)}\n\nValid HubSpot deal stages (return the stage ID, never the label):\n${stageList}\n\nField rules:\n${JSON.stringify(fixtureRules)}\n\nTranscript:\n${transcript}`;
    const gemini = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseJsonSchema: responseSchema(),
        },
      }),
      cache: "no-store",
    });
    if (!gemini.ok) throw new Error(`Gemini analysis failed (${gemini.status}).`);
    const generated = parseGeminiResponse(await gemini.json());
    const resultFields = {} as Record<FieldKey, FieldResult>;
    for (const field of fields) {
      const value = generated.fields?.[field];
      resultFields[field] = isGeminiField(value)
        ? safeResult(field, value, fixture.opportunity.fields[field], fixture.hubspot.stages)
        : {
          outcome_state: "unable_to_determine",
          current_value: fixture.opportunity.fields[field],
          proposed_value: null,
          customer_statement_evidence: [],
          decision_context: { user_provided_context: null, existing_crm_value: fixture.opportunity.fields[field], fixture_rule: fixtureRules[field] },
          reason: "Gemini did not return a valid result for this field.",
          expected_user_action: "acknowledge_no_change",
          risk_level: "medium",
        };
    }
    const expected: ExpectedResult = {
      case_id: fixture.case_id,
      case_name: "Gemini CRM review",
      result_label: typeof generated.result_label === "string" ? generated.result_label.slice(0, 240) : "Meeting transcript review",
      validated_ground_truth: false,
      opportunity_confirmation: { expected_opportunity_id: fixture.opportunity.id, expected_action: "confirm", reason: "Matched to the selected HubSpot contact and deal." },
      fields: resultFields,
    };
    return NextResponse.json({ fixture, expected });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Transcript analysis failed." }, { status: 400 });
  }
}
