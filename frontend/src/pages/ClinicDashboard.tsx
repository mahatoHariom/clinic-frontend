/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { api, FollowUp, Notification } from "../api";

const Container = styled.div`
  width: 100%; /* Full width of parent */
  max-width: 1200px; /* Keeps content readable on large screens */
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.h1`
  font-size: 2.5rem;
  color: #2c3e50;
  text-align: center;
`;

const Card = styled.div<{ isConcern?: boolean }>`
  background: ${(props) => (props.isConcern ? "#fff5f5" : "white")};
  border-radius: 12px;
  padding: 20px;
  margin: 15px 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Button = styled.button`
  background: #3498db;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  &:hover {
    background: #2980b9;
  }
`;

const Input = styled.input`
  padding: 12px;
  margin: 10px 10px 10px 0;
  border: 1px solid #ddd;
  border-radius: 8px;
  width: 200px;
`;

const NotificationBanner = styled.div`
  background: #e74c3c;
  color: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
`;

const ClinicDashboard: React.FC = () => {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newPatient, setNewPatient] = useState({ name: "", procedure: "" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [followUpsRes, notificationsRes] = await Promise.all([
        api.getFollowUps(),
        api.getNotifications(),
      ]);
      setFollowUps(followUpsRes.data);
      setNotifications(notificationsRes.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
    }
  };

  const addPatient = async () => {
    try {
      await api.addPatient(newPatient);
      setNewPatient({ name: "", procedure: "" });
      await fetchData();
    } catch (err) {
      setError("Failed to add patient.");
    }
  };

  return (
    <Container>
      <Header>Clinic Dashboard</Header>
      {error && (
        <p style={{ color: "#e74c3c", textAlign: "center" }}>{error}</p>
      )}
      {notifications.map((note) => (
        <NotificationBanner key={note.id}>
          {note.message} - {new Date(note.createdAt).toLocaleString()}
        </NotificationBanner>
      ))}
      <Card>
        <h3>Add New Patient</h3>
        <Input
          value={newPatient.name}
          onChange={(e) =>
            setNewPatient({ ...newPatient, name: e.target.value })
          }
          placeholder="Patient Name"
        />
        <Input
          value={newPatient.procedure}
          onChange={(e) =>
            setNewPatient({ ...newPatient, procedure: e.target.value })
          }
          placeholder="Procedure"
        />
        <Button onClick={addPatient}>Add Patient</Button>
      </Card>
      <h2>Follow-Ups</h2>
      {followUps.map((followUp) => (
        <Card key={followUp.id} isConcern={followUp.status === "CONCERN"}>
          <p>
            <strong>{followUp.patient.name}</strong> -{" "}
            {followUp.patient.procedure}
          </p>
          <p>Scheduled: {new Date(followUp.scheduledAt).toLocaleString()}</p>
          <p>Status: {followUp.status}</p>
          {followUp.response && <p>Response: {followUp.response}</p>}
          <a href={`/patient/${followUp.id}`}>Respond</a>
        </Card>
      ))}
    </Container>
  );
};

export default ClinicDashboard;
