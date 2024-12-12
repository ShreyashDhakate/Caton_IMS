import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { toast } from "sonner"; // Import Sonner toast and Toaster
import { useNavigate } from "react-router-dom";

type Appointment = {
  id: string;
  patient_name: string;
  mobile: string;
  disease: string;
  precautions: string;
  medicines: string[];
  date_created: string;
};

const GlobalState = {
  previousCount: -1,
};

const Patients: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const navigate = useNavigate();

  // Fetch appointments from the backend
  const fetchAppointments = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const data = (await invoke("get_all_appointments", {
        hospitalId: userId,
      })) as Appointment[];

      // Trigger notification only if there are new patients
      if (GlobalState.previousCount !== -1 && data.length > GlobalState.previousCount) {
        toast(`New patient added! Total patients: ${data.length}`);
      }

      // Update global previous count and set appointments
      GlobalState.previousCount = data.length;
      console.log("data: ",data);
      setAppointments(data);
      // console.log("Appointments:",appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to fetch appointments. Please try again.");
    }
  };

  // Poll the backend every 5 seconds for updates
  useEffect(() => {
    fetchAppointments(); // Initial fetch
    const interval = setInterval(fetchAppointments, 5000); // Poll every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  const handleRedirectToBilling = () => {
    if (selectedAppointment) {
      // Store the selected appointment details dynamically using its ID
      const appointmentKey = `appointment_${selectedAppointment.id}`;
      const appointmentData = {
        patient_name: selectedAppointment.patient_name,
        disease: selectedAppointment.disease,
        precautions: selectedAppointment.precautions,
        medicines: selectedAppointment.medicines,
      };
      localStorage.setItem(appointmentKey, JSON.stringify(appointmentData));
      console.log(appointmentData);
      console.log(appointmentKey);
      // Pass the appointment ID to the billing page
      navigate("/billing", { state: { appointmentId: selectedAppointment.id } });
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Patients</h1>
      <Table className="w-full border">
        <TableHead>
          <TableRow>
            <TableCell>Patient Name</TableCell>
            <TableCell>Mobile</TableCell>
            <TableCell>Disease</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
  {appointments.map((appointment, index) => (
    <TableRow
      key={appointment.id || `${appointment.patient_name}-${index}`}
      onClick={() => setSelectedAppointment(appointment)}
      className="hover:bg-gray-100 cursor-pointer"
    >
      <TableCell>{appointment.patient_name}</TableCell>
      <TableCell>{appointment.mobile}</TableCell>
      <TableCell>{appointment.disease}</TableCell>
      <TableCell>{new Date(appointment.date_created).toLocaleString()}</TableCell>
    </TableRow>
  ))}
</TableBody>
      </Table>

      {selectedAppointment && (
        <div className="p-4 border rounded shadow-md bg-white">
          <h2 className="text-xl font-bold">Appointment Details</h2>
          <p>
            <strong>Patient Name:</strong> {selectedAppointment.patient_name}
          </p>
          <p>
            <strong>Mobile:</strong> {selectedAppointment.mobile}
          </p>
          <p>
            <strong>Disease:</strong> {selectedAppointment.disease}
          </p>
          <p>
            <strong>Precautions:</strong> {selectedAppointment.precautions}
          </p>
          <p>
            <strong>Medicines:</strong> {selectedAppointment.medicines.join(", ")}
          </p>
          <p>
            <strong>Date Created:</strong>{" "}
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