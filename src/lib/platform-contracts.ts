/** Public API types only. Never import server/database modules into client components. */
export type MembershipStatus = "pending" | "active" | "suspended";
export type PublicationStatus = "draft" | "published" | "cancelled";
export type RegistrationStatus = "open" | "closed";
export interface Member {
  id: string; name: string; email: string; status: MembershipStatus;
  academicYear: string; major: string; interests: string[]; createdAt: string;
}
export interface MemberInput { name: string; academicYear: string; major: string; interests: string[] }
export interface PlatformEvent {
  id: string; title: string; description: string; location: string; category: string;
  timingLabel: string; startsAt: string | null; endsAt: string | null;
  publicationStatus: PublicationStatus; registrationStatus: RegistrationStatus;
  registrationOpensAt: string | null; registrationClosesAt: string | null;
  capacity: number | null; registeredCount: number; attendanceCount?: number;
  version: number;
}
export type EventInput = Omit<PlatformEvent, "id" | "registeredCount" | "attendanceCount" | "version">;
export type EventUpdateInput = EventInput & { expectedVersion: number };
export const AUDIT_ACTIONS = ["event.created", "event.updated", "member.status_changed", "attendance.recorded", "attendance.exported"] as const;
export type AuditAction = typeof AUDIT_ACTIONS[number];
export interface AuditEntry {
  id: string; actorUserId: string; action: AuditAction; targetId: string;
  requestId: string; details: Record<string, string | number | null>; createdAt: string;
}
export interface Registration {
  id: string; eventId: string; memberId: string; status: "registered" | "cancelled";
  createdAt: string; checkedInAt: string | null; event?: PlatformEvent;
  member?: Pick<Member, "name" | "email">;
}
export interface Page<T> { items: T[]; page: number; pageSize: number; total: number }
export interface MemberHome { member: Member | null; isOfficer: boolean; membershipApprovalEnabled: boolean }
export interface Ticket { token: string; expiresAt: string; registrationId: string; eventId: string }
export interface Analytics {
  totalMembers: number; pendingMembers: number; activeMembers: number;
  growth: { month: string; count: number }[];
  interests: { interest: string; count: number }[];
  events: { id: string; title: string; registered: number; attended: number; attendanceRate: number }[];
}
export interface ApiError { error: { code: string; message: string; requestId: string } }
export const ACADEMIC_YEARS = ["First year", "Second year", "Third year", "Fourth year or later", "Graduate student", "Other", "Prefer not to say"];
export const MEMBER_INTERESTS = ["Mentorship", "Community service", "Medical Spanish", "Research", "Pre-health workshops", "Community and culture"];
