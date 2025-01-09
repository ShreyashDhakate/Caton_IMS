import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useToast } from "./ui/sonner";
import {
  saveAppointmentToIndexedDB,
  searchAppointmentsByPatientName,
  searchDoctorMedicines,
  syncDoctorMedicinesFromMongoDB,
} from "../lib/doctorstock";

interface MedicineInfo {
  id: string;
  name: string;
  batchNumber: string;
  quantity: number;
  sellingPrice: number;
  expiryDate: string;
  purchasePrice: number;
}

interface Patient {
  id: string; // Unique ID for the patient
  name: string;
  age: number;
  gender: string;
  appointments: Appointment[]; // List of appointments
}

export interface Appointment {
  id: string;
  patientName: string;
  // mobile: string;
  age: number;
  gender: string;
  // address: string;
  investigation: string | null;
  diagnosis: string | null;
  advice: string | null;
  medicines: { id: string; quantity: number; name: string }[];
  hospitalId: string;
  timestamp: string;
}

// // Function to format the timestamp
// const formatDate = (timestamp: string): string => {
//   const date = new Date(timestamp);
//   const day = date.getDate().toString().padStart(2, "0");
//   const month = (date.getMonth() + 1).toString().padStart(2, "0");
//   const year = date.getFullYear().toString().slice(-2);
//   return `${day}-${month}-${year}`;
// };

const Appointment: React.FC = () => {
  const [patient, setPatient] = useState({
    name: "",
    // mobile: "",
    age: 0,
    gender: "",
    // address: "",
    investigation: "",
    diagnosis: "",
    advice: "",
  });

  const [medicineSearch, setMedicineSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [patientResults, setPatientResults] = useState<Appointment[]>([]);
  const [searchResults, setSearchResults] = useState<MedicineInfo[]>([]);
  const [selectedMedicines, setSelectedMedicines] = useState<MedicineInfo[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setPatient((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchMedicine = async (query: string) => {
    try {
      const results = await searchDoctorMedicines(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching medicines:", error);
      addToast("Failed to search medicines locally.", "error");
    }
  };

  const handleSearchPatient = async (query: string) => {
    try {
      if (!query.trim()) {
        setPatientResults([]);
        return;
      }

      const results = await searchAppointmentsByPatientName(query);
      setPatientResults(results);
    } catch (error) {
      console.error("Error searching appointments:", error);
      addToast("Failed to search appointments locally.", "error");
    }
  };

  const handlePatientSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setPatientSearch(query);

    if (query.length > 0) {
      handleSearchPatient(query);
    } else {
      setPatientResults([]);
    }
  };

  // const handleSelectPatient = (appointment: Appointment) => {
  //   setPatient({
  //     name: appointment.patientName,
  //     mobile: appointment.mobile,
  //     age: appointment.age,
  //     gender: appointment.gender,
  //     address: appointment.address,
  //     investigation: appointment.investigation || "",
  //     diagnosis: appointment.diagnosis || "",
  //     advice: appointment.advice || "",
  //   });
  //   setPatientSearch("");
  //   setPatientResults([]);
  // };

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
      addToast("Quantity must be at least 1.", "info");
      return;
    }

    const originalMedicine = searchResults.find((medicine) => medicine.id === id);
    if (!originalMedicine) {
      addToast("Medicine not found in search results.", "error");
      return;
    }

    if (newQuantity > originalMedicine.quantity) {
      addToast(
        `Entered quantity (${newQuantity}) exceeds available stock (${originalMedicine.quantity}).`,
        "error"
      );
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
        addToast("User ID is missing. Please log in again.", "info");
        return;
      }

      if (!patient.name ) {
        addToast("Patient name is required.", "info");
        return;
      }

      if (selectedMedicines.length === 0) {
        addToast("Please select at least one medicine.", "info");
        return;
      }

      const appointmentData = {
        patientName: patient.name,
        // mobile: patient.mobile,
        age: Number(patient.age),
        gender: patient.gender,
        // address: patient.address,
        investigation: patient.investigation || null,
        diagnosis: patient.diagnosis || null,
        advice: patient.advice || null,
        medicines: selectedMedicines.map(({ id, name, quantity }) => ({ id, name, quantity })),
        hospitalId: userId,
      };

      await invoke("save_appointment", appointmentData);
      await saveAppointmentToIndexedDB(appointmentData);

      addToast("Appointment saved successfully!", "success");
      setPatient({
        name: "",
        // mobile: "",
        age: 0,
        gender: "",
        // address: "",
        investigation: "",
        diagnosis: "",
        advice: "",
      });
      setSelectedMedicines([]);
      setMedicineSearch("");
      setSearchResults([]);
      setSelectedAppointment(null);

    } catch (error: any) {

      addToast(`Failed to save appointment: ${error.message}`, "error");
      console.error("Error saving appointment:", error);
    }
  };

  const handleSelectPatient = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setPatientSearch(""); // Clear the search input
    setPatientResults([]); // Clear the search results
  };

  const handleAddSelectedAppointment = () => {
    if (!selectedAppointment) return;

    setPatient({
      name: selectedAppointment.patientName,
      // mobile: selectedAppointment.mobile,
      age: selectedAppointment.age,
      gender: selectedAppointment.gender,
      // address: selectedAppointment.address,
      investigation: "",
      diagnosis: "",
      advice: "",
    });
    // Clear the selected medicines
    // setSelectedAppointment(null);
    addToast("Appointment details added successfully!", "success");
  };

  return (
    <div className="flex flex-col gap-4 bg-gray-100 p-4 min-h-screen">
      {/* Container for Two Sections */}
      <div className="flex flex-wrap md:flex-nowrap gap-4">
        {/* Patient Section */}
        <div className="bg-white shadow-md rounded-lg p-6 w-full md:w-1/2 h-[75vh] overflow-auto">
          <h2 className="text-xl font-bold mb-4">Patient Details</h2>

          {/* Patient Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search Patient by Name"
              value={patientSearch}
              onChange={handlePatientSearchChange}
              className="w-full p-2 border rounded"
            />
            {patientResults.length > 0 && (
              <div className="border rounded mt-2 bg-white p-2">
                {patientResults.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 border-b cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSelectPatient(appointment)}
                  >
                    <h4 className="font-bold text-lg">{appointment.patientName}</h4>
                    {/* <p>Mobile: {appointment.mobile}</p> */}
                    <p>Age: {appointment.age} | Gender: {appointment.gender} | Date: {new Date(appointment.timestamp).toLocaleString()} </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Appointment Details */}
          {selectedAppointment && (
            <div className="mt-4 p-4 border rounded bg-gray-50">
              <h3 className="text-lg font-bold mb-2">Selected Appointment Details:</h3>
              <p><strong>Name:</strong> {selectedAppointment.patientName}</p>
              {/* <p><strong>Mobile:</strong> {selectedAppointment.mobile}</p> */}
              <p><strong>Age:</strong> {selectedAppointment.age}</p>
              <p><strong>Gender:</strong> {selectedAppointment.gender}</p>
              <p><strong>Date:</strong> {new Date(selectedAppointment.timestamp).toLocaleString()}</p>
              <p><strong>Investigation:</strong> {selectedAppointment.investigation}</p>
              <p><strong>Diagnosis:</strong> {selectedAppointment.diagnosis}</p>
              <p><strong>Advice:</strong> {selectedAppointment.advice}</p>
              <div>
                <strong>Medicines:</strong>
                {selectedAppointment.medicines.length > 0 ? (
                  <ul className="list-disc pl-5 mt-1">
                    {selectedAppointment.medicines.map((medicine, index) => (
                      <li key={index}>
                        {medicine.name} - {medicine.quantity} unit(s)
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 mt-1">No medicines prescribed.</p>
                )}
              </div>
              <button
                onClick={handleAddSelectedAppointment}
                className="bg-green-500 text-white px-4 py-2 rounded mt-2 hover:bg-green-600"
              >
                Add to Current Appointment
              </button>
            </div>
          )}

          {/* Patient Form */}
          <div className="space-y-4 mt-4">
  {/* Patient Name */}
  <div className="flex flex-col">
    <label htmlFor="name" className="text-sm font-medium text-gray-700">
      Patient Name
    </label>
    <input
      type="text"
      id="name"
      name="name"
      placeholder="Enter patient name"
      value={patient.name}
      onChange={handleInputChange}
      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>

  {/* Age and Gender */}
  <div className="flex gap-4">
    <div className="flex-1 flex flex-col">
      <label htmlFor="age" className="text-sm font-medium text-gray-700">
        Age
      </label>
      <input
        type="number"
        id="age"
        name="age"
        placeholder="Enter age"
        value={patient.age}
        onChange={handleInputChange}
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div className="flex-1 flex flex-col">
      <label htmlFor="gender" className="text-sm font-medium text-gray-700">
        Gender
      </label>
      <select
        id="gender"
        name="gender"
        value={patient.gender}
        onChange={handleInputChange}
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>
    </div>
  </div>

  {/* Investigation */}
  <div className="flex flex-col">
    <label htmlFor="investigation" className="text-sm font-medium text-gray-700">
      Investigation
    </label>
    <textarea
      id="investigation"
      name="investigation"
      placeholder="Enter investigation details"
      value={patient.investigation}
      onChange={handleInputChange}
      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      rows={2}
    />
  </div>

  {/* Diagnosis */}
  <div className="flex flex-col">
    <label htmlFor="diagnosis" className="text-sm font-medium text-gray-700">
      Diagnosis
    </label>
    <textarea
      id="diagnosis"
      name="diagnosis"
      placeholder="Enter diagnosis details"
      value={patient.diagnosis}
      onChange={handleInputChange}
      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      rows={2}
    />
  </div>

  {/* Advice */}
  <div className="flex flex-col">
    <label htmlFor="advice" className="text-sm font-medium text-gray-700">
      Advice
    </label>
    <textarea
      id="advice"
      name="advice"
      placeholder="Enter advice"
      value={patient.advice}
      onChange={handleInputChange}
      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      rows={2}
    />
  </div>
</div>

        </div>

        {/* Medicine Section */}
        <div className="bg-white shadow-md rounded-lg p-6 w-full md:w-1/2 h-[75vh] overflow-auto">
          <h2 className="text-xl font-bold mb-4">Medicine Details</h2>

          {/* Medicine Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search Medicine by Name"
              value={medicineSearch}
              onChange={handleMedicineSearchChange}
              className="w-full p-2 border rounded"
            />
            {searchResults.length > 0 && (
              <ul className="border rounded mt-2 bg-white">
                {searchResults.map((medicine) => (
                  <li
                    key={medicine.id}
                    className="py-2 px-4 border-b cursor-pointer hover:bg-gray-200"
                    onClick={() => handleAddMedicine(medicine)}
                  >
                    {medicine.name} | Batch: {medicine.batchNumber} | Qty:{" "}
                    {medicine.quantity} | Price: ₹{medicine.sellingPrice}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Selected Medicines */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Selected Medicines:</h3>
            {selectedMedicines.length > 0 ? (
              selectedMedicines.map((medicine, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2"
                >
                  <span>
                    {medicine.name} (Batch: {medicine.batchNumber})
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={medicine.quantity}
                      onChange={(e) =>
                        handleQuantityChange(medicine.id, parseInt(e.target.value))
                      }
                      className="w-16 p-1 border rounded"
                    />
                    <button
                      onClick={() => handleRemoveMedicine(index)}
                      className="bg-red-500 text-white rounded px-2 py-1 hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No medicines selected.</p>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-center mt-4">
        <button
          onClick={handleSaveAppointment}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Save Appointment
        </button>
      </div>
    </div>
  );

};

export default Appointment;
