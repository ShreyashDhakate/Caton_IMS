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
    const medicines: MongoDBMedicine[] = await invoke("get_all_medicines", {
      hospitalId: hospitalId,
    });

    const formattedMedicines: Medicine[] = medicines.map((medicine) => ({
      id: medicine.local_id,
      name: medicine.name,
      batchNumber: medicine.batch_number,
      expiryDate: medicine.expiry_date,
      quantity: medicine.quantity,
      purchasePrice: medicine.purchase_price,
      sellingPrice: medicine.selling_price,
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
