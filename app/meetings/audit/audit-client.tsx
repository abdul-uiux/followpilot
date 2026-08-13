"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppHeader } from "../../components/app-header";
import { AppSidebar } from "../../components/app-sidebar";
import { readMeetingArchive, type ArchivedMeeting } from "../../lib/meeting-archive";

export default function AuditClient({ meetingId }: { meetingId: string | null }) {
  const [meeting, setMeeting] = useState<ArchivedMeeting | null>(null);

  useEffect(() => {
    const archive = readMeetingArchive();
    const timeout = window.setTimeout(() => setMeeting(archive.find((item) => item.id === meetingId) ?? null), 0);
    return () => window.clearTimeout(timeout);
  }, [meetingId]);

  const changes = meeting?.changes ?? [];
  const auditEntries = meeting?.audit?.length ? meeting.audit : meeting ? [
    { time: meeting.time, event: "Review completed", detail: meeting.detail, result: "Applied" },
    { time: meeting.time, event: "HubSpot updated", detail: `${meeting.updates.join(" · ")} sent to the selected HubSpot record.`, result: "Applied" },
  ] : [];
  const appliedCount = changes.length || meeting?.updates.length || 0;

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#191919]">
      <AppSidebar activePage="meetings" />
      <div className="min-h-screen lg:pl-60">
        <AppHeader title="Meeting audit" subtitle="Completed review" />
        <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-14">
          <Link href="/meetings" className="text-xs font-medium text-[#625f5c] hover:text-[#191919]">← Back to meetings</Link>
          {meeting ? <>
            <section className="mt-8 rounded-xl border border-[#deddda] bg-white px-6 py-8 sm:px-8 sm:py-10">
              <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end"><div><div className="grid h-11 w-11 place-items-center rounded-lg bg-[#191919] text-xl text-white">✓</div><p className="mt-5 text-xs font-medium text-[#787774]">Completed review</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Your HubSpot record is up to date.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#625f5c]">{meeting.detail}</p></div><div className="min-w-32 rounded-2xl border border-[#deddda] bg-white px-5 py-4"><p className="text-3xl font-semibold">{appliedCount}</p><p className="mt-1 text-xs text-[#787774]">changes applied</p></div></div>
            </section>
            <div className="mt-7 grid gap-7 lg:grid-cols-[0.7fr_1.3fr]">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><h2 className="text-lg font-semibold text-slate-950">Completion result</h2><div className="mt-5 space-y-3">{changes.length ? changes.map((change, index) => <div key={`${change.field}-${index}`} className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-600 text-xs text-white">✓</span><div><p className="text-sm font-semibold text-emerald-950">{change.field} applied</p><p className="mt-0.5 line-clamp-2 text-xs leading-5 text-emerald-800">{change.after}</p></div></div>) : meeting.updates.map((update) => <div key={update} className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-600 text-xs text-white">✓</span><p className="text-sm font-semibold text-emerald-950">{update}</p></div>)}</div></section>
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><header className="border-b border-slate-100 px-5 py-4 sm:px-6"><h2 className="text-lg font-semibold text-slate-950">Audit history</h2><p className="mt-1 text-xs text-slate-500">Every review decision and HubSpot update in this session.</p></header><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-semibold">Time</th><th className="px-5 py-3 font-semibold">Event</th><th className="px-5 py-3 font-semibold">Detail</th><th className="px-5 py-3 font-semibold">Result</th></tr></thead><tbody className="divide-y divide-slate-100">{auditEntries.map((entry, index) => <tr key={`${entry.time}-${index}`}><td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-slate-500">{entry.time}</td><td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-800">{entry.event}</td><td className="max-w-md px-5 py-4 leading-5 text-slate-600">{entry.detail}</td><td className="whitespace-nowrap px-5 py-4 text-xs font-semibold text-emerald-700">{entry.result}</td></tr>)}</tbody></table></div></section>
            </div>
          </> : <section className="mt-8 rounded-xl border border-dashed border-[#c9c8c5] bg-white px-6 py-12 text-center"><p className="text-sm font-semibold">Meeting audit not found</p><p className="mt-2 text-xs text-[#787774]">Return to Meetings and open an available completed review.</p></section>}
        </main>
      </div>
    </div>
  );
}
