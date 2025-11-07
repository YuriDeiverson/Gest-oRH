// Enums para manter type-safety (SQLite não suporta enums nativos)

export enum IntentionStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum ReferralStatus {
  NEW = "NEW",
  IN_CONTACT = "IN_CONTACT",
  NEGOTIATING = "NEGOTIATING",
  CLOSED = "CLOSED",
  REJECTED = "REJECTED",
}

export enum AnnouncementPriority {
  LOW = "LOW",
  NORMAL = "NORMAL",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED",
}
