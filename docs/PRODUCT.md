# FollowPilot Product Specification

## Product summary

FollowPilot helps customer-facing teams confidently complete post-meeting work without missing anything important.

V1 focuses specifically on account executives reviewing CRM updates for active sales opportunities. It uses realistic HubSpot-style fixture data to test whether users trust AI-prepared CRM work when they keep control of every important decision.

Customer-success managers who own renewal or expansion opportunities are a later secondary audience, not part of the first test.

## Problem statement

After customer calls, account executives managing active sales opportunities must turn messy conversations into accurate CRM updates. This work is manual and spread across transcripts, notes, CRM records, and other sources. Mistakes can create incorrect pipeline records, missed commitments, delayed follow-up, poor customer experiences, and inaccurate revenue forecasts.

## Target users

The primary V1 user is an account executive who regularly uses HubSpot and personally manages active sales opportunities.

The first test cohort is 3–5 account executives who regularly use HubSpot and personally manage active sales opportunities.

Customer-success managers are not included in the first test. CSMs who personally manage renewal or expansion opportunities may be evaluated in a later transferability round. CSMs focused on onboarding, support, adoption, or account health are outside V1.

## V1 user journey

1. The account executive pastes transcript text or uploads a `.txt` file. Meeting title, participant names, and a short user-provided context note are optional.
2. FollowPilot suggests the most likely HubSpot-style fixture opportunity based on the submitted information.
3. The user confirms the suggested opportunity or selects another fixture opportunity. Each transcript must relate to one primary open opportunity.
4. FollowPilot reads the selected fixture record and the documented fixture rules.
5. FollowPilot reviews all five supported fields and gives each exactly one result: proposed change, no change recommended, or unable to determine.
6. For every field, the user sees its current value, review result, reason, and source information. Customer-statement evidence and decision context are displayed separately.
7. Conflicting source information produces a conflict state without a definite or preselected answer. The user resolves the conflict manually.
8. The user approves, edits, or rejects proposed changes and may manually add a missed update for a supported field. Nothing is written yet.
9. A high-risk change supported only by user-provided context receives an additional warning and explicit confirmation.
10. The user completes final confirmation.
11. FollowPilot simulates applying the approved changes to the HubSpot-style fixture record and clearly reports each result.
12. FollowPilot records the required audit history, including source provenance and manually added changes.

## Goals

- Have every tester complete the FollowPilot workflow at least 50% faster than their own measured manual baseline.
- Help users complete review and approval in 7 minutes or less while still meeting the relative 50% speed threshold.
- Give every supported field a clear and accurate review result.
- Have at least 80% of AI-proposed CRM changes approved without editing, without allowing that metric to hide missed updates.
- Observed critical unsupported CRM proposals during the initial test: 0. Any occurrence is a serious safety failure requiring investigation and likely redesign.
- Give users enough customer-statement evidence, decision context, and control to trust the result and consider using FollowPilot again.

## Non-goals for V1

- No meeting-tool connections, including Zoom, Google Meet, Fathom, or Fireflies. Users provide transcripts themselves to keep V1 small.
- No follow-up email drafting or sending.
- No action-item creation, assignment, or deadline changes outside the approved CRM changes.
- No transcript translation, meeting summaries, sharing to Slack, or other tool connections.
- No automatic CRM writes, customer-facing messages, commitments, deadlines, or business-critical publishing without user approval.
- No real HubSpot OAuth connection, live-record access, or live CRM writes. V1 uses fixture data to validate the review workflow before integration work begins.
- No support for CRMs other than HubSpot-style fixture data.
- No first-round testing of customer-success workflows. Renewal and expansion CSMs belong to a later transferability round.
- No company-specific CRM-policy configuration. V1 uses one documented reference rule set for a realistic B2B SaaS sales process.

## Supported HubSpot fields

V1 supports only these deal fields:

- Deal stage
- Next step
- Close date
- Deal amount
- Deal description or notes

FollowPilot must review every supported field after every submitted call. Each field must show exactly one result:

- Proposed change
- No change recommended
- Unable to determine

## Product rules

### Human control

The account executive always makes the final decision for anything affecting CRM records, customer commitments, or commercial information.

For each proposed change, the user must be able to review the current value, proposed value, reason, customer-statement evidence, and decision context. Customer-statement evidence and decision context must remain visibly separate. The user must be able to approve, edit, or reject each proposal.

The user may manually add a missed update for one of the five supported fields. The audit history must label it `Added manually by user`.

After item-level review and any additional high-risk confirmations, FollowPilot must show one final confirmation before simulating approved changes on the fixture record.

### Customer-statement evidence and decision context

Customer-statement evidence consists only of information present in the source transcript:

- The exact transcript excerpt
- Who said it, when speaker attribution exists in the source
- When it was said, when a timestamp exists in the source

When attribution is absent, FollowPilot must show `Speaker: Unknown` or `Timestamp: Not provided`. It must also state whether its interpretation of the excerpt is explicit or inferred.

Decision context consists of:

- User-provided context
- Existing CRM value
- Fixture rule

FollowPilot must display customer-statement evidence and decision context separately. Existing CRM values, fixture rules, and user-provided context must never be described as evidence that a customer made a statement.

User-provided context may support a recommendation, but it must never be presented as transcript evidence or as a direct customer statement. FollowPilot must never present an AI inference as a direct customer statement or attach irrelevant customer-statement evidence to a proposed value.

### Uncertainty and conflict

Uncertainty must be visible, not hidden. When information is missing or confidence is too low, FollowPilot must show `Unable to determine` rather than make a definite recommendation.

When source information conflicts, FollowPilot must show `Conflict detected — user decision required`. It may identify the latest explicit customer statement as a possible value, but it must not preselect or recommend that value as correct.

FollowPilot must not invent missing details, turn vague language into a commitment, silently resolve conflicts, present an inference as fact, or apply an unresolved low-confidence change.

### High-risk changes supported by user context

A change supported only by user-provided context must be visibly marked as not supported by the transcript.

For deal amount, deal stage, close date, or any customer or commercial commitment, the normal approval action is insufficient. FollowPilot must show an additional warning:

`This change is not supported by the transcript. It is based only on context you provided.`

The user must explicitly confirm:

`Apply using my provided context`

### Failures

If FollowPilot fails to apply an approved change to the fixture record, it must mark the change as not applied, explain the failure in simple language, and let the user retry, edit, or skip it. A review must not be marked complete while an approved change has failed.

### Access and data handling

Before uploading a transcript, users must confirm that they are authorized to share the meeting information and that the upload follows their company policy and applicable consent requirements.

FollowPilot keeps the raw uploaded transcript and linked evidence until the review is complete, then automatically deletes the raw transcript after 30 days. Approved CRM changes and audit history may remain, but only with the minimum evidence needed to explain what was approved.

### Audit history

For every CRM change, the audit history must show who did what, to which fixture opportunity and field, when it happened, what changed, why it changed, the customer-statement evidence and decision context used, and whether the simulation succeeded. These source types must remain separate.

Manually added updates must be labeled `Added manually by user`. User-provided context must remain distinguishable from customer-statement evidence.

## User stories

- As an account executive, I want to submit a customer-call transcript against one confirmed open opportunity so that I can review relevant CRM fields without searching across tools.
- As an account executive, I want every supported field to show proposed change, no change recommended, or unable to determine so that I know nothing was silently skipped.
- As an account executive, I want customer-statement evidence and decision context displayed separately so that I can judge what actually supports a change.
- As an account executive, I want conflicts and uncertainty shown without a preselected answer so that I remain responsible for ambiguous decisions.
- As an account executive, I want to approve, edit, reject, or manually add supported changes so that I can complete the CRM job without leaving FollowPilot.
- As an account executive, I want stronger warnings for high-risk changes based only on my context so that I do not mistake them for customer-supported facts.
- As an account executive, I want clear simulation results and an audit history so that I know exactly what happened.

## V1 requirements

### P0 — required for V1

- Users can paste transcript text or upload a `.txt` file.
- Users can optionally add a meeting title, participant names, and a short user-provided context note.
- Users confirm one open HubSpot-style fixture opportunity before review.
- FollowPilot reads the selected fixture record and documented fixture rules.
- FollowPilot reviews only the five supported fields.
- Every supported field receives exactly one result: proposed change, no change recommended, or unable to determine.
- Every proposed change shows its current value, proposed value, reason, customer-statement evidence, and decision context, with those source types kept separate.
- Transcript excerpts show any speaker or timestamp present in the source.
- Missing speaker or timestamp data is explicitly identified as unavailable.
- Conflicting source information creates a user-decision-required state without a definite or preselected answer.
- Users can approve, edit, or reject each proposed change.
- Users can manually add a missed update for a supported field.
- Manually added updates are identified in the audit history.
- High-risk changes supported only by user-provided context require an additional warning and explicit confirmation.
- Users complete final confirmation before any approved change is simulated on the fixture record.
- FollowPilot clearly reports whether each approved change was simulated successfully, failed, or was skipped.
- A review cannot complete while an approved change has an unresolved failure.
- FollowPilot records source provenance and the required audit history.
- Raw transcript retention follows the 30-day deletion rule.

### P2 — later product direction

- Real HubSpot integration: OAuth, live record reads and writes, and permission handling
- Follow-up email drafts
- Action-item extraction and creation
- On-demand transcript or summary translation
- Approved summaries or action items shared to Slack or similar tools
- More CRM fields, objects, and CRM platforms
- Transferability testing with CSMs who own renewal or expansion opportunities
- Company-specific CRM rules and approval policies

## Success metrics and test method

| Measure | V1 target |
| --- | --- |
| Formal active-time reduction | Every tester is at least 50% faster than their own measured manual baseline |
| FollowPilot review and approval time | 7 minutes or less; ideal: 3–5 minutes |
| AI suggestions approved without editing | 80% or more |
| Observed critical unsupported CRM proposals during the initial test | 0. Any occurrence is a serious safety failure requiring investigation and likely redesign |
| Critical unsupported changes simulated | 0 |
| Return intent | Most testers say they would use FollowPilot again |

Measure a separate manual baseline for every tester using an equivalent transcript and fixture-record task.

- **50% faster or more:** Passes the formal continuation threshold.
- **30% to 49% faster:** Does not pass. Redesign and retest the workflow.
- **Below 30% faster:** Strong evidence that the workflow is not creating enough value; substantially reconsider it.

A result below 50% never passes the formal speed criterion, even when the task takes 7 minutes or less.

Evaluate field results against a reference answer created or reviewed by an experienced sales or RevOps practitioner using the documented fixture rules. A proposed change succeeds only when it has the correct field, value, meaning, source provenance, and support and is approved without correction.

Track manually added relevant changes and important missed updates separately. The 80% unchanged-approval target does not compensate for frequent omissions.

For ambiguous cases, use two reviewers or one reviewer applying a written field-update rule. Reviewer disagreement indicates ambiguity; it is not automatically an AI failure.

These thresholds are provisional test decisions, not established industry benchmarks. A small test cannot establish product safety, and one severe false-confidence failure may justify redesign regardless of average results.

## Trust-breakers to avoid

- Presenting an unsupported commercial change as supported by customer-statement evidence
- Confident wording when customer-statement evidence is unclear or conflicting
- Missing, weak, irrelevant, or incorrectly attributed customer-statement evidence
- Presenting user-provided context as a customer statement
- Preselecting an answer when source information conflicts
- Selecting the wrong HubSpot-style fixture opportunity
- Missing important supported updates repeatedly
- Changing anything without the required approval
- Making users reread large parts of the transcript
- Creating more review work than the product removes
- Leaving users unsure whether simulation completed successfully

FollowPilot must be accurate enough to be useful, transparent enough to be trusted, and fast enough to beat each tester's manual workflow.

## Open questions

- What exact reference rule determines when each supported field should change? **Owner: product and sales/RevOps reviewer**
- Which experienced sales or RevOps practitioner will review the fixture rules? **Owner: product**
- What operational standard defines sufficient customer-statement evidence and decision context for each field? **Owner: product, sales/RevOps, and test**
- What confidence rules apply to missing attribution, ambiguity, and other uncertainty? **Owner: product and data**
- How will each tester's equivalent manual baseline be measured? **Owner: product and research**
- How will reference answers and reviewer disagreements be adjudicated? **Owner: product and test**
- What criteria establish that the workflow is stable enough for sanitized real transcripts? **Owner: product and research**
- How should minimum transcript evidence and user-provided context be retained after raw-transcript deletion? **Owner: engineering and legal**
- What exactly should the final confirmation show? **Owner: product and design**
- How should manually added changes affect the 80% unchanged-approval metric's denominator? **Owner: product and data**
- Should synthetic test transcripts bypass the real-data authorization confirmation? **Owner: product and legal**

## Dependencies and phased delivery

V1 depends on realistic fixture data, a documented B2B SaaS reference rule set reviewed by an experienced sales or RevOps practitioner, a safe transcript-processing flow, and audit-history and retention support.

The first phase is a synthetic-data usability test with 3–5 account executives who regularly use HubSpot and personally manage active sales opportunities. After the workflow meets stability criteria, a later validation round may use sanitized real transcripts paired with fixture records.

Renewal or expansion CSMs belong to a later transferability round. Real HubSpot OAuth, live record access, live writes, permissions, and company-specific CRM configuration remain later integration work.

No hard delivery date has been set.
