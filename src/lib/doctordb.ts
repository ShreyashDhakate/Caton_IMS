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

class DoctorMedicineDatabase extends Dexie {
  medicines!: Dexie.Table<Medicine, string>; // Medicine table schema
  appointments!: Dexie.Table<Appointment, string>; // Appointments table schema

  constructor() {
    super("DoctorMedicineDatabase");
    this.version(1).stores({
      medicines: "++id, user_id, name, batch_number, expiry_date, quantity, purchase_price, selling_price, wholesaler_name, purchase_date",
    });

    // Define the appointments table in version 2
    this.version(2).stores({
      appointments: "++id, patientName, age, gender, mobile, address, hospitalId, investigation, diagnosis, advice, timestamp", // Indexed fields for appointments
    });    
  }
}

export const doctorDb = new DoctorMedicineDatabase();
