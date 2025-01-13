import Dexie from "dexie";

export interface Medicine {
  [x: string]: any;
  id:  string;
  user_id: string;
  name: string;
  batch_number: string;
  expiry_date: string;
  quantity: number;
  purchase_price: number;
  selling_price: number;
  wholesaler_name: string;
  purchase_date: string;
  // local_id:string;
}

export interface Sale {
  id?: string; // Optional field for the sale ID
  purchase_date: string; // The date when the purchase was made
  customer_name: string; // The name of the customer
  medicines: Medicine[]; // An array of medicines sold in the transaction
  total_cost: number; // The total cost of the transaction (sum of individual medicine prices)
  payment_mode: "offline" | "online"; // The payment mode, either 'offline' or 'online'
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
      sales: "++id, purchase_date, customer_name, total_cost,payment_mode", // Indexed fields
      saleMedicines: "++id, sale_id, medicine_id,selling_price",
    });
  }
}

export const db = new MedicineDatabase();
export const salesDb = new SalesDatabase();