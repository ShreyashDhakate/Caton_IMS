import Dexie from "dexie";

export interface Medicine {
  [x: string]: any;
  _id: { $oid: string };
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

export interface Sale {
  id?: string;
  purchase_date: string;
  customer_name: string;
  medicines: Medicine[];
  total_cost: number; // Array of medicines sold
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

class SalesDatabase extends Dexie {
  sales!: Dexie.Table<Sale, string>; // Table schema
  saleMedicines: any;

  constructor() {
    super("SalesDatabase");
    this.version(1).stores({
      sales: "++id, purchase_date, customer_name, total_cost", // Indexed fields
      saleMedicines: "++id, sale_id, medicine_id,selling_price",
    });
  }
}

export const db = new MedicineDatabase();
export const salesDb = new SalesDatabase();