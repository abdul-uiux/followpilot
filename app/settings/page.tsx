"use client";

import Link from "next/link";
import { useState } from "react";
import { updateProfile } from "firebase/auth";
import { AppSidebar } from "../components/app-sidebar";
import { AppHeader } from "../components/app-header";
import { useAuth } from "../components/auth-provider";
import { firebaseAuth } from "../lib/firebase";
import { useToast } from "../components/toast-provider";

const settingsStorageKey = "followpilot-workspace-settings";
type SavedSettings = {
  name?: string;
  workspaceName?: string;
  meetingSummary?: boolean;
  reviewReminder?: boolean;
  productUpdates?: boolean;
  timezone?: string;
};

function loadSavedSettings(): SavedSettings {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(settingsStorageKey) ?? "{}") as SavedSettings;
  } catch {
    return {};
  }
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#e9e9e7] ${checked ? "bg-[#191919]" : "bg-[#d5d4d1]"}`}
    >
      <span className={`block h-5 w-5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

function SettingsRow({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-stretch gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6">
      <div className="min-w-0"><p className="text-[13px] font-medium text-[#191919]">{title}</p><p className="mt-1 max-w-xl text-xs leading-5 text-[#787774]">{description}</p></div>
      <div className="self-end sm:shrink-0 sm:self-auto">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, displayName, initials, refreshProfile } = useAuth();
  const savedSettings = useState(loadSavedSettings)[0];
  const { showToast } = useToast();
  const [name, setName] = useState(savedSettings.name ?? "");
  const [workspaceName, setWorkspaceName] = useState(savedSettings.workspaceName ?? "");
  const [meetingSummary, setMeetingSummary] = useState(savedSettings.meetingSummary ?? true);
  const [reviewReminder, setReviewReminder] = useState(savedSettings.reviewReminder ?? true);
  const [productUpdates, setProductUpdates] = useState(savedSettings.productUpdates ?? false);
  const [timezone, setTimezone] = useState(savedSettings.timezone ?? "America/Los_Angeles");
  const [lastSaved, setLastSaved] = useState(() => ({
    name: savedSettings.name ?? "",
    workspaceName: savedSettings.workspaceName ?? "",
    meetingSummary: savedSettings.meetingSummary ?? true,
    reviewReminder: savedSettings.reviewReminder ?? true,
    productUpdates: savedSettings.productUpdates ?? false,
    timezone: savedSettings.timezone ?? "America/Los_Angeles",
  }));
  const [isSaving, setIsSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleteModalClosing, setIsDeleteModalClosing] = useState(false);
  const [confirmationName, setConfirmationName] = useState("");
  const [workspaceDeleted, setWorkspaceDeleted] = useState(false);
  const accountName = name || displayName;
  const accountWorkspace = workspaceName || `${displayName}'s workspace`;
  const hasPendingChanges = name !== lastSaved.name || workspaceName !== lastSaved.workspaceName || meetingSummary !== lastSaved.meetingSummary || reviewReminder !== lastSaved.reviewReminder || productUpdates !== lastSaved.productUpdates || timezone !== lastSaved.timezone;

  const saveChanges = async () => {
    if (!hasPendingChanges || isSaving) return;
    setIsSaving(true);
    try {
      if (firebaseAuth?.currentUser && firebaseAuth.currentUser.displayName !== accountName) {
        await updateProfile(firebaseAuth.currentUser, { displayName: accountName });
      }
      const savedValues = { name, workspaceName, meetingSummary, reviewReminder, productUpdates, timezone };
      window.localStorage.setItem(settingsStorageKey, JSON.stringify(savedValues));
      setLastSaved(savedValues);
      refreshProfile();
      showToast("Changes saved");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not save changes", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const closeDeleteModal = (afterClose?: () => void) => {
    if (isDeleteModalClosing) return;
    setIsDeleteModalClosing(true);
    window.setTimeout(() => {
      setDeleteOpen(false);
      setIsDeleteModalClosing(false);
      setConfirmationName("");
      afterClose?.();
    }, 180);
  };

  const deleteWorkspace = () => {
    if (confirmationName.trim() !== accountWorkspace) return;
    closeDeleteModal(() => {
      window.localStorage.removeItem(settingsStorageKey);
      window.sessionStorage.removeItem("followpilot-demo-authenticated");
      setWorkspaceDeleted(true);
      showToast(`“${accountWorkspace}” was deleted`);
    });
  };

  if (workspaceDeleted) {
    return <div className="min-h-screen bg-[#f7f7f5] text-[#191919]"><main className="mx-auto flex min-h-screen max-w-md items-center px-5"><div><div className="grid h-11 w-11 place-items-center rounded-lg bg-[#191919] text-lg text-white">✓</div><p className="mt-5 text-xs font-semibold tracking-[0.14em] text-[#787774] uppercase">Workspace deleted</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Your workspace has been permanently deleted.</h1><p className="mt-3 text-sm leading-6 text-[#625f5c]">All saved workspace preferences and demo review data have been cleared from this browser.</p><Link href="/" className="mt-7 inline-flex rounded-md bg-[#191919] px-3.5 py-2 text-[13px] font-medium text-white transition hover:bg-[#353535]">Return home</Link></div></main></div>;
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#191919]">
      <AppSidebar activePage="settings" />
      <div className="lg:pl-60">
        <AppHeader title="Settings" subtitle={accountWorkspace} />

        <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8 lg:py-14">
          <div className="max-w-2xl"><p className="text-xs font-semibold tracking-[0.14em] text-[#787774] uppercase">Workspace preferences</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Make FollowPilot feel like yours.</h1><p className="mt-3 text-sm leading-6 text-[#625f5c]">Manage your workspace details, review defaults, and notification preferences.</p></div>

          <div className="mt-10 space-y-8">
            <section aria-labelledby="profile-heading">
              <div className="mb-3"><h2 id="profile-heading" className="text-[13px] font-semibold">Profile & workspace</h2><p className="mt-1 text-xs text-[#787774]">Personal details and defaults for this workspace.</p></div>
              <div className="overflow-hidden rounded-xl border border-[#deddda] bg-white">
                <div className="flex flex-col gap-4 border-b border-[#ececea] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div className="flex items-center gap-3"><div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-[#e8e7e4] bg-cover bg-center text-[13px] font-semibold text-[#191919]" style={user?.photoURL ? { backgroundImage: `url(${user.photoURL})` } : undefined}>{user?.photoURL ? <span className="sr-only">{displayName}</span> : initials}</div><div><p className="text-[13px] font-medium">Profile picture</p><p className="mt-1 text-xs text-[#787774]">Avatar changes are temporarily unavailable.</p></div></div>
                </div>
                <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
                  <label className="block text-[13px] font-medium">Name<input value={accountName} onChange={(event) => setName(event.target.value)} className="mt-2 h-9 w-full rounded-md border border-[#deddda] bg-white px-3 text-[13px] font-normal outline-none transition placeholder:text-[#9b9995] focus:border-[#191919] focus:ring-3 focus:ring-[#e9e9e7]" /></label>
                  <label className="block text-[13px] font-medium">Email<input value={user?.email ?? ""} readOnly aria-readonly="true" className="mt-2 h-9 w-full cursor-not-allowed rounded-md border border-[#ececea] bg-[#f7f7f5] px-3 text-[13px] font-normal text-[#787774] outline-none" /></label>
                  <label className="block text-[13px] font-medium">Workspace name<input value={accountWorkspace} onChange={(event) => setWorkspaceName(event.target.value)} className="mt-2 h-9 w-full rounded-md border border-[#deddda] bg-white px-3 text-[13px] font-normal outline-none transition placeholder:text-[#9b9995] focus:border-[#191919] focus:ring-3 focus:ring-[#e9e9e7]" /></label>
                  <label className="block text-[13px] font-medium">Review timezone<select value={timezone} onChange={(event) => setTimezone(event.target.value)} className="mt-2 h-9 w-full rounded-md border border-[#deddda] bg-white px-3 text-[13px] font-normal text-[#52504d] outline-none transition focus:border-[#191919] focus:ring-3 focus:ring-[#e9e9e7]"><option value="America/Los_Angeles">Pacific time (UTC−7)</option><option value="America/New_York">Eastern time (UTC−4)</option><option value="Europe/London">London time (UTC+1)</option></select></label>
                </div>
                <div className="border-t border-[#ececea] px-5 py-4 sm:px-6"><p className="text-[13px] font-medium">Default review behavior</p><p className="mt-1 text-xs leading-5 text-[#787774]">Open a new meeting at the transcript step, ready to prepare CRM updates.</p></div>
              </div>
            </section>

            <section aria-labelledby="notifications-heading"><div className="mb-3"><h2 id="notifications-heading" className="text-[13px] font-semibold">Notifications</h2><p className="mt-1 text-xs text-[#787774]">Choose the moments that deserve your attention.</p></div><div className="divide-y divide-[#ececea] overflow-hidden rounded-xl border border-[#deddda] bg-white"><SettingsRow title="Meeting summaries" description="Send a concise email when a meeting review is ready."><Toggle checked={meetingSummary} onChange={setMeetingSummary} label="Meeting summaries" /></SettingsRow><SettingsRow title="Review reminders" description="Remind me when a review is waiting for a decision."><Toggle checked={reviewReminder} onChange={setReviewReminder} label="Review reminders" /></SettingsRow><SettingsRow title="Product updates" description="Occasional notes about improvements and new features."><Toggle checked={productUpdates} onChange={setProductUpdates} label="Product updates" /></SettingsRow></div></section>

            <section aria-labelledby="privacy-heading"><div className="mb-3"><h2 id="privacy-heading" className="text-[13px] font-semibold">Privacy & data</h2><p className="mt-1 text-xs text-[#787774]">Clear, deliberate controls for your review history.</p></div><div className="overflow-hidden rounded-xl border border-[#deddda] bg-[#fffafa]"><SettingsRow title="Delete workspace" description="Permanently delete this demo workspace and all its review history."><button type="button" onClick={() => { setIsDeleteModalClosing(false); setDeleteOpen(true); }} className="rounded-md border border-[#f1c8c3] bg-white px-3 py-2 text-[13px] font-medium text-[#a8342a] transition hover:bg-[#fff4f2]">Delete workspace</button></SettingsRow></div></section>
          </div>

          <div className="mt-10 flex justify-end border-t border-[#e8e7e4] pt-5"><button type="button" onClick={() => void saveChanges()} disabled={!hasPendingChanges || isSaving} className="rounded-md bg-[#191919] px-3.5 py-2 text-[13px] font-medium text-white transition hover:bg-[#353535] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#d9d9d7] disabled:cursor-not-allowed disabled:opacity-45">{isSaving ? "Saving…" : "Save changes"}</button></div>
        </main>
      </div>
      {deleteOpen && <div className={`fixed inset-0 z-40 grid place-items-center bg-[#191919]/20 px-5 py-8 backdrop-blur-[2px] ${isDeleteModalClosing ? "modal-backdrop-exit pointer-events-none" : "modal-backdrop-enter"}`} role="presentation" onMouseDown={() => closeDeleteModal()}><section role="dialog" aria-modal="true" aria-labelledby="delete-workspace-title" className={`w-full max-w-md rounded-xl border border-[#deddda] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-6 ${isDeleteModalClosing ? "modal-panel-exit" : "modal-panel-enter"}`} onMouseDown={(event) => event.stopPropagation()}><p className="text-xs font-semibold tracking-[0.14em] text-[#a8342a] uppercase">Permanent action</p><h2 id="delete-workspace-title" className="mt-2 text-xl font-semibold tracking-[-0.03em]">Delete “{accountWorkspace}”?</h2><p className="mt-3 text-sm leading-6 text-[#625f5c]">Deleting <span className="font-medium text-[#191919]">“{accountWorkspace}”</span> will permanently delete all workspace data, meeting reviews, and history. This cannot be undone.</p><label className="mt-5 block text-[13px] font-medium">Type <span className="font-semibold">{accountWorkspace}</span> to confirm<input value={confirmationName} onChange={(event) => setConfirmationName(event.target.value)} autoFocus className="mt-2 h-9 w-full rounded-md border border-[#deddda] bg-white px-3 text-[13px] font-normal outline-none transition focus:border-[#191919] focus:ring-3 focus:ring-[#e9e9e7]" /></label><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => closeDeleteModal()} className="rounded-md px-3 py-2 text-[13px] font-medium text-[#625f5c] transition hover:bg-[#ececea]">Cancel</button><button type="button" disabled={confirmationName.trim() !== accountWorkspace || isDeleteModalClosing} onClick={deleteWorkspace} className="rounded-md bg-[#a8342a] px-3.5 py-2 text-[13px] font-medium text-white transition hover:bg-[#8f2c23] disabled:cursor-not-allowed disabled:opacity-45">Delete workspace</button></div></section></div>}
    </div>
  );
}
