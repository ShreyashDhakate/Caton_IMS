// components/PharmacyStockUpdate.tsx

import React, { useState } from "react";
import { TextField, Button, IconButton, Typography, Divider } from "@mui/material";
import { AddCircleOutline, DeleteOutline } from "@mui/icons-material";
import dayjs from "dayjs";

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

const PharmacyStockUpdate: React.FC = () => {
  const [purchases, setPurchases] = useState<WholesalerPurchase[]>([
    {
      id: 1,
      wholesalerName: "",
      purchaseDate: dayjs().format("YYYY-MM-DD"),
      medicines: [
        {
          id: 1,
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

  // Handle input change for wholesaler or purchase date
  const handlePurchaseChange = (id: number, field: keyof WholesalerPurchase, value: string) => {
    setPurchases((prev) =>
      prev.map((purchase) => (purchase.id === id ? { ...purchase, [field]: value } : purchase))
    );
  };

  // Handle input change for medicines inside a purchase
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

  // Add a new medicine row inside a purchase
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

  // Remove a medicine row from a purchase
  const removeMedicine = (purchaseId: number, medicineId: number) => {
    setPurchases((prev) =>
      prev.map((purchase) =>
        purchase.id === purchaseId
          ? { ...purchase, medicines: purchase.medicines.filter((medicine) => medicine.id !== medicineId) }
          : purchase
      )
    );
  };

  // Handle submit
  const handleSubmit = () => {
    console.log("Purchases:", purchases);
    alert("Purchase Confirmed!");
  };

  return (
    <div className="p-6  mx-auto bg-white shadow-lg rounded-lg">
      <Typography variant="h4" className="text-center font-bold mb-8">
        Pharmacy Stock Update
      </Typography>

      {purchases.map((purchase) => (
        <div key={purchase.id} className="mb-10">
          {/* Wholesaler Information */}
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

          {/* Medicine Table */}
          <Typography variant="h6" className="font-semibold mb-4">
            Medicines List
          </Typography>
          {purchase.medicines.map((medicine) => (
            <div key={medicine.id} className="grid grid-cols-7 gap-4 mb-4">
              <TextField
                label="Medicine Name"
                value={medicine.name}
                onChange={(e) =>
                  handleMedicineChange(purchase.id, medicine.id, "name", e.target.value)
                }
                size="small"
              />
              <TextField
                label="Batch Number"
                value={medicine.batchNumber}
                onChange={(e) =>
                  handleMedicineChange(purchase.id, medicine.id, "batchNumber", e.target.value)
                }
                size="small"
              />
              <TextField
                label="Expiry Date"
                type="date"
                value={medicine.expiryDate}
                onChange={(e) =>
                  handleMedicineChange(purchase.id, medicine.id, "expiryDate", e.target.value)
                }
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <TextField
                label="Quantity"
                type="number"
                value={medicine.quantity}
                onChange={(e) =>
                  handleMedicineChange(purchase.id, medicine.id, "quantity", +e.target.value)
                }
                size="small"
              />
              <TextField
                label="Purchase Price"
                type="number"
                value={medicine.purchasePrice}
                onChange={(e) =>
                  handleMedicineChange(purchase.id, medicine.id, "purchasePrice", +e.target.value)
                }
                size="small"
              />
              <TextField
                label="Selling Price"
                type="number"
                value={medicine.sellingPrice}
                onChange={(e) =>
                  handleMedicineChange(purchase.id, medicine.id, "sellingPrice", +e.target.value)
                }
                size="small"
              />
              <IconButton onClick={() => removeMedicine(purchase.id, medicine.id)} color="error">
                <DeleteOutline />
              </IconButton>
            </div>
          ))}

          <Button
            variant="contained"
            startIcon={<AddCircleOutline />}
            onClick={() => addMedicine(purchase.id)}
            className="mb-4"
          >
            Add Medicine
          </Button>

          <Divider className="my-6" />
        </div>
      ))}

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleSubmit}
        className="mt-6"
      >
        Confirm Purchase
      </Button>
    </div>
  );
};

export default PharmacyStockUpdate;
