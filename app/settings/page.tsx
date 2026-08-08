"use client";

import Link from "next/link";
import { useState } from "react";
import { AppSidebar } from "../components/app-sidebar";

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#e9e9e7] ${checked ? "bg-[#191919]" : "bg-[#d5d4d1]"}`}
    >
      <span className={`block h-5 w-5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.18)] transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
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
  const [name, setName] = useState("Alex Rivera");
  const [workspaceName, setWorkspaceName] = useState("Personal workspace");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [meetingSummary, setMeetingSummary] = useState(true);
  const [reviewReminder, setReviewReminder] = useState(true);
  const [productUpdates, setProductUpdates] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveChanges = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const changeProfilePicture = (file: File | undefined) => {
    if (file) setProfileImage(URL.createObjectURL(file));
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#191919]">
      <AppSidebar activePage="settings" />
      <div className="lg:pl-60">
        <header className="flex h-14 items-center justify-between border-b border-[#e8e7e4] bg-[#fbfbfa] px-5 sm:px-7">
          <div><p className="text-sm font-medium">Settings</p><p className="text-[11px] text-[#787774]">Personal workspace</p></div>
          <Link href="/" className="rounded-md bg-[#191919] px-3 py-2 text-[13px] font-medium text-white transition hover:bg-[#353535] lg:hidden">+ New</Link>
          <div className="hidden items-center gap-3 sm:flex"><span className="text-xs text-[#787774]">Alex Rivera</span><div className="grid h-7 w-7 place-items-center rounded-full bg-[#e8e7e4] text-[10px] font-semibold">AR</div></div>
        </header>

        <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8 lg:py-14">
          <div className="max-w-2xl"><p className="text-xs font-semibold tracking-[0.14em] text-[#787774] uppercase">Workspace preferences</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Make FollowPilot feel like yours.</h1><p className="mt-3 text-sm leading-6 text-[#625f5c]">Manage your workspace details, review defaults, and notification preferences.</p></div>

          <div className="mt-10 space-y-8">
            <section aria-labelledby="profile-heading">
              <div className="mb-3"><h2 id="profile-heading" className="text-[13px] font-semibold">Profile & workspace</h2><p className="mt-1 text-xs text-[#787774]">Personal details and defaults for this workspace.</p></div>
              <div className="overflow-hidden rounded-xl border border-[#deddda] bg-white">
                <div className="flex flex-col gap-4 border-b border-[#ececea] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div className="flex items-center gap-3"><div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-[#e8e7e4] bg-cover bg-center text-[13px] font-semibold" style={profileImage ? { backgroundImage: `url(${profileImage})` } : undefined}>{profileImage ? <span className="sr-only">Selected profile picture</span> : name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div><div><p className="text-[13px] font-medium">Profile picture</p><p className="mt-1 text-xs text-[#787774]">PNG, JPG, or WebP. Up to 5 MB.</p></div></div>
                  <label className="cursor-pointer self-start rounded-md border border-[#deddda] bg-white px-3 py-2 text-[13px] font-medium text-[#52504d] transition hover:border-[#9b9995] hover:text-[#191919] sm:self-auto">Change picture<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => changeProfilePicture(event.target.files?.[0])} className="sr-only" /></label>
                </div>
                <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
                  <label className="block text-[13px] font-medium">Name<input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-9 w-full rounded-md border border-[#deddda] bg-white px-3 text-[13px] font-normal outline-none transition placeholder:text-[#9b9995] focus:border-[#191919] focus:ring-4 focus:ring-[#e9e9e7]" /></label>
                  <label className="block text-[13px] font-medium">Email<input value="alex@followpilot.com" readOnly aria-readonly="true" className="mt-2 h-9 w-full cursor-not-allowed rounded-md border border-[#ececea] bg-[#f7f7f5] px-3 text-[13px] font-normal text-[#787774] outline-none" /></label>
                  <label className="block text-[13px] font-medium">Workspace name<input value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} className="mt-2 h-9 w-full rounded-md border border-[#deddda] bg-white px-3 text-[13px] font-normal outline-none transition placeholder:text-[#9b9995] focus:border-[#191919] focus:ring-4 focus:ring-[#e9e9e7]" /></label>
                  <label className="block text-[13px] font-medium">Review timezone<select defaultValue="America/Los_Angeles" className="mt-2 h-9 w-full rounded-md border border-[#deddda] bg-white px-3 text-[13px] font-normal text-[#52504d] outline-none transition focus:border-[#191919] focus:ring-4 focus:ring-[#e9e9e7]"><option value="America/Los_Angeles">Pacific time (UTC−7)</option><option value="America/New_York">Eastern time (UTC−4)</option><option value="Europe/London">London time (UTC+1)</option></select></label>
                </div>
                <div className="border-t border-[#ececea] px-5 py-4 sm:px-6"><p className="text-[13px] font-medium">Default review behavior</p><p className="mt-1 text-xs leading-5 text-[#787774]">Open a new meeting at the transcript step, ready to prepare CRM updates.</p></div>
              </div>
            </section>

            <section aria-labelledby="notifications-heading"><div className="mb-3"><h2 id="notifications-heading" className="text-[13px] font-semibold">Notifications</h2><p className="mt-1 text-xs text-[#787774]">Choose the moments that deserve your attention.</p></div><div className="divide-y divide-[#ececea] overflow-hidden rounded-xl border border-[#deddda] bg-white"><SettingsRow title="Meeting summaries" description="Send a concise email when a meeting review is ready."><Toggle checked={meetingSummary} onChange={setMeetingSummary} label="Meeting summaries" /></SettingsRow><SettingsRow title="Review reminders" description="Remind me when a review is waiting for a decision."><Toggle checked={reviewReminder} onChange={setReviewReminder} label="Review reminders" /></SettingsRow><SettingsRow title="Product updates" description="Occasional notes about improvements and new features."><Toggle checked={productUpdates} onChange={setProductUpdates} label="Product updates" /></SettingsRow></div></section>

            <section aria-labelledby="privacy-heading"><div className="mb-3"><h2 id="privacy-heading" className="text-[13px] font-semibold">Privacy & data</h2><p className="mt-1 text-xs text-[#787774]">Clear, deliberate controls for your review history.</p></div><div className="overflow-hidden rounded-xl border border-[#deddda] bg-[#fffafa]"><SettingsRow title="Delete workspace" description="Permanently delete this demo workspace and its review history."><button type="button" className="rounded-md border border-[#f1c8c3] bg-white px-3 py-2 text-[13px] font-medium text-[#a8342a] transition hover:bg-[#fff4f2]">Delete workspace</button></SettingsRow></div></section>
          </div>

          <div className="mt-10 flex items-center justify-end gap-3 border-t border-[#e8e7e4] pt-5"><span className="mr-auto text-xs text-[#787774]" aria-live="polite">{saved ? "Changes saved" : ""}</span><button type="button" onClick={() => { setName("Alex Rivera"); setWorkspaceName("Personal workspace"); setProfileImage(null); }} className="rounded-md px-3 py-2 text-[13px] font-medium text-[#625f5c] transition hover:bg-[#ececea]">Reset</button><button type="button" onClick={saveChanges} className="rounded-md bg-[#191919] px-3.5 py-2 text-[13px] font-medium text-white transition hover:bg-[#353535] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d9d9d7]">Save changes</button></div>
        </main>
      </div>
    </div>
  );
}
