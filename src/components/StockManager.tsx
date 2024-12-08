import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Button,
} from "@mui/material";

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
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([]);
  const [uniqueWholesalers, setUniqueWholesalers] = useState<{[key: string]: Wholesaler[]}>({});
  const [selectedWholesaler, setSelectedWholesaler] = useState<Wholesaler | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [medicineToRemove, setMedicineToRemove] = useState<number | null>(null);
  const [medicineToEdit, setMedicineToEdit] = useState<Medicine | null>(null);

  const hospitalId = localStorage.getItem("userId"); // Replace with dynamic user ID if available.

  // Fetch wholesalers from the backend
  useEffect(() => {
    const fetchWholesalers = async () => {
      try {
        const result: Wholesaler[] = await invoke("get_stock", { hospitalId });
        if (Array.isArray(result)) {
          // Extract unique wholesalers and their medicines grouped by purchase date
          const groupedByWholesalerAndDate: {[key: string]: Wholesaler[]} = {};
          result.forEach((wholesaler) => {
            const key = `${wholesaler.wholesalerName}_${wholesaler.purchaseDate}`;
            if (!groupedByWholesalerAndDate[key]) {
              groupedByWholesalerAndDate[key] = [];
            }
            groupedByWholesalerAndDate[key].push(wholesaler);
          });
          setUniqueWholesalers(groupedByWholesalerAndDate);

          // Convert the unique wholesalers array for display
          const validWholesalers = Object.keys(groupedByWholesalerAndDate).map((key) => {
            const [wholesalerName, purchaseDate] = key.split("_");
            return {
              id: Date.now() + Math.random(), // Assign a unique ID (You may replace this with a more robust ID generation mechanism)
              wholesalerName,
              purchaseDate,
              medicines: groupedByWholesalerAndDate[key].map((wholesaler) => wholesaler.medicines).flat()
            };
          });

          setWholesalers(validWholesalers);
        } else {
          console.error("Unexpected API response:", result);
        }
      } catch (error) {
        console.error("Error fetching stock:", error);
      }
    };
    fetchWholesalers();
  }, [hospitalId]);

  // Update the wholesalers' state after changes
  const updateWholesalerState = (updatedMedicines: Medicine[]) => {
    setSelectedWholesaler((prev) =>
      prev ? { ...prev, medicines: updatedMedicines } : null
    );
    setWholesalers((prev) =>
      prev.map((wholesaler) =>
        wholesaler.id === selectedWholesaler?.id
          ? { ...wholesaler, medicines: updatedMedicines }
          : wholesaler
      )
    );
  };

  // Remove a stock item
  const handleRemoveStock = (medicineId: number) => {
    setMedicineToRemove(medicineId);
    setOpenDialog(true);
  };

  const confirmRemoveStock = async () => {
    if (!selectedWholesaler || medicineToRemove === null) return;
    try {
      const updatedMedicines = await invoke("remove_medicine", {
        wholesalerId: selectedWholesaler.id,
        medicineId: medicineToRemove,
      });
      updateWholesalerState(updatedMedicines as Medicine[]);
    } catch (error) {
      console.error("Error removing stock:", error);
    } finally {
      setOpenDialog(false);
    }
  };

  // Edit a stock item
  const handleEditStock = (medicine: Medicine) => {
    setMedicineToEdit({ ...medicine });
    setOpenEditDialog(true);
  };

  const confirmEditStock = async () => {
    if (!selectedWholesaler || !medicineToEdit) return;
    try {
      const updatedMedicines = await invoke("update_medicine", {
        wholesalerId: selectedWholesaler.id,
        medicine: medicineToEdit,
      });
      updateWholesalerState(updatedMedicines as Medicine[]);
    } catch (error) {
      console.error("Error editing stock:", error);
    } finally {
      setOpenEditDialog(false);
    }
  };

  return (
    <div className="container mx-auto mt-10 p-6">
      <h1 className="text-3xl font-bold mb-5 text-center">Stock Manager</h1>

      {/* Wholesalers List */}
      {!selectedWholesaler ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wholesalers.map((wholesaler) => (
            <div key={wholesaler.id} className="border p-4 rounded shadow hover:shadow-lg">
              <h2 className="text-xl font-semibold">{wholesaler.wholesalerName}</h2>
              <p className="text-sm">Purchase Date: {wholesaler.purchaseDate}</p>
              <button
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => setSelectedWholesaler(wholesaler)}
              >
                View Stock
              </button>
            </div>
          ))}
        </div>
      ) : (
        // Stock Details
        <div>
          <div className="flex justify-between items-center mb-5">
            <button
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              onClick={() => setSelectedWholesaler(null)}
            >
              Back to Wholesalers
            </button>
          </div>
          <h2 className="text-2xl font-semibold mb-5">
            Stock for {selectedWholesaler.wholesalerName} - {selectedWholesaler.purchaseDate}
          </h2>
          <table className="table-auto w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                {["Name", "Batch", "Expiry", "Quantity", "Purchase Price", "Selling Price", "Actions"].map(
                  (header) => (
                    <th key={header} className="px-4 py-2 border">
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {selectedWholesaler.medicines.map((medicine) => (
                <tr key={medicine.id}>
                  <td className="px-4 py-2 border">{medicine.name}</td>
                  <td className="px-4 py-2 border">{medicine.batchNumber}</td>
                  <td className="px-4 py-2 border">{medicine.expiryDate}</td>
                  <td className="px-4 py-2 border">{medicine.quantity}</td>
                  <td className="px-4 py-2 border">{medicine.purchasePrice}</td>
                  <td className="px-4 py-2 border">{medicine.sellingPrice}</td>
                  <td className="px-4 py-2 border">
                    <button
                      className="px-2 py-1 bg-red-600 text-white rounded mr-2"
                      onClick={() => handleRemoveStock(medicine.id)}
                    >
                      Remove
                    </button>
                    <button
                      className="px-2 py-1 bg-green-600 text-white rounded"
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

      {/* Remove Stock Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Removal</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to remove this medicine?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={confirmRemoveStock} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Stock Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Medicine</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={medicineToEdit?.name || ""}
            onChange={(e) => setMedicineToEdit({ ...medicineToEdit!, name: e.target.value })}
            fullWidth
          />
          <TextField
            label="Batch Number"
            value={medicineToEdit?.batchNumber || ""}
            onChange={(e) => setMedicineToEdit({ ...medicineToEdit!, batchNumber: e.target.value })}
            fullWidth
          />
          <TextField
            label="Expiry Date"
            type="date"
            value={medicineToEdit?.expiryDate || ""}
            onChange={(e) => setMedicineToEdit({ ...medicineToEdit!, expiryDate: e.target.value })}
            fullWidth
          />
          <TextField
            label="Quantity"
            type="number"
            value={medicineToEdit?.quantity || ""}
            onChange={(e) => setMedicineToEdit({ ...medicineToEdit!, quantity: parseInt(e.target.value) })}
            fullWidth
          />
          <TextField
            label="Purchase Price"
            type="number"
            value={medicineToEdit?.purchasePrice || ""}
            onChange={(e) => setMedicineToEdit({ ...medicineToEdit!, purchasePrice: parseFloat(e.target.value) })}
            fullWidth
          />
          <TextField
            label="Selling Price"
            type="number"
            value={medicineToEdit?.sellingPrice || ""}
            onChange={(e) => setMedicineToEdit({ ...medicineToEdit!, sellingPrice: parseFloat(e.target.value) })}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={confirmEditStock} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default StockManager;
