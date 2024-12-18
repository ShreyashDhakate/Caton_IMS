import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useToast } from "./ui/sonner";
import { searchDoctorMedicines, syncDoctorMedicinesFromMongoDB } from "../lib/doctorstock";

interface MedicineInfo {
  id: string;
  name: string;
  batchNumber: string;
  quantity: number;
  sellingPrice: number;
  expiryDate: string;
  purchasePrice: number;
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
  const { addToast } = useToast();
  useEffect(() => {
    const fetchData = async () => {
      try {
        await syncDoctorMedicinesFromMongoDB();
        console.log("Doctor's IndexedDB synced with MongoDB.");
      } catch (error) {
        console.error("Error syncing data to IndexedDB:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3600000);

    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPatient((prev) => ({ ...prev, [name]: value }));
  };


  const handleSearchMedicine = async (query: string) => {
    try {
      const results = await searchDoctorMedicines(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching medicines:", error);
      addToast("Failed to search medicines locally.","error");
    }
  };

  const handleMedicineSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setMedicineSearch(query);

    if (query.length > 0) {
      handleSearchMedicine(query);
    } else {
      setSearchResults([]);
    }
  };

  const handleAddMedicine = (medicine: MedicineInfo) => {
    setSelectedMedicines((prev) => {
      const existingMedicine = prev.find((item) => item.id === medicine.id);

      if (existingMedicine) {
        return prev.map((item) =>
          item.id === medicine.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...medicine, quantity: 1 }];
    });
  };

  const handleRemoveMedicine = (index: number) => {
    setSelectedMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      addToast("Quantity must be at least 1.","info");
      return;
    }

    const originalMedicine = searchResults.find((medicine) => medicine.id === id);
    if (!originalMedicine) {
      addToast("Medicine not found in search results.","error");
      return;
    }

    if (newQuantity > originalMedicine.quantity) {
      addToast(`Entered quantity (${newQuantity}) exceeds available stock (${originalMedicine.quantity}).`,'error');
      return;
    }

    setSelectedMedicines((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
    );
  };

  const handleSaveAppointment = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        addToast("User ID is missing. Please log in again.","info");
        return;
      }

      if (!patient.name || !patient.mobile) {
        addToast("Patient name and mobile number are required.","info");
        return;
      }

      if (selectedMedicines.length === 0) {
        addToast("Please select at least one medicine.","info");
        return;
      }

      await invoke("save_appointment", {
        patientName: patient.name,
        mobile: patient.mobile,
        disease: patient.disease || null,
        precautions: patient.precautions || null,
        medicines: selectedMedicines.map(({ id, quantity }) => ({ id, quantity })),
        hospitalId: userId,
      });

      addToast("Appointment saved successfully!","success");
      setPatient({ name: "", mobile: "", disease: "", precautions: "" });
      setSelectedMedicines([]);
      setMedicineSearch("");
      setSearchResults([]);
    } catch (error: any) {
      addToast(`Failed to save appointment: ${error.message}`,"error");
      console.error("Error saving appointment:", error);
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-gray-100 p-2 min-h-screen">
      {/* Two Sections Container */}
      <div className="flex gap-4 p-2">
        {/* Patient Details Section - Left */}
        <div className="bg-white shadow-lg p-6 rounded-lg w-full md:w-1/2 h-[70vh] overflow-auto">
          <h2 className="text-xl font-semibold mb-4">Patient Details</h2>
          <input
            placeholder="Patient Name"
            name="name"
            value={patient.name}
            onChange={handleInputChange}
            className="w-full mb-3 p-2 border rounded"
          />
          <input
            placeholder="Mobile Number"
            name="mobile"
            value={patient.mobile}
            onChange={handleInputChange}
            className="w-full mb-3 p-2 border rounded"
          />
          <input
            placeholder="Disease"
            name="disease"
            value={patient.disease}
            onChange={handleInputChange}
            className="w-full mb-3 p-2 border rounded"
          />
          <textarea
            placeholder="Precautions"
            name="precautions"
            value={patient.precautions}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            rows={4}
          />
        </div>
  
        {/* Medicine Search Section - Right */}
        <div className="bg-white shadow-lg p-6 rounded-lg w-full md:w-1/2 h-[70vh] overflow-auto">
          <h2 className="text-xl font-semibold mb-4">Search Medicines</h2>
          <input
            placeholder="Search for Medicines"
            value={medicineSearch}
            onChange={handleMedicineSearchChange}
            className="w-full mb-4 p-2 border rounded"
          />
  
          {/* Medicine Results */}
          {searchResults.length > 0 && (
            <div>
              {searchResults.map((medicine) => (
                <div
                  key={medicine.id}
                  className="flex justify-between items-center border-b py-2 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleAddMedicine(medicine)}
                >
                  <span>
                    {medicine.name} | Batch: {medicine.batchNumber} | Qty: {medicine.quantity} | Price: ₹{medicine.sellingPrice} | Exp: {medicine.expiryDate}
                  </span>
                </div>
              ))}
            </div>
          )}
  
          {/* Selected Medicines */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Selected Medicines:</h3>
            {selectedMedicines.map((medicine, index) => (
              <div key={index} className="flex justify-between items-center mb-2">
                <span>{medicine.name} (Batch: {medicine.batchNumber})</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={medicine.quantity}
                    onChange={(e) =>
                      handleQuantityChange(medicine.id, parseInt(e.target.value) || 1)
                    }
                    className="w-16 p-1 border rounded"
                  />
                  <button
                    onClick={() => handleRemoveMedicine(index)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
  
      {/* Save Button */}
      <div className="flex justify-center mt-4">
        <button
          onClick={handleSaveAppointment}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
        >
          Save Appointment
        </button>
      </div>
    </div>
  );
}  

export default Appointment;
