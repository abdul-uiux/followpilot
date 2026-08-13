import AuditClient from "./audit-client";

export default async function MeetingAuditPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  return <AuditClient meetingId={id ?? null} />;
}
