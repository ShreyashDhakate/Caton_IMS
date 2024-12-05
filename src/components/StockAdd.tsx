import React, { useEffect, useState } from "react";
import { TextField, Button, IconButton, Typography, Divider } from "@mui/material";
import { AddCircleOutline, DeleteOutline } from "@mui/icons-material";
import dayjs from "dayjs";
import { invoke } from "@tauri-apps/api/core";
import { useInitializeDatabase } from "../hooks/useInitializeDatabase.ts.ts";
import { toast } from 'sonner';

interface Medicine {
  id: number;
  name: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
}

interface WholesalerPurchase {
  id: number;
  wholesalerName: string;
  purchaseDate: string;
  medicines: Medicine[];
}

const StockAdd: React.FC = () => {
  const [purchases, setPurchases] = useState<WholesalerPurchase[]>([{
    id: 1,
    wholesalerName: "",
    purchaseDate: dayjs().format("YYYY-MM-DD"),
    medicines: [{
      id: Date.now(),
      name: "",
      batchNumber: "",
      expiryDate: "",
      quantity: 0,
      purchasePrice: 0,
      sellingPrice: 0,
    }],
  }]);

  const { initializeDatabase } = useInitializeDatabase();

  useEffect(() => {
    initializeDatabase();
  }, [initializeDatabase]);

  const validateMedicineFields = (medicine: Medicine) => {
    return (
      medicine.name.trim() !== "" &&
      medicine.batchNumber.trim() !== "" &&
      medicine.expiryDate.trim() !== "" &&
      medicine.quantity > 0 &&
      medicine.purchasePrice > 0 &&
      medicine.sellingPrice > 0
    );
  };

  const handlePurchaseChange = (id: number, field: keyof WholesalerPurchase, value: string) => {
    setPurchases((prev) =>
      prev.map((purchase) => (purchase.id === id ? { ...purchase, [field]: value } : purchase))
    );
  };

  const handleMedicineChange = (
    purchaseId: number,
    medicineId: number,
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
  };

  const addMedicine = (purchaseId: number) => {
    setPurchases((prev) =>
      prev.map((purchase) =>
        purchase.id === purchaseId
          ? {
              ...purchase,
              medicines: [
                ...purchase.medicines,
                {
                  id: Date.now(),
                  name: "",
                  batchNumber: "",
                  expiryDate: "",
                  quantity: 0,
                  purchasePrice: 0,
                  sellingPrice: 0,
                },
              ],
            }
          : purchase
      )
    );
  };

  const removeMedicine = (purchaseId: number, medicineId: number) => {
    setPurchases((prev) =>
      prev.map((purchase) =>
        purchase.id === purchaseId
          ? { ...purchase, medicines: purchase.medicines.filter((medicine) => medicine.id !== medicineId) }
          : purchase
      )
    );
  };

  const handleSubmit = async () => {
    try {
      for (const purchase of purchases) {
        for (const medicine of purchase.medicines) {
          if (!validateMedicineFields(medicine)) {
            toast.error("Please fill in all the compulsory fields for each medicine.");
            return;
          }

          await invoke("insert_medicine", {
            name: medicine.name,
            batchNumber: medicine.batchNumber,
            expiryDate: medicine.expiryDate,
            quantity: medicine.quantity,
            purchasePrice: medicine.purchasePrice,
            sellingPrice: medicine.sellingPrice,
            wholesalerName: purchase.wholesalerName,
            purchaseDate: purchase.purchaseDate,
          });
        }
      }
      toast.success("Purchase confirmed and medicines added successfully!");
    } catch (error) {
      console.error("Error adding medicines:", error);
      toast.error("Failed to confirm purchase.");
    }
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
              onChange={(e) => handlePurchaseChange(purchase.id, "wholesalerName", e.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              label="Purchase Date"
              type="date"
              value={purchase.purchaseDate}
              onChange={(e) => handlePurchaseChange(purchase.id, "purchaseDate", e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
            />
          </div>

          <Typography variant="h6" className="font-semibold mb-4">
            Medicines List
          </Typography>
          {purchase.medicines.map((medicine) => (
            <div key={medicine.id} className="grid grid-cols-7 gap-4 mb-4">
              <TextField
                label="Medicine Name"
                value={medicine.name}
                onChange={(e) => handleMedicineChange(purchase.id, medicine.id, "name", e.target.value)}
                size="small"
              />
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
              <IconButton onClick={() => removeMedicine(purchase.id, medicine.id)} color="error">
                <DeleteOutline />
              </IconButton>
            </div>
          ))}

          <Button
            startIcon={<AddCircleOutline />}
            variant="outlined"
            size="small"
            onClick={() => addMedicine(purchase.id)}
            className="mb-4"
          >
            Add Medicine
          </Button>
        </div>
      ))}

      <Divider className="mb-6" />

      <Button variant="contained" onClick={handleSubmit} color="primary" fullWidth>
        Confirm Purchase
      </Button>
    </div>
  );
};

export default StockAdd;
