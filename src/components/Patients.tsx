import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ui/sonner";

export interface Appointment {
  id: string;
  patient_name: string;
  mobile: string;
  age: number;
  gender: string;
  address: string;
  investigation: string | null;
  diagnosis: string | null;
  advice: string | null;
  medicines: { id: string; quantity: number; name: string }[];
  hospitalId: string;
  date_created: string;
}


const GlobalState = {
  previousCount: -1,
};

const Patients: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const navigate = useNavigate();

  const { addToast } = useToast();
  // Fetch appointments from the backend
  const fetchAppointments = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const data = (await invoke("get_all_appointments", {
        hospitalId: userId,
      })) as Appointment[];

      // Trigger notification only if there are new patients
      if (GlobalState.previousCount !== -1 && data.length > GlobalState.previousCount) {
        addToast(`New patient added! Total patients: ${data.length}`, "info");
      }

      // Update global previous count and set appointments
      GlobalState.previousCount = data.length;
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      addToast("Failed to fetch appointments. Please try again.", "error");
    }
  };

  // Poll the backend every 5 seconds for updates
  useEffect(() => {
    fetchAppointments(); // Initial fetch
    const interval = setInterval(fetchAppointments, 1000); // Poll every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  const handleRedirectToBilling = () => {
    if (selectedAppointment) {
      // Store the selected appointment details dynamically using its ID
      const appointmentKey = `appointment_${selectedAppointment.id}`;
      const appointmentData = {
        patient_name: selectedAppointment.patient_name,
        age: selectedAppointment.age,
        gender: selectedAppointment.gender,
        address: selectedAppointment.address,
        investigation: selectedAppointment.investigation,
        diagnosis: selectedAppointment.diagnosis,
        advice: selectedAppointment.advice,
        medicines: selectedAppointment.medicines,
      };
      localStorage.setItem(appointmentKey, JSON.stringify(appointmentData));
      navigate("/billing", { state: { appointmentId: selectedAppointment.id } });
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Patients</h1>
      <div className="w-full border rounded-lg overflow-hidden">
        <table className="table-auto w-full">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">Patient Name</th>
              <th className="px-4 py-2 text-left">Age</th>
              <th className="px-4 py-2 text-left">Gender</th>
              <th className="px-4 py-2 text-left">Mobile</th>
              <th className="px-4 py-2 text-left">Disease</th>
              <th className="px-4 py-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment, index) => (
              <tr
                key={appointment.id || `${appointment.patient_name}-${index}`}
                onClick={() => setSelectedAppointment(appointment)}
                className="cursor-pointer hover:bg-gray-100 border-b"
              >
                <td className="px-4 py-2">{appointment.patient_name}</td>
                <td className="px-4 py-2">{appointment.age}</td>
                <td className="px-4 py-2">{appointment.gender}</td>
                <td className="px-4 py-2">{appointment.mobile}</td>
                <td className="px-4 py-2">{appointment.diagnosis}</td>
                <td className="px-4 py-2">
                  {new Date(appointment.date_created).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedAppointment && (
        <div className="p-4 border rounded shadow-md bg-white">
          <h2 className="text-xl font-bold mb-2">Appointment Details</h2>
          <p>
            <strong>Patient Name:</strong> {selectedAppointment.patient_name}
          </p>
          <p>
            <strong>Gender:</strong> {selectedAppointment.gender}
          </p>
          <p>
            <strong>Age:</strong> {selectedAppointment.age}
          </p>
          <p>
            <strong>Mobile:</strong> {selectedAppointment.mobile}
          </p>
          <p>
            <strong>Disease:</strong> {selectedAppointment.diagnosis}
          </p>
          <p>
            <strong>Precautions:</strong> {selectedAppointment.advice}
          </p>
          <p>
            <strong>Medicines:</strong> {selectedAppointment.medicines.map(med => med.name).join(", ")}
          </p>

          <p>
            <strong>Date:</strong>{" "}
            {new Date(selectedAppointment.date_created).toLocaleString()}
          </p>
          <div className="mt-4 flex space-x-4">
            <button
              onClick={() => setSelectedAppointment(null)}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Close
            </button>
            <button
              onClick={handleRedirectToBilling}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go to Billing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
