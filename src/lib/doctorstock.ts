import { invoke } from "@tauri-apps/api/core";
import { doctorDb } from "./doctordb"; // Path to the doctor's IndexedDB instance

interface MongoDBMedicine {
  _id: { $oid: string };
  name: string;
  batch_number: string;
  expiry_date: string;
  quantity: number;
  purchase_price: number;
  selling_price: number;
  wholesaler_name: string;
  purchase_date: string;
}

interface DoctorMedicine {
  id: string;
  name: string;
  batch_number: string;
  expiry_date: string;
  quantity: number;
  purchase_price: number;
  selling_price: number;
  wholesaler_name: string;
  purchase_date: string;
}

export async function syncDoctorMedicinesFromMongoDB(): Promise<void> {
  try {
    const medicines: MongoDBMedicine[] = await invoke("get_all_medicines");

    const formattedMedicines: DoctorMedicine[] = medicines.map((medicine) => ({
      id: medicine._id.$oid,
      name: medicine.name,
      batch_number: medicine.batch_number,
      expiry_date: medicine.expiry_date,
      quantity: medicine.quantity,
      purchase_price: medicine.purchase_price,
      selling_price: medicine.selling_price,
      wholesaler_name: medicine.wholesaler_name,
      purchase_date: medicine.purchase_date,
    }));

    await doctorDb.transaction("rw", doctorDb.medicines, async () => {
      for (const medicine of formattedMedicines) {
        const existingMedicine = await doctorDb.medicines.get(medicine.id);
        if (existingMedicine) {
          await doctorDb.medicines.update(medicine.id, medicine);
        } else {
          await doctorDb.medicines.add(medicine);
        }
      }
    });

    console.log("Doctor's IndexedDB synced with MongoDB.");
  } catch (error) {
    console.error("Error syncing data to doctor's IndexedDB:", error);
    throw error;
  }
}
