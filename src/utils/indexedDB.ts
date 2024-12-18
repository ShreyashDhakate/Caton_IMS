// utils/indexedDB.ts
import { openDB } from "idb";

const DB_NAME = "MedicineDB";
const STORE_NAME = "medicines";

interface Medicine {
    id: number;
    name: string;
    batchNumber: string;
    expiryDate: string;
    quantity: number;
    purchasePrice: number;
    sellingPrice: number;
  }

export const initializeDB = async () => {
  return await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    },
  });
};

export const saveMedicine = async (medicine:Medicine) => {
  const db = await initializeDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  await tx.store.add(medicine);
  await tx.done;
};

export const getAllMedicines = async () => {
  const db = await initializeDB();
  return await db.getAll(STORE_NAME);
};

export const searchMedicines = async (query:string) => {
  const medicines = await getAllMedicines();
  return medicines.filter((medicine) =>
    medicine.name.toLowerCase().includes(query.toLowerCase())
  );
};
