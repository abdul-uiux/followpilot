"use client";

import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, getAdditionalUserInfo, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from "firebase/auth";
import { AppSidebar } from "./components/app-sidebar";
import { AppHeader } from "./components/app-header";
import { useToast } from "./components/toast-provider";
import { firebaseAuth, firebaseIsConfigured } from "./lib/firebase";
import { readHubSpotStatus, saveHubSpotStatus } from "./lib/hubspot-status-cache";
import { readMeetingArchive, saveArchivedMeeting, type ArchivedMeeting } from "./lib/meeting-archive";
import { useAuth } from "./components/auth-provider";
import {
  fieldKeys,
  type AuditEntry,
  type CrmValue,
  type ExpectedResult,
  type FieldKey,
  type FieldResult,
  type FixtureRecord,
  type ReviewDecision,
  type RiskLevel,
} from "./followpilot-types";

type FlowStep = "dashboard" | "intake" | "review" | "summary" | "complete";
type ManualChange = { id: number; field: FieldKey; value: string; reason: string };
type ApprovedChange = {
  id: string;
  field: FieldKey;
  label: string;
  before: CrmValue;
  after: string;
  source: "FollowPilot suggestion" | "Added manually by user";
  action: "approved" | "edited" | "manual";
  risk: RiskLevel;
};
type MatchedContact = {
  id: string;
  email: string;
  name: string;
  deals: Array<{ id: string; name: string; stage: string; amount: string; closeDate: string; updatedAt: string }>;
};

const fieldLabels: Record<FieldKey, string> = {
  deal_stage: "Deal stage",
  next_step: "Next step",
  close_date: "Close date",
  amount: "Deal amount",
  notes: "Deal notes",
};

const outcomeLabels: Record<FieldResult["outcome_state"], string> = {
  proposed_change: "Proposed change",
  no_change: "No change recommended",
  unable_to_determine: "Unable to determine",
  conflict: "Conflict detected",
};

const steps: Array<{ key: FlowStep; label: string }> = [
  { key: "intake", label: "Confirm record" },
  { key: "review", label: "Review fields" },
  { key: "summary", label: "Final check" },
  { key: "complete", label: "Completed" },
];

const stepOrder: Record<FlowStep, number> = {
  dashboard: -1,
  intake: 0,
  review: 1,
  summary: 2,
  complete: 3,
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatValue(value: CrmValue) {
  if (value === null || value === "") return "Not set";
  if (typeof value === "string") return value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: value.currency,
    maximumFractionDigits: 0,
  }).format(value.value);
}

function editableValue(value: CrmValue) {
  if (value === null) return "";
  return typeof value === "string" ? value : String(value.value);
}

function appendNotes(current: CrmValue, addition: string) {
  const existing = typeof current === "string" ? current.trim() : "";
  return existing ? `${existing}\n\n${addition.trim()}` : addition.trim();
}

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="m4 10 3.4 3.4L16 5.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowUpIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 15.5V4.5m0 0L6 8.5m4-4 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 15.5h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function SparkIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2.5 11.6 8.4 17.5 10l-5.9 1.6L10 17.5l-1.6-5.9L2.5 10l5.9-1.6L10 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M21.8 12.23c0-.71-.06-1.39-.19-2.03H12v3.84h5.49a4.7 4.7 0 0 1-2.03 3.08v2.49h3.29c1.93-1.78 3.05-4.4 3.05-7.38Z" />
      <path fill="#34A853" d="M12 22c2.75 0 5.06-.91 6.75-2.39l-3.29-2.49c-.91.61-2.08.97-3.46.97-2.65 0-4.89-1.79-5.69-4.2H2.91v2.57A10.2 10.2 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.31 13.89A6.13 6.13 0 0 1 6 12c0-.66.11-1.3.31-1.89V7.54H2.91A10.2 10.2 0 0 0 1.8 12c0 1.64.39 3.2 1.11 4.46l3.4-2.57Z" />
      <path fill="#EA4335" d="M12 5.91c1.5 0 2.84.52 3.9 1.54l2.93-2.93C17.06 2.88 14.75 2 12 2a10.2 10.2 0 0 0-9.09 5.54l3.4 2.57c.8-2.41 3.04-4.2 5.69-4.2Z" />
    </svg>
  );
}

function AuthScreen({
  mode,
  onModeChange,
  onAuthenticated,
}: {
  mode: "sign-in" | "sign-up";
  onModeChange: (mode: "sign-in" | "sign-up") => void;
  onAuthenticated: (signedUp: boolean) => void;
}) {
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const signingUp = mode === "sign-up";

  const authenticationMessage = (error: unknown, provider: "email" | "google") => {
    const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
    if (provider === "google" && code === "auth/account-exists-with-different-credential") {
      return signingUp
        ? "An account already exists for this email. Sign in with your email and password instead."
        : "This email is connected with email and password. Sign in with your email and password instead of Google.";
    }
    if (provider === "email" && code === "auth/email-already-in-use") {
      return "An account already exists for this email. Continue with Google if that is how you created it, or sign in with your password.";
    }
    return error instanceof Error ? error.message.replace("Firebase: ", "") : "Authentication could not be completed.";
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firebaseAuth) {
      setAuthError("Firebase Authentication is not configured yet.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();
    setAuthError(null);
    setIsSubmitting(true);
    void (async () => {
      try {
        if (signingUp) {
          const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
          if (name) await updateProfile(credential.user, { displayName: name });
        } else {
          await signInWithEmailAndPassword(firebaseAuth, email, password);
        }
        onAuthenticated(signingUp);
      } catch (error) {
        setAuthError(authenticationMessage(error, "email"));
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  const continueWithGoogle = async () => {
    if (!firebaseAuth) {
      setAuthError("Firebase Authentication is not configured yet.");
      return;
    }
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const credential = await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
      if (signingUp && !getAdditionalUserInfo(credential)?.isNewUser) {
        await signOut(firebaseAuth);
        setAuthError("An account already exists for this email. Sign in with Google instead.");
        return;
      }
      onAuthenticated(signingUp);
    } catch (error) {
      setAuthError(authenticationMessage(error, "google"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fbfbfa] text-[#191919]">
      <header className="flex h-16 items-center justify-between border-b border-[#ececea] px-5 sm:px-8">
        <div className="flex items-center gap-2.5"><div className="grid h-7 w-7 place-items-center rounded-md bg-[#191919] text-xs font-bold text-white">F</div><span className="text-sm font-semibold tracking-[-0.02em]">FollowPilot</span></div>
        <p className="hidden text-xs text-[#787774] sm:block">Post-call CRM review, with you in control.</p>
      </header>
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-5 py-12">
        <div className="w-full">
          <p className="text-sm font-medium text-[#787774]">{signingUp ? "Create a workspace" : "Welcome back"}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em]">{signingUp ? "Start reviewing with confidence." : "Sign in to FollowPilot."}</h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-[#625f5c]">{signingUp ? "Create your personal workspace in a few seconds. No CRM connection is required for this fixture demo." : "Pick up your meeting reviews, then decide exactly what should change in your CRM."}</p>
          <form key={mode} onSubmit={submit} className="mt-8 space-y-4">
            {signingUp && <label className="block text-sm font-medium">Your name<input name="name" required placeholder="Your name" className="mt-2 w-full rounded-lg border border-[#deddda] bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-[#9b9995] focus:border-[#191919] focus:ring-4 focus:ring-[#e9e9e7]" /></label>}
            <label className="block text-sm font-medium">Work email<input name="email" required type="email" placeholder="you@company.com" className="mt-2 w-full rounded-lg border border-[#deddda] bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-[#9b9995] focus:border-[#191919] focus:ring-4 focus:ring-[#e9e9e7]" /></label>
            {signingUp && <label className="block text-sm font-medium">Workspace name<input required placeholder="Acme sales" className="mt-2 w-full rounded-lg border border-[#deddda] bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-[#9b9995] focus:border-[#191919] focus:ring-4 focus:ring-[#e9e9e7]" /></label>}
            <label className="block text-sm font-medium">Password<input name="password" required minLength={6} type="password" placeholder="At least 6 characters" className="mt-2 w-full rounded-lg border border-[#deddda] bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-[#9b9995] focus:border-[#191919] focus:ring-4 focus:ring-[#e9e9e7]" /></label>
            {authError && <p role="alert" className="text-xs leading-5 text-[#a8342a]">{authError}</p>}
            <button type="submit" disabled={isSubmitting || !firebaseIsConfigured()} className="mt-2 flex w-full items-center justify-center rounded-lg bg-[#191919] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#353535] focus:outline-none focus:ring-4 focus:ring-[#d9d9d7] disabled:opacity-45">{isSubmitting ? "Please wait…" : signingUp ? "Create workspace" : "Sign in"}</button>
          </form>
          <div className="my-6 flex items-center gap-3 text-xs text-[#9b9995]"><span className="h-px flex-1 bg-[#e8e7e4]" />or<span className="h-px flex-1 bg-[#e8e7e4]" /></div>
          <button type="button" onClick={() => void continueWithGoogle()} disabled={isSubmitting || !firebaseIsConfigured()} className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#deddda] bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-[#f7f7f5] focus:outline-none focus:ring-4 focus:ring-[#e9e9e7] disabled:opacity-45"><GoogleIcon /> Continue with Google</button>
          <p className="mt-7 text-center text-sm text-[#625f5c]">{signingUp ? "Already have a workspace?" : "New to FollowPilot?"} <button type="button" onClick={() => { setAuthError(null); onModeChange(signingUp ? "sign-in" : "sign-up"); }} className="font-medium text-[#191919] underline underline-offset-4">{signingUp ? "Sign in" : "Create one"}</button></p>
          {!firebaseIsConfigured() && <p className="mt-8 text-center text-xs leading-5 text-[#a8342a]">Add your Firebase web-app settings to <code>.env.local</code> to enable sign-in.</p>}
        </div>
      </section>
    </main>
  );
}

function AppShell({ children, onNewMeeting }: { children: React.ReactNode; onNewMeeting: () => void }) {
  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#191919]">
      <AppSidebar activePage="home" onNewMeeting={onNewMeeting} />
      <div className="lg:pl-60">{children}</div>
    </div>
  );
}

function UploadModal({
  open,
  onClose,
  onAnalyze,
  transcript,
  setTranscript,
  meetingTitle,
  setMeetingTitle,
  attendees,
  setAttendees,
  about,
  setAbout,
  fileName,
  onFile,
  authorized,
  setAuthorized,
  isAnalyzing,
  contactEmail,
  setContactEmail,
  matchedContact,
  selectedDealId,
  setSelectedDealId,
  onFindContact,
  isMatchingContact,
}: {
  open: boolean;
  onClose: () => void;
  onAnalyze: () => void;
  transcript: string;
  setTranscript: (value: string) => void;
  meetingTitle: string;
  setMeetingTitle: (value: string) => void;
  attendees: string;
  setAttendees: (value: string) => void;
  about: string;
  setAbout: (value: string) => void;
  fileName: string | null;
  onFile: (event: ChangeEvent<HTMLInputElement>) => void;
  authorized: boolean;
  setAuthorized: (value: boolean) => void;
  isAnalyzing: boolean;
  contactEmail: string;
  setContactEmail: (value: string) => void;
  matchedContact: MatchedContact | null;
  selectedDealId: string;
  setSelectedDealId: (value: string) => void;
  onFindContact: () => void;
  isMatchingContact: boolean;
}) {
  const [attendeeInput, setAttendeeInput] = useState("");
  const [dealMenuOpen, setDealMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const requestClose = () => {
    if (isAnalyzing || isClosing) return;
    setIsClosing(true);
    window.setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 180);
  };
  if (!open) return null;
  const attendeeNames = attendees.split(",").map((name) => name.trim()).filter(Boolean);
  const addAttendees = (value: string) => {
    const additions = value.split(",").map((name) => name.trim()).filter(Boolean);
    if (additions.length) setAttendees([...attendeeNames, ...additions].join(", "));
    setAttendeeInput("");
  };
  return (
    <div className={`fixed inset-0 z-50 flex items-end bg-black/20 p-0 sm:items-center sm:justify-center sm:p-6 ${isClosing ? "modal-backdrop-exit pointer-events-none" : "modal-backdrop-enter"}`} role="presentation" onMouseDown={requestClose}>
      <section role="dialog" aria-modal="true" aria-labelledby="upload-title" className={`max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-xl bg-white shadow-2xl sm:rounded-xl ${isClosing ? "modal-panel-exit" : "modal-panel-enter"}`} onMouseDown={(event) => event.stopPropagation()}>
        <header className="flex items-start justify-between border-b border-[#ececea] px-6 py-5 sm:px-8">
          <div><p className="text-sm font-medium text-[#787774]">New meeting</p><h2 id="upload-title" className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#191919]">Review a transcript</h2><p className="mt-2 text-sm leading-6 text-[#625f5c]">Add the meeting context, then review every CRM update before anything is included.</p></div>
          <button type="button" onClick={requestClose} disabled={isAnalyzing} aria-label="Close upload dialog" className="ml-4 grid h-8 w-8 shrink-0 place-items-center rounded-md text-xl text-[#787774] transition hover:bg-[#f2f2f0] hover:text-[#191919] disabled:opacity-45">×</button>
        </header>
        <div className="space-y-5 px-6 py-6 sm:px-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-medium">Meeting name<input value={meetingTitle} onChange={(event) => setMeetingTitle(event.target.value)} placeholder="e.g. BluePeak strategy review" className="mt-2 w-full rounded-lg border border-[#deddda] bg-white px-3 py-2.5 text-sm font-normal outline-none transition placeholder:text-[#9b9995] focus:border-[#191919] focus:ring-4 focus:ring-[#e9e9e7]" /></label>
            <div className="text-sm font-medium"><p>Attendees</p><div className="mt-2 overflow-x-auto rounded-lg border border-[#deddda] bg-white px-2.5 py-2 text-sm font-normal outline-none transition focus-within:border-[#191919] focus-within:ring-4 focus-within:ring-[#e9e9e7]"><div className="flex h-6 min-w-max flex-nowrap items-center gap-1.5">{attendeeNames.map((attendee, index) => <span key={`${attendee}-${index}`} className="inline-flex h-6 shrink-0 items-center gap-1 rounded-md bg-[#efefed] py-0 pl-2 pr-1 text-[11px] font-medium leading-none text-[#4f4d4a]">{attendee}<button type="button" onClick={() => setAttendees(attendeeNames.filter((_, currentIndex) => currentIndex !== index).join(", "))} aria-label={`Remove ${attendee}`} className="grid h-4 w-4 shrink-0 place-items-center rounded leading-none text-[#787774] transition hover:bg-[#fdeceb] hover:text-[#b42318] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b42318]"><span className="relative -top-px">×</span></button></span>)}<input value={attendeeInput} onChange={(event) => { const value = event.target.value; if (value.includes(",")) addAttendees(value); else setAttendeeInput(value); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addAttendees(attendeeInput); } }} onBlur={() => addAttendees(attendeeInput)} placeholder={attendeeNames.length ? "Add another" : "Names, separated by commas"} className="w-36 shrink-0 bg-transparent px-1 py-1 text-[13px] outline-none placeholder:text-[#9b9995]" /></div></div></div>
          </div>
          <div className="rounded-lg border border-[#ececea] bg-[#fafaf9] p-4"><label className="block text-sm font-medium">HubSpot contact email<div className="mt-2 flex gap-2"><input value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} type="email" placeholder="customer@company.com" className="min-w-0 flex-1 rounded-lg border border-[#deddda] bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-[#191919] focus:ring-4 focus:ring-[#e9e9e7]" /><button type="button" onClick={onFindContact} disabled={!contactEmail.trim() || isMatchingContact} className="rounded-md border border-[#deddda] bg-white px-3 text-[13px] font-medium text-[#52504d] disabled:opacity-45">{isMatchingContact ? "Finding…" : "Find contact"}</button></div></label>{matchedContact && <div className="mt-3"><p className="text-xs text-[#625f5c]">Matched <span className="font-medium text-[#191919]">{matchedContact.name}</span> · {matchedContact.email}</p>{matchedContact.deals.length ? <div className="relative mt-3"><p className="text-xs font-medium text-[#52504d]">Choose associated deal</p><button type="button" aria-haspopup="listbox" aria-expanded={dealMenuOpen} onClick={() => setDealMenuOpen((open) => !open)} className="mt-1.5 flex w-full items-center justify-between rounded-lg border border-[#deddda] bg-white py-2.5 pl-3 pr-3.5 text-left text-[13px] font-normal text-[#191919] outline-none transition hover:border-[#9b9995] focus:border-[#191919] focus:ring-4 focus:ring-[#e9e9e7]"><span className="truncate">{matchedContact.deals.find((deal) => deal.id === selectedDealId)?.name ?? "Select a deal"}<span className="text-[#787774]"> · {matchedContact.deals.find((deal) => deal.id === selectedDealId)?.stage || "No stage"}</span></span><svg className={`ml-3 h-4 w-4 shrink-0 text-[#625f5c] transition-transform ${dealMenuOpen ? "rotate-180" : ""}`} viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></button>{dealMenuOpen && <div role="listbox" className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-lg border border-[#deddda] bg-white p-1 shadow-[0_10px_24px_rgba(25,25,25,0.12)]">{matchedContact.deals.map((deal) => <button key={deal.id} type="button" role="option" aria-selected={deal.id === selectedDealId} onClick={() => { setSelectedDealId(deal.id); setDealMenuOpen(false); }} className={deal.id === selectedDealId ? "flex w-full flex-col rounded-md bg-[#efefed] px-3 py-2 text-left" : "flex w-full flex-col rounded-md px-3 py-2 text-left transition hover:bg-[#f5f5f3]"}><span className="text-[13px] font-medium text-[#191919]">{deal.name}</span><span className="mt-0.5 text-[11px] text-[#787774]">{deal.stage || "No stage"}</span></button>)}</div>}</div> : <p className="mt-2 text-xs text-[#a8342a]">This contact has no associated deals. Add or associate a deal in HubSpot first.</p>}</div>}</div>
          <label className="block text-sm font-medium">What was this meeting about?<textarea value={about} onChange={(event) => setAbout(event.target.value)} placeholder="Optional context to help focus the analysis" className="mt-2 min-h-20 w-full resize-y rounded-lg border border-[#deddda] bg-white px-3 py-2.5 text-sm font-normal leading-6 outline-none transition placeholder:text-[#9b9995] focus:border-[#191919] focus:ring-4 focus:ring-[#e9e9e7]" /></label>
          <div>
            <div className="flex items-center justify-between gap-3"><label className="text-sm font-medium">Meeting transcript</label><span className="text-xs text-[#787774]">.txt files supported</span></div>
            <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#c9c8c5] bg-[#fafaf9] px-4 py-4 text-sm font-medium transition hover:border-[#787774] hover:bg-[#f5f5f3]">
              <ArrowUpIcon /> {fileName ? `Attached: ${fileName}` : "Upload a transcript file"}<input type="file" accept="text/plain,.txt" className="sr-only" onChange={onFile} />
            </label>
            <div className="my-3 flex items-center gap-3 text-xs text-[#9b9995]"><span className="h-px flex-1 bg-[#ececea]" />or paste it below<span className="h-px flex-1 bg-[#ececea]" /></div>
            <textarea value={transcript} onChange={(event) => setTranscript(event.target.value)} placeholder="Paste the transcript here…" className="min-h-40 w-full resize-y rounded-lg border border-[#deddda] bg-white px-3 py-2.5 font-mono text-[13px] leading-6 outline-none transition placeholder:font-sans placeholder:text-sm placeholder:text-[#9b9995] focus:border-[#191919] focus:ring-4 focus:ring-[#e9e9e7]" />
          </div>
          <label className="flex items-start gap-3 rounded-lg bg-[#f5f5f3] p-3.5 text-xs leading-5 text-[#625f5c]"><input type="checkbox" checked={authorized} onChange={(event) => setAuthorized(event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-[#c9c8c5] accent-[#191919]" />I’m authorized to share this transcript.</label>
        </div>
        <footer className="flex flex-col-reverse gap-3 border-t border-[#ececea] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8"><p className="text-xs text-[#787774]">Approved updates go to this HubSpot deal.</p><div className="flex gap-2"><button type="button" onClick={requestClose} disabled={isAnalyzing} className="rounded-md px-4 py-2.5 text-sm font-medium text-[#625f5c] transition hover:bg-[#f2f2f0] disabled:opacity-45">Cancel</button><button type="button" onClick={onAnalyze} disabled={!transcript.trim() || !authorized || !matchedContact || !selectedDealId || isAnalyzing} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#191919] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#353535] focus:outline-none focus:ring-4 focus:ring-[#d9d9d7] disabled:cursor-not-allowed disabled:opacity-45"><SparkIcon /> {isAnalyzing ? "Analyzing…" : "Analyze now"}</button></div></footer>
      </section>
    </div>
  );
}

function OutcomePill({ outcome }: { outcome: FieldResult["outcome_state"] }) {
  const style = {
    proposed_change: "border-stone-300 bg-stone-100 text-stone-800",
    no_change: "border-slate-200 bg-slate-100 text-slate-600",
    unable_to_determine: "border-amber-200 bg-amber-50 text-amber-800",
    conflict: "border-rose-200 bg-rose-50 text-rose-800",
  }[outcome];

  return (
    <span className={cx("rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase", style)}>
      {outcomeLabels[outcome]}
    </span>
  );
}

function RiskPill({ risk }: { risk: RiskLevel }) {
  const style = {
    low: "border-emerald-200 bg-emerald-50 text-emerald-700",
    medium: "border-amber-200 bg-amber-50 text-amber-700",
    high: "border-rose-200 bg-rose-50 text-rose-700",
  }[risk];

  return <span className={cx("rounded-full border px-2 py-1 text-xs font-medium", style)}>{risk} risk</span>;
}

function Progress({ step, onStepChange }: { step: FlowStep; onStepChange: (step: FlowStep) => void }) {
  const activeIndex = stepOrder[step];
  const currentStep = steps[activeIndex];
  const reviewLocked = step === "complete";

  return (
    <nav aria-label="Review progress" className="w-full border-b border-[#e8e7e4]">
      <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
        <div className="mb-3 text-xs">
          <span className="font-medium text-[#191919]">{currentStep.label}</span>
        </div>
      <ol className="flex w-full">
        {steps.map((item, index) => {
          const current = item.key === step;
          const complete = index < activeIndex;
          const available = !reviewLocked && index <= activeIndex;
          return (
            <li
              key={item.key}
              className="min-w-0 flex-1"
            >
              <button
                type="button"
                disabled={!available}
                onClick={() => available && onStepChange(item.key)}
                aria-current={current ? "step" : undefined}
                className={cx(
                  "group w-full text-left outline-none focus-visible:ring-4 focus-visible:ring-[#e9e9e7] disabled:cursor-not-allowed",
                  !available && "cursor-default",
                )}
              >
                <span className="flex items-center">
                  <span
                    className={cx(
                      "grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[11px] font-semibold transition",
                      current && "border-[#191919] bg-[#191919] text-white",
                      complete && "border-[#191919] bg-white text-[#191919]",
                      !current && !complete && "border-[#deddda] bg-white text-[#9b9995]",
                    )}
                  >
                    {complete ? <CheckIcon className="h-3.5 w-3.5" /> : index + 1}
                  </span>
                  {index < steps.length - 1 && (
                    <span className={cx("h-px flex-1 bg-[#deddda]", complete && "bg-[#191919]")} />
                  )}
                </span>
                <span className={cx("mt-2 hidden pr-2 text-[11px] font-medium leading-4 sm:block", current || complete ? "text-[#191919]" : "text-[#9b9995]")}>
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      </div>
    </nav>
  );
}

function AnalysisOverlay() {
  const messages = [
    "FollowPilot is matching the connected HubSpot record",
    "Preparing evidence-backed suggestions",
    "Nothing will be changed automatically",
  ];
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => setMessageIndex((current) => (current + 1) % messages.length), 1800);
    return () => window.clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#f7f7f5]/65 px-5 py-8 backdrop-blur-md" role="status" aria-live="polite" aria-label="Preparing your review">
      <section className="w-full max-w-md text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[#deddda] bg-white/90 shadow-[0_10px_28px_rgba(25,25,25,0.09)]">
          <span className="h-7 w-7 rounded-full border-2 border-[#deddda] border-t-[#191919] animate-spin" aria-hidden="true" />
        </div>
        <p className="mt-7 text-xs font-semibold tracking-[0.14em] text-[#52504d] uppercase">Preparing your review</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-[#191919]">Analyzing the meeting details.</h1>
        <p key={messageIndex} className="analysis-status-copy mx-auto mt-3 max-w-sm text-sm leading-6 text-[#625f5c]">{messages[messageIndex]}<span className="analysis-loading-dots" aria-hidden="true"><span>.</span><span>.</span><span>.</span></span></p>
      </section>
    </div>
  );
}

function EvidenceAndContext({ result }: { result: FieldResult }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="rounded-xl border border-sky-200 bg-sky-50/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-sky-950">Transcript evidence</h3>
          <span className="shrink-0 whitespace-nowrap rounded-full bg-sky-100 px-2 py-1 text-[10px] font-bold text-sky-700 uppercase">
            Customer quote
          </span>
        </div>
        {result.customer_statement_evidence.length ? (
          <div className="mt-3 space-y-4">
            {result.customer_statement_evidence.map((evidence, index) => (
              <figure key={`${evidence.timestamp}-${index}`}>
                <blockquote className="text-sm leading-6 text-sky-950">“{evidence.excerpt}”</blockquote>
                <figcaption className="mt-2 flex flex-wrap gap-x-3 text-xs text-sky-700">
                  <span>{evidence.speaker}</span>
                  <span>{evidence.timestamp}</span>
                  <span className="font-semibold capitalize">{evidence.interpretation}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-sky-800">No transcript evidence supports this result.</p>
        )}
      </section>

      <section className="rounded-xl border border-stone-200 bg-stone-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-stone-900">Decision context</h3>
          <span className="shrink-0 whitespace-nowrap rounded-full bg-stone-200 px-2 py-1 text-[10px] font-bold text-stone-700 uppercase">
            Internal context
          </span>
        </div>
        <dl className="mt-3 space-y-3 text-sm leading-5">
          <div>
            <dt className="text-xs font-semibold text-stone-600">Existing CRM value</dt>
            <dd className="mt-0.5 text-stone-900">{formatValue(result.decision_context.existing_crm_value)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-stone-600">Fixture rule</dt>
            <dd className="mt-0.5 text-stone-900">{result.decision_context.fixture_rule}</dd>
          </div>
          {result.decision_context.user_provided_context && (
            <div>
              <dt className="text-xs font-semibold text-stone-600">User-provided context</dt>
              <dd className="mt-0.5 text-stone-900">{result.decision_context.user_provided_context}</dd>
            </div>
          )}
        </dl>
      </section>
    </div>
  );
}

function FieldCard({
  field,
  result,
  decision,
  editValue,
  editing,
  onApprove,
  onReject,
  onEdit,
  onEditValue,
  onSaveEdit,
  onCancelEdit,
}: {
  field: FieldKey;
  result: FieldResult;
  decision: ReviewDecision;
  editValue: string;
  editing: boolean;
  onApprove: () => void;
  onReject: () => void;
  onEdit: () => void;
  onEditValue: (value: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}) {
  const canApply = result.outcome_state === "proposed_change";
  const decisionLabel = {
    pending: "Decision required",
    approved: "Approved",
    edited: "Edited & approved",
    rejected: "Rejected",
    not_applicable: "Reviewed",
  }[decision];

  return (
    <article id={`field-${field}`} className="overflow-hidden rounded-xl border border-[#deddda] bg-white">
      <header className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:justify-between lg:px-6">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <OutcomePill outcome={result.outcome_state} />
            <RiskPill risk={result.risk_level} />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">{fieldLabels[field]}</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{result.reason}</p>
        </div>
        <span
          className={cx(
            "inline-flex h-fit shrink-0 items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-xs font-semibold",
            decision === "pending" && "bg-amber-100 text-amber-900",
            (decision === "approved" || decision === "edited") && "bg-emerald-100 text-emerald-800",
            decision === "rejected" && "bg-rose-100 text-rose-800",
            decision === "not_applicable" && "bg-slate-100 text-slate-600",
          )}
        >
          {(decision === "approved" || decision === "edited") && <CheckIcon />}
          {decisionLabel}
        </span>
      </header>

      <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
        <section className="border-b border-slate-100 p-5 lg:border-r lg:border-b-0 lg:p-6">
          <p className="text-[11px] font-bold tracking-[0.14em] text-slate-400 uppercase">CRM value</p>
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-500">Current</p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 font-medium text-slate-800">
              {formatValue(result.current_value)}
            </p>
          </div>

          {canApply ? (
            <div className="mt-4 rounded-lg border border-[#deddda] bg-[#fafaf9] p-4">
              <p className="text-xs font-semibold text-[#625f5c]">
                {field === "notes" ? "Append this note" : "Proposed"}
              </p>
              {editing ? (
                <div className="mt-2">
                  <textarea
                    aria-label={`Edit ${fieldLabels[field]}`}
                    className="min-h-28 w-full resize-y rounded-lg border border-[#deddda] bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none focus:border-[#191919] focus:ring-3 focus:ring-[#e9e9e7]"
                    value={editValue}
                    onChange={(event) => onEditValue(event.target.value)}
                  />
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={onSaveEdit}
                      disabled={!editValue.trim()}
                      className="rounded-lg bg-[#191919] px-3 py-2 text-xs font-semibold text-white hover:bg-[#353535] disabled:opacity-40"
                    >
                      Save edited value
                    </button>
                    <button
                      type="button"
                      onClick={onCancelEdit}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 font-semibold text-stone-900">
                  {decision === "edited" ? editValue : formatValue(result.proposed_value)}
                </p>
              )}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              This result stays visible but cannot be included in the simulated update.
            </div>
          )}
        </section>

        <section className="p-5 lg:p-6">
          <p className="mb-4 text-[11px] font-bold tracking-[0.14em] text-slate-400 uppercase">Why this result</p>
          <EvidenceAndContext result={result} />
        </section>
      </div>

      {canApply && !editing && (
        <footer className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 lg:px-6">
          <button
            type="button"
            onClick={onApprove}
            className={cx(
              "rounded-lg border px-4 py-2 text-sm font-semibold",
              decision === "approved"
                ? "border-stone-900 bg-stone-900 text-white"
                : "border-slate-300 bg-white text-slate-800 hover:border-emerald-400 hover:text-emerald-700",
            )}
          >
            Approve
          </button>
          <button
            type="button"
            onClick={onEdit}
            className={cx(
              "rounded-lg border px-4 py-2 text-sm font-semibold",
              decision === "edited"
                ? "border-stone-900 bg-stone-900 text-white"
                : "border-slate-300 bg-white text-slate-800 hover:border-stone-500 hover:text-stone-900",
            )}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onReject}
            className={cx(
              "rounded-lg border px-4 py-2 text-sm font-semibold",
              decision === "rejected"
                ? "border-rose-700 bg-rose-700 text-white"
                : "border-slate-300 bg-white text-slate-800 hover:border-rose-400 hover:text-rose-700",
            )}
          >
            Reject
          </button>
          <p className="ml-auto text-xs text-slate-500">Nothing is applied until final confirmation.</p>
        </footer>
      )}
    </article>
  );
}

export default function FollowPilotReview({
  transcript: initialTranscript,
  fixture: initialFixture,
  expected: initialExpected,
  showOnboarding = false,
  sampleReview = false,
}: {
  transcript: string;
  fixture: FixtureRecord;
  expected: ExpectedResult;
  showOnboarding?: boolean;
  sampleReview?: boolean;
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const [auditMeetingId] = useState<string | null>(() => typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("audit"));
  const { user, loading: authLoading, displayName } = useAuth();
  const isAuthenticated = Boolean(user);
  const [isOnboarding, setIsOnboarding] = useState(showOnboarding);
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [step, setStep] = useState<FlowStep>(sampleReview ? "intake" : "dashboard");
  const [transcript, setTranscript] = useState(initialTranscript);
  const [fixture, setFixture] = useState(initialFixture);
  const [expected, setExpected] = useState(initialExpected);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [matchedContact, setMatchedContact] = useState<MatchedContact | null>(null);
  const [selectedDealId, setSelectedDealId] = useState("");
  const [isMatchingContact, setIsMatchingContact] = useState(false);
  const [hubSpotConnection, setHubSpotConnection] = useState<{ configured: boolean; connected: boolean }>(() => {
    const cached = readHubSpotStatus();
    return cached ? { configured: cached.configured, connected: cached.connected } : { configured: true, connected: false };
  });
  const [connectionLoading, setConnectionLoading] = useState(() => readHubSpotStatus() === null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState(sampleReview ? "Product demo follow-up" : "");
  const [attendees, setAttendees] = useState(sampleReview ? "Maya Chen, Omar Haddad" : "");
  const [meetingAbout, setMeetingAbout] = useState(sampleReview ? "Review the proposal, security questionnaire, and procurement follow-up." : "");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [authorizedToShare, setAuthorizedToShare] = useState(false);
  const [decisions, setDecisions] = useState<Record<FieldKey, ReviewDecision>>(() =>
    Object.fromEntries(
      fieldKeys.map((field) => [
        field,
        initialExpected.fields[field].outcome_state === "proposed_change" ? "pending" : "not_applicable",
      ]),
    ) as Record<FieldKey, ReviewDecision>,
  );
  const [editValues, setEditValues] = useState<Record<FieldKey, string>>(() =>
    Object.fromEntries(fieldKeys.map((field) => [field, editableValue(initialExpected.fields[field].proposed_value)])) as Record<
      FieldKey,
      string
    >,
  );
  const [editingField, setEditingField] = useState<FieldKey | null>(null);
  const [manualChanges, setManualChanges] = useState<ManualChange[]>([]);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualField, setManualField] = useState<FieldKey>("deal_stage");
  const [manualValue, setManualValue] = useState("");
  const [manualReason, setManualReason] = useState("");
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [recentMeetings, setRecentMeetings] = useState<ArchivedMeeting[]>([]);

  useEffect(() => {
    const updateMeetings = () => setRecentMeetings(readMeetingArchive());
    updateMeetings();
    window.addEventListener("followpilot:meeting-archive-updated", updateMeetings);
    return () => window.removeEventListener("followpilot:meeting-archive-updated", updateMeetings);
  }, []);

  const completeAuthentication = (signedUp: boolean) => {
    if (signedUp) router.push("/onboarding");
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    const loadConnection = async () => {
      try {
        const response = await fetch("/api/hubspot/status", { cache: "no-store" });
        const value = await response.json() as { configured?: boolean; connected?: boolean };
        const status = { configured: value.configured !== false, connected: value.connected === true };
        saveHubSpotStatus(status);
        if (active) setHubSpotConnection(status);
      } catch {
        if (active) setHubSpotConnection({ configured: true, connected: false });
      } finally {
        if (active) setConnectionLoading(false);
      }
    };
    void loadConnection();
    return () => { active = false; };
  }, [isAuthenticated]);

  const addAudit = (event: string, detail: string, result: string) => {
    setAudit((current) => [
      ...current,
      {
        id: current.length + 1,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        event,
        detail,
        result,
      },
    ]);
  };

  const pendingCount = fieldKeys.filter((field) => decisions[field] === "pending").length;

  const approvedChanges = useMemo<ApprovedChange[]>(() => {
    const fixtureChanges = fieldKeys.flatMap((field) => {
      const result = expected.fields[field];
      const decision = decisions[field];
      if (result.outcome_state !== "proposed_change" || (decision !== "approved" && decision !== "edited")) {
        return [];
      }

      const proposed = decision === "edited" ? editValues[field] : editableValue(result.proposed_value);
      return [
        {
          id: `fixture-${field}`,
          field,
          label: fieldLabels[field],
          before: result.current_value,
          after: field === "notes" ? appendNotes(result.current_value, proposed) : proposed,
          source: "FollowPilot suggestion" as const,
          action: decision,
          risk: result.risk_level,
        },
      ];
    });

    const manual = manualChanges.map((change) => ({
      id: `manual-${change.id}`,
      field: change.field,
      label: fieldLabels[change.field],
      before: fixture.opportunity.fields[change.field],
      after:
        change.field === "notes" ? appendNotes(fixture.opportunity.fields.notes, change.value) : change.value,
      source: "Added manually by user" as const,
      action: "manual" as const,
      risk: expected.fields[change.field].risk_level,
    }));

    return [...fixtureChanges, ...manual];
  }, [decisions, editValues, expected.fields, fixture.opportunity.fields, manualChanges]);

  const confirmOpportunity = () => {
    addAudit("Opportunity confirmed", `${fixture.opportunity.name} (${fixture.opportunity.id})`, "Confirmed");
    setStep("review");
  };

  const handleTranscriptFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setTranscript(typeof reader.result === "string" ? reader.result : "");
      setUploadedFileName(file.name);
    };
    reader.readAsText(file);
  };

  const resetReview = (nextExpected: ExpectedResult) => {
    setExpected(nextExpected);
    setDecisions(Object.fromEntries(fieldKeys.map((field) => [field, nextExpected.fields[field].outcome_state === "proposed_change" ? "pending" : "not_applicable"])) as Record<FieldKey, ReviewDecision>);
    setEditValues(Object.fromEntries(fieldKeys.map((field) => [field, editableValue(nextExpected.fields[field].proposed_value)])) as Record<FieldKey, string>);
    setManualChanges([]);
    setEditingField(null);
  };

  const archiveCompletedMeeting = (entries: AuditEntry[]) => {
    if (sampleReview || !matchedContact) return;
    const now = new Date();
    const selectedDeal = matchedContact.deals.find((deal) => deal.id === selectedDealId);
    const count = approvedChanges.length;
    saveArchivedMeeting({
      id: `meeting-${Date.now()}`,
      title: meetingTitle.trim() || "Customer meeting",
      company: selectedDeal?.name || matchedContact.name,
      date: now.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }),
      time: now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      duration: "Completed review",
      attendees: attendees.trim() || matchedContact.name,
      status: "Completed",
      summary: meetingAbout.trim() || `CRM review completed for ${matchedContact.name}.`,
      updates: [`${count} approved update${count === 1 ? "" : "s"}`],
      detail: `${count} approved CRM update${count === 1 ? " was" : "s were"} sent to HubSpot for ${selectedDeal?.name || matchedContact.name}.`,
      audit: entries.map(({ event, detail, result, time }) => ({ event, detail, result, time })),
      changes: approvedChanges.map((change) => ({ field: change.label, before: formatValue(change.before), after: change.after })),
      sortDate: now.valueOf(),
      period: "This week",
    });
  };

  const findContact = async () => {
    if (!contactEmail.trim()) return;
    setIsMatchingContact(true);
    try {
      const response = await fetch("/api/hubspot/match", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contactEmail }) });
      const value = await response.json() as { contact?: MatchedContact; error?: string };
      if (!response.ok || !value.contact) throw new Error(value.error || "HubSpot contact could not be matched.");
      setMatchedContact(value.contact);
      setSelectedDealId(value.contact.deals[0]?.id ?? "");
      showToast(value.contact.deals.length ? "Contact and associated deals found" : "Contact found, but no associated deals are available", value.contact.deals.length ? undefined : "error");
    } catch (error) {
      setMatchedContact(null);
      setSelectedDealId("");
      showToast(error instanceof Error ? error.message : "HubSpot contact could not be matched", "error");
    } finally {
      setIsMatchingContact(false);
    }
  };

  const analyzeMeeting = async () => {
    if (!transcript.trim() || !hubSpotConnection.connected || !matchedContact || !selectedDealId) return;
    setIsAnalyzing(true);
    setUploadOpen(false);
    setStep("intake");
    try {
      const response = await fetch("/api/reviews/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, dealId: selectedDealId, contactEmail: matchedContact.email }),
      });
      const value = await response.json() as { fixture?: FixtureRecord; expected?: ExpectedResult; error?: string };
      if (!response.ok || !value.fixture || !value.expected) throw new Error(value.error || "Gemini could not analyse this transcript.");
      setFixture(value.fixture);
      resetReview(value.expected);
      setUploadOpen(false);
      setIsOnboarding(false);
      window.history.replaceState(null, "", "/");
      addAudit("Gemini analysis complete", `${meetingTitle || "Untitled meeting"} matched to ${matchedContact.name} and produced evidence-backed CRM proposals`, "Analysis ready");
      setStep("intake");
      showToast("Gemini review is ready");
    } catch (error) {
      setStep("dashboard");
      showToast(error instanceof Error ? error.message : "Gemini could not analyse this transcript", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startSampleReview = () => {
    router.push("/meetings?sample=1");
  };

  const approve = (field: FieldKey) => {
    setDecisions((current) => ({ ...current, [field]: "approved" }));
    addAudit(
      "Field approved",
      `${fieldLabels[field]}: ${formatValue(expected.fields[field].proposed_value)}`,
      "Queued for final review",
    );
  };

  const reject = (field: FieldKey) => {
    setDecisions((current) => ({ ...current, [field]: "rejected" }));
    setEditingField(null);
    addAudit("Field rejected", `${fieldLabels[field]} proposal excluded`, "Excluded from update");
  };

  const saveEdit = (field: FieldKey) => {
    if (!editValues[field].trim()) return;
    setDecisions((current) => ({ ...current, [field]: "edited" }));
    setEditingField(null);
    addAudit("Field edited", `${fieldLabels[field]} changed to: ${editValues[field]}`, "Edited value queued");
  };

  const addManualChange = () => {
    if (!manualValue.trim() || !manualReason.trim()) return;
    const change = { id: Date.now(), field: manualField, value: manualValue.trim(), reason: manualReason.trim() };
    setManualChanges((current) => [...current, change]);
    addAudit(
      "Manual change added",
      `${fieldLabels[manualField]}: ${change.value}. Reason: ${change.reason}`,
      "Added manually by user",
    );
    setManualValue("");
    setManualReason("");
    setManualOpen(false);
  };

  const applyApprovedChanges = async () => {
    if (sampleReview) {
      setIsApplying(true);
      addAudit("Final confirmation", `${approvedChanges.length} sample change${approvedChanges.length === 1 ? "" : "s"} authorized`, "Confirmed");
      approvedChanges.forEach((change) => addAudit("Sample CRM update applied", `${fieldLabels[change.field]}: simulated successfully`, "Applied successfully"));
      setStep("complete");
      setIsApplying(false);
      showToast("Sample review completed — no HubSpot data was changed");
      return;
    }
    if (!matchedContact || !selectedDealId) {
      showToast("Match a HubSpot contact and select a deal first", "error");
      return;
    }
    setIsApplying(true);
    addAudit(
      "Final confirmation",
      `${approvedChanges.length} change${approvedChanges.length === 1 ? "" : "s"} authorized`,
      "Confirmed",
    );
    try {
      const response = await fetch("/api/hubspot/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId: selectedDealId, contactEmail: matchedContact.email, changes: approvedChanges.map((change) => ({ field: change.field, after: change.after })) }),
      });
      const value = await response.json() as { results?: Array<{ field: FieldKey; ok: boolean; message: string }>; error?: string };
      if (!response.ok || !value.results) throw new Error(value.error || "HubSpot updates could not be applied.");
      value.results.forEach((result) => addAudit(result.ok ? "HubSpot update applied" : "HubSpot update failed", `${fieldLabels[result.field]}: ${result.message}`, result.ok ? "Applied successfully" : "Needs attention"));
      archiveCompletedMeeting([...audit, ...value.results.map((result) => ({ id: 0, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }), event: result.ok ? "HubSpot update applied" : "HubSpot update failed", detail: `${fieldLabels[result.field]}: ${result.message}`, result: result.ok ? "Applied successfully" : "Needs attention" }))]);
      setStep("complete");
      showToast(value.results.every((result) => result.ok) ? "Approved changes applied to HubSpot" : "Some changes need attention", value.results.every((result) => result.ok) ? undefined : "error");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "HubSpot updates could not be applied", "error");
    } finally {
      setIsApplying(false);
    }
  };

  if (authLoading) {
    return <main className="grid min-h-screen place-items-center bg-[#fbfbfa] text-sm text-[#787774]">Loading workspace…</main>;
  }

  if (!isAuthenticated) {
    return <AuthScreen mode={authMode} onModeChange={setAuthMode} onAuthenticated={completeAuthentication} />;
  }

  const archivedMeeting = auditMeetingId ? readMeetingArchive().find((meeting) => meeting.id === auditMeetingId) : null;
  if (archivedMeeting) {
    return (
      <AppShell onNewMeeting={() => setUploadOpen(true)}>
        <main className="min-h-screen">
          <AppHeader title="Meeting audit" subtitle="Completed review" />
          <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 lg:py-14"><button type="button" onClick={() => router.push("/meetings")} className="text-xs font-medium text-[#625f5c] hover:text-[#191919]">← Back to meetings</button><p className="mt-8 text-xs font-semibold uppercase tracking-[0.14em] text-[#787774]">Applied to HubSpot</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{archivedMeeting.title}</h1><p className="mt-3 text-sm leading-6 text-[#625f5c]">{archivedMeeting.detail}</p><section className="mt-8 overflow-hidden rounded-xl border border-[#deddda] bg-white"><div className="border-b border-[#ececea] px-5 py-4"><p className="text-sm font-semibold">Audit history</p></div><ol className="divide-y divide-[#ececea]">{archivedMeeting.audit.map((entry, index) => <li key={`${entry.time}-${index}`} className="grid gap-1 px-5 py-4 sm:grid-cols-[84px_minmax(0,1fr)_auto] sm:items-center sm:gap-4"><time className="text-[11px] text-[#787774]">{entry.time}</time><div><p className="text-[13px] font-medium">{entry.event}</p><p className="mt-1 text-xs text-[#787774]">{entry.detail}</p></div><span className="text-[11px] font-medium text-[#397950]">{entry.result}</span></li>)}</ol></section></div>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell onNewMeeting={() => hubSpotConnection.connected ? setUploadOpen(true) : router.push("/onboarding")}>
      <main id="workspace" className="min-h-screen">
        <AppHeader title={step === "dashboard" ? "Home" : meetingTitle || "Meeting analysis"} subtitle="Your workspace" />

        <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onAnalyze={analyzeMeeting} transcript={transcript} setTranscript={setTranscript} meetingTitle={meetingTitle} setMeetingTitle={setMeetingTitle} attendees={attendees} setAttendees={setAttendees} about={meetingAbout} setAbout={setMeetingAbout} fileName={uploadedFileName} onFile={handleTranscriptFile} authorized={authorizedToShare} setAuthorized={setAuthorizedToShare} isAnalyzing={isAnalyzing} contactEmail={contactEmail} setContactEmail={setContactEmail} matchedContact={matchedContact} selectedDealId={selectedDealId} setSelectedDealId={setSelectedDealId} onFindContact={() => void findContact()} isMatchingContact={isMatchingContact} />

        {step === "dashboard" && isOnboarding && (
          <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-5xl items-center px-5 py-10 sm:px-8 lg:py-14">
            <section className="w-full overflow-hidden rounded-2xl border border-[#deddda] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-end">
                <div className="max-w-xl"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#191919] text-white"><SparkIcon className="h-5 w-5" /></div><p className="mt-6 text-xs font-semibold tracking-[0.14em] text-[#787774] uppercase">Set up your workspace</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Connect HubSpot before your first review.</h1><p className="mt-3 text-sm leading-6 text-[#625f5c]">FollowPilot checks your HubSpot connection on the server before a review can start. Tokens are encrypted and stored in this browser.</p><div className="mt-6 flex flex-wrap items-center gap-2">{hubSpotConnection.connected ? <><span className="inline-flex items-center gap-2 rounded-md bg-[#ebf5ed] px-3.5 py-2.5 text-[13px] font-medium text-[#2e6b43]"><CheckIcon /> HubSpot connected</span><button type="button" onClick={() => { window.open("/api/hubspot/connect?returnTo=/onboarding", "_blank", "noopener,noreferrer"); }} className="rounded-md border border-[#deddda] bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#52504d] transition hover:border-[#9b9995] hover:text-[#191919]">Reconnect HubSpot</button><button type="button" onClick={() => { setIsOnboarding(false); router.push("/"); }} className="rounded-md bg-[#191919] px-3.5 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#353535]">Continue</button></> : <button type="button" onClick={() => { window.open("/api/hubspot/connect?returnTo=/onboarding", "_blank", "noopener,noreferrer"); }} disabled={connectionLoading || !hubSpotConnection.configured} className="inline-flex items-center gap-2 rounded-md bg-[#191919] px-3.5 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#353535] disabled:opacity-45"><span className="text-base leading-none">+</span> {connectionLoading ? "Checking connection…" : "Connect HubSpot"}</button>}<button type="button" onClick={startSampleReview} className="rounded-md border border-[#deddda] bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#52504d] transition hover:border-[#9b9995] hover:text-[#191919]">View a test meeting</button></div>{!connectionLoading && !hubSpotConnection.configured && <p className="mt-3 text-xs text-[#a8342a]">HubSpot OAuth needs to be configured for this workspace.</p>}</div>
                <div className="rounded-xl border border-[#ececea] bg-[#fafaf9] p-5"><p className="text-[11px] font-semibold tracking-[0.12em] text-[#787774] uppercase">How it works</p><ol className="mt-4 space-y-4">{["Connect HubSpot", "Add a meeting transcript", "Review only approved changes"].map((item, index) => <li key={item} className="flex gap-3 text-xs leading-5 text-[#625f5c]"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-[#deddda] bg-white text-[10px] font-semibold text-[#52504d]">{index + 1}</span>{item}</li>)}</ol></div>
              </div>
              <div className="border-t border-[#ececea] bg-[#fafaf9] px-6 py-3 text-xs text-[#787774] sm:px-10">Without HubSpot, you can still explore the sample meeting in Meetings.</div>
            </section>
          </div>
        )}

        {step === "dashboard" && !isOnboarding && (
          <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:py-14">
            <div className="max-w-2xl"><h1 className="text-2xl font-semibold tracking-[-0.03em] sm:text-[28px]">Good morning, {displayName}</h1><p className="mt-2 text-sm leading-6 text-[#625f5c]">Paste a customer-call transcript and FollowPilot will prepare the CRM review for you.</p></div>
            {!hubSpotConnection.connected ? (
              <section className="mt-8 rounded-xl border border-[#deddda] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-7">
                <p className="text-xs font-semibold tracking-[0.14em] text-[#787774] uppercase">CRM required</p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">Connect HubSpot to start a review.</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[#625f5c]">Meeting reviews are available only with a connected HubSpot account. You can still explore the sample meeting while you set up your CRM.</p>
                <div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={() => { window.open("/api/hubspot/connect?returnTo=/", "_blank", "noopener,noreferrer"); }} disabled={connectionLoading || !hubSpotConnection.configured} className="rounded-md bg-[#191919] px-3.5 py-2 text-[13px] font-medium text-white disabled:opacity-45">{connectionLoading ? "Checking HubSpot…" : "Connect HubSpot"}</button><button type="button" onClick={startSampleReview} className="rounded-md border border-[#deddda] bg-white px-3.5 py-2 text-[13px] font-medium text-[#52504d] hover:text-[#191919]">View test meeting</button></div>
              </section>
            ) : (
              <section className="mt-8 rounded-xl border border-[#deddda] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-5"><textarea aria-label="Paste a meeting transcript" value={transcript} onChange={(event) => setTranscript(event.target.value)} placeholder="Paste the meeting transcript here…" className="min-h-52 w-full resize-y border-0 bg-transparent p-1 text-sm leading-6 outline-none placeholder:text-[#9b9995]" /><div className="mt-3 flex flex-col gap-3 border-t border-[#ececea] pt-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-[#787774]">{matchedContact ? `Matched to ${matchedContact.name} · ${matchedContact.deals.find((deal) => deal.id === selectedDealId)?.name ?? "Select a deal"}` : transcript.trim() ? "Add contact details to choose the HubSpot record" : "Paste a transcript, then add the HubSpot contact details"}</p><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => setUploadOpen(true)} className="rounded-md px-3 py-2 text-sm font-medium text-[#625f5c] hover:bg-[#f2f2f0]">Add details</button><button type="button" onClick={() => matchedContact && selectedDealId ? void analyzeMeeting() : setUploadOpen(true)} disabled={!transcript.trim() || isAnalyzing} className="inline-flex items-center gap-2 rounded-md bg-[#191919] px-3.5 py-2 text-sm font-medium text-white transition hover:bg-[#353535] disabled:cursor-not-allowed disabled:opacity-40"><SparkIcon /> Analyze now</button></div></div></section>
            )}
            <div className="mt-10 flex items-end justify-between"><div><h2 className="text-base font-semibold">Recent meetings</h2><p className="mt-1 text-sm text-[#787774]">Your latest review work, all in one place.</p></div><button type="button" onClick={() => router.push("/meetings")} className="text-sm text-[#625f5c] hover:text-[#191919]">View all</button></div>
            <section id="recent" className="mt-4 overflow-hidden rounded-xl border border-[#deddda] bg-white">{recentMeetings.length ? recentMeetings.slice(0, 3).map((meeting) => <button type="button" key={meeting.id} onClick={() => router.push("/meetings")} className="flex w-full items-center justify-between gap-4 border-b border-[#ececea] px-5 py-4 text-left last:border-b-0 hover:bg-[#fafaf9] sm:px-6"><div><p className="text-sm font-medium">{meeting.title}</p><p className="mt-1 text-xs text-[#787774]">{meeting.company} · {meeting.updates.join(" · ")}</p></div><span className="text-xs text-[#787774]">{meeting.date} →</span></button>) : <div className="px-5 py-8 text-center sm:px-6"><p className="text-sm font-medium">No real meetings yet</p><p className="mt-1 text-xs text-[#787774]">Your analyzed meetings will appear here after the first review.</p></div>}</section>
          </div>
        )}

        {step !== "dashboard" && <Progress step={step} onStepChange={setStep} />}

      {step === "intake" && (
        <div className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="mb-8 max-w-3xl">
            <p className="text-xs font-medium text-[#787774]">Analysis ready</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl">
              Confirm the opportunity before you review updates.
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600">
              FollowPilot matched this meeting to the most likely open record. Review the transcript and confirm before any suggestions are shown.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <section className="rounded-xl border border-[#deddda] bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Meeting transcript</h2>
                  <p className="mt-1 text-sm text-slate-500">{meetingTitle || "Meeting transcript"} · {attendees || "Attendees not provided"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTranscript(initialTranscript)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Reset fixture text
                </button>
              </div>
              <textarea
                aria-label="Meeting transcript"
                value={transcript}
                onChange={(event) => setTranscript(event.target.value)}
                className="mt-5 min-h-[520px] w-full resize-y rounded-lg border border-[#deddda] bg-[#fafaf9] px-4 py-4 font-mono text-[13px] leading-6 text-slate-800 outline-none focus:border-[#191919] focus:ring-3 focus:ring-[#e9e9e7]"
              />
              <div className="mt-3 flex items-center justify-between gap-4 text-xs text-slate-500">
                <span>{transcript.length.toLocaleString()} characters</span>
                <span>{transcript === initialTranscript ? "Using fixture transcript" : "Transcript edited locally"}</span>
              </div>
            </section>

            <aside className="h-fit rounded-xl border border-[#deddda] bg-white p-5 sm:p-6 lg:sticky lg:top-6">
              <p className="flex items-center gap-2 text-xs font-medium text-[#625f5c]">
                <span className="h-2 w-2 rounded-full bg-[#191919]" /> Suggested opportunity
              </p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">{fixture.opportunity.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{fixture.opportunity.id}</p>
              <dl className="mt-6 divide-y divide-slate-100 border-y border-slate-100 text-sm">
                {[
                  ["Status", fixture.opportunity.status],
                  ["Owner", fixture.opportunity.owner.name],
                  ["Stage", formatValue(fixture.opportunity.fields.deal_stage)],
                  ["Amount", formatValue(fixture.opportunity.fields.amount)],
                  ["Target close", formatValue(fixture.opportunity.fields.close_date)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 py-3">
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="text-right font-semibold text-slate-800">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                {fixture.reference_status}.
              </div>
              <button
                type="button"
                onClick={confirmOpportunity}
                disabled={!transcript.trim()}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-[#191919] px-4 py-3 text-sm font-medium text-white hover:bg-[#353535] focus:ring-4 focus:ring-[#d9d9d7] disabled:opacity-40"
              >
                Confirm this opportunity <span aria-hidden="true">→</span>
              </button>
            </aside>
          </div>
        </div>
      )}

      {isAnalyzing && <AnalysisOverlay />}

      {step === "review" && !isAnalyzing && (
        <div className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-7 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 lg:sticky lg:top-6">
              <p className="text-xs font-bold tracking-[0.14em] text-slate-400 uppercase">Review ledger</p>
              <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">All five CRM fields</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">Decide every proposed change before final review.</p>
              <nav aria-label="CRM fields" className="mt-5 space-y-1">
                {fieldKeys.map((field) => (
                  <a
                    key={field}
                    href={`#field-${field}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    <span>{fieldLabels[field]}</span>
                    <span
                      className={cx(
                        "h-2.5 w-2.5 rounded-full",
                        decisions[field] === "pending" && "bg-amber-400",
                        (decisions[field] === "approved" || decisions[field] === "edited") && "bg-emerald-500",
                        decisions[field] === "rejected" && "bg-rose-500",
                        decisions[field] === "not_applicable" && "bg-slate-300",
                      )}
                    />
                  </a>
                ))}
              </nav>
              <div className="mt-5 rounded-xl bg-slate-950 p-4 text-white">
                <p className="text-3xl font-semibold">{pendingCount}</p>
                <p className="mt-1 text-xs text-slate-300">proposed decisions remaining</p>
              </div>
            </aside>

            <div>
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-medium text-[#787774]">{fixture.opportunity.name}</p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950">Review prepared changes</h1>
                </div>
                <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
                  Evidence and context stay separate
                </span>
              </div>

              <div className="space-y-5">
                {fieldKeys.map((field) => (
                  <FieldCard
                    key={field}
                    field={field}
                    result={expected.fields[field]}
                    decision={decisions[field]}
                    editValue={editValues[field]}
                    editing={editingField === field}
                    onApprove={() => approve(field)}
                    onReject={() => reject(field)}
                    onEdit={() => setEditingField(field)}
                    onEditValue={(value) => setEditValues((current) => ({ ...current, [field]: value }))}
                    onSaveEdit={() => saveEdit(field)}
                    onCancelEdit={() => {
                      setEditValues((current) => ({
                        ...current,
                        [field]: editableValue(expected.fields[field].proposed_value),
                      }));
                      setEditingField(null);
                    }}
                  />
                ))}
              </div>

              <section className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-semibold text-slate-900">Did FollowPilot miss something?</h2>
                    <p className="mt-1 text-sm text-slate-500">Add a supported-field update and label it in the audit history.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setManualOpen((current) => !current)}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {manualOpen ? "Cancel manual change" : "Add missed update"}
                  </button>
                </div>
                {manualOpen && (
                  <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
                    <label className="text-sm font-medium text-slate-700">
                      Field
                      <select
                        value={manualField}
                        onChange={(event) => setManualField(event.target.value as FieldKey)}
                        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-100"
                      >
                        {fieldKeys.map((field) => (
                          <option key={field} value={field}>{fieldLabels[field]}</option>
                        ))}
                      </select>
                    </label>
                    <label className="text-sm font-medium text-slate-700">
                      New value
                      <input
                        value={manualValue}
                        onChange={(event) => setManualValue(event.target.value)}
                        placeholder="Enter the missed update"
                        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-100"
                      />
                    </label>
                    <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                      Reason
                      <input
                        value={manualReason}
                        onChange={(event) => setManualReason(event.target.value)}
                        placeholder="Why should this be added?"
                        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-100"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={addManualChange}
                      disabled={!manualValue.trim() || !manualReason.trim()}
                      className="w-fit rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-40 sm:col-span-2"
                    >
                      Add manual change
                    </button>
                  </div>
                )}
                {manualChanges.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {manualChanges.map((change) => (
                      <li key={change.id} className="flex justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                        <span><strong>{fieldLabels[change.field]}:</strong> {change.value}</span>
                        <span className="shrink-0 text-xs font-semibold text-blue-700">Added manually</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <div className="sticky bottom-4 mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {pendingCount ? `${pendingCount} decision${pendingCount === 1 ? "" : "s"} remaining` : "Review complete"}
                  </p>
                  <p className="text-xs text-slate-500">Rejected changes are excluded from the final update.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep("summary")}
                  disabled={pendingCount > 0 || editingField !== null}
                  className="google-border-action rounded-md px-5 py-3 text-sm font-medium text-white disabled:opacity-40"
                >
                  Review final changes →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === "summary" && (
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="text-center">
            <p className="text-xs font-medium text-[#787774]">Final confirmation</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl">Review what will change</h1>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600">
              This is the complete update set for {fixture.opportunity.name}. {sampleReview ? "This sample simulates the result and never changes HubSpot." : "Only the approved fields will be written to the selected HubSpot record."}
            </p>
          </div>

          <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="font-semibold text-slate-950">Approved update set</h2>
                <p className="mt-1 text-xs text-slate-500">{approvedChanges.length} CRM {sampleReview ? "simulation" : "write"}{approvedChanges.length === 1 ? "" : "s"} ready</p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">{sampleReview ? "Synthetic sample" : "Connected HubSpot record"}</span>
            </header>
            {approvedChanges.length ? (
              <div className="divide-y divide-slate-100">
                {approvedChanges.map((change) => (
                  <article key={change.id} className="grid gap-4 px-5 py-5 sm:px-6 md:grid-cols-[170px_1fr]">
                    <div>
                      <p className="font-semibold text-slate-950">{change.label}</p>
                      <p className="mt-1 text-xs text-slate-500">{change.source}</p>
                      {change.field === "notes" && (
                        <span className="mt-2 inline-flex rounded-full bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-700 uppercase">Append</span>
                      )}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-start">
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Before</p>
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{formatValue(change.before)}</p>
                      </div>
                      <span className="hidden pt-4 text-slate-300 sm:block">→</span>
                      <div className="rounded-lg bg-blue-50 p-3">
                        <p className="text-[10px] font-bold text-blue-500 uppercase">After</p>
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 font-medium text-blue-950">{change.after}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="px-6 py-12 text-center text-sm text-slate-500">No changes were approved. Complete the review with zero CRM writes.</p>
            )}
          </section>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => setStep("review")}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              ← Back to field review
            </button>
            <button
              type="button"
              onClick={() => void applyApprovedChanges()}
              disabled={isApplying}
              className="rounded-md bg-[#191919] px-5 py-3 text-sm font-medium text-white hover:bg-[#353535] focus:ring-4 focus:ring-[#d9d9d7]"
            >
              {isApplying ? (sampleReview ? "Completing sample…" : "Applying to HubSpot…") : (sampleReview ? "Complete sample review" : "Apply approved HubSpot updates")}
            </button>
          </div>
        </div>
      )}

      {step === "complete" && (
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <section className="rounded-xl border border-[#deddda] bg-white px-6 py-8 sm:px-8 sm:py-10">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-[#191919] text-white"><CheckIcon className="h-6 w-6" /></div>
                {sampleReview && <p className="mt-5 text-xs font-medium text-[#787774]">Sample review complete</p>}
                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">{sampleReview ? "You completed the sample review." : "Your HubSpot record is up to date."}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#625f5c]">
                  {approvedChanges.length} approved change{approvedChanges.length === 1 ? " was" : "s were"} {sampleReview ? "simulated. No HubSpot data was changed." : "sent to HubSpot."}
                </p>
              </div>
              <div className="rounded-lg bg-[#f5f5f3] px-5 py-4">
                <p className="text-3xl font-semibold">{approvedChanges.length}</p>
                <p className="mt-1 text-xs text-[#787774]">changes applied</p>
              </div>
            </div>
          </section>

          <div className="mt-7 grid gap-7 lg:grid-cols-[0.7fr_1.3fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-slate-950">Completion result</h2>
              <div className="mt-5 space-y-3">
                {approvedChanges.map((change) => (
                  <div key={change.id} className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-600 text-white"><CheckIcon /></span>
                    <div>
                      <p className="text-sm font-semibold text-emerald-950">{change.label} applied</p>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-emerald-800">{change.after}</p>
                    </div>
                  </div>
                ))}
                {!approvedChanges.length && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Completed with no CRM writes.</p>}
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <header className="border-b border-slate-100 px-5 py-4 sm:px-6">
                <h2 className="text-lg font-semibold text-slate-950">Audit history</h2>
                <p className="mt-1 text-xs text-slate-500">Every review decision and simulated result in this session.</p>
              </header>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="bg-slate-50 text-[11px] tracking-wide text-slate-500 uppercase">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Time</th>
                      <th className="px-5 py-3 font-semibold">Event</th>
                      <th className="px-5 py-3 font-semibold">Detail</th>
                      <th className="px-5 py-3 font-semibold">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {audit.map((entry) => (
                      <tr key={entry.id}>
                        <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-slate-500">{entry.time}</td>
                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-800">{entry.event}</td>
                        <td className="max-w-md px-5 py-4 leading-5 text-slate-600">{entry.detail}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-xs font-semibold text-emerald-700">{entry.result}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      )}
      </main>
    </AppShell>
  );
}
