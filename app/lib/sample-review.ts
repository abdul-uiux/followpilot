import type { ExpectedResult, FieldKey, FixtureRecord } from "../followpilot-types";

export const sampleTranscript = `Product demo follow-up — entirely fictional sample

[00:18] Maya Chen (VP of Operations, BluePeak Analytics): We finished the technical evaluation yesterday. The team is comfortable moving forward to a formal proposal review.

[00:45] Maya Chen: No, keep the scope and the $48,000 annual amount as quoted.

[01:10] Maya Chen: September 30, 2026 still works as our target.

[01:33] Maya Chen: Please send the formal proposal tomorrow, then let's review it with Omar on Friday, August 7 at 2:00 p.m. Eastern.

[01:56] Maya Chen: Add the security questionnaire and note that Omar Haddad from procurement will lead the commercial review.`;

const fixtureRules: Record<FieldKey, string> = {
  deal_stage: "Move to proposal only when the customer explicitly confirms evaluation is complete and agrees to review a formal proposal.",
  next_step: "Record a concrete next action only when an owner or timing is explicitly stated.",
  close_date: "Change the close date only when the customer explicitly provides a different date.",
  amount: "Change the amount only when the customer explicitly agrees to a different commercial value.",
  notes: "Append material customer facts explicitly stated during the meeting.",
};

export const sampleFixture: FixtureRecord = {
  case_id: "sample-bluepeak-demo",
  data_classification: "entirely_synthetic",
  reference_status: "Synthetic sample — no HubSpot data is changed",
  opportunity: {
    id: "SAMPLE-DEAL-0101",
    name: "BluePeak Analytics — Annual Platform",
    company: "BluePeak Analytics",
    status: "open",
    owner: { name: "Elena Ruiz", role: "Account executive" },
    fields: {
      deal_stage: "discovery",
      next_step: "Technical evaluation with operations team",
      close_date: "2026-09-30",
      amount: { currency: "USD", value: 48000 },
      notes: "Technical evaluation in progress with Maya Chen. Security and procurement ownership not yet documented.",
    },
  },
  user_provided_context: null,
  fixture_rules: fixtureRules,
};

const context = (field: FieldKey) => ({ user_provided_context: null, existing_crm_value: sampleFixture.opportunity.fields[field], fixture_rule: fixtureRules[field] });

export const sampleExpected: ExpectedResult = {
  case_id: sampleFixture.case_id,
  case_name: "BluePeak Analytics product demo follow-up",
  result_label: "Synthetic sample review",
  validated_ground_truth: false,
  opportunity_confirmation: { expected_opportunity_id: sampleFixture.opportunity.id, expected_action: "confirm", reason: "The sample transcript and opportunity both refer to BluePeak Analytics." },
  fields: {
    deal_stage: { outcome_state: "proposed_change", current_value: "discovery", proposed_value: "proposal", risk_level: "high", expected_user_action: "approve", decision_context: context("deal_stage"), reason: "The customer explicitly says the evaluation is complete and they are ready for a formal proposal review.", customer_statement_evidence: [{ excerpt: "We finished the technical evaluation yesterday. The team is comfortable moving forward to a formal proposal review.", speaker: "Maya Chen", timestamp: "00:18", interpretation: "explicit" }] },
    next_step: { outcome_state: "proposed_change", current_value: "Technical evaluation with operations team", proposed_value: "Send formal proposal; review with Maya Chen and Omar Haddad on Friday, August 7 at 2:00 p.m. ET", risk_level: "medium", expected_user_action: "approve", decision_context: context("next_step"), reason: "The customer provided a concrete action, participants, and timing.", customer_statement_evidence: [{ excerpt: "Please send the formal proposal tomorrow, then let's review it with Omar on Friday, August 7 at 2:00 p.m. Eastern.", speaker: "Maya Chen", timestamp: "01:33", interpretation: "explicit" }] },
    close_date: { outcome_state: "no_change", current_value: "2026-09-30", proposed_value: null, risk_level: "high", expected_user_action: "acknowledge_no_change", decision_context: context("close_date"), reason: "The customer confirms the existing September 30 target date.", customer_statement_evidence: [{ excerpt: "September 30, 2026 still works as our target.", speaker: "Maya Chen", timestamp: "01:10", interpretation: "explicit" }] },
    amount: { outcome_state: "no_change", current_value: { currency: "USD", value: 48000 }, proposed_value: null, risk_level: "high", expected_user_action: "acknowledge_no_change", decision_context: context("amount"), reason: "The customer explicitly confirms the quoted annual amount and scope.", customer_statement_evidence: [{ excerpt: "Keep the scope and the $48,000 annual amount as quoted.", speaker: "Maya Chen", timestamp: "00:45", interpretation: "explicit" }] },
    notes: { outcome_state: "proposed_change", current_value: sampleFixture.opportunity.fields.notes, proposed_value: "Technical evaluation completed. Include the security questionnaire with the proposal. Omar Haddad from procurement will lead the commercial review.", risk_level: "low", expected_user_action: "approve", decision_context: context("notes"), reason: "The customer identifies a security deliverable and who will lead commercial review.", customer_statement_evidence: [{ excerpt: "Add the security questionnaire and note that Omar Haddad from procurement will lead the commercial review.", speaker: "Maya Chen", timestamp: "01:56", interpretation: "explicit" }] },
  },
};
