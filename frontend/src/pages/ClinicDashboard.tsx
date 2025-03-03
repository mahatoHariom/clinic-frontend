/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { api, FollowUp, Notification } from "../api";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.h1`
  font-size: 2.5rem;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 20px;
`;

const Card = styled.div<{ isConcern?: boolean }>`
  background: ${(props) => (props.isConcern ? "#fff5f5" : "white")};
  border-radius: 12px;
  padding: 20px;
  margin: 15px 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-5px);
  }
`;

const Button = styled.button`
  background: #3498db;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s;
  &:hover {
    background: #2980b9;
  }
`;

const Input = styled.input`
  padding: 12px;
  margin: 10px 10px 10px 0;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
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
  align-items: center;
`;

const DismissButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
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
      setError("Failed to fetch data");
    }
  };

  const addPatient = async () => {
    try {
      await api.addPatient(newPatient);
      setNewPatient({ name: "", procedure: "" });
      fetchData();
      setError(null);
    } catch (err) {
      setError("Failed to add patient");
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <Container
      style={{
        width: "100%",
      }}
    >
      <Header>Clinic Dashboard</Header>
      {error && (
        <p style={{ color: "#e74c3c", textAlign: "center" }}>{error}</p>
      )}
      {notifications.length > 0 && (
        <div>
          <h3 style={{ color: "#2c3e50" }}>Urgent Notifications</h3>
          {notifications.map((note) => (
            <NotificationBanner key={note.id}>
              {note.message} - {new Date(note.createdAt).toLocaleString()}
              <DismissButton onClick={() => dismissNotification(note.id)}>
                ✖
              </DismissButton>
            </NotificationBanner>
          ))}
        </div>
      )}
      <Card>
        <h3 style={{ color: "#34495e" }}>Add New Patient</h3>
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
      <h2 style={{ color: "#2c3e50", marginTop: "30px" }}>Follow-Ups</h2>
      {followUps.map((followUp) => (
        <Card key={followUp.id} isConcern={followUp.status === "CONCERN"}>
          <p style={{ fontSize: "1.1rem", color: "#34495e" }}>
            <strong>{followUp.patient.name}</strong> -{" "}
            {followUp.patient.procedure}
          </p>
          <p>Scheduled: {new Date(followUp.scheduledAt).toLocaleString()}</p>
          <p>
            Status:{" "}
            <span
              style={{
                color: followUp.status === "CONCERN" ? "#e74c3c" : "#27ae60",
              }}
            >
              {followUp.status}
            </span>
          </p>
          {followUp.response && <p>Response: {followUp.response}</p>}
          <a
            href={`/patient/${followUp.id}`}
            style={{ color: "#3498db", textDecoration: "none" }}
          >
            Respond
          </a>
        </Card>
      ))}
    </Container>
  );
};

export default ClinicDashboard;
