"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AppSidebar } from "../components/app-sidebar";
import { useToast } from "../components/toast-provider";

function CheckIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m3.3 8.1 2.9 2.9 6.5-6.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function IntegrationsPage() {
  const { showToast } = useToast();
  const [connection, setConnection] = useState<{ configured: boolean; connected: boolean; portalId?: number | null; user?: string | null }>({ configured: true, connected: false });
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    let active = true;
    const loadConnection = async () => {
      try {
        const response = await fetch("/api/hubspot/status", { cache: "no-store" });
        const value = await response.json() as { configured: boolean; connected: boolean; portalId?: number | null; user?: string | null };
        if (active) setConnection(value);
      } catch {
        if (active) setConnection({ configured: true, connected: false });
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadConnection();

    const result = new URLSearchParams(window.location.search).get("hubspot");
    if (result === "connected") showToast("HubSpot connected");
    if (result === "error") showToast("HubSpot connection could not be completed", "error");
    if (result) window.history.replaceState(null, "", "/integrations");
    return () => { active = false; };
  }, [showToast]);

  const disconnect = async () => {
    setDisconnecting(true);
    try {
      await fetch("/api/hubspot/status", { method: "DELETE" });
      setConnection((current) => ({ ...current, connected: false, portalId: null, user: null }));
      showToast("HubSpot disconnected");
    } catch {
      showToast("HubSpot could not be disconnected", "error");
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#191919]">
      <AppSidebar activePage="integrations" />
      <div className="lg:pl-60">
        <header className="flex h-14 items-center justify-between border-b border-[#e8e7e4] bg-[#fbfbfa] px-5 sm:px-7">
          <div><p className="text-sm font-medium">Integrations</p><p className="text-[11px] text-[#787774]">Personal workspace</p></div>
          <div className="hidden items-center gap-3 sm:flex"><span className="text-xs text-[#787774]">Alex Rivera</span><div className="grid h-7 w-7 place-items-center rounded-full bg-[#e8e7e4] text-[10px] font-semibold">AR</div></div>
        </header>

        <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8 lg:py-14">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.14em] text-[#787774] uppercase">CRM connection</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Keep your customer context in sync.</h1>
            <p className="mt-3 text-sm leading-6 text-[#625f5c]">Connect the CRM where your team already works. FollowPilot will prepare changes from each meeting for your review before anything is updated.</p>
          </div>

          <section className="mt-10 overflow-hidden rounded-xl border border-[#deddda] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]" aria-labelledby="hubspot-heading">
            <div className="flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <Image src="/hubspot-logo.png" alt="HubSpot" width={128} height={40} className="h-10 w-32 shrink-0 object-contain" priority />
                <div>
                  <div className="flex flex-wrap items-center gap-2"><h2 id="hubspot-heading" className="text-lg font-semibold tracking-[-0.02em]">HubSpot</h2>{connection.connected && <span className="inline-flex items-center gap-1 rounded-full bg-[#ebf5ed] px-2 py-1 text-[11px] font-medium text-[#2e6b43]"><CheckIcon />Connected</span>}</div>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-[#625f5c]">Bring meeting context into your deals, contacts, and companies. Only reviewed changes are ready to send to HubSpot.</p>
                  {connection.connected && <p className="mt-2 text-xs text-[#787774]">Connected to portal {connection.portalId ?? "—"}{connection.user ? ` as ${connection.user}` : ""}.</p>}
                  {!loading && !connection.configured && <p className="mt-2 text-xs text-[#a8342a]">Add your HubSpot OAuth credentials to <code className="font-medium">.env.local</code> to enable connection.</p>}
                </div>
              </div>
              {connection.connected ? <button type="button" onClick={disconnect} disabled={disconnecting} className="shrink-0 rounded-md border border-[#deddda] bg-white px-3.5 py-2 text-[13px] font-medium text-[#52504d] transition hover:border-[#9b9995] hover:text-[#191919] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#e9e9e7] disabled:cursor-not-allowed disabled:opacity-50">{disconnecting ? "Disconnecting…" : "Disconnect"}</button> : <button type="button" onClick={() => { window.location.assign("/api/hubspot/connect"); }} disabled={loading || !connection.configured} className="shrink-0 rounded-md bg-[#191919] px-3.5 py-2 text-[13px] font-medium text-white transition hover:bg-[#353535] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d9d9d7] disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Checking…" : "Connect HubSpot"}</button>}
            </div>

            <div className="border-t border-[#ececea] bg-[#fafaf9] px-5 py-5 sm:px-7">
              <p className="text-[11px] font-semibold tracking-[0.12em] text-[#787774] uppercase">What FollowPilot can prepare</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  ["Deals", "Stage, amount, close date, and next steps."],
                  ["Contacts", "Meeting notes and agreed follow-ups."],
                  ["Companies", "Customer context from each conversation."],
                ].map(([title, description]) => <div key={title} className="rounded-lg border border-[#ececea] bg-white p-4"><p className="text-[13px] font-medium">{title}</p><p className="mt-1 text-xs leading-5 text-[#787774]">{description}</p></div>)}
              </div>
            </div>
          </section>

          <p className="mt-5 text-xs leading-5 whitespace-nowrap text-[#787774]">FollowPilot never applies changes automatically. Every proposed update stays in your review queue until you approve it.</p>
        </main>
      </div>
    </div>
  );
}
