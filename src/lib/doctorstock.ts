import { invoke } from "@tauri-apps/api/core";
import { doctorDb } from "./doctordb"; // Path to the doctor's IndexedDB instance

interface MongoDBMedicine {
  _id: { $oid: string };
  local_id: string;
  user_id: string;
  name: string;
  batch_number: string;
  expiry_date: string;
  quantity: number;
  purchase_price: number;
  selling_price: number;
  wholesaler_name: string;
  purchase_date: string;
}

export interface Appointment {
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

interface Patient {
  id: string; // Unique ID for the patient
  name: string;
  age: number;
  gender: string;
  appointments: Appointment[]; // List of appointments
}

// Required format interfaces
export interface Medicine {
  id: string;
  name: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
}

export async function addAppointmentToPatient(
  patientName: string,
  appointment: Omit<Appointment, "timestamp">
): Promise<void> {
  try {
    const timestamp = new Date().toISOString(); // Add a timestamp to the appointment

    // Begin a transaction on the "patients" table
    await doctorDb.transaction("rw", doctorDb.patients, async () => {
      // Search for the patient by name
      let patient = await doctorDb.patients.where("name").equals(patientName).first();

      if (!patient) {
        // If the patient does not exist, create a new patient record
        const newPatient: Patient = {
          id: crypto.randomUUID(), // Generate a unique ID for the new patient
          name: patientName,
          age: appointment.age, // Assuming age is part of the appointment
          gender: appointment.gender, // Assuming gender is part of the appointment
          appointments: [
            {
              ...appointment,
              timestamp,
            },
          ],
        };

        // Add the new patient to the database
        await doctorDb.patients.add(newPatient);
        console.log(`New patient "${patientName}" created and appointment added successfully.`);
      } else {
        // If the patient exists, update their record with the new appointment
        if (!patient.appointments) {
          patient.appointments = [];
        }

        patient.appointments.push({
          ...appointment,
          timestamp,
        });

        // Update the existing patient record in the "patients" table
        await doctorDb.patients.put(patient);
        console.log(`Appointment added to existing patient "${patientName}" successfully.`);
      }
    });
  } catch (error) {
    console.error("Error adding appointment to patient:", error);
    throw error; // Re-throw the error for the caller to handle
  }
}



export async function searchPatientsByName(query: string): Promise<Patient[]> {
  if (!query.trim()) return []; // Return empty array for empty query

  try {
    // Check if the database is empty
    const patientsCount = await doctorDb.patients.count();
    if (patientsCount === 0) {
      console.warn("No patients found in the database.");
      return []; // Return empty array if database is empty
    }

    const patients: Patient[] = await doctorDb.patients
      .filter((patient) => patient.name?.toLowerCase().includes(query.toLowerCase())) // Ensure name exists
      .toArray();

    return patients; // Return the filtered list
  } catch (error) {
    console.error("Failed to search patients by name:", error);
    return []; // Return empty array on error
  }
}




// export async function saveAppointmentToIndexedDB(appointment: Omit<Appointment, "id" | "timestamp">): Promise<void> {
//   try {
//     const timestamp = new Date().toISOString(); // Add a timestamp to the appointment
//     const id = crypto.randomUUID(); // Generate a unique ID for the appointment

//     // Begin a transaction on the "appointments" table
//     await doctorDb.transaction("rw", doctorDb.appointments, async () => {
//       await doctorDb.appointments.add({
//         ...appointment,
//         id,
//         timestamp,
//       });
//     });

//     console.log("Appointment saved successfully to IndexedDB.");
//   } catch (error) {
//     console.error("Failed to save appointment to IndexedDB:", error);
//     throw error;
//   }
// }

// export async function searchAppointmentsByPatientName(query: string): Promise<Appointment[]> {
//   if (!query.trim()) return [];

//   try {
//     // Perform a case-insensitive search in the IndexedDB "appointments" table
//     const appointments: Appointment[] = await doctorDb.appointments
//       .filter((appointment) => 
//         appointment.patientName.toLowerCase().includes(query.toLowerCase())
//       )
//       .toArray();

//     return appointments;
//   } catch (error) {
//     console.error("Failed to search appointments by patient name:", error);
//     throw error;
//   }
// }


// Search medicines by name
export async function searchDoctorMedicines(query: string): Promise<Medicine[]> {
  if (!query.trim()) return [];
  const medicines: Medicine[] = await doctorDb.medicines.toArray();

  return medicines
    .filter((medicine) => medicine.name.toLowerCase().includes(query.toLowerCase()))
    .map((medicine) => ({
      id: medicine.id || crypto.randomUUID(), // Ensure an ID is present
      name: medicine.name,
      batchNumber: medicine.batchNumber,
      expiryDate: medicine.expiryDate,
      quantity: medicine.quantity,
      purchasePrice: medicine.purchasePrice,
      sellingPrice: medicine.sellingPrice,
    }));
}

export async function syncDoctorMedicinesFromMongoDB(): Promise<void> {
  try {
    const hospitalId = localStorage.getItem("userId"); // Retrieve hospitalId from local storage
    if (!hospitalId) {
      throw new Error("Hospital ID is missing from local storage.");
    }

    // Fetch all medicines from MongoDB
    const medicinesFromMongoDB: MongoDBMedicine[] = await invoke("get_all_medicines", {
      hospitalId: hospitalId,
    });

    // Format medicines for IndexedDB
    const formattedMedicines: Medicine[] = medicinesFromMongoDB.map((medicine) => ({
      id: medicine.local_id,
      name: medicine.name,
      batchNumber: medicine.batch_number,
      expiryDate: medicine.expiry_date,
      quantity: medicine.quantity,
      purchasePrice: medicine.purchase_price,
      sellingPrice: medicine.selling_price,
    }));

    // Begin IndexedDB transaction
    await doctorDb.transaction("rw", doctorDb.medicines, async () => {
      const indexedDbMedicines = await doctorDb.medicines.toArray();

      // Update or add medicines from MongoDB to IndexedDB
      for (const medicine of formattedMedicines) {
        const existingMedicine = await doctorDb.medicines.get(medicine.id);
        if (existingMedicine) {
          await doctorDb.medicines.update(medicine.id, medicine);
        } else {
          await doctorDb.medicines.add(medicine);
        }
      }

      // Identify medicines to delete (present in IndexedDB but missing in MongoDB)
      const mongoDbMedicineIds = new Set(formattedMedicines.map((medicine) => medicine.id));
      for (const medicine of indexedDbMedicines) {
        if (!mongoDbMedicineIds.has(medicine.id)) {
          await doctorDb.medicines.delete(medicine.id);
        }
      }
    });

    console.log("Doctor's IndexedDB synced with MongoDB, including deletions.");
  } catch (error) {
    console.error("Error syncing data to doctor's IndexedDB:", error);
    throw error;
  }
}

