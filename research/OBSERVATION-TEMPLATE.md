# Observation template — Pre-architecture internal scenario and workflow-model evaluation

## Study status and evidence boundary

Complete this template once per synthetic case.

- This is **not user research**: no target users are being observed.
- This is **not usability testing**: there is no usable interactive prototype and no participant task.
- This is **not formal validation**: one internal walkthrough cannot validate user behavior or product outcomes.
- The activity uses **synthetic transcripts, HubSpot-style fixture records, and one internal product-team evaluator**.
- Timing is **directional only** and rehearses the future measurement method.
- No conclusions may be made about real account-executive demand, trust, adoption, usability, safety, or representative time savings.

Do not write “user,” “participant,” “finding,” “validated,” “ground truth,” or “usability issue” when describing the evaluator or results. Use **internal evaluator**, **direct model observation**, **product-team reference assumption**, and **model or specification issue** as appropriate.

## Case metadata

- **Case ID:**
- **Case title:**
- **Evaluation date:**
- **Internal evaluator ID:**
- **Evaluation iteration:**
- **Synthetic transcript version:**
- **Fixture-record version:**
- **Reference-rule version:**
- **Observation-template version:**
- **Case-material location:**
- **Sales/RevOps review status:** `Pending` / `Reviewed`
- **Reference-answer label:** `Product-team reference assumptions, pending sales/RevOps review` / `Reviewed reference answer`

### Data check

- [ ] Transcript is entirely synthetic.
- [ ] Names, companies, opportunity details, and commercial terms are fictional.
- [ ] Fixture record contains no real customer or company data.
- [ ] No external participant or real AE is involved.
- [ ] Any reviewer status is recorded accurately; unreviewed expected outcomes are not called ground truth.

## Intended case coverage

### Supported fields

- [ ] Deal stage
- [ ] Next step
- [ ] Close date
- [ ] Deal amount
- [ ] Deal description or notes

### Field outcomes and conflict

- [ ] Proposed change
- [ ] No change recommended
- [ ] Unable to determine
- [ ] `Conflict detected — user decision required`

### Source and provenance conditions

- [ ] Customer-statement evidence from transcript
- [ ] User-provided context
- [ ] Existing CRM value
- [ ] Fixture rule
- [ ] Speaker present
- [ ] Speaker unavailable: `Speaker: Unknown`
- [ ] Timestamp present
- [ ] Timestamp unavailable: `Timestamp: Not provided`

### Decisions, risks, and recovery

- [ ] Correct opportunity confirmed
- [ ] Incorrect opportunity suggestion corrected
- [ ] Approve
- [ ] Edit
- [ ] Reject
- [ ] Manual add
- [ ] Context-only high-risk confirmation
- [ ] Final confirmation
- [ ] Successful simulated result
- [ ] Failed simulated result
- [ ] Skipped simulated result
- [ ] Partial simulated result
- [ ] Unresolved failure
- [ ] Audit history

## Synthetic scenario summary

- **Customer-call type:** discovery / demo / proposal / negotiation / closing
- **Primary open fixture opportunity:**
- **Scenario purpose:**
- **Planned edge conditions:**
- **Short synthetic-call summary:**
- **User-provided context included:** yes / no
- **Missing or conflicting source information designed into the case:**
- **High-risk commercial or commitment condition designed into the case:**

This summary defines a controlled synthetic case. It is not a description of real AE behavior or a research finding.

## Product-team expected CRM result

Until independently reviewed, label this entire section **Product-team reference assumptions, pending sales/RevOps review**.

| Field | Existing fixture value | Expected field outcome | Expected value, if any | Customer-statement evidence | Speaker, if present | Timestamp, if present | User-provided context | Existing CRM context | Fixture rule | Ambiguity or conflict | Reasoning |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Deal stage |  |  |  |  |  |  |  |  |  |  |  |
| Next step |  |  |  |  |  |  |  |  |  |  |  |
| Close date |  |  |  |  |  |  |  |  |  |  |  |
| Deal amount |  |  |  |  |  |  |  |  |  |  |  |
| Deal description or notes |  |  |  |  |  |  |  |  |  |  |  |

### Provenance check

- [ ] Every customer-statement claim has an exact transcript excerpt.
- [ ] Speaker is shown only when present in the synthetic source; otherwise it says `Speaker: Unknown`.
- [ ] Timestamp is shown only when present in the synthetic source; otherwise it says `Timestamp: Not provided`.
- [ ] User-provided context is not described as transcript evidence or a customer statement.
- [ ] Existing CRM values are not described as evidence that a customer made a statement.
- [ ] Fixture rules are not described as evidence that a customer made a statement.
- [ ] Any inference is identified as an interpretation rather than an explicit statement.
- [ ] Conflicting statements remain visible and have no definite or preselected answer.

## Manual task rehearsal

Perform this from the synthetic transcript and fixture record before using the structured planned-workflow layout.

### Manual steps observed

| Step | Direct model observation | Information or artifact used | Decision made | Gap, conflict, or workaround |
| --- | --- | --- | --- | --- |
| Confirm opportunity |  |  |  |  |
| Review current values |  |  |  |  |
| Determine changed fields |  |  |  |  |
| Determine unchanged fields |  |  |  |  |
| Resolve ambiguity or conflict |  |  |  |  |
| Record expected result |  |  |  |  |
| Check completion |  |  |  |  |

### Manual timing rehearsal

> **Internal directional timing from one evaluator; not a formal continuation result.**

- **Active start:**
- **Active end:**
- **Total active time:**
- **Setup or interruptions excluded:**
- **Time reopening evidence:**
- **Time correcting an initial expected value:**
- **Time resolving ambiguity or conflict:**
- **Other timing notes:**

This timing rehearses the future baseline-measurement procedure. It is not a real AE manual baseline and cannot support conclusions about representative time savings or the formal 50% continuation threshold.

## Planned FollowPilot workflow-model walkthrough

This is a structured manual simulation of planned behavior, not use of a product. Do not report it as task completion, usability testing, an AI result, or a performance comparison.

### Opportunity confirmation

- **Suggested fixture opportunity:**
- **Correct primary fixture opportunity:**
- **Information used to match the opportunity:**
- **Can the model represent confirmation or correction clearly?** yes / no / unresolved
- **Wrong-opportunity risk or recovery gap:**

### Five-field review

| Field | Current value visible | Planned output state | Proposed value, if any | Customer-statement evidence shown separately | Decision context shown separately | Uncertainty or conflict visible | Planned evaluator action | Model or rule issue |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Deal stage |  |  |  |  |  |  |  |  |
| Next step |  |  |  |  |  |  |  |  |
| Close date |  |  |  |  |  |  |  |  |
| Deal amount |  |  |  |  |  |  |  |  |
| Deal description or notes |  |  |  |  |  |  |  |  |

### Decision and transition checkpoints

| Checkpoint | Required condition | Planned transition or result | Direct model observation | Undefined or contradictory behavior |
| --- | --- | --- | --- | --- |
| Proposed change | Supported value and provenance are visible | Approve, edit, or reject |  |  |
| No change | Field was reviewed; no supported update | `No change recommended` |  |  |
| Missing or weak information | Definite value is unsupported | `Unable to determine` |  |  |
| Conflict | Sources disagree | `Conflict detected — user decision required`; no preselected answer |  |  |
| Missed update | Relevant supported-field change was omitted | Manual add; audit label `Added manually by user` |  |  |
| Context-only high risk | Amount, stage, close date, or commitment relies only on user context | Warning plus `Apply using my provided context` |  |  |
| Final confirmation | All field decisions and unresolved items are visible | Confirm before simulated application |  |  |
| Simulated result | Each approved item has a result | Successful, failed, skipped, or partial |  |  |
| Failure recovery | Approved item did not apply | Retry, edit, or skip; review not complete while unresolved |  |  |
| Audit history | Provenance, action, field, value, actor, time, and result are preserved | Explain exactly what happened |  |  |

### Critical unsupported proposal check

- **Did the planned output include an unsupported CRM proposal that could materially affect forecasting, commitments, reporting, or record integrity?** yes / no
- **If yes, describe the proposal and unsupported claim:**
- **Did presentation make it appear supported by customer-statement evidence?** yes / no
- **Was it detected before simulated application?** yes / no
- **Required classification:** serious safety failure requiring investigation and likely redesign
- **Containment or model change needed:**

An occurrence is serious even when this internal evaluator detects it. However, zero occurrences in synthetic internal cases cannot establish product safety, and an occurrence cannot measure real-user error rates.

### Planned-workflow timing rehearsal

> **Internal directional timing from one evaluator; not a formal continuation result.**

- **Active start:**
- **Active end:**
- **Total active time:**
- **Processing or waiting time recorded separately:**
- **Time reopening evidence:**
- **Time correcting a planned suggestion:**
- **Time resolving ambiguity or conflict:**
- **Setup or interruptions excluded:**
- **Instrumentation problem or unclear definition:**

Do not calculate a formal speed improvement from this case. There is no usable prototype, the evaluator is not an AE participant, and the planned flow is manually simulated. Timing only rehearses future measurement.

## Simulated result and audit-history check

| Field or event | Approved, edited, rejected, or manually added | Simulated result | Failure or skip reason | Unresolved? | Required audit entry | Provenance preserved? |
| --- | --- | --- | --- | --- | --- | --- |
| Deal stage |  |  |  |  |  |  |
| Next step |  |  |  |  |  |  |
| Close date |  |  |  |  |  |  |
| Deal amount |  |  |  |  |  |  |
| Deal description or notes |  |  |  |  |  |  |
| Final confirmation |  |  |  |  |  |  |

### Completion check

- [ ] Correct fixture opportunity confirmed.
- [ ] All five fields reviewed.
- [ ] Every proposal approved, edited, or rejected.
- [ ] Every missed relevant supported-field update added manually.
- [ ] Conflicts and unable-to-determine items resolved or intentionally left unchanged.
- [ ] Required high-risk confirmations completed.
- [ ] Final confirmation completed.
- [ ] No unresolved simulated application failure remains.
- [ ] Audit history explains every decision and result with correct provenance.

## Issue log

Keep direct observation separate from interpretation and recommendation.

| Issue ID | Direct model observation | Issue category | Severity | Interpretation | Recommendation or decision needed | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  | Blocking / Important / Later validation |  |  |  | Open |

Use these issue categories: information gap; reference-rule gap or contradiction; missing or ambiguous state; missing or invalid transition; evidence or provenance error; safety or false-confidence risk; recovery or completion gap; audit-history gap; measurement-protocol gap; unvalidated user assumption.

Severity meanings:

- **Blocking:** UX architecture cannot safely represent a required decision or outcome without guessing, contradiction, or an undefined transition.
- **Important:** architecture can proceed, but the issue should be resolved before prototype usability testing.
- **Later validation:** evidence from real AEs, a domain reviewer, a usable prototype, or another owner is required.

## Case synthesis

### Model coverage

- **States represented successfully:**
- **States or transitions not representable:**
- **Evidence and decision-context separation gaps:**
- **Rule inconsistencies:**
- **Failure, recovery, or audit gaps:**
- **Timing-method problems:**

### Architecture implications

- **Blocking issues before UX architecture:**
- **Important issues to resolve before prototype testing:**
- **Decisions made from this case:**
- **Open product, policy, engineering, legal, or research questions:**

### Assumptions requiring later evidence

- **Requires real AE workflow evidence:**
- **Requires sales/RevOps review:**
- **Requires a usable prototype:**
- **Requires formal baseline comparison:**

### Contradictions encountered

- **Outdated `docs/PRODUCT.md` “synthetic-data usability test” wording affected this case?** yes / no; notes:
- **Future 3–5 AE first-round wording versus this earlier internal phase affected this case?** yes / no; notes:
- **Reference-rule review requirement versus pending-review assumptions affected this case?** yes / no; notes:
- **Formal 50% threshold versus non-formal internal timing affected this case?** yes / no; notes:

Do not resolve these contradictions by treating the internal evaluator as a participant, the manual layout as a prototype, internal timing as a baseline result, or unreviewed expected outcomes as ground truth.

## Evidence-integrity sign-off

- [ ] I labeled this as an internal formative scenario and workflow-model evaluation.
- [ ] I did not call it user research, usability testing, or formal validation.
- [ ] I stated that synthetic cases and one internal evaluator were used.
- [ ] I kept direct observations separate from interpretations and recommendations.
- [ ] I did not turn stakeholder decisions or assumptions into research findings.
- [ ] I labeled timing as directional rehearsal only.
- [ ] I made no conclusion about real AE demand, trust, adoption, usability, safety, or representative time savings.
- [ ] I preserved relevant contradictions and unresolved assumptions.

### Permitted conclusion

This case may support a statement about whether the **documented product model** represented the synthetic scenario and which model, rule, measurement, or architecture gaps were observed.

### Prohibited conclusions

This case may not be used to claim validated AE demand, trust, adoption, usability, safety, representative time savings, real-workflow accuracy, or CRM-policy correctness. Completion of this template is not evidence that a real account executive can understand, trust, safely use, or benefit from FollowPilot.
