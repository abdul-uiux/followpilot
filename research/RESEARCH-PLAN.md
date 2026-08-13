# Pre-architecture internal scenario and workflow-model evaluation

## Study status and evidence boundary

This is an **internal formative scenario and workflow-model evaluation** conducted before UX architecture or interface design.

- This is **not user research**: no account executives or other target users are participating.
- This is **not usability testing**: no usable interactive prototype exists and no participant will attempt tasks in a product.
- This is **not formal validation**: the method and sample cannot validate user behavior, product performance, or market outcomes.
- The study uses **synthetic transcripts, HubSpot-style fixture records, and one internal product-team evaluator**.
- Timing is **directional only** and rehearses a future measurement method; it is not a FollowPilot performance result or an account-executive baseline.
- No conclusions may be made about real account-executive demand, trust, adoption, usability, safety, or representative time savings.

Stakeholder decisions and product-team expectations are inputs to this evaluation, not research findings. Expected field outcomes remain **product-team reference assumptions, pending sales/RevOps review**.

## Purpose

The study will inform the product structure required before UX architecture by testing whether the planned information, state, decision, failure, and audit models can represent realistic synthetic post-call CRM cases coherently.

The evaluation objective is:

> Inform the information and state model, fixture and reference rules, and future external test protocol by systematically walking one internal evaluator through synthetic post-call CRM scenarios and recording model coverage, gaps, contradictions, and unresolved assumptions.

The evaluation may expose specification gaps and help rehearse a later study. It must not be used to claim that the V1 user, problem, workflow, solution, or success thresholds have been validated.

## Decisions this evaluation should inform

In priority order, the study should inform:

1. **Information and state model:** what field outcomes, provenance types, decisions, conflicts, failures, and audit events UX architecture must represent.
2. **Fixture and reference rules:** where product-team rules are incomplete, contradictory, unsafe, or unable to determine an expected outcome.
3. **Future external test protocol:** what tasks, cases, behavioral observations, instrumentation, and adjudication rules a later study with real account executives will need.
4. **Architecture readiness:** whether any blocking undefined state or transition remains before UX architecture begins.
5. **Research backlog:** which assumptions still require real account executives, a sales/RevOps reviewer, a usable prototype, or another owner.

This study cannot decide whether real account executives have the assumed problem, will adopt FollowPilot, trust its outputs, use the evidence model correctly, or complete the workflow faster.

## Assumptions being examined

These are stakeholder and product-team assumptions, not findings. They are ranked by their potential to invalidate the planned product structure.

| Risk rank | Assumption | What this evaluation can examine | What remains untested |
| --- | --- | --- | --- |
| 1 | The state model can represent the decisions needed for all five supported CRM fields. | Whether synthetic cases expose missing or contradictory states and transitions. | Whether real AEs understand or use the model. |
| 2 | Transcript content, optional user context, existing CRM values, and fixture rules provide enough distinct inputs for a safe decision model. | Whether the model keeps customer-statement evidence separate from decision context and handles missing inputs. | Whether these inputs match real AE evidence needs. |
| 3 | `Proposed change`, `No change recommended`, `Unable to determine`, and the separate conflict state cover the required field outcomes. | Whether each synthetic case can be represented without guessing or hiding uncertainty. | Whether real AEs interpret the states correctly. |
| 4 | Deal stage, next step, close date, deal amount, and deal description or notes form a coherent first workflow. | Whether the reference rules and transitions work across all five fields. | Whether reviewing every field after every call is valuable or burdensome to real AEs. |
| 5 | Approval, edit, reject, manual add, extra high-risk confirmation, failure recovery, and audit behavior can coexist in one complete flow. | Whether the planned transitions and completion rules are internally coherent. | Usability, error rates, trust, and actual completion behavior. |
| 6 | Controlled synthetic cases can expose the main specification gaps before architecture. | Whether the planned case set produces useful model and rule issues. | Transfer to messy real conversations. |
| 7 | The product team's reference rules credibly model a B2B SaaS sales process. | Internal consistency only. | Domain validity until an experienced sales or RevOps practitioner reviews them. |
| 8 | A future manual-baseline comparison can be measured consistently. | Whether the timing categories and recording procedure are workable. | Representative time savings and the formal 50% threshold. |

## Existing evidence and evidence gaps

### Available evidence

- The product designer has direct experience with manual post-meeting follow-up work.
- Existing meeting-assistant products have been observed to focus largely on capture and summarization while leaving downstream work manual.
- `docs/PROJECT-BRIEF.md`, `docs/PRODUCT.md`, and `docs/USERS-AND-JOBS.md` contain approved stakeholder decisions about the intended V1 user, supported fields, evidence boundaries, review states, safety rules, and formal continuation thresholds.

This is limited evidence. The designer's experience is not evidence of account-executive behavior, and approved stakeholder decisions are not research findings.

### Material evidence gaps

- No formal research with the primary V1 account executives has been completed.
- No real AE post-call CRM workflow has been observed.
- No real AE manual baseline has been measured.
- No usable interactive prototype exists.
- No usability, trust, adoption, or workflow-performance evidence exists.
- The synthetic scenarios and reference rules have not yet been independently reviewed by an experienced sales or RevOps practitioner.
- No evidence establishes that synthetic-case results transfer to real transcripts or live CRM policies.

## Research stage and method

### Stage

This is an **internal formative evaluation and research-preparation activity**. It is not one of the user-research or product-validation stages described as exploratory research, concept testing, usability testing, or formal validation because it involves no target participants and no usable prototype.

### Method

Use a structured scenario walkthrough and model-coverage analysis:

1. Build controlled synthetic transcripts and corresponding HubSpot-style fixture records.
2. Determine an expected CRM result manually using documented product-team reference assumptions.
3. Lay out the planned FollowPilot output in a structured review format.
4. Simulate the planned workflow from opportunity confirmation through field review, resolution, final confirmation, simulated application result, and audit history.
5. Record missing information, contradictory rules, undefined states or transitions, hidden uncertainty, unsafe implications, recovery gaps, and measurement problems.
6. Analyze coverage across cases and classify issues by severity and required owner.

The walkthrough does not simulate a user's cognition and must not be described as a usability session or as evidence of product performance.

## Evaluator criteria, exclusions, and recruitment

### Immediate evaluation

- **Evaluator:** one internal product-team evaluator familiar with FollowPilot's approved documents.
- **Materials:** entirely synthetic transcripts and fixture records created for this project.
- **Recruitment:** not applicable; no external participants will be recruited for this evaluation.
- **Exclusions:** account executives, CSMs, customers, and other external participants are not included in this immediate phase.

The evaluator's familiarity creates a substantial interpretation and confirmation-bias risk. Results describe specification and model behavior under one internal walkthrough, not real user behavior.

### Deferred external study

A later study, if access becomes available and a usable prototype exists, should recruit 3–5 account executives who regularly use HubSpot and personally manage active sales opportunities. Detailed recruitment criteria belong in that later study's approved research plan and screener. No participant screener is needed for the present evaluation.

## Synthetic case set

Use at least the following six cases. All names, companies, commercial terms, transcripts, and records must be fictional.

| Case | Primary purpose | Required coverage |
| --- | --- | --- |
| 1. Clear mixed outcomes | Exercise explicit supported updates alongside fields that should remain unchanged. | All five fields; at least one proposed change and one no-change result; clear customer-statement evidence. |
| 2. All no change | Confirm that reviewed fields are visible even when no update is warranted. | All five fields marked `No change recommended`; no hidden skipped field. |
| 3. Ambiguous or missing information | Prevent guessing when a definite value is unsupported. | `Unable to determine`; missing details; explicit uncertainty; optional user context handled separately. |
| 4. Conflict and missing attribution | Exercise contradictory transcript statements and incomplete source metadata. | `Conflict detected — user decision required`; no preselected answer; `Speaker: Unknown` and/or `Timestamp: Not provided`. |
| 5. Unsupported high-risk context | Exercise changes based only on a user's note. | Amount, stage, close date, or commitment; not-supported-by-transcript warning; explicit `Apply using my provided context` confirmation. |
| 6. Recovery and failure | Exercise wrong matching, a missed change, and incomplete simulated application. | Opportunity correction; manual add; edit/reject as relevant; failed, skipped, and partial-success behavior; audit explanation. |

Across the set, exercise every supported field and each required field outcome. Include incorrect-opportunity matching, unsupported high-risk suggestions, missed-update recovery, ambiguity, conflict, missing speaker or timestamp data, and simulation failure. A critical unsupported proposal must be recorded as a serious safety failure even when the evaluator detects it before simulated application; its occurrence is not proof of real-world product safety or unsafety.

## Data-collection procedure

### 1. Preparation

1. Assign a case ID and version to the synthetic transcript, fixture record, and reference-rule set.
2. State which supported fields and edge conditions the case is intended to exercise.
3. Label all expected outcomes as **product-team reference assumptions, pending sales/RevOps review**.
4. Confirm that no real customer, company, participant, or opportunity information is present.

### 2. Manual task rehearsal

1. Review the synthetic transcript and fixture record without using the planned FollowPilot review layout.
2. Record the manually expected result for each of the five fields.
3. Record customer-statement evidence separately from decision context.
4. State the fixture rule and reasoning used, including ambiguity or inability to determine a value.
5. Record directional active time and the defined timing categories.

This step rehearses how a future equivalent manual task might be captured. It is not a measured AE baseline.

### 3. Planned workflow simulation

Using the structured observation template, walk through:

1. Confirming or correcting one primary open fixture opportunity.
2. Reviewing all five supported fields.
3. Separating customer-statement evidence from user-provided context, existing CRM value, and fixture rule.
4. Representing proposed change, no change, unable to determine, and conflict.
5. Resolving uncertainty and conflict without an automatic definite answer.
6. Approving, editing, rejecting, or manually adding supported changes.
7. Applying the extra warning and confirmation to context-only high-risk changes.
8. Completing final confirmation.
9. Representing successful, failed, skipped, and partial simulated outcomes.
10. Recording an audit history that explains provenance, decisions, and results.

At each step, record where the planned workflow is incomplete, contradictory, repetitive, slow, unsafe, or impossible to represent. This is a manual model walkthrough, not a task performed in FollowPilot.

### 4. Cross-case synthesis

Complete the coverage matrix, group issues by type, assign severity, identify an owner, and list assumptions that require later evidence. Do not translate issue counts from six synthetic cases into claims about prevalence among users or real conversations.

## Neutral analytic questions

Use these questions to inspect the model without presuming that FollowPilot is useful or correct:

1. What information is required to decide the outcome for each field?
2. What content is customer-statement evidence, and what content is only decision context?
3. What prevents a definite field outcome in this case?
4. Where do sources or rules conflict, and what decision must remain with a person?
5. Can the state model represent the outcome without guessing, hiding uncertainty, or implying unsupported certainty?
6. How can a missed update be added, or an incorrect proposal be edited or rejected, without leaving an unresolved state?
7. Which changes require a high-risk warning or additional confirmation, and why?
8. Can the simulated result and audit history explain what succeeded, failed, was skipped, or remained unresolved?
9. Which observations concern the product model, and which remain unvalidated assumptions about real account executives?

## Workflow-observation tasks

For each case, the evaluator will:

- Identify and confirm the intended active opportunity.
- Review the current value and expected outcome for all five supported fields.
- Locate the exact transcript support, when any, including speaker and timestamp only when present.
- Identify user-provided context, existing CRM values, and fixture rules as decision context rather than customer-statement evidence.
- Mark ambiguity, missing information, conflicting statements, and missing attribution.
- Exercise the appropriate approve, edit, reject, or manual-add transition.
- Exercise an extra context-only high-risk confirmation where the case requires it.
- Walk through final confirmation, simulated result states, failure recovery, and audit-history output.
- Record every point where the model lacks information, a rule, a state, a transition, provenance, or a clear completion condition.

## Evidence to capture

For every case, capture:

- Case ID, title, versions, target opportunity, and supported fields exercised.
- Current fixture values and the expected result for every supported field.
- Exact customer-statement evidence, including speaker and timestamp only when the synthetic source provides them.
- Decision context separated into user-provided context, existing CRM value, and fixture rule.
- Rule applied, confidence or ambiguity, conflict, and required human decision.
- Planned approve, edit, reject, manual-add, high-risk confirmation, and final-confirmation behavior.
- Successful, failed, skipped, partial, and unresolved simulated outcomes.
- Audit-history requirements and provenance labels.
- Undefined states or transitions, rule inconsistencies, missing information, and false-confidence risks.
- Directional timing categories and instrumentation problems.
- Architecture implication and assumptions requiring later AE or expert evidence.

Keep **direct observation**, **interpretation**, and **recommendation** in separate fields. Since there are no participants, there will be no participant quotes or behavioral findings.

## Directional timing protocol

Every timing entry must carry this exact label:

> **Internal directional timing from one evaluator; not a formal continuation result.**

Record:

- Manual task-rehearsal active time.
- Planned-workflow simulation active time.
- Processing or waiting time separately, if any manual simulation step introduces it.
- Time spent reopening evidence.
- Time spent correcting a planned suggestion.
- Time spent resolving ambiguity or conflict.
- Interruptions or setup time excluded from active time.

Timing only rehearses definitions, instrumentation, and case comparability for a future study. Do not calculate or present these measurements as representative time savings, a product-performance comparison, or evidence against the formal continuation threshold.

The approved formal threshold—each tester at least 50% faster than their own measured manual baseline—remains deferred until a usable prototype exists, the workflow is stable enough to test, and real account executives can complete comparable tasks. Results of 30–49% or below 30% likewise cannot be assigned in this internal evaluation.

## Analysis method

Use a deductive coverage matrix and an issue log.

### Coverage matrix dimensions

- Five supported CRM fields.
- Proposed change, no change recommended, unable to determine, and conflict.
- Customer-statement evidence and each decision-context type.
- Missing speaker, missing timestamp, ambiguity, and conflicting statements.
- Approve, edit, reject, manual add, high-risk confirmation, and final confirmation.
- Success, failure, skip, partial success, unresolved failure, and audit history.

### Issue categories

- Information gap
- Reference-rule gap or contradiction
- Missing or ambiguous state
- Missing or invalid transition
- Evidence or provenance error
- Safety or false-confidence risk
- Recovery or completion gap
- Audit-history gap
- Measurement-protocol gap
- Unvalidated user assumption

### Severity

- **Blocking:** UX architecture cannot safely represent a required decision or outcome without guessing, contradiction, or an undefined transition.
- **Important:** Architecture can proceed, but the issue should be resolved before prototype usability testing.
- **Later validation:** The question requires evidence from real AEs, a domain reviewer, a usable prototype, or another owner and does not block the initial architecture model.

Analyze patterns as coverage and specification issues, not participant frequency. Preserve counterexamples and disagreements between rules rather than collapsing them into consensus.

## Architecture-readiness and stopping criteria

The evaluation is sufficient to move into UX architecture only when it documents:

- A complete list of required field states across all five supported fields.
- A strict distinction between customer-statement evidence and decision context.
- Rules for proposed change, no change recommended, unable to determine, and conflict.
- Identified context-only high-risk confirmation cases.
- Clear approve, edit, reject, and manual-add behavior.
- Defined failure, skipped, partial-success, and unresolved states.
- A draft audit-history model that explains provenance, decisions, and results.
- Synthetic scenarios covering the required normal and edge cases.
- No unresolved **blocking** state or transition needed for the initial architecture.
- A rehearsed timing instrument labeled as directional and non-formal.
- A documented list of assumptions that still require real AEs or sales/RevOps review.

Stop the walkthrough and revise the relevant model or rule when it requires guessing, hides uncertainty, merges customer-statement evidence with decision context, creates an unsupported commercial claim, or cannot explain a failure or completion state. Resume only after the issue is documented and a product decision or explicit open question exists.

Meeting these criteria means only that the product structure is sufficiently specified to design. It does not validate AE demand, trust, adoption, usability, safety, CRM-policy accuracy, or representative time savings.

## Privacy, consent, recording, and data handling

- Use only fictional transcripts, people, companies, opportunity records, and commercial details.
- Do not use real customer, employer, or participant information.
- Participant consent is not applicable because this evaluation includes no participants.
- Do not screen-record or audio-record external people. Internal notes and timing logs are project working materials, not participant data.
- Store case materials within the project according to normal project access controls.
- Inspect every scenario before use to confirm that no real identifying or confidential information has been copied into it.
- A later external study requires its own consent, recording permission, privacy review, retention plan, and company-policy handling before recruitment or data collection.

The lack of real data reduces immediate privacy risk but also prevents conclusions about real transcript handling, company policy, consent behavior, or production retention needs.

## Limitations and prohibited conclusions

- One internal evaluator is not representative of account executives.
- The evaluator's product knowledge can mask comprehension, discoverability, and workflow problems.
- Synthetic conversations cannot reproduce the full ambiguity, language, interruptions, context, or policy variation of real sales calls.
- Manual simulation cannot measure product usability, interaction cost, AI performance, or system latency.
- Internal timing is not a real AE baseline and does not test the formal 50% continuation threshold.
- Product-team expected outcomes are not ground truth until reviewed by an experienced sales or RevOps practitioner.
- Scenario coverage does not establish prevalence or real-world safety.

No conclusion from this study may claim validated real AE demand, trust, adoption, usability, safety, representative time savings, or CRM-policy accuracy. Any later document or presentation using these results must repeat the study classification, sample, synthetic-data boundary, and prohibited conclusions.

## Documented contradictions to preserve

These contradictions are intentionally visible and are not resolved by this plan:

1. **Outdated phase label in `docs/PRODUCT.md`:** its Dependencies and phased delivery section calls the first phase a “synthetic-data usability test with 3–5 account executives.” No usable prototype exists, and the approved immediate phase uses synthetic cases and one internal evaluator. The immediate activity therefore cannot be called usability testing or the first external AE test.
2. **Sequence in `docs/USERS-AND-JOBS.md`:** its V1 research-plan section describes a first round with 3–5 AEs using synthetic data. The approved internal evaluation is an earlier preparatory phase; it does not replace that future round or supply its evidence.
3. **Sales/RevOps review timing:** current documents require an experienced sales or RevOps practitioner to review the reference rule set before testing. The internal model evaluation may begin with product-team assumptions pending review, but those expected outcomes cannot be called ground truth or used for formal testing until the review occurs.
4. **Formal speed threshold versus present method:** the approved 50% threshold applies to each real tester against that tester's measured manual baseline. One internal evaluator, manual simulation, and no prototype cannot evaluate it.

No project document will be edited as part of this study-plan task.

## Open questions and owners

| Open question | Owner | When needed |
| --- | --- | --- |
| What exact reference rule determines when each supported field should change? | Product and sales/RevOps reviewer | Before rules are treated as reviewed reference answers. |
| Which experienced sales or RevOps practitioner will review the cases, rules, expected outcomes, high-risk cases, and ambiguity handling? | Product | Helpful but not required before initial UX architecture; required before formal testing claims. |
| What operational standard defines sufficient customer-statement evidence and decision context for each field? | Product, sales/RevOps, and future test | Before prototype testing. |
| What confidence rules apply to missing attribution, ambiguity, and other uncertainty? | Product and data | During architecture and before prototype behavior is finalized. |
| What exactly should final confirmation show? | Product and design | During UX architecture. |
| How should simulated partial success and retries affect completion and audit history? | Product and engineering | During architecture and implementation planning. |
| How will equivalent manual-baseline cases and active-time definitions be controlled for each real tester? | Product and research | Before formal threshold testing. |
| How will reference-answer disagreements be adjudicated? | Product, sales/RevOps, and research | Before formal prototype testing. |
| When and how can 3–5 qualifying AEs be recruited? | Product and research | Before external user research or validation. |
| What observable criteria establish that the workflow is stable enough for sanitized real transcripts? | Product and research | Before any later real-transcript round. |

