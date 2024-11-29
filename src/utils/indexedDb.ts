import { openDB, IDBPDatabase } from "idb";
import { MedicineInfo } from '../components/Billing';

export interface Medicine {
  id: number;
  name: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
}

const DB_NAME = "MedicinesDB";
const STORE_NAME = "medicines";

// Initialize IndexedDB
export const initDB = async (): Promise<IDBPDatabase> => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    },
  });
};

// Save multiple medicines to IndexedDB
export const saveMedicines = async (medicines: Medicine[]): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  for (const medicine of medicines) {
    await store.put(medicine);
  }
  await tx.done;
};

// Search medicines in IndexedDB by name with a limit
export const searchIndexedDBMedicines = async (query: string, limit: number): Promise<Medicine[]> => {
  const db = await initDB();
  const allMedicines = await db.getAll(STORE_NAME);
  
  // Filter medicines by name, matching the search query, and limit results
  return allMedicines
    .filter(medicine => medicine.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, limit);
};

// Fetch all medicines from IndexedDB
export const getMedicines = async (): Promise<Medicine[]> => {
  const db = await initDB();
  return await db.getAll(STORE_NAME);
};

// Add a single medicine to IndexedDB
export const addMedicineToIndexedDB = async (medicine: Medicine): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  await tx.objectStore(STORE_NAME).put(medicine);
  await tx.done;
};

// Update an existing medicine in IndexedDB
export const updateMedicineInIndexedDB = async (medicine: Medicine): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  await tx.objectStore(STORE_NAME).put(medicine);
  await tx.done;
};

// Delete a medicine by ID from IndexedDB
export const deleteMedicineFromIndexedDB = async (id: number): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  await tx.objectStore(STORE_NAME).delete(id);
  await tx.done;
};

export const getMedicinesFromIndexedDB = async (): Promise<MedicineInfo[]> => {
  const db = await openDB('pharmacy-db', 1);
  const medicines = await db.getAll('medicines'); // Assuming 'medicines' is the object store name
  return medicines as MedicineInfo[];
};