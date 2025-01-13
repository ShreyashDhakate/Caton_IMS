import Dexie from "dexie";

export interface Medicine {
  id: string;
  name: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
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

class DoctorMedicineDatabase extends Dexie {
  medicines!: Dexie.Table<Medicine, string>; // Medicine table schema
  patients!: Dexie.Table<Patient, string>; // Appointments table schema

  constructor() {
    super("DoctorMedicineDatabase");
    this.version(1).stores({
      medicines: "++id, user_id, name, batch_number, expiry_date, quantity, purchase_price, selling_price, wholesaler_name, purchase_date",
    });

    // Replace appointments table with the patients table in version 2
    this.version(2).stores({
      patients: "++id, name, age, gender, appointments", // Indexed fields for patients
    });
  }
}

export const doctorDb = new DoctorMedicineDatabase();
