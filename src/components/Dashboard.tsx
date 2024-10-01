// src/components/Dashboard.tsx
import React, { useState } from 'react';
import { Button, Typography, Box, CircularProgress } from '@mui/material';
import PatientPopup from './PatientPopup';

const Dashboard: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Sample patient data
  const patients = [
    { id: 1, name: 'John Doe', age: 30, gender: 'Male' },
    { id: 2, name: 'Jane Smith', age: 25, gender: 'Female' },
    
  ];

  const handlePatientClick = (patient: any) => {
    setSelectedPatient(patient);
  };

  const closePopup = () => {
    setSelectedPatient(null);
  };

  return (
    <Box className="p-4">
      <Typography variant="h4" gutterBottom>
        Patient Dashboard
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Box>
          {patients.map((patient) => (
            <Box key={patient.id} className="flex justify-between p-2 border-b">
              <Typography>{patient.name}</Typography>
              <Button variant="contained" onClick={() => handlePatientClick(patient)}>
                View Details
              </Button>
            </Box>
          ))}
        </Box>
      )}
      {selectedPatient && <PatientPopup patient={selectedPatient} onClose={closePopup} />}
    </Box>
  );
};

export default Dashboard;
