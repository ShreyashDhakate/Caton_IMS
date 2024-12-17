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
