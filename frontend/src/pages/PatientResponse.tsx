/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { api } from "../api";

const FormContainer = styled.div`
  width: 100%; /* Full width of parent */
  max-width: 600px; /* Limits width for readability */
  margin: 50px auto;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  color: #2c3e50;
  text-align: center;
`;

const Button = styled.button<{ color?: string }>`
  background: ${(props) => props.color || "#2ecc71"};
  color: white;
  padding: 12px 25px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  &:hover {
    background: ${(props) => (props.color ? "#c0392b" : "#27ae60")};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  margin: 15px 0;
  border: 1px solid #ddd;
  border-radius: 8px;
`;

const PatientResponse: React.FC = () => {
  const { followUpId } = useParams<{ followUpId: string }>();
  const navigate = useNavigate();
  const [response, setResponse] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitResponse = async (status: "HEALTHY" | "CONCERN") => {
    try {
      if (!followUpId) throw new Error("Invalid follow-up ID");
      await api.respondToFollowUp({
        followUpId,
        status,
        response: status === "CONCERN" ? response : undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setError("Failed to submit response. Please try again.");
    }
  };

  if (submitted) {
    return (
      <FormContainer>
        <Title>Thank you for your response!</Title>
        <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
      </FormContainer>
    );
  }

  return (
    <FormContainer>
      <Title>How is your pet doing?</Title>
      {error && <p style={{ color: "#e74c3c" }}>{error}</p>}
      <Button onClick={() => submitResponse("HEALTHY")}>Healthy</Button>
      <TextArea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        placeholder="Describe your concern..."
      />
      <Button color="#e74c3c" onClick={() => submitResponse("CONCERN")}>
        Report Concern
      </Button>
    </FormContainer>
  );
};

export default PatientResponse;
