import { invoke } from "@tauri-apps/api/core";
import { db } from "./db"; // Adjust the path to your actual file

// Type for OriginalMedicine
type OriginalMedicine = {
  id: string; // Required
  user_id: string;
  name: string;
  batch_number: string;
  expiry_date: string;
  quantity: number;
  purchase_price: number;
  selling_price: number;
  wholesaler_name: string;
  purchase_date: string;
};

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

export interface Wholesaler {
  id: string;
  wholesalerName: string;
  purchaseDate: string;
  medicines: Medicine[];
}

// Fetch and group medicines by wholesaler and purchase date
export async function fetchAndGroupMedicines(): Promise<Wholesaler[]> {
  const medicines: OriginalMedicine[] = await db.medicines.toArray();

  const groupedData = medicines.reduce<Record<string, Wholesaler>>((acc, medicine) => {
    const groupKey = `${medicine.wholesaler_name}-${medicine.purchase_date}`;
    if (!acc[groupKey]) {
      acc[groupKey] = {
        id: crypto.randomUUID(),
        wholesalerName: medicine.wholesaler_name,
        purchaseDate: medicine.purchase_date,
        medicines: [],
      };
    }

    acc[groupKey].medicines.push({
      id: medicine.id, // Use the ID from OriginalMedicine
      name: medicine.name,
      batchNumber: medicine.batch_number,
      expiryDate: medicine.expiry_date,
      quantity: medicine.quantity,
      purchasePrice: medicine.purchase_price,
      sellingPrice: medicine.selling_price,
    });

    return acc;
  }, {});

  return Object.values(groupedData);
}

// Add a new medicine
export async function addMedicine(medicine: OriginalMedicine): Promise<void> {
  const medicineWithId = {
    ...medicine,
    id: medicine.id || crypto.randomUUID(), // Assign an ID if it doesn't exist
  };
  await db.medicines.add(medicineWithId);
}

// Update an existing medicine by ID
export async function updateMedicine(id: string, updates: Partial<OriginalMedicine>): Promise<void> {
  const existingMedicine = await db.medicines.get(id);
  if (existingMedicine) {
    await db.medicines.update(id, updates);
  }
}

// Delete a medicine by ID
export async function deleteLocalMedicine(id: string): Promise<void> {
  await db.medicines.delete(id);
}

// Fetch a single medicine by ID
export async function fetchMedicineById(id: string): Promise<OriginalMedicine | undefined> {
  try {
    console.log("Fetching medicine from IndexedDB with ID:", id);
    const medicine = await db.medicines.get(id);
    console.log("Fetched medicine:", medicine);
    return medicine;
  } catch (error) {
    console.error("Error fetching medicine from IndexedDB:", error);
    throw error; // Ensure errors propagate correctly
  }
}

// Fetch all medicines
export async function fetchAllMedicines(): Promise<OriginalMedicine[]> {
  return await db.medicines.toArray();
}

// Search medicines by name
export async function searchMedicines(query: string): Promise<Medicine[]> {
  if (!query.trim()) return [];
  const medicines: OriginalMedicine[] = await db.medicines.toArray();

  return medicines
    .filter((medicine) => medicine.name.toLowerCase().includes(query.toLowerCase()))
    .map((medicine) => ({
      id: medicine.id, // Use the ID from OriginalMedicine
      name: medicine.name,
      batchNumber: medicine.batch_number,
      expiryDate: medicine.expiry_date,
      quantity: medicine.quantity,
      purchasePrice: medicine.purchase_price,
      sellingPrice: medicine.selling_price,
    }));
}

// Sync medicines to MongoDB
export async function syncMedicinesToMongoDB(): Promise<void> {
  try {
    const medicines: OriginalMedicine[] = await db.medicines.toArray();
    console.log("medicines to sync to mongoDB:", medicines);
    for (const medicine of medicines) {
      try {
        const userId = localStorage.getItem("userId");

        // Check if the batch exists in MongoDB
        const batchExists = await invoke<boolean>("check_medicine_batch", {
          batchNumber: medicine.batch_number,
          hospitalId: userId,
          name: medicine.name,
        });

        if (batchExists) {
          // Update the batch in MongoDB
          await invoke("update_batch", {
            localId: medicine.id,
            batchNumber: medicine.batch_number,
            quantity: medicine.quantity,
            expiryDate: medicine.expiry_date,
            purchasePrice: medicine.purchase_price,
            sellingPrice: medicine.selling_price,
            wholesalerName: medicine.wholesaler_name,
            purchaseDate: medicine.purchase_date,
            hospitalId: userId,
          });
        } else {
          // Insert the new medicine batch into MongoDB
          await invoke("insert_medicine", {
            localId: medicine.id,
            name: medicine.name,
            batchNumber: medicine.batch_number,
            expiryDate: medicine.expiry_date,
            quantity: medicine.quantity,
            purchasePrice: medicine.purchase_price,
            sellingPrice: medicine.selling_price,
            wholesalerName: medicine.wholesaler_name,
            purchaseDate: medicine.purchase_date,
            hospitalId: userId,
          });
        }
      } catch (error) {
        console.error(`Error syncing medicine [${medicine.name}]:`, error);
      }
    }

    console.log("All medicines synced successfully.");
  } catch (error) {
    console.error("Error syncing medicines to MongoDB:", error);
  }
}

// import { Wholesaler } from "../types"; // Replace with the actual path if needed

export async function deletePurchase(wholesalerName: string, purchaseDate: string): Promise<void> {
  try {
    // Fetch all medicines
    const medicines = await db.medicines.toArray();

    // Filter medicines belonging to the specific purchase (wholesaler and date)
    const medicinesToDelete = medicines.filter(
      (medicine) =>
        medicine.wholesaler_name === wholesalerName && medicine.purchase_date === purchaseDate
    );

    // Delete each medicine from the database
    const deletePromises = medicinesToDelete.map((medicine) =>
      db.medicines.delete(medicine.id)
    );

    await Promise.all(deletePromises);

    console.log(
      `Deleted ${medicinesToDelete.length} medicines for wholesaler ${wholesalerName} and purchase date ${purchaseDate}.`
    );
  } catch (error) {
    console.error("Error deleting purchase:", error);
    throw new Error("Failed to delete purchase");
  }
}

