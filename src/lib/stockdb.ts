import { db } from "./db"; // Adjust the path to your actual file


type OriginalMedicine = {
    [x: string]: any;
    _id?: { $oid: string }; // Optional, matches `Option<ObjectId>` in Rust
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

export async function fetchAndGroupMedicines(): Promise<Wholesaler[]> {
  const medicines: OriginalMedicine[] = await db.medicines.toArray();

  // Group medicines by wholesalerName and purchaseDate
  const groupedData = medicines.reduce<Record<string, Wholesaler>>((acc, medicine) => {
    const groupKey = `${medicine.wholesaler_name}-${medicine.purchase_date}`;
    if (!acc[groupKey]) {
      acc[groupKey] = {
        id: crypto.randomUUID(), // Generate a unique ID for each wholesaler group
        wholesalerName: medicine.wholesaler_name,
        purchaseDate: medicine.purchase_date,
        medicines: [],
      };
    }

    acc[groupKey].medicines.push({
      id: medicine.id || crypto.randomUUID(), // Ensure each medicine has an ID
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
