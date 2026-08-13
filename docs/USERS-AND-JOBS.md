# FollowPilot V1 Users, Jobs, and Needs

## Purpose and evidence status

This document defines the users, jobs, needs, boundaries, and research gaps for FollowPilot V1. It is based on `docs/PROJECT-BRIEF.md`, `docs/PRODUCT.md`, and stakeholder decisions made during the users-jobs-needs interview.

No formal research with the intended V1 users has been completed. The strongest current evidence is the product designer's direct experience with manual post-meeting work and observation of existing meeting-assistant products. Descriptions of account-executive behavior in this document remain assumptions until tested with account executives.

## V1 user scope

### Primary user — Decision

The primary V1 user is an account executive who:

- Works in B2B SaaS or a similar consultative sales environment
- Regularly uses HubSpot, ideally daily or several times per week
- Personally manages and updates active HubSpot opportunities after customer calls
- Conducts at least three customer calls per week
- Has at least six months of CRM and sales-opportunity experience
- Understands deal stage, next step, close date, deal amount, and deal notes
- Is responsible for the accuracy of their own pipeline data

Account executives who rarely update the CRM themselves, or whose opportunity records are maintained primarily by Sales Operations, are outside the first test cohort.

### Secondary future user — Decision

Customer-success managers may be tested in a later transferability round only when they personally manage renewal or expansion opportunities. They are not part of the first V1 test.

### Excluded users — Decision

V1 does not serve:

- Customer-success managers focused mainly on onboarding, support, adoption, or account health
- Internal teams
- Early leads that do not yet have an open HubSpot deal
- People working only with dormant, archived, closed-won, or closed-lost deals
- People whose CRM updates are handled primarily by another role

## Trigger and context of use

### Included calls — Decision

V1 supports any customer call tied to one open HubSpot deal currently being worked. This includes discovery, demo, proposal, negotiation, and closing calls while the opportunity remains open.

Each transcript must relate to one primary opportunity. Calls that cover multiple opportunities are outside V1.

### Primary use moment — Decision

The intended use moment is immediately after each customer call, while the context is still fresh. Using FollowPilot later during CRM cleanup may be possible, but it is not the primary V1 workflow.

### Adoption hypothesis — Assumption

Account executives will choose to review prepared CRM work immediately after calls if the workflow is faster than manual entry and gives them confidence that important information was not missed or misrepresented.

## Core job

When an account executive finishes a customer call tied to one active opportunity, they need to determine what changed, verify the support for each CRM value, resolve uncertainty, and complete the record accurately so they can move to the next task without worrying about missed commitments or corrupted pipeline data.

### Completion conditions — Decision

The post-call CRM job is complete when:

- The correct opportunity has been confirmed
- All five supported fields have been reviewed
- Every proposed change has been approved, edited, or rejected
- Any relevant change missed by FollowPilot has been added manually
- Unresolved items have been addressed or intentionally left unchanged
- The user has completed final confirmation
- The simulated update has no unresolved failures
- The audit history records the result

## Assumed current workflow

The current manual workflow is assumed to be:

1. The customer call ends.
2. The account executive checks memory, personal notes, or the transcript.
3. The account executive opens the relevant HubSpot deal.
4. They review the existing deal values.
5. They decide what changed during the call.
6. They update the relevant fields.
7. They cross-check important details where needed.
8. They save the record.
9. They may return later if something was missed.

This workflow has not been validated with account executives and must not be presented as research evidence.

## Supported decisions and fields

### Field coverage — Decision

The account executive reviews all five supported fields after every call:

- Deal stage
- Next step
- Close date
- Deal amount
- Deal description or notes

FollowPilot must show a review result for every field, including when no change is recommended or the correct value cannot be determined. Showing only fields with proposed changes is insufficient because the user also needs confidence that nothing was overlooked.

### Approval responsibility — Decision and testing simplification

For the fixture-based V1, assume that the account executive is authorized to approve all five supported fields. This is a testing simplification, not a claim about real organizations. A live implementation may require sales-manager or RevOps approval for fields such as stage, amount, or close date.

### Reference rules — Decision

The product team will create one clearly documented fixture rule set modeling a realistic B2B SaaS sales process. At least one experienced sales or RevOps practitioner must review it before testing.

The rule set is a test reference, not a universal CRM policy. Company-specific stages, close-date conventions, and other CRM rules are future configuration.

## Information and evidence needs

### Primary V1 sources — Decision

V1 primarily uses:

- The submitted transcript
- The current HubSpot-style fixture record
- The documented fixture rule set

Account executives may also rely in real work on personal notes, prior-call history, emails, calendar details, proposals, pricing documents, and company-specific CRM rules. V1 does not connect to those sources automatically.

### Optional user context — Decision

The account executive may add a short context note when important information is absent from the primary sources. FollowPilot must identify its provenance and must not present it as transcript evidence or imply that the customer supplied it.

Evidence and context must be visibly separated into:

- Transcript evidence
- User-provided context
- Existing CRM value
- Fixture rule

If required information remains missing, FollowPilot must not guess. It must leave the field unchanged or mark it as unable to determine.

### Attribution — Decision

For transcript evidence, show the exact excerpt and, when available, its speaker and timestamp. When the source lacks attribution, show:

- `Speaker: Unknown`
- `Timestamp: Not provided`

Missing attribution lowers confidence. For high-risk fields, the product must require stronger review and must not imply certainty about who made the statement.

### User-added changes — Decision

If FollowPilot misses a relevant update, the account executive can manually add a change for one of the five supported fields without leaving the review. The audit history must label it:

`Added manually by user`

## Uncertainty, conflict, and high-risk changes

### Conflicting statements — Decision

When transcript statements conflict, FollowPilot must display the conflict and avoid a definite or preselected recommendation. It may identify the latest explicit statement as a possible value, but the account executive must resolve the conflict manually.

Use the status:

`Conflict detected — user decision required`

### Context-only high-risk changes — Decision

A change supported only by user-provided context must be marked as not supported by the transcript. The standard approval action is insufficient when the change affects:

- Deal amount
- Deal stage
- Close date
- A customer or commercial commitment

The product must show an additional warning, such as:

`This change is not supported by the transcript. It is based only on context you provided.`

The account executive must then explicitly confirm:

`Apply using my provided context`

### Critical unsupported CRM change — Decision

A critical unsupported CRM change is any proposed or applied update that could materially affect forecasting, customer commitments, reporting, or opportunity-record integrity without sufficient evidence.

For V1, this includes:

- Changing deal amount without explicit support
- Changing deal stage without meeting the fixture rule
- Assigning a specific close date that was not clearly confirmed
- Turning vague interest into a commitment
- Recording an inferred promise as an agreed fact
- Applying information to the wrong opportunity
- Choosing a value that contradicts the clearest supported statement
- Presenting user-entered context as if it came from the customer

A critical unsupported proposal is a serious test failure even when the user catches it before simulated application.

The most damaging failure is presenting an unsupported commercial change as confidently supported by the transcript. This creates false confidence while risking corruption of the CRM record.

## User needs and trust conditions

The account executive needs to:

- Confirm that the correct opportunity was selected
- See the current and proposed value for every supported field
- See which fields were reviewed but do not need a change
- Understand why each change is proposed
- Distinguish transcript evidence from user context, CRM state, and fixture rules
- Recognize ambiguity, conflicts, missing attribution, and unsupported claims
- Approve, edit, reject, or manually add changes
- Know when stronger confirmation is required
- Avoid rereading large parts of the transcript
- Understand exactly what was simulated, skipped, or failed
- Finish with a reliable audit history and no unresolved application failures

The main desired outcome is confidence in complete and accurate CRM follow-up. Time savings matter, but speed does not compensate for false confidence or unsupported commercial changes.

## V1 research plan

### First-round participants — Decision

Test with three to five account executives who meet the primary-user criteria. Three is the minimum; five is preferred. Do not include CSMs in the first round.

### Test data phases — Decision

Start with synthetic transcripts and fixture records. Controlled cases must cover:

- Clear evidence
- Ambiguous statements
- Conflicting statements
- Missing details
- Unsupported high-risk changes
- No-change cases

Synthetic data reduces privacy, consent, and company-policy risk and makes edge cases reproducible. It can test the interface and review behavior, but it cannot establish performance on messy real conversations.

After the workflow is stable, run a second validation round with sanitized real meeting transcripts paired with fixture records.

### Direct observation — Decision

Observe directly whether testers:

- Confirm the correct opportunity
- Understand current and proposed values
- Find and interpret evidence correctly
- Notice uncertainty and conflicts
- Approve, edit, reject, or manually add changes correctly
- Make any critical approval mistake
- Complete the workflow efficiently
- Reopen or reread substantial transcript sections
- Hesitate, backtrack, or ask for help
- Understand the final simulated result

Self-reported confidence, effort, trust, and willingness to reuse FollowPilot supplement this behavioral evidence; they do not replace it.

## Continuation and redesign thresholds

### Formal speed threshold — Decision

For V1 to pass the speed criterion, every tester must complete the FollowPilot workflow at least **50% faster than their own measured manual baseline**.

- **50% faster or more:** Passes the formal speed criterion.
- **30% to 49% faster:** Does not pass. Redesign the workflow and retest it.
- **Below 30% faster:** Strong evidence that the workflow is not creating enough value; substantially reconsider it.

The ranges above are unambiguous: a result below 50% never passes the formal V1 speed criterion.

### Additional redesign signals — Decision

Substantially redesign or stop the workflow when testing shows any of the following:

- Testers must reread large parts of the transcript to feel safe
- Critical unsupported suggestions appear repeatedly
- The interface causes a tester to approve a dangerous change by making weak evidence look trustworthy
- Important supported changes are frequently missed
- Testers cannot distinguish transcript evidence from user-provided context
- Testers remain unsure whether the simulated update completed successfully
- Most testers prefer updating HubSpot manually
- Reviewing feels like checking all of the AI's work rather than receiving useful preparation

One severe safety or false-confidence failure may justify redesign even when average metrics appear acceptable.

## Evidence, assumptions, and research gaps

### Current evidence

- The product designer has direct experience reviewing meetings and manually completing downstream work.
- Existing meeting assistants have been observed to focus mainly on capture and summarization, leaving downstream review and system updates manual.
- No formal research or usability results from the primary V1 account executives exist yet.

### Weak assumptions to test

- The assumed manual workflow accurately represents account-executive behavior.
- Account executives will use FollowPilot immediately after customer calls.
- Reviewing all five fields after each call adds confidence without excessive burden.
- One B2B SaaS fixture rule set is realistic enough for the first test.
- Results from synthetic cases will transfer to sanitized real conversations.
- Users can safely understand and approve context-only high-risk changes with stronger warnings.
- Reviewing AI-prepared work is meaningfully easier than completing CRM updates manually.

### Open questions

- What exact reference rule determines when each supported field should change?
- Which experienced sales or RevOps practitioner will review the fixture rules?
- What operational standard defines sufficient evidence for each field?
- What confidence rules apply to missing attribution, ambiguity, and other uncertainty?
- How will each tester's manual baseline be measured?
- How will reference answers and reviewer disagreements be adjudicated?
- What observable criteria establish that the workflow is stable enough for sanitized real transcripts?
- How should minimum supporting evidence be retained after raw-transcript deletion?
- What exactly should the final confirmation show?

