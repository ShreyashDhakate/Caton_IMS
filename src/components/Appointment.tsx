// import React, { useEffect, useState } from "react";
// import { invoke } from "@tauri-apps/api/core";
// import { useToast } from "./ui/sonner";
// import {
//   saveAppointmentToIndexedDB,
//   searchAppointmentsByPatientName,
//   searchDoctorMedicines,
//   syncDoctorMedicinesFromMongoDB,
// } from "../lib/doctorstock";

// interface MedicineInfo {
//   id: string;
//   name: string;
//   batchNumber: string;
//   quantity: number;
//   sellingPrice: number;
//   expiryDate: string;
//   purchasePrice: number;
// }

// interface PatientInfo {
//   id: string;
//   name: string;
//   mobile: string;
//   disease?: string;
// }

// export interface Appointment {
//   id: string;
//   patientName: string;
//   mobile: string;
//   disease: string | null;
//   precautions: string | null;
//   medicines: { id: string; quantity: number; name: string }[];
//   hospitalId: string;
//   timestamp: string;
// }

// const Appointment: React.FC = () => {
//   const [patient, setPatient] = useState({
//     name: "",
//     mobile: "",
//     disease: "",
//     precautions: "",
//   });

//   const [medicineSearch, setMedicineSearch] = useState("");
//   const [patientSearch, setPatientSearch] = useState("");
//   const [patientResults, setPatientResults] = useState<Appointment[]>([]);
//   const [searchResults, setSearchResults] = useState<MedicineInfo[]>([]);
//   const [selectedMedicines, setSelectedMedicines] = useState<MedicineInfo[]>([]);
//   const { addToast } = useToast();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         await syncDoctorMedicinesFromMongoDB();
//         console.log("Doctor's IndexedDB synced with MongoDB.");
//       } catch (error) {
//         console.error("Error syncing data to IndexedDB:", error);
//       }
//     };

//     fetchData();
//     const interval = setInterval(fetchData, 3600000);

//     return () => clearInterval(interval);
//   }, []);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setPatient((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSearchMedicine = async (query: string) => {
//     try {
//       const results = await searchDoctorMedicines(query);
//       setSearchResults(results);
//     } catch (error) {
//       console.error("Error searching medicines:", error);
//       addToast("Failed to search medicines locally.", "error");
//     }
//   };

//   const handleSearchPatient = async (query: string) => {
//     try {
//       if (!query.trim()) {
//         setPatientResults([]);
//         return;
//       }
  
//       const results = await searchAppointmentsByPatientName(query);
  
//       setPatientResults(results);
//     } catch (error) {
//       console.error("Error searching appointments:", error);
//       addToast("Failed to search appointments locally.", "error");
//     }
//   };


//   const handlePatientSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const query = e.target.value;
//     setPatientSearch(query);

//     if (query.length > 0) {
//       handleSearchPatient(query);
//     } else {
//       setPatientResults([]);
//     }
//   };

//   const handleSelectPatient = (appointment: Appointment) => {
//     setPatient({
//       name: appointment.patientName,
//       mobile: appointment.mobile,
//       disease: appointment.disease || "",
//       precautions: "",
//     });
//     setPatientSearch("");
//     setPatientResults([]);
//   };

//   const handleMedicineSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const query = e.target.value;
//     setMedicineSearch(query);

//     if (query.length > 0) {
//       handleSearchMedicine(query);
//     } else {
//       setSearchResults([]);
//     }
//   };

//   const handleAddMedicine = (medicine: MedicineInfo) => {
//     setSelectedMedicines((prev) => {
//       const existingMedicine = prev.find((item) => item.id === medicine.id);

//       if (existingMedicine) {
//         return prev.map((item) =>
//           item.id === medicine.id
//             ? { ...item, quantity: item.quantity + 1 }
//             : item
//         );
//       }
//       return [...prev, { ...medicine, quantity: 1 }];
//     });
//   };

//   const handleRemoveMedicine = (index: number) => {
//     setSelectedMedicines((prev) => prev.filter((_, i) => i !== index));
//   };

//   const handleQuantityChange = (id: string, newQuantity: number) => {
//     if (newQuantity < 1) {
//       addToast("Quantity must be at least 1.", "info");
//       return;
//     }

//     const originalMedicine = searchResults.find((medicine) => medicine.id === id);
//     if (!originalMedicine) {
//       addToast("Medicine not found in search results.", "error");
//       return;
//     }

//     if (newQuantity > originalMedicine.quantity) {
//       addToast(
//         `Entered quantity (${newQuantity}) exceeds available stock (${originalMedicine.quantity}).`,
//         "error"
//       );
//       return;
//     }

//     setSelectedMedicines((prev) =>
//       prev.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
//     );
//   };

//   const handleSaveAppointment = async () => {
//     try {
//       const userId = localStorage.getItem("userId");
//       if (!userId) {
//         addToast("User ID is missing. Please log in again.", "info");
//         return;
//       }
  
//       if (!patient.name || !patient.mobile) {
//         addToast("Patient name and mobile number are required.", "info");
//         return;
//       }
  
//       if (selectedMedicines.length === 0) {
//         addToast("Please select at least one medicine.", "info");
//         return;
//       }
  
//       const appointmentData = {
//         patientName: patient.name,
//         mobile: patient.mobile,
//         disease: patient.disease || null,
//         precautions: patient.precautions || null,
//         medicines: selectedMedicines.map(({ id, name, quantity }) => ({ id, name, quantity })),
//         hospitalId: userId,
//       };
  
//       // Save appointment to backend and IndexedDB
//       await invoke("save_appointment", appointmentData);
//       await saveAppointmentToIndexedDB(appointmentData);
  
//       addToast("Appointment saved successfully!", "success");
//       setPatient({ name: "", mobile: "", disease: "", precautions: "" });
//       setSelectedMedicines([]);
//       setMedicineSearch("");
//       setSearchResults([]);
//     } catch (error: any) {
//       addToast(`Failed to save appointment: ${error.message}`, "error");
//       console.error("Error saving appointment:", error);
//     }
//   };
  

//   return (
//     <div className="flex flex-col gap-4 bg-gray-100 p-2 min-h-screen">
//       {/* Two Sections Container */}
//       <div className="flex gap-4 p-2">
//         {/* Patient Search Section */}
//         <div className="bg-white shadow-lg p-6 rounded-lg w-full md:w-1/2 h-[70vh] overflow-auto">
//           <h2 className="text-xl font-semibold mb-4">Search Patients</h2>
//           <input
//             placeholder="Search for Patients"
//             value={patientSearch}
//             onChange={handlePatientSearchChange}
//             className="w-full mb-4 p-2 border rounded"
//           />

//           {patientResults.length > 0 && (
//             <div>
//               {patientResults.map((appointment) => (
//                 <div
//                   key={appointment.id}
//                   className="flex justify-between items-center border-b py-2 cursor-pointer hover:bg-gray-200"
//                   onClick={() => handleSelectPatient(appointment)}
//                 >
//                   <span>{appointment.patientName} | Mobile: {appointment.mobile}</span>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Selected Patient Details */}
//           <div className="mt-4">
//             <h3 className="text-lg font-semibold mb-2">Patient Details:</h3>
//             <input
//               placeholder="Patient Name"
//               name="name"
//               value={patient.name}
//               onChange={handleInputChange}
//               className="w-full mb-3 p-2 border rounded"
//             />
//             <input
//               placeholder="Mobile Number"
//               name="mobile"
//               value={patient.mobile}
//               onChange={handleInputChange}
//               className="w-full mb-3 p-2 border rounded"
//             />
//             <input
//               placeholder="Disease"
//               name="disease"
//               value={patient.disease}
//               onChange={handleInputChange}
//               className="w-full mb-3 p-2 border rounded"
//             />
//             <textarea
//               placeholder="Precautions"
//               name="precautions"
//               value={patient.precautions}
//               onChange={handleInputChange}
//               className="w-full p-2 border rounded"
//               rows={4}
//             />
//           </div>
//         </div>

//         {/* Medicine Search Section */}
//         <div className="bg-white shadow-lg p-6 rounded-lg w-full md:w-1/2 h-[70vh] overflow-auto">
//           <h2 className="text-xl font-semibold mb-4">Search Medicines</h2>
//           <input
//             placeholder="Search for Medicines"
//             value={medicineSearch}
//             onChange={handleMedicineSearchChange}
//             className="w-full mb-4 p-2 border rounded"
//           />

//           {searchResults.length > 0 && (
//             <div>
//               {searchResults.map((medicine) => (
//                 <div
//                   key={medicine.id}
//                   className="flex justify-between items-center border-b py-2 cursor-pointer hover:bg-gray-200"
//                   onClick={() => handleAddMedicine(medicine)}
//                 >
//                   <span>
//                     {medicine.name} | Batch: {medicine.batchNumber} | Qty: {medicine.quantity} | Price: ₹{medicine.sellingPrice} | Exp: {medicine.expiryDate}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           )}

//           <div className="mt-4">
//             <h3 className="text-lg font-semibold mb-2">Selected Medicines:</h3>
//             {selectedMedicines.map((medicine, index) => (
//               <div key={index} className="flex justify-between items-center mb-2">
//                 <span>{medicine.name} (Batch: {medicine.batchNumber})</span>
//                 <div className="flex items-center gap-2">
//                   <input
//                     type="number"
//                     value={medicine.quantity}
//                     onChange={(e) =>
//                       handleQuantityChange(medicine.id, parseInt(e.target.value) || 1)
//                     }
//                     className="w-16 border rounded p-1"
//                   />
//                   <button
//                     onClick={() => handleRemoveMedicine(index)}
//                     className="bg-red-500 text-white rounded px-2 py-1 hover:bg-red-700"
//                   >
//                     Remove
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Save Appointment */}
//       <div className="flex justify-center p-2">
//         <button
//           className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-700"
//           onClick={handleSaveAppointment}
//         >
//           Save Appointment
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Appointment;

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

interface PatientInfo {
  id: string;
  name: string;
  mobile: string;
  age: number;
  gender: string;
  address: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  mobile: string;
  age: number;
  gender: string;
  address: string;
  investigation: string | null;
  diagnosis: string | null;
  advice: string | null;
  medicines: { id: string; quantity: number; name: string }[];
  hospitalId: string;
  timestamp: string;
}

const Appointment: React.FC = () => {
  const [patient, setPatient] = useState({
    name: "",
    mobile: "",
    age: 0,
    gender: "",
    address: "",
    investigation: "",
    diagnosis: "",
    advice: "",
  });

  const [medicineSearch, setMedicineSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [patientResults, setPatientResults] = useState<Appointment[]>([]);
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

  const handleSelectPatient = (appointment: Appointment) => {
    setPatient({
      name: appointment.patientName,
      mobile: appointment.mobile,
      age: appointment.age,
      gender: appointment.gender,
      address: appointment.address,
      investigation: appointment.investigation || "",
      diagnosis: appointment.diagnosis || "",
      advice: appointment.advice || "",
    });
    setPatientSearch("");
    setPatientResults([]);
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

      if (!patient.name || !patient.mobile) {
        addToast("Patient name and mobile number are required.", "info");
        return;
      }

      if (selectedMedicines.length === 0) {
        addToast("Please select at least one medicine.", "info");
        return;
      }

      const appointmentData = {
        patientName: patient.name,
        mobile: patient.mobile,
        age: Number(patient.age),
        gender: patient.gender,
        address: patient.address,
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
        mobile: "",
        age: 0,
        gender: "",
        address: "",
        investigation: "",
        diagnosis: "",
        advice: "",
      });
      setSelectedMedicines([]);
      setMedicineSearch("");
      setSearchResults([]);
    } catch (error: any) {
      addToast(`Failed to save appointment: ${error.message}`, "error");
      console.error("Error saving appointment:", error);
    }
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
              <ul className="border rounded mt-2 bg-white">
                {patientResults.map((appointment) => (
                  <li
                    key={appointment.id}
                    className="py-2 px-4 border-b cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSelectPatient(appointment)}
                  >
                    {appointment.patientName} | Mobile: {appointment.mobile}
                  </li>
                ))}
              </ul>
            )}
          </div>
  
          {/* Patient Form */}
          <div className="space-y-3">
            <input
              type="text"
              name="name"
              placeholder="Patient Name"
              value={patient.name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={patient.age}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
            <select
              name="gender"
              value={patient.gender}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <input
              type="text"
              name="mobile"
              placeholder="Mobile Number"
              value={patient.mobile}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
            <textarea
              name="address"
              placeholder="Address"
              value={patient.address}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              rows={3}
            />
            <textarea
              name="investigation"
              placeholder="Investigation"
              value={patient.investigation}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              rows={2}
            />
            <textarea
              name="diagnosis"
              placeholder="Diagnosis"
              value={patient.diagnosis}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              rows={2}
            />
            <textarea
              name="advice"
              placeholder="Advice"
              value={patient.advice}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              rows={2}
            />
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
