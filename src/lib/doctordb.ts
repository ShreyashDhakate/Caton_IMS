import Dexie from "dexie";

export interface DoctorMedicine {
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

class DoctorMedicineDatabase extends Dexie {
  medicines!: Dexie.Table<DoctorMedicine, string>; // Table schema

  constructor() {
    super("DoctorMedicineDatabase");
    this.version(1).stores({
      medicines: "++id, name, batch_number, expiry_date, quantity, purchase_price, selling_price, wholesaler_name, purchase_date", // Indexed fields
    });
  }
}

export const doctorDb = new DoctorMedicineDatabase();
