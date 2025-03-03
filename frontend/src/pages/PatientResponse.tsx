/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { api } from "../api";

const FormContainer = styled.div`
  //   max-width: 600px;
  width: 100%;
  margin: 50px auto;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  color: #2c3e50;
  text-align: center;
  margin-bottom: 20px;
`;

const Button = styled.button<{ color?: string }>`
  background: ${(props) => props.color || "#2ecc71"};
  color: white;
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  margin: 10px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s;
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
  font-size: 1rem;
  resize: vertical;
`;

const ErrorMessage = styled.p`
  color: #e74c3c;
  text-align: center;
`;

const PatientResponse: React.FC = () => {
  const { followUpId } = useParams<{ followUpId: string }>();
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
      setError(null);
    } catch (err) {
      setError("Failed to submit response");
    }
  };

  if (submitted) {
    return (
      <FormContainer>
        <Title>Thank you for your response!</Title>
        <p style={{ textAlign: "center", color: "#7f8c8d" }}>
          Your feedback has been recorded.
        </p>
      </FormContainer>
    );
  }

  return (
    <FormContainer>
      <Title>How is your pet doing?</Title>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <Button onClick={() => submitResponse("HEALTHY")}>Healthy</Button>
      <div>
        <TextArea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Describe your concern..."
          rows={5}
        />
        <Button color="#e74c3c" onClick={() => submitResponse("CONCERN")}>
          Report Concern
        </Button>
      </div>
    </FormContainer>
  );
};

export default PatientResponse;
