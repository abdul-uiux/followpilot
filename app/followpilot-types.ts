export const fieldKeys = [
  "deal_stage",
  "next_step",
  "close_date",
  "amount",
  "notes",
] as const;

export type FieldKey = (typeof fieldKeys)[number];
export type OutcomeState =
  | "proposed_change"
  | "no_change"
  | "unable_to_determine"
  | "conflict";
export type RiskLevel = "low" | "medium" | "high";
export type MoneyValue = { currency: string; value: number };
export type CrmValue = string | MoneyValue | null;

export type TranscriptEvidence = {
  excerpt: string;
  speaker: string;
  timestamp: string;
  interpretation: "explicit" | "inferred";
};

export type DecisionContext = {
  user_provided_context: string | null;
  existing_crm_value: CrmValue;
  fixture_rule: string;
};

export type FieldResult = {
  outcome_state: OutcomeState;
  current_value: CrmValue;
  proposed_value: CrmValue;
  customer_statement_evidence: TranscriptEvidence[];
  decision_context: DecisionContext;
  reason: string;
  expected_user_action: string;
  risk_level: RiskLevel;
};

export type ExpectedResult = {
  case_id: string;
  case_name: string;
  result_label: string;
  validated_ground_truth: false;
  opportunity_confirmation: {
    expected_opportunity_id: string;
    expected_action: string;
    reason: string;
  };
  fields: Record<FieldKey, FieldResult>;
};

export type FixtureRecord = {
  case_id: string;
  data_classification: "entirely_synthetic";
  reference_status: string;
  opportunity: {
    id: string;
    name: string;
    company: string;
    status: "open";
    owner: { name: string; role: string };
    fields: Record<FieldKey, CrmValue>;
  };
  user_provided_context: string | null;
  fixture_rules: Record<FieldKey, string>;
};

export type ReviewDecision =
  | "pending"
  | "approved"
  | "edited"
  | "rejected"
  | "not_applicable";

export type AuditEntry = {
  id: number;
  time: string;
  event: string;
  detail: string;
  result: string;
};
