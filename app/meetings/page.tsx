"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppSidebar } from "../components/app-sidebar";

type Meeting = {
  id: string;
  title: string;
  company: string;
  date: string;
  time: string;
  duration: string;
  attendees: string;
  status: "Needs decision" | "Ready to review" | "Completed";
  summary: string;
  updates: string[];
  detail: string;
  sortDate: number;
  period: "This week" | "Earlier";
};

const meetings: Meeting[] = [
  {
    id: "northstar",
    title: "Operations rollout",
    company: "Northstar",
    date: "Yesterday",
    time: "2:30 PM",
    duration: "42 min",
    attendees: "Priya Nair, Dana Brooks + 2",
    status: "Needs decision",
    summary: "Legal review is still open, and the commercial amount needs a human decision before the CRM record can be completed.",
    updates: ["2 suggested updates", "1 unresolved conflict"],
    detail: "The customer confirmed a legal-redline handoff. Two explicit amount statements conflict, so FollowPilot has not selected a value.",
    sortDate: 20260807,
    period: "This week",
  },
  {
    id: "bluepeak",
    title: "Q3 product strategy",
    company: "BluePeak Analytics",
    date: "Today",
    time: "10:00 AM",
    duration: "37 min",
    attendees: "Maya Chen, Omar Haddad + 1",
    status: "Ready to review",
    summary: "The technical evaluation is complete and the team is ready to review a formal proposal.",
    updates: ["3 suggested updates", "2 fields unchanged"],
    detail: "Prepared changes cover the deal stage, proposal follow-up, and buying-process notes. The close date and quoted annual amount remain unchanged.",
    sortDate: 20260808,
    period: "This week",
  },
  {
    id: "cedar",
    title: "Compliance platform",
    company: "Cedar & Finch",
    date: "Aug 3",
    time: "3:00 PM",
    duration: "51 min",
    attendees: "Nina Patel, Jonas Reed + 3",
    status: "Completed",
    summary: "Security-language negotiation remains open. The completed review retains the decision trail for the applied fixture updates.",
    updates: ["2 changes simulated", "1 item skipped"],
    detail: "A context-only commercial change received additional confirmation. The manually added legal follow-up was deliberately skipped after a simulated fixture failure.",
    sortDate: 20260803,
    period: "Earlier",
  },
  {
    id: "atlas",
    title: "Renewal planning",
    company: "Atlas Works",
    date: "Jul 31",
    time: "11:15 AM",
    duration: "28 min",
    attendees: "Elena Ruiz, Mark Foster",
    status: "Completed",
    summary: "A concise renewal planning conversation with a confirmed next-step owner and no commercial change.",
    updates: ["1 change simulated", "4 fields unchanged"],
    detail: "The review preserved the existing stage, amount, and close date while recording the agreed renewal-plan follow-up.",
    sortDate: 20260731,
    period: "Earlier",
  },
];

const sampleMeeting: Meeting = {
  id: "acme-demo",
  title: "Product demo follow-up",
  company: "Acme Co.",
  date: "Today",
  time: "11:30 AM",
  duration: "34 min",
  attendees: "Taylor Brooks, Jordan Lee",
  status: "Ready to review",
  summary: "A product demo with clear interest in team reporting, onboarding support, and a follow-up with the operations lead.",
  updates: ["3 suggested updates", "1 follow-up owner"],
  detail: "The customer wants to evaluate the reporting workflow with their operations team. FollowPilot prepared the next step, buyer notes, and a proposed follow-up date for review.",
  sortDate: 20260808,
  period: "This week",
};

const statusStyles: Record<Meeting["status"], string> = {
  "Needs decision": "border-amber-200 bg-amber-50 text-amber-800",
  "Ready to review": "border-blue-200 bg-blue-50 text-blue-800",
  Completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

function ClockIcon() {
  return <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="5.75" stroke="currentColor" strokeWidth="1.35" /><path d="M8 4.7V8l2.25 1.45" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function ChevronIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function UserRoundIcon() {
  return <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="5.15" r="2.45" stroke="currentColor" strokeWidth="1.35" /><path d="M3.35 13.1c.45-2.08 2.34-3.6 4.65-3.6s4.2 1.52 4.65 3.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" /></svg>;
}

function SearchIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="4.35" stroke="currentColor" strokeWidth="1.4" /><path d="m10.2 10.2 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>;
}

function MeetingCard({ meeting, isOpen, onToggle }: { meeting: Meeting; isOpen: boolean; onToggle: (open: boolean) => void }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#deddda] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.025)] transition hover:border-[#c9c8c5]">
      <button type="button" aria-expanded={isOpen} aria-controls={`meeting-panel-${meeting.id}`} onClick={() => onToggle(!isOpen)} className="grid w-full cursor-pointer gap-5 px-5 py-5 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[#e9e9e7] sm:grid-cols-[minmax(0,1fr)_auto] sm:px-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusStyles[meeting.status]}`}>{meeting.status}</span>
            <span className="text-xs text-[#787774]">{meeting.date} · {meeting.time}</span>
          </div>
          <h2 className="mt-3 text-lg font-semibold tracking-[-0.02em] text-[#191919] sm:text-xl">{meeting.company} <span className="font-normal text-[#9b9995]">/</span> {meeting.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#625f5c]">{meeting.summary}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#787774]">
            <span className="inline-flex items-center gap-1.5"><ClockIcon />{meeting.duration}</span>
            <span className="inline-flex items-center gap-1.5"><UserRoundIcon />{meeting.attendees}</span>
            {meeting.updates.map((update) => <span key={update} className="font-medium text-[#52504d]">{update}</span>)}
          </div>
        </div>
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center self-start rounded-lg border border-[#deddda] text-lg transition ${isOpen ? "rotate-45 border-[#191919] bg-[#191919] text-white" : "bg-[#fbfbfa] text-[#625f5c]"}`} aria-hidden="true">+</span>
      </button>
      <div id={`meeting-panel-${meeting.id}`} className={`grid overflow-hidden transition-[grid-template-rows] duration-200 ease-linear ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="min-h-0 overflow-hidden">
          <div className={`border-t border-[#ececea] bg-[#fafaf9] px-5 py-5 transition-opacity duration-150 ease-linear sm:px-6 ${isOpen ? "opacity-100" : "opacity-0"}`}>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div>
                <p className="text-[11px] font-bold tracking-[0.14em] text-[#787774] uppercase">Review snapshot</p>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[#52504d]">{meeting.detail}</p>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <button type="button" className="rounded-lg border border-[#deddda] bg-white px-3.5 py-2 text-[13px] font-medium text-[#52504d] transition hover:border-[#9b9995] hover:text-[#191919]">View transcript</button>
                <button type="button" className="rounded-lg bg-[#191919] px-3.5 py-2 text-[13px] font-medium text-white transition hover:bg-[#353535]">{meeting.status === "Completed" ? "View audit" : "Open review"} <span aria-hidden="true">→</span></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function MeetingsContent() {
  const isSampleView = useSearchParams().get("sample") === "1";
  const meetingSource = useMemo(() => isSampleView ? [sampleMeeting] : meetings, [isSampleView]);
  const [filter, setFilter] = useState<"all" | "needs-decision" | "completed">("all");
  const [sort, setSort] = useState<"recent" | "oldest" | "status">("recent");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [openMeetingId, setOpenMeetingId] = useState<string | null>(() => isSampleView ? sampleMeeting.id : "northstar");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const visibleMeetings = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filtered = meetingSource.filter((meeting) => {
      const matchesFilter = filter === "all" ? true : filter === "needs-decision" ? meeting.status === "Needs decision" : meeting.status === "Completed";
      const matchesSearch = !normalizedQuery || [meeting.company, meeting.title, meeting.attendees, meeting.summary].some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesFilter && matchesSearch;
    });
    const statusRank: Record<Meeting["status"], number> = { "Needs decision": 0, "Ready to review": 1, Completed: 2 };

    return [...filtered].sort((a, b) => {
      if (sort === "oldest") return a.sortDate - b.sortDate;
      if (sort === "status") return statusRank[a.status] - statusRank[b.status] || b.sortDate - a.sortDate;
      return b.sortDate - a.sortDate;
    });
  }, [filter, meetingSource, searchQuery, sort]);

  const filters: Array<{ key: typeof filter; label: string }> = [
    { key: "all", label: "All meetings" },
    { key: "needs-decision", label: "Needs decision" },
    { key: "completed", label: "Completed" },
  ];
  const sortOptions: Array<{ key: typeof sort; label: string }> = [
    { key: "recent", label: "Most recent" },
    { key: "oldest", label: "Oldest first" },
    { key: "status", label: "Status priority" },
  ];
  const activeSortLabel = sortOptions.find((option) => option.key === sort)?.label ?? "Most recent";
  const visiblePeriods = [...new Set(visibleMeetings.map((meeting) => meeting.period))];

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#191919]">
      <AppSidebar activePage="meetings" />

      <div className="lg:pl-60">
        <header className="flex h-14 items-center justify-between border-b border-[#e8e7e4] bg-[#fbfbfa] px-5 sm:px-7"><div><p className="text-sm font-medium">Meetings</p><p className="text-[11px] text-[#787774]">Fixture workspace</p></div><Link href="/" className="rounded-md bg-[#191919] px-3 py-2 text-[13px] font-medium text-white transition hover:bg-[#353535] lg:hidden">+ New</Link><div className="hidden items-center gap-2 sm:flex">{searchOpen ? <div className="flex items-center rounded-md border border-[#c9c8c5] bg-white px-3 text-[#625f5c] focus-within:border-[#191919] focus-within:ring-4 focus-within:ring-[#e9e9e7]"><SearchIcon /><input autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} aria-label="Search meetings" placeholder="Search meetings" className="h-9 w-64 bg-transparent px-2 text-[12px] text-[#191919] outline-none placeholder:text-[#9b9995]" /><button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(""); }} aria-label="Close search" className="grid h-6 w-6 place-items-center rounded text-[13px] hover:bg-[#efefed]">×</button></div> : <button type="button" onClick={() => setSearchOpen(true)} aria-label="Search meetings" className="grid h-8 w-8 place-items-center rounded-md text-[#625f5c] transition hover:bg-[#efefed] hover:text-[#191919] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#e9e9e7]"><SearchIcon /></button>}<div className="mx-1 h-6 w-px bg-[#e8e7e4]" /><span className="text-xs text-[#787774]">Alex Rivera</span><div className="grid h-7 w-7 place-items-center rounded-full bg-[#e8e7e4] text-[10px] font-semibold">AR</div></div></header>
        <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-14">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div><p className="text-xs font-semibold tracking-[0.14em] text-[#787774] uppercase">Review archive</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Every customer conversation,<br className="hidden sm:block" /> ready to pick back up.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[#625f5c]">Open a meeting to revisit its CRM decisions, evidence, and review outcome without reopening the whole workflow.</p></div>
            <div className="grid grid-cols-2 divide-x divide-[#deddda] rounded-xl border border-[#deddda] bg-white"><div className="px-4 py-3"><p className="text-2xl font-semibold">{visibleMeetings.length}</p><p className="mt-0.5 text-xs text-[#787774]">{isSampleView ? "sample meeting" : filter === "all" ? "past meetings" : "matching meetings"}</p></div><div className="px-4 py-3"><p className="text-2xl font-semibold text-amber-700">{meetingSource.filter((meeting) => meeting.status === "Needs decision").length}</p><p className="mt-0.5 text-xs text-[#787774]">needs decision</p></div></div>
          </div>
          <div className="mt-9 flex flex-col gap-3 border-y border-[#e8e7e4] py-3 sm:flex-row sm:items-center sm:justify-between"><div role="group" aria-label="Filter meetings" className="flex flex-wrap gap-2">{filters.map((item) => <button key={item.key} type="button" aria-pressed={filter === item.key} onClick={() => { setFilter(item.key); setOpenMeetingId(null); }} className={filter === item.key ? "rounded-md bg-[#191919] px-3 py-1.5 text-xs font-semibold text-white" : "rounded-md px-3 py-1.5 text-xs font-medium text-[#625f5c] transition hover:bg-[#ececea] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#e9e9e7]"}>{item.label}</button>)}</div><div className="relative"><button type="button" aria-haspopup="menu" aria-expanded={sortMenuOpen} aria-controls="meeting-sort-options" onClick={() => setSortMenuOpen((open) => !open)} className="flex items-center gap-2 rounded-md border border-[#deddda] bg-white px-3 py-1.5 text-xs font-medium text-[#52504d] transition hover:border-[#9b9995] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#e9e9e7]"><span className="text-[#787774]">Sort</span>{activeSortLabel}<ChevronIcon /></button>{sortMenuOpen && <div id="meeting-sort-options" role="menu" className="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-lg border border-[#deddda] bg-white p-1 shadow-lg">{sortOptions.map((option) => <button key={option.key} type="button" role="menuitemradio" aria-checked={sort === option.key} onClick={() => { setSort(option.key); setSortMenuOpen(false); setOpenMeetingId(null); }} className={sort === option.key ? "flex w-full items-center justify-between rounded-md bg-[#efefed] px-3 py-2 text-left text-xs font-semibold text-[#191919]" : "flex w-full items-center rounded-md px-3 py-2 text-left text-xs text-[#625f5c] hover:bg-[#f5f5f3]"}>{option.label}{sort === option.key && <span aria-hidden="true">✓</span>}</button>)}</div>}</div></div>
          <section aria-label="Past meetings" className="mt-5 space-y-5">{visibleMeetings.length ? visiblePeriods.map((period) => { const periodMeetings = visibleMeetings.filter((meeting) => meeting.period === period); return <div key={period} className="space-y-3"><p className="px-1 text-[10px] font-semibold tracking-[0.12em] text-[#787774] uppercase">{period}</p>{periodMeetings.map((meeting) => <MeetingCard key={meeting.id} meeting={meeting} isOpen={openMeetingId === meeting.id} onToggle={(open) => setOpenMeetingId(open ? meeting.id : null)} />)}</div>; }) : <div className="rounded-2xl border border-dashed border-[#c9c8c5] bg-white px-6 py-12 text-center"><p className="text-sm font-semibold text-[#191919]">No meetings match this filter or search.</p><button type="button" onClick={() => { setFilter("all"); setSearchQuery(""); }} className="mt-3 text-[13px] font-medium underline underline-offset-4">Clear filters</button></div>}</section>
        </main>
      </div>
    </div>
  );
}

export default function MeetingsPage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#f7f7f5]" />}><MeetingsContent /></Suspense>;
}
