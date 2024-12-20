import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { TextField, Button, Box, Typography } from "@mui/material";
import { toast } from "sonner";

interface BackendMedicine {
  _id?: { $oid: string };
  name: string;
  batch_number: string;
  expiry_date: string;
  quantity: number;
  purchase_price: number;
  selling_price: number;
}

interface MedicineInfo {
  id: string; // Added ID field
  name: string;
  batchNumber: string;
  quantity: number;
  sellingPrice: number;
  expiryDate: string;
}

const Appointment: React.FC = () => {
  const [patient, setPatient] = useState({
    name: "",
    mobile: "",
    disease: "",
    precautions: "",
  });

  const [medicineSearch, setMedicineSearch] = useState("");
  const [searchResults, setSearchResults] = useState<MedicineInfo[]>([]);
  const [selectedMedicines, setSelectedMedicines] = useState<MedicineInfo[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPatient((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchMedicine = async (query: string) => {
    try {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      const userId = localStorage.getItem("userId");
      const results: BackendMedicine[] = await invoke("search_medicines", {
        query,
        hospitalId: userId,
      });

      const mappedResults: MedicineInfo[] = results.map((medicine) => ({
        id: medicine._id?.$oid || "", // Extracting the ID
        name: medicine.name,
        batchNumber: medicine.batch_number,
        quantity: medicine.quantity,
        sellingPrice: medicine.selling_price,
        expiryDate: medicine.expiry_date,
      }));

      setSearchResults(mappedResults);
    } catch (error) {
      console.error("Error searching medicines:", error);
      toast.error("Failed to fetch search results.");
    }
  };

  const handleMedicineSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setMedicineSearch(query);

    if (query.length > 2) {
      handleSearchMedicine(query);
    } else {
      setSearchResults([]);
    }
  };

  const handleAddMedicine = (medicine: MedicineInfo) => {
    if (!selectedMedicines.find((item) => item.id === medicine.id)) {
      setSelectedMedicines((prev) => [...prev, { ...medicine, quantity: 1 }]);
    }
  };

  const handleRemoveMedicine = (index: number) => {
    setSelectedMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      toast.error("Quantity must be at least 1.");
      return;
    }
  
    // Find the original medicine in the search results
    const originalMedicine = searchResults.find((medicine) => medicine.id === id);
  
    if (!originalMedicine) {
      toast.error("Medicine not found in search results.");
      return;
    }
  
    if (newQuantity > originalMedicine.quantity) {
      toast.error(
        `Entered quantity (${newQuantity}) exceeds available stock (${originalMedicine.quantity}).`
      );
      return;
    }
  
    setSelectedMedicines((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };
  

  const handleSaveAppointment = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast.error("User ID is missing. Please log in again.");
        return;
      }

      if (!patient.name || !patient.mobile) {
        toast.error("Patient name and mobile number are required.");
        return;
      }

      if (selectedMedicines.length === 0) {
        toast.error("Please select at least one medicine.");
        return;
      }

      await invoke("save_appointment", {
        patientName: patient.name,
        mobile: patient.mobile,
        disease: patient.disease || null,
        precautions: patient.precautions || null,
        medicines: selectedMedicines.map(({ id, quantity }) => ({
          id,
          quantity,
        })), // Saving only ID and quantity
        hospitalId: userId,
      });

      toast.success("Appointment saved successfully!");
      setPatient({ name: "", mobile: "", disease: "", precautions: "" });
      setSelectedMedicines([]);
      setMedicineSearch("");
      setSearchResults([]);
    } catch (error: any) {
      toast.error(`Failed to save appointment: ${error.message}`);
      console.error("Error saving appointment:", error);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between bg-gray-100 p-5 h-[70vh]">
      {/* Patient Details Section */}
      <Box className="flex flex-col justify-between w-[50%] h-[70vh] bg-white p-6 shadow-lg rounded-lg">
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
      <Box className="flex flex-col w-[48%] h-[70vh] bg-white p-6 shadow-lg rounded-lg">
        <Typography variant="h5" className="mb-6 font-semibold">
          Search Medicines
        </Typography>
        <TextField
          label="Search for Medicines"
          variant="outlined"
          value={medicineSearch}
          onChange={handleMedicineSearchChange}
          className="mb-4"
          fullWidth
        />
        <Box className="mb-4">
          {searchResults.map((medicine, index) => (
            <Box
              key={index}
              className="flex items-center justify-between border-b py-2 cursor-pointer hover:bg-gray-200"
              onClick={() => handleAddMedicine(medicine)}
            >
              <Typography variant="body2" className="flex-1">
                {medicine.name} | Batch: {medicine.batchNumber} | Qty:{" "}
                {medicine.quantity} | Price: ₹{medicine.sellingPrice} | Exp:{" "}
                {medicine.expiryDate}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box>
          <Typography variant="subtitle1" className="mt-4 mb-2">
            Selected Medicines:
          </Typography>
          <ul>
            {selectedMedicines.map((medicine, index) => (
              <li key={index} className="flex items-center justify-between mb-2">
                <span>
                  {medicine.name} (Batch: {medicine.batchNumber})
                </span>
                <Box className="flex items-center">
                  <TextField
                    type="number"
                    variant="outlined"
                    size="small"
                    value={medicine.quantity}
                    onChange={(e) =>
                      handleQuantityChange(
                        medicine.id,
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="w-20 mr-4"
                  />
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    onClick={() => handleRemoveMedicine(index)}
                  >
                    Remove
                  </Button>
                </Box>
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
