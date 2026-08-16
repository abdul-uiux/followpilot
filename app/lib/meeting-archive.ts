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
  saveLocalArchive(next);
}

export function deleteArchivedMeeting(meetingId: string) {
  const next = readMeetingArchive().filter((item) => item.id !== meetingId);
  saveLocalArchive(next);
}

function saveLocalArchive(meetings: ArchivedMeeting[]) {
  window.localStorage.setItem(archiveKey, JSON.stringify(meetings));
  window.dispatchEvent(new Event(meetingArchiveEvent));
}

function asArchivedMeeting(id: string, value: Record<string, unknown>): ArchivedMeeting | null {
  if (typeof value.title !== "string" || typeof value.company !== "string" || typeof value.sortDate !== "number") return null;
  return {
    id,
    title: value.title,
    company: value.company,
    date: typeof value.date === "string" ? value.date : "",
    time: typeof value.time === "string" ? value.time : "",
    duration: typeof value.duration === "string" ? value.duration : "Completed review",
    attendees: typeof value.attendees === "string" ? value.attendees : "",
    status: "Completed",
    summary: typeof value.summary === "string" ? value.summary : "",
    updates: Array.isArray(value.updates) ? value.updates.filter((item): item is string => typeof item === "string") : [],
    detail: typeof value.detail === "string" ? value.detail : "",
    audit: Array.isArray(value.audit) ? value.audit.filter((item): item is ArchivedMeeting["audit"][number] => Boolean(item) && typeof item === "object" && typeof (item as Record<string, unknown>).event === "string" && typeof (item as Record<string, unknown>).detail === "string" && typeof (item as Record<string, unknown>).result === "string" && typeof (item as Record<string, unknown>).time === "string") : [],
    changes: Array.isArray(value.changes) ? value.changes.filter((item): item is NonNullable<ArchivedMeeting["changes"]>[number] => Boolean(item) && typeof item === "object" && typeof (item as Record<string, unknown>).field === "string" && typeof (item as Record<string, unknown>).before === "string" && typeof (item as Record<string, unknown>).after === "string") : [],
    sortDate: value.sortDate,
    period: value.period === "Earlier" ? "Earlier" : "This week",
  };
}

/** Load one signed-in user's durable meeting history and refresh the local cache. */
export async function syncArchivedMeetings(userId: string) {
  if (!firebaseDb || !userId) return readMeetingArchive();
  const meetingsRef = collection(firebaseDb, "users", userId, "meetings");
  const snapshot = await getDocs(query(meetingsRef, orderBy("sortDate", "desc")));
  let meetings = snapshot.docs.map((item) => asArchivedMeeting(item.id, item.data())).filter((item): item is ArchivedMeeting => item !== null);

  // Preserve reviews made before Firestore was enabled by migrating this
  // browser's local archive the first time its cloud archive is empty.
  if (!meetings.length) {
    const localMeetings = readMeetingArchive();
    if (localMeetings.length) {
      await Promise.all(localMeetings.map((meeting) => setDoc(doc(meetingsRef, meeting.id), meeting)));
      meetings = localMeetings;
    }
  }

  saveLocalArchive(meetings);
  return meetings;
}

/** Save locally immediately, then persist the same audit record for this user. */
export async function persistArchivedMeeting(userId: string, meeting: ArchivedMeeting) {
  saveArchivedMeeting(meeting);
  if (!firebaseDb || !userId) return;
  await setDoc(doc(firebaseDb, "users", userId, "meetings", meeting.id), meeting);
}

/** Remove only FollowPilot's copy; CRM changes in HubSpot remain untouched. */
export async function removeArchivedMeeting(userId: string, meetingId: string) {
  deleteArchivedMeeting(meetingId);
  if (!firebaseDb || !userId) return;
  await deleteDoc(doc(firebaseDb, "users", userId, "meetings", meetingId));
}
import { collection, deleteDoc, doc, getDocs, orderBy, query, setDoc } from "firebase/firestore";
import { firebaseDb } from "./firebase";
