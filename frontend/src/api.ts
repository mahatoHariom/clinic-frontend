import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "clinic-clbd.vercel.app/api";

export interface Patient {
  id: string;
  name: string;
  procedure: string;
  followUps: FollowUp[];
}

export interface FollowUp {
  id: string;
  patientId: string;
  scheduledAt: string;
  status: "PENDING" | "HEALTHY" | "CONCERN";
  response?: string;
  patient: Patient;
}

export interface Notification {
  id: string;
  message: string;
  followUpId: string;
  createdAt: string;
}

export const api = {
  addPatient: (data: { name: string; procedure: string }) =>
    axios.post<Patient>(`${API_URL}/patients`, data),
  getFollowUps: () => axios.get<FollowUp[]>(`${API_URL}/follow-ups`),
  respondToFollowUp: (data: {
    followUpId: string;
    status: "HEALTHY" | "CONCERN";
    response?: string;
  }) => axios.post<FollowUp>(`${API_URL}/respond`, data),
  getNotifications: () => axios.get<Notification[]>(`${API_URL}/notifications`),
};
