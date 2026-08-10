import { fieldKeys, type ExpectedResult, type FixtureRecord } from "../followpilot-types";

export function emptyReviewData(): { fixture: FixtureRecord; expected: ExpectedResult } {
  const fields = Object.fromEntries(fieldKeys.map((field) => [field, field === "amount" ? { currency: "USD", value: 0 } : ""])) as FixtureRecord["opportunity"]["fields"];
  const expectedFields = Object.fromEntries(fieldKeys.map((field) => [field, {
    outcome_state: "unable_to_determine",
    current_value: fields[field],
    proposed_value: null,
    customer_statement_evidence: [],
    decision_context: { user_provided_context: null, existing_crm_value: fields[field], fixture_rule: "Match a HubSpot contact and deal to begin." },
    reason: "No meeting has been analyzed yet.",
    expected_user_action: "acknowledge_no_change",
    risk_level: "low",
  }])) as ExpectedResult["fields"];
  return {
    fixture: { case_id: "unmatched", data_classification: "connected_crm", reference_status: "No record selected", opportunity: { id: "", name: "No deal selected", company: "", status: "open", owner: { name: "", role: "" }, fields }, user_provided_context: null, fixture_rules: Object.fromEntries(fieldKeys.map((field) => [field, "Match a HubSpot contact and deal to begin."])) as FixtureRecord["fixture_rules"] },
    expected: { case_id: "unmatched", case_name: "No review yet", result_label: "", validated_ground_truth: false, opportunity_confirmation: { expected_opportunity_id: "", expected_action: "confirm", reason: "Match a HubSpot contact and deal to begin." }, fields: expectedFields },
  };
}
