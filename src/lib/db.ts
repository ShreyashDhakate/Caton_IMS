import Dexie from "dexie";

export interface Medicine {
  id: string;
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

class MedicineDatabase extends Dexie {
  medicines!: Dexie.Table<Medicine, string>; // Table schema

  constructor() {
    super("MedicineDatabase");
    this.version(1).stores({
      medicines: "++id, user_id, name, batch_number, expiry_date,quantity,purchase_price, selling_price,wholesaler_name,purchase_date",// Indexed fields
    });
  }
}

export const db = new MedicineDatabase();
