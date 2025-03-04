import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import styled from "styled-components";
import ClinicDashboard from "./pages/ClinicDashboard";
import PatientResponse from "./pages/PatientResponse";

const AppContainer = styled.div`
  font-family: "Roboto", sans-serif;
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f4f8 0%, #e1e8ed 100%);
  width: 100vw; /* Full viewport width */
  padding: 20px;
  box-sizing: border-box; /* Ensures padding doesn't overflow */
`;
const App: React.FC = () => {
  return (
    <AppContainer>
      <Router>
        <Routes>
          <Route path="/" element={<ClinicDashboard />} />
          <Route path="/patient/:followUpId" element={<PatientResponse />} />
        </Routes>
      </Router>
    </AppContainer>
  );
};

export default App;
