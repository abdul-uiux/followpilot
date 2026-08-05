# FollowPilot Product Specification

## Product summary

FollowPilot helps customer-facing teams confidently complete post-meeting work without missing anything important.

V1 focuses only on reviewing and approving evidence-backed CRM updates using realistic HubSpot-style fixture data. It tests whether users trust AI-prepared CRM work when they keep control of every important decision.

## Problem statement

After customer meetings, account executives and customer-success managers must turn a messy conversation into accurate CRM updates. This work is manual and spread across transcripts, notes, CRM records, and other tools. Mistakes can create poor customer experiences, incorrect records, missed commitments, delayed follow-ups, and lost revenue.

## Target users

- Account executives who regularly use HubSpot.
- Customer-success managers who regularly use HubSpot.

The first test group is 3–5 regular HubSpot users, ideally with at least two account executives and two customer-success managers.

## V1 user journey

1. The user pastes transcript text or uploads a `.txt` file. Meeting title and participant names are optional.
2. FollowPilot suggests the most likely HubSpot-style fixture record based on the transcript.
3. The user confirms the suggested record or manually chooses another fixture record before CRM review starts.
4. FollowPilot reads the selected fixture record's current values and prepares proposed changes.
5. The user reviews each proposal, its current value, proposed value, reason, and transcript evidence.
6. The user approves, edits, or rejects every proposed change. Nothing is written yet.
7. The user completes one final confirmation step.
8. FollowPilot simulates applying the approved changes to the HubSpot-style fixture record and clearly shows the result.
9. FollowPilot records an audit history for every change.

## Goals

- Help users review and approve CRM changes in 7 minutes or less.
- Reduce active post-meeting CRM-review time by at least 50% compared with the user's normal process.
- Have at least 80% of AI-suggested CRM changes approved without editing.
- Ensure no critical unsupported CRM change is approved and applied.
- Give users enough evidence and control to use FollowPilot again for later meetings.

## Non-goals for V1

- No meeting-tool connections, including Zoom, Google Meet, Fathom, or Fireflies. Users provide transcripts themselves to keep V1 small.
- No follow-up email drafting or sending.
- No action-item creation, assignment, or deadline changes outside the approved CRM changes.
- No transcript translation, meeting summaries, sharing to Slack, or other tool connections.
- No automatic CRM writes, customer-facing messages, commitments, deadlines, or business-critical publishing without user approval.
- No real HubSpot OAuth connection, live-record access, or live CRM writes. V1 uses fixture data to validate the review workflow before integration work begins.
- No support for CRMs other than HubSpot-style fixture data.

## Supported HubSpot fields

V1 supports only these deal fields:

- Deal stage
- Next step
- Close date
- Deal amount
- Deal description or notes

## Product rules

### Human control

The person always makes the final decision for anything affecting customers, CRM records, or business commitments.

Before a CRM update is made, the user must be able to review the current CRM value, the suggested new value, the reason for the change, and exact supporting transcript evidence. They must be able to approve, edit, or reject each proposal.

After approval, FollowPilot must show one final confirmation step before simulating the changes on the fixture record.

### Evidence and accuracy

Transcript evidence is required for any claim that could create a customer commitment, change a business record, affect ownership or deadlines, or influence a commercial decision.

This includes CRM changes, customer commitments, action items, owners, due dates, pricing, budgets, discounts, contract terms, deal stage, close date, next steps, customer objections, requirements, risks, final decisions, and follow-up statements that claim agreement.

For important claims, FollowPilot must show:

- The exact transcript excerpt
- Who said it
- When it was said
- Whether it was explicitly stated or inferred

FollowPilot must never present an AI inference as a direct customer statement.

### Uncertainty

Uncertainty must be visible, not hidden. When the transcript is unclear or confidence is low, FollowPilot must not make a definite recommendation. It must explain what may have happened, show the relevant excerpt, explain why confidence is low, and let the user confirm, edit, or dismiss the item.

It must not invent missing details, turn vague language into a definite commitment, silently resolve conflicting statements, present an inference as a fact, or apply low-confidence changes to the fixture record.

### Failures

If FollowPilot fails to apply an approved change to the fixture record, it must mark the change as not applied, explain the failure in simple language, and let the user retry, edit, or skip it. A review must not be marked complete while an approved change has failed.

### Access and data handling

Before uploading a transcript, users must confirm that they are authorized to share the meeting information and that the upload follows their company policy and applicable consent requirements.

FollowPilot keeps the raw uploaded transcript and linked evidence until the review is complete, then automatically deletes the raw transcript after 30 days. Approved CRM changes and audit history may remain, but only with the minimum evidence needed to explain what was approved.

### Audit history

For every CRM change, the audit history must show who did what, to which fixture record and field, when it happened, what changed, why it changed, supporting evidence, and whether the simulated update succeeded.

## User stories

- As an account executive, I want to submit a meeting transcript against a confirmed HubSpot-style fixture record so that I can review relevant CRM changes without searching across tools.
- As a customer-success manager, I want to see the current and suggested value for each proposed change, with evidence, so that I can safely decide whether to accept it.
- As a customer-facing user, I want to edit or reject each proposed change before it is simulated so that I remain responsible for customer commitments and business records.
- As a customer-facing user, I want unclear information marked as uncertain so that I do not mistake an AI guess for a fact.
- As a user, I want clear application-status messages and an audit history so that I know exactly what happened to every approved change.

## V1 requirements

### P0 — required for V1

- Users can paste transcript text or upload a `.txt` file.
- Users can optionally add a meeting title and participant names.
- Users choose a HubSpot-style fixture record, with an optional suggestion that they must confirm or change.
- FollowPilot can read the selected fixture record's current values for the five supported deal fields.
- FollowPilot can propose changes only for the five supported deal fields.
- Every proposed change shows the current value, proposed value, reason, and supporting transcript evidence.
- Users can approve, edit, or reject each proposed change.
- Low-confidence or unclear items are visibly marked and cannot be treated as definite facts.
- Users complete a final confirmation before any approved change is simulated on the fixture record.
- FollowPilot clearly reports whether each approved change was simulated successfully, failed, or was skipped.
- FollowPilot records the required audit history.
- Raw transcript retention follows the 30-day deletion rule.

### P2 — later product direction

- Real HubSpot integration: OAuth, live record reads and writes, and permission handling
- Follow-up email drafts
- Action-item extraction and creation
- On-demand transcript or summary translation
- Approved summaries or action items shared to Slack or similar tools
- More CRM fields, objects, and CRM platforms

## Success metrics and test method

| Measure | V1 target |
| --- | --- |
| AI suggestions approved without editing | 80% or more |
| Active time saved per meeting | 50% or more |
| FollowPilot review and approval time | 7 minutes or less; ideal: 3–5 minutes |
| Typical manual workflow time | 15–25 minutes |
| Critical unsupported CRM changes applied | 0 |
| Return intent | Most testers say they would use FollowPilot again |

Evaluate AI suggestions against a reference answer made by an experienced sales or customer-success user who reviews the same transcript and HubSpot-style fixture record manually. A suggestion succeeds only when it has the correct field, value, meaning, and supporting evidence, and is approved without correction.

For ambiguous cases, use two reviewers or one reviewer with a written field-update rule. Reviewer disagreement means the case is ambiguous; it is not automatically an AI failure.

These are provisional MVP thresholds, not established industry benchmarks. A small test cannot prove the system is safe; one serious unsupported commercial change is a major product problem.

## Trust-breakers to avoid

- Suggestions that are wrong too often
- Confident wording when the transcript is unclear
- Missing, weak, or irrelevant evidence
- Selecting the wrong HubSpot-style fixture record
- Changing or sending anything without approval
- Making users reread the whole transcript
- Creating more review work than the product removes

FollowPilot must be accurate enough to be useful, transparent enough to be trusted, and fast enough to beat the manual workflow.

## Open questions

- How should transcript evidence be stored after the raw transcript is deleted while still meeting the “minimum evidence” rule? **Owner: engineering and legal**
- What realistic fixture records are needed to cover normal, unclear, and conflicting CRM-update cases? **Owner: product and design**
- What exact confidence signals and thresholds should trigger an uncertainty flag? **Owner: product and data**
- What should the final confirmation show when several CRM changes are ready to write? **Owner: product and design**
- What counts as a critical unsupported CRM change in the test plan, beyond the named high-risk fields? **Owner: product and test users**

## Dependencies and phased delivery

V1 depends on realistic HubSpot-style fixture data for the supported deal fields, a safe transcript-processing flow, and a way to record the audit history and retention period. Real HubSpot OAuth, live record reads and writes, and permissions belong to a later integration phase.

No hard delivery date has been set. The first phase is a small 3–5 person test with account executives and customer-success managers who already use HubSpot.
