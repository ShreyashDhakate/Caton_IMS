import React, { useEffect, useState } from "react";
import { AddCircleOutline, DeleteOutline } from "@mui/icons-material";
import dayjs from "dayjs";

import { useToast } from "./ui/sonner";
import { addMedicine } from "../lib/stockdb";
import { searchMedicines, syncMedicinesToMongoDB } from "../lib/stockdb";

interface Medicine {
  id: string;
  name: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number | null;
  purchasePrice: number | null;
  sellingPrice: number | null;
}

interface WholesalerPurchase {
  id: string;
  wholesalerName: string;
  purchaseDate: string;
  medicines: Medicine[];
}

const StockAdd: React.FC = () => {
  const { addToast } = useToast();
  const [purchases, setPurchases] = useState<WholesalerPurchase[]>([
    {
      id: crypto.randomUUID(),
      wholesalerName: "",
      purchaseDate: dayjs().format("YYYY-MM-DD"),
      medicines: [
        {
          id: crypto.randomUUID(),
          name: "",
          batchNumber: "",
          expiryDate: "",
          quantity: null,
          purchasePrice: null,
          sellingPrice: null,
        },
      ],
    },
  ]);

  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [activeMedicineId, setActiveMedicineId] = useState<string | null>(null);

  const handleSearchMedicine = async (query: string) => {
    try {
      const results = await searchMedicines(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching medicines:", error);
      addToast("Failed to search medicines locally.","error");
    }
  };

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        await syncMedicinesToMongoDB();
        console.log("Synced medicines to MongoDB");
      } catch (error) {
        console.error("Error syncing medicines:", error);
      }
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const handleSubmit = async () => {
    try {
      for (const purchase of purchases) {
        for (const medicine of purchase.medicines) {
          if (
            !medicine.name.trim() ||
            !medicine.batchNumber.trim() ||
            !medicine.expiryDate.trim() ||
            medicine.quantity === null ||
            medicine.purchasePrice === null ||
            medicine.sellingPrice === null
          ) {
            addToast("Please fill in all fields for each medicine.","info");
            return;
          }

          await addMedicine({
            id: crypto.randomUUID(),
            user_id: localStorage.getItem("userId") || "default_user",
            name: medicine.name,
            batch_number: medicine.batchNumber,
            expiry_date: medicine.expiryDate,
            quantity: medicine.quantity,
            purchase_price: medicine.purchasePrice,
            selling_price: medicine.sellingPrice,
            wholesaler_name: purchase.wholesalerName,
            purchase_date: purchase.purchaseDate,
          });

          addToast(`Medicine saved locally: ${medicine.name}`,"success");
        }
      }
    } catch (error) {
      console.error("Error saving medicines:", error);
      addToast("Failed to save medicines locally.","error");
    }
  };

  const handleMedicineChange = (
    purchaseId: string,
    medicineId: string,
    field: keyof Medicine,
    value: string | number | null
  ) => {
    setPurchases((prev) =>
      prev.map((purchase) =>
        purchase.id === purchaseId
          ? {
              ...purchase,
              medicines: purchase.medicines.map((medicine) =>
                medicine.id === medicineId ? { ...medicine, [field]: value } : medicine
              ),
            }
          : purchase
      )
    );

    if (field === "name") {
      setActiveMedicineId(medicineId);
      handleSearchMedicine(value as string);
    }
  };

  const handleSelectMedicine = (
    purchaseId: string,
    medicineId: string,
    selected: Medicine
  ) => {
    setPurchases((prev) =>
      prev.map((purchase) =>
        purchase.id === purchaseId
          ? {
              ...purchase,
              medicines: purchase.medicines.map((medicine) =>
                medicine.id === medicineId
                  ? {
                      ...medicine,
                      name: selected.name,
                      batchNumber: selected.batchNumber || "",
                      expiryDate: selected.expiryDate || "",
                      purchasePrice: selected.purchasePrice || null,
                      sellingPrice: selected.sellingPrice || null,
                    }
                  : medicine
              ),
            }
          : purchase
      )
    );

    setActiveMedicineId(null);
    setSearchResults([]);
    addToast(`Selected medicine: ${selected.name}`,"success");
  };

  return (
    <div className="p-6 mx-auto bg-white shadow-md rounded-lg width-full">
      <h2 className="text-2xl font-bold text-center mb-8">Add New Stock</h2>
      {purchases.map((purchase) => (
        <div key={purchase.id} className="mb-10">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <input
              className="border rounded p-2 w-full"
              placeholder="Wholesaler Name"
              value={purchase.wholesalerName}
              onChange={(e) =>
                setPurchases((prev) =>
                  prev.map((p) =>
                    p.id === purchase.id ? { ...p, wholesalerName: e.target.value } : p
                  )
                )
              }
            />
            <input
              type="date"
              className="border rounded p-2 w-full"
              value={purchase.purchaseDate}
              onChange={(e) =>
                setPurchases((prev) =>
                  prev.map((p) =>
                    p.id === purchase.id ? { ...p, purchaseDate: e.target.value } : p
                  )
                )
              }
            />
          </div>
          <h3 className="text-lg font-semibold mb-4">Medicines List</h3>
          {purchase.medicines.map((medicine) => (
            <div key={medicine.id} className="mb-4">
              <input
                className="border rounded p-2 w-full mb-2"
                placeholder="Medicine Name"
                value={medicine.name}
                onChange={(e) =>
                  handleMedicineChange(purchase.id, medicine.id, "name", e.target.value)
                }
              />
              {activeMedicineId === medicine.id && searchResults.length > 0 && (
                <ul className="border rounded p-2 bg-gray-100">
                  {searchResults.map((result) => (
                    <li
                      key={result.id}
                      className="p-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => handleSelectMedicine(purchase.id, medicine.id, result)}
                    >
                      {result.name} (Qty: {result.quantity}, Batch: {result.batchNumber})
                    </li>
                  ))}
                </ul>
              )}
              <div className="grid grid-cols-6 gap-4 mt-4">
                {[
                  { label: "Batch Number", field: "batchNumber" },
                  { label: "Expiry Date", field: "expiryDate", type: "date" },
                  { label: "Quantity", field: "quantity", type: "number" },
                  { label: "Purchase Price", field: "purchasePrice", type: "number" },
                  { label: "Selling Price", field: "sellingPrice", type: "number" },
                ].map(({ label, field, type }) => (
                  <input
                    key={field}
                    placeholder={label}
                    type={type || "text"}
                    className="border rounded p-2"
                    value={(medicine as any)[field] ?? ""}
                    onChange={(e) =>
                      handleMedicineChange(
                        purchase.id,
                        medicine.id,
                        field as keyof Medicine,
                        e.target.value === "" ? null : e.target.value
                      )
                    }
                  />
                ))}
                <button
                  className="text-red-600 hover:text-red-800"
                  onClick={() =>
                    setPurchases((prev) =>
                      prev.map((p) =>
                        p.id === purchase.id
                          ? { ...p, medicines: p.medicines.filter((m) => m.id !== medicine.id) }
                          : p
                      )
                    )
                  }
                >
                  <DeleteOutline />
                </button>
              </div>
            </div>
          ))}
          <button
            className="text-blue-600 hover:text-blue-800 flex items-center"
            onClick={() =>
              setPurchases((prev) =>
                prev.map((p) =>
                  p.id === purchase.id
                    ? {
                        ...p,
                        medicines: [
                          ...p.medicines,
                          {
                            id: crypto.randomUUID(),
                            name: "",
                            batchNumber: "",
                            expiryDate: "",
                            quantity: null,
                            purchasePrice: null,
                            sellingPrice: null,
                          },
                        ],
                      }
                    : p
                )
              )
            }
          >
            <AddCircleOutline className="mr-2" /> Add Medicine
          </button>
          <hr className="my-4" />
        </div>
      ))}
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white p-3 rounded hover:bg-blue-800 w-full"
      >
        Submit
      </button>
    </div>
  );
};

export default StockAdd;