import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { TextField, Button, Box, Typography } from '@mui/material';
import { toast } from 'sonner';

const Appointment: React.FC = () => {
  const [patient, setPatient] = useState({
    name: '',
    mobile: '',
    disease: '',
    precautions: '',
  });

  const [medicineSearch, setMedicineSearch] = useState('');
  const [medicineList, setMedicineList] = useState<string[]>([]);
  const [selectedMedicines, setSelectedMedicines] = useState<
    { name: string; quantity: number }[]
  >([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPatient((prev) => ({ ...prev, [name]: value }));
  };

  const handleMedicineSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMedicineSearch(e.target.value);
    if (e.target.value.length > 2) {
      setMedicineList(['Paracetamol', 'Ibuprofen', 'Cough Syrup']);
    } else {
      setMedicineList([]);
    }
  };

  const handleAddMedicine = (medicine: string) => {
    if (!selectedMedicines.find((item) => item.name === medicine)) {
      setSelectedMedicines((prev) => [...prev, { name: medicine, quantity: 1 }]);
    }
  };

  const handleQuantityChange = (
    medicine: string,
    quantity: number
  ) => {
    setSelectedMedicines((prev) =>
      prev.map((item) =>
        item.name === medicine ? { ...item, quantity } : item
      )
    );
  };

  const handleSaveAppointment = async () => {
    try {
      const appointmentData = {
        patient,
        medicines: selectedMedicines,
      };

      await invoke('save_appointment', { data: appointmentData });

      toast.success('Appointment saved successfully!');
      setPatient({ name: '', mobile: '', disease: '', precautions: '' });
      setSelectedMedicines([]);
      setMedicineSearch('');
      setMedicineList([]);
    } catch (error) {
      toast.error('Failed to save appointment. Please try again.');
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between bg-gray-100  p-5 h-[70vh]">
      {/* Patient Details Section */}
      <Box
        className="flex flex-col justify-between w-[50%] h-[70vh] bg-white p-6 shadow-lg rounded-lg"
      >
        <Typography variant="h5" className="mb-6 font-semibold">
          Patient Details
        </Typography>
        <TextField
          label="Patient Name"
          variant="outlined"
          name="name"
          value={patient.name}
          onChange={handleInputChange}
          className="mb-4"
          fullWidth
        />
        <TextField
          label="Mobile Number"
          variant="outlined"
          name="mobile"
          value={patient.mobile}
          onChange={handleInputChange}
          className="mb-4"
          fullWidth
        />
        <TextField
          label="Disease"
          variant="outlined"
          name="disease"
          value={patient.disease}
          onChange={handleInputChange}
          className="mb-4"
          fullWidth
        />
        <TextField
          label="Precautions"
          variant="outlined"
          name="precautions"
          value={patient.precautions}
          onChange={handleInputChange}
          className="mb-4"
          fullWidth
          multiline
          rows={4}
        />
      </Box>

      {/* Medicine Search Section */}
      <Box
        className="flex flex-col w-[48%] h-[70vh] bg-white p-6 shadow-lg rounded-lg"
      >
        <Typography variant="h5" className="mb-6 font-semibold">
          Search Medicines
        </Typography>
        <TextField
          label="Search for Medicines"
          variant="outlined"
          value={medicineSearch}
          onChange={handleMedicineSearch}
          className="mb-4"
          fullWidth
        />
        <Box>
          {medicineList.map((medicine) => (
            <Button
              key={medicine}
              variant="outlined"
              onClick={() => handleAddMedicine(medicine)}
              className="mr-2 mb-2"
            >
              {medicine}
            </Button>
          ))}
        </Box>
        <Box>
          <Typography variant="subtitle1" className="mt-4 mb-2">
            Selected Medicines:
          </Typography>
          <ul>
            {selectedMedicines.map((medicine, index) => (
              <li key={index} className="flex items-center justify-between">
                <span>{medicine.name}</span>
                <TextField
                  type="number"
                  variant="outlined"
                  size="small"
                  value={medicine.quantity}
                  onChange={(e) =>
                    handleQuantityChange(
                      medicine.name,
                      parseInt(e.target.value) || 1
                    )
                  }
                  className="w-20 ml-4"
                />
              </li>
            ))}
          </ul>
        </Box>
      </Box>

      {/* Save Button */}
      <Box className="flex justify-center items-center w-full mt-12">
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveAppointment}
          className="px-8"
        >
          Save Appointment
        </Button>
      </Box>
    </div>
  );
};

export default Appointment;
