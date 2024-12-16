import Dexie from "dexie";

// Type for OriginalMedicine
type OriginalMedicine = {
  [x: string]: any;
  id: string; // Optional for flexibility during initial data creation
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

export interface Medicine {
  id: string;
  name: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
}

class DoctorMedicineDatabase extends Dexie {
  medicines!: Dexie.Table<Medicine, string>; // Table schema

  constructor() {
    super("DoctorMedicineDatabase");
    this.version(1).stores({
      medicines: "++id, user_id, name, batch_number, expiry_date, quantity, purchase_price, selling_price, wholesaler_name, purchase_date", // Indexed fields
    });
  }
}

export const doctorDb = new DoctorMedicineDatabase();
