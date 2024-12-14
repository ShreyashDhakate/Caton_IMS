import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  IconButton,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { AddCircleOutline, DeleteOutline } from "@mui/icons-material";
import dayjs from "dayjs";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { openDB } from "idb";
import { addMedicine, fetchAndGroupMedicines } from "../lib/stockdb";
import { db } from "../lib/db";
import { searchMedicines, syncMedicinesToMongoDB } from "../lib/stockdb";



interface Medicine {
  id: string;
  name: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
}

interface WholesalerPurchase {
  id: string;
  wholesalerName: string;
  purchaseDate: string;
  medicines: Medicine[];
}
interface BackendMedicine {
  _id?: { $oid: string };
  name: string;
  batch_number: string;
  expiry_date: string;
  quantity: number;
  purchase_price: number;
  selling_price: number;
}

const StockAdd: React.FC = () => {
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
          quantity: 0,
          purchasePrice: 0,
          sellingPrice: 0,
        },
      ],
    },
  ]);

  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [activeMedicineId, setActiveMedicineId] = useState<string | null>(null);

  // useEffect(() => {
  //   // Initialize IndexedDB on component mount
  //   initializeIndexedDB();
  // }, []);
  // 
  const handleSearchMedicine = async (query: string) => {
    try {
      const results = await searchMedicines(query);
      // console.log(results);
  
      // Convert string `id` to number before updating the state
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching medicines:", error);
      toast.error("Failed to search medicines locally.");
    }
  };
  

  // // Initialize IndexedDB
  // const initializeIndexedDB = async () => {
  //   const db = await openDB("MedicineDB", 1, {
  //     upgrade(db) {
  //       if (!db.objectStoreNames.contains("medicines")) {
  //         db.createObjectStore("medicines", { keyPath: "id" });
  //       }
  //     },
  //   });
  //   console.log("inedxeddb initialized");
  //   return db;
  // };
  
  
  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        await syncMedicinesToMongoDB();
        console.log("Synced medicines to MongoDB");
      } catch (error) {
        console.error("Error syncing medicines:", error);
      }
    }, 3600000); // Sync every 1 hour
  
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
              medicine.quantity <= 0 ||
              medicine.purchasePrice <= 0 ||
              medicine.sellingPrice <= 0
            ) {
              toast.error("Please fill in all fields for each medicine.");
              return;
            }
  
            // Add medicine to IndexedDB
            await addMedicine({
              id: crypto.randomUUID(), // Generate a unique ID
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
            
  
            toast.success(`Medicine saved locally: ${medicine.name}`);
          }
        }
      } catch (error) {
        console.error("Error saving medicines:", error);
        toast.error("Failed to save medicines locally.");
      }
    };

  const handleMedicineChange = (
    purchaseId: string,
    medicineId: string,
    field: keyof Medicine,
    value: string | number
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
                      purchasePrice: selected.purchasePrice || 0,
                      sellingPrice: selected.sellingPrice || 0,
                    }
                  : medicine
              ),
            }
          : purchase
      )
    );

    setActiveMedicineId(null);
    setSearchResults([]);
    toast.success(`Selected medicine: ${selected.name}`);
  };


  return (
    <div className="p-6 mx-auto bg-white shadow-lg rounded-lg">
      <Typography variant="h4" className="text-center font-bold mb-8">
        Add New Stock
      </Typography>

      {purchases.map((purchase) => (
        <div key={purchase.id} className="mb-10">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <TextField
              label="Wholesaler Name"
              value={purchase.wholesalerName}
              onChange={(e) =>
                setPurchases((prev) =>
                  prev.map((p) => (p.id === purchase.id ? { ...p, wholesalerName: e.target.value } : p))
                )
              }
              size="small"
              fullWidth
            />
            <TextField
              label="Purchase Date"
              type="date"
              value={purchase.purchaseDate}
              onChange={(e) =>
                setPurchases((prev) =>
                  prev.map((p) => (p.id === purchase.id ? { ...p, purchaseDate: e.target.value } : p))
                )
              }
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
            />
          </div>

          <Typography variant="h6" className="font-semibold mb-4">
            Medicines List
          </Typography>
          {purchase.medicines.map((medicine) => (
            <div key={medicine.id} className="mb-4">
              <TextField
                label="Medicine Name"
                value={medicine.name}
                onChange={(e) => handleMedicineChange(purchase.id, medicine.id, "name", e.target.value)}
                size="small"
                fullWidth
              />
              {activeMedicineId === medicine.id && searchResults.length > 0 && (
                <List style={{ border: "1px solid #ccc", borderRadius: 4 }}>
                  {searchResults.map((result) => (
                    <ListItem
                      key={result.id}
                      component="div"
                      onClick={() => handleSelectMedicine(purchase.id, medicine.id, result)}
                    >
                      <ListItemText
                        primary={`${result.name} (Qty: ${result.quantity}, Batch: ${result.batchNumber})`}
                        secondary={`Expiry: ${result.expiryDate}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              <div className="grid grid-cols-6 gap-4 mt-4">
                <TextField
                  label="Batch Number"
                  value={medicine.batchNumber}
                  onChange={(e) => handleMedicineChange(purchase.id, medicine.id, "batchNumber", e.target.value)}
                  size="small"
                />
                <TextField
                  label="Expiry Date"
                  type="date"
                  value={medicine.expiryDate}
                  onChange={(e) => handleMedicineChange(purchase.id, medicine.id, "expiryDate", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
                <TextField
                  label="Quantity"
                  type="number"
                  value={medicine.quantity}
                  onChange={(e) => handleMedicineChange(purchase.id, medicine.id, "quantity", +e.target.value)}
                  size="small"
                />
                <TextField
                  label="Purchase Price"
                  type="number"
                  value={medicine.purchasePrice}
                  onChange={(e) => handleMedicineChange(purchase.id, medicine.id, "purchasePrice", +e.target.value)}
                  size="small"
                />
                <TextField
                  label="Selling Price"
                  type="number"
                  value={medicine.sellingPrice}
                  onChange={(e) => handleMedicineChange(purchase.id, medicine.id, "sellingPrice", +e.target.value)}
                  size="small"
                />
                <IconButton
                  onClick={() =>
                    setPurchases((prev) =>
                      prev.map((p) =>
                        p.id === purchase.id
                          ? {
                              ...p,
                              medicines: p.medicines.filter((m) => m.id !== medicine.id),
                            }
                          : p
                      )
                    )
                  }
                  color="error"
                >
                  <DeleteOutline />
                </IconButton>
              </div>
            </div>
          ))}
          <Button
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
                            quantity: 0,
                            purchasePrice: 0,
                            sellingPrice: 0,
                          },
                        ],
                      }
                    : p
                )
              )
            }
            startIcon={<AddCircleOutline />}
          >
            Add Medicine
          </Button>
          <Divider className="my-4" />
        </div>
      ))}
      <Button onClick={handleSubmit} variant="contained" color="primary" fullWidth>
        Submit
      </Button>
    </div>
  );
};

export default StockAdd;
