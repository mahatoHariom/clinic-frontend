export interface Patient {
  id: string;
  name: string;
  procedure: string;
  ownerEmail: string;
  createdAt: string;
}

export interface FollowUp {
  id: string;
  patientId: string;
  patient: Patient;
  scheduledAt: string;
  status: "pending" | "healthy" | "concern";
  response?: string;
  notified: boolean;
}
