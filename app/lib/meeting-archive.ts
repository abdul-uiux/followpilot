export type ArchivedMeeting = {
  id: string;
  title: string;
  company: string;
  date: string;
  time: string;
  duration: string;
  attendees: string;
  status: "Completed";
  summary: string;
  updates: string[];
  detail: string;
  audit: Array<{ event: string; detail: string; result: string; time: string }>;
  changes?: Array<{ field: string; before: string; after: string }>;
  sortDate: number;
  period: "This week" | "Earlier";
};

const archiveKey = "followpilot:meeting-archive";
export const meetingArchiveEvent = "followpilot:meeting-archive-updated";

export function readMeetingArchive(): ArchivedMeeting[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(archiveKey) ?? "[]") as unknown;
    return Array.isArray(value) ? value as ArchivedMeeting[] : [];
  } catch {
    return [];
  }
}

export function saveArchivedMeeting(meeting: ArchivedMeeting) {
  const next = [meeting, ...readMeetingArchive().filter((item) => item.id !== meeting.id)];
  window.localStorage.setItem(archiveKey, JSON.stringify(next));
  window.dispatchEvent(new Event(meetingArchiveEvent));
}

export function deleteArchivedMeeting(meetingId: string) {
  const next = readMeetingArchive().filter((item) => item.id !== meetingId);
  window.localStorage.setItem(archiveKey, JSON.stringify(next));
  window.dispatchEvent(new Event(meetingArchiveEvent));
}
