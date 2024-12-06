import React, { useState } from "react";
import stockData from "./stocks.json";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Button,
} from "@mui/material";

// Define types for stock data
interface Medicine {
  id: number;
  name: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
}

interface Wholesaler {
  id: number;
  wholesalerName: string;
  purchaseDate: string;
  medicines: Medicine[];
}

const StockManager: React.FC = () => {
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>(stockData as Wholesaler[]);
  const [selectedWholesaler, setSelectedWholesaler] = useState<Wholesaler | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeletePurchaseDialog, setOpenDeletePurchaseDialog] = useState(false);
  const [medicineToRemove, setMedicineToRemove] = useState<number | null>(null);
  const [medicineToEdit, setMedicineToEdit] = useState<Medicine | null>(null);

  const handleViewStock = (id: number) => {
    setSelectedWholesaler(wholesalers.find((item) => item.id === id) || null);
  };

  const handleRemoveStock = (medicineId: number) => {
    setMedicineToRemove(medicineId);
    setOpenDialog(true);
  };

  const confirmRemoveStock = () => {
    if (!selectedWholesaler || medicineToRemove === null) return;
    const updatedMedicines = selectedWholesaler.medicines.filter(
      (medicine) => medicine.id !== medicineToRemove
    );
    updateWholesalerState(updatedMedicines);
    setOpenDialog(false);
  };

  const handleEditStock = (medicine: Medicine) => {
    setMedicineToEdit({ ...medicine });
    setOpenEditDialog(true);
  };

  const confirmEditStock = () => {
    if (!selectedWholesaler || !medicineToEdit) return;
    const updatedMedicines = selectedWholesaler.medicines.map((medicine) =>
      medicine.id === medicineToEdit.id ? medicineToEdit : medicine
    );
    updateWholesalerState(updatedMedicines);
    setOpenEditDialog(false);
  };

  const handleDeletePurchase = () => setOpenDeletePurchaseDialog(true);

  const confirmDeletePurchase = () => {
    if (!selectedWholesaler) return;
    setWholesalers((prev) => prev.filter((wholesaler) => wholesaler.id !== selectedWholesaler.id));
    setSelectedWholesaler(null);
    setOpenDeletePurchaseDialog(false);
  };

  const updateWholesalerState = (updatedMedicines: Medicine[]) => {
    setSelectedWholesaler((prev) => (prev ? { ...prev, medicines: updatedMedicines } : null));
    setWholesalers((prev) =>
      prev.map((wholesaler) =>
        wholesaler.id === selectedWholesaler?.id
          ? { ...wholesaler, medicines: updatedMedicines }
          : wholesaler
      )
    );
  };

  const cancelDialog = (dialogSetter: React.Dispatch<React.SetStateAction<boolean>>) =>
    dialogSetter(false);

  const renderTextField = (
    label: string,
    value: string | number,
    onChange: (value: string | number) => void,
    type = "text"
  ) => (
    <TextField
      label={label}
      type={type}
      value={value}
      fullWidth
      onChange={(e) =>
        onChange(type === "number" ? parseFloat(e.target.value) : e.target.value)
      }
      margin="dense"
    />
  );

  const handleStringInput = (value: string | number) =>
    typeof value === "string" ? value : String(value); // Ensure it's a string

  return (
    <div className="container mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold mb-5 text-center">Stock Manager</h1>
      {!selectedWholesaler ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wholesalers.map((wholesaler) => (
            <div key={wholesaler.id} className="border p-4 rounded shadow hover:shadow-lg">
              <h2 className="text-xl font-semibold mb-2">{wholesaler.wholesalerName}</h2>
              <p className="text-sm">Purchase Date: {wholesaler.purchaseDate}</p>
              <button
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => handleViewStock(wholesaler.id)}
              >
                View Stock
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-5">
            <button
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              onClick={() => setSelectedWholesaler(null)}
            >
              Back to Wholesalers
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={handleDeletePurchase}
            >
              Delete Purchase
            </button>
          </div>
          <h2 className="text-2xl font-semibold mb-3">
            Stock for {selectedWholesaler.wholesalerName}
          </h2>
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                {["id", "Name", "Batch", "Expiry", "Quantity", "Purchase Price", "Selling Price", "Actions"].map(
                  (header) => (
                    <th key={header} className="border border-gray-300 px-4 py-2">
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {selectedWholesaler.medicines.map((medicine) => (
                <tr key={medicine.id}>
                  {Object.values(medicine).map((value, idx) => (
                    <td key={idx} className="border border-gray-300 px-4 py-2">
                      {handleStringInput(value)} {/* Ensures value is a string */}
                    </td>
                  ))}
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      className="px-2 py-1 mr-2 bg-red-600 text-white rounded hover:bg-red-700"
                      onClick={() => handleRemoveStock(medicine.id)}
                    >
                      Remove
                    </button>
                    <button
                      className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      onClick={() => handleEditStock(medicine)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Dialog open={openDialog} onClose={() => cancelDialog(setOpenDialog)}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to remove this stock?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => cancelDialog(setOpenDialog)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmRemoveStock} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openEditDialog} onClose={() => cancelDialog(setOpenEditDialog)}>
        <DialogTitle>Edit Medicine</DialogTitle>
        <DialogContent>
          {medicineToEdit &&
            [
              ["Medicine Name", medicineToEdit.name, "text"],
              ["Batch Number", medicineToEdit.batchNumber, "text"],
              ["Expiry Date", medicineToEdit.expiryDate, "date"],
              ["Quantity", medicineToEdit.quantity, "number"],
              ["Purchase Price", medicineToEdit.purchasePrice, "number"],
              ["Selling Price", medicineToEdit.sellingPrice, "number"],
            ].map(([label, value]) =>
              renderTextField(label as string, value as string , (newValue) =>
                setMedicineToEdit((prev) =>
                  prev ? { ...prev, [typeof label === 'string' ? label.toLowerCase().replace(/ /g, "") : label]: newValue } : prev
                )
              )
            )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => cancelDialog(setOpenEditDialog)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmEditStock} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openDeletePurchaseDialog} onClose={() => cancelDialog(setOpenDeletePurchaseDialog)}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this purchase?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => cancelDialog(setOpenDeletePurchaseDialog)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDeletePurchase} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default StockManager;
