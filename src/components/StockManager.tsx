import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Button,
} from "@mui/material";
import { fetchAndGroupMedicines } from "../lib/stockdb";
import { db } from "../lib/db";

interface Medicine {
  id: string;
  name: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
}

interface Wholesaler {
  id: string;
  wholesalerName: string;
  purchaseDate: string;
  medicines: Medicine[];
}

const StockManager: React.FC = () => {
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([]);
  const [selectedWholesaler, setSelectedWholesaler] =
    useState<Wholesaler | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeletePurchaseDialog, setOpenDeletePurchaseDialog] =
    useState(false);

  const [medicineToRemove, setMedicineToRemove] = useState<string | null>(null);
  const [medicineToEdit, setMedicineToEdit] = useState<Medicine | null>(null);

  const hospitalId = localStorage.getItem("userId");
  const fetchWholesalers = async () => {
    const groupedData = await fetchAndGroupMedicines();
    setWholesalers(groupedData);
    try {
      if (!hospitalId) throw new Error("Invalid hospital ID");
      const rawResult = await invoke("get_stock", { hospitalId });
      console.log(rawResult);
      const wholesalers: Wholesaler[] = Array.isArray(rawResult)
        ? rawResult.map((wholesaler) => ({
            id: uuidv4(),
            wholesalerName: wholesaler.wholesaler_name,
            purchaseDate: wholesaler.purchase_date,
            medicines: wholesaler.medicines.map((med: any) => ({
              id: med._id.$oid,
              name: med.name,
              batchNumber: med.batch_number,
              expiryDate: med.expiry_date,
              quantity: med.quantity,
              purchasePrice: med.purchase_price,
              sellingPrice: med.selling_price,
            })),
          }))
        : [];

      console.log(wholesalers);

      setWholesalers(
        wholesalers.sort((a, b) =>
          a.wholesalerName.localeCompare(b.wholesalerName)
        )
      );
    } catch (error) {
      console.error("Error fetching stock:", error);
    }
  };

  useEffect(() => {
    fetchWholesalers();
  }, [hospitalId]);

  const handleRemoveStock = async () => {
    if (selectedWholesaler && medicineToRemove !== null) {
      await db.medicines.delete(medicineToRemove);

      setOpenDialog(false);
      fetchWholesalers();
      toast.success("Medicine removed successfully!");
      try {
        await db.medicines.delete(medicineToRemove);
        const result = await invoke("delete_medicine", {
          hospitalId,
          medicineId: medicineToRemove,
        });
        console.log(result);

        // Remove the medicine from the selected wholesaler's medicines
        const updatedMedicines = selectedWholesaler.medicines.filter(
          (medicine) => medicine.id !== medicineToRemove
        );

        // Update the state for selected wholesaler
        updateWholesalerMedState(updatedMedicines);

        // Close the dialog after successful deletion
        setOpenDialog(false);
        // toast.success("Medicine removed successfully!");
      } catch (error) {
        console.error("Error removing stock:", error);
        toast.error("Error removing medicine!");
      }
    }
  };

  const updateWholesalerMedState = (updatedMedicines: Medicine[]) => {
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

  const handleEditStock = async () => {
    console.log(medicineToEdit?.id);
    if (!medicineToEdit || !medicineToEdit.id) {
      console.error("Invalid medicine ID");
      return;
    }

    if (selectedWholesaler) {
      console.log("Medicine to edit:", medicineToEdit);
      console.log("Updating stock with:", {
        hospitalId,
        medicineId: medicineToEdit?.id,
        quantity: medicineToEdit?.quantity,
        purchase_price: medicineToEdit?.purchasePrice,
        selling_price: medicineToEdit?.sellingPrice,
        batch_number: medicineToEdit?.batchNumber,
        expiry_date: medicineToEdit?.expiryDate,
      });

      try {
        await invoke("update_stock", {
          hospitalId,
          medicineId: medicineToEdit.id,
          quantity: medicineToEdit.quantity,
          purchase_price: medicineToEdit.purchasePrice,
          selling_price: medicineToEdit.sellingPrice,
          batch_number: medicineToEdit.batchNumber,
          expiry_date: medicineToEdit.expiryDate,
        });
        updateWholesalerState();
        setOpenEditDialog(false);
        toast.success("Edited Medicine Successfully!");
      } catch (error) {
        console.error("Error editing stock:", error);
      }
    }
  };

  const handleDeletePurchase = async () => {
    if (selectedWholesaler) {
      try {
        await invoke("delete_purchase", {
          wholesalerId: selectedWholesaler.id,
        });
        setWholesalers((prev) =>
          prev.filter((w) => w.id !== selectedWholesaler.id)
        );
        setSelectedWholesaler(null);
        setOpenDeletePurchaseDialog(false);
      } catch (error) {
        console.error("Error deleting purchase:", error);
      }
    }
  };

  const updateWholesalerState = (updatedMedicines?: Medicine[]) => {
    setSelectedWholesaler((prev) =>
      prev ? { ...prev, medicines: updatedMedicines || prev.medicines } : null
    );
    setWholesalers((prev) =>
      prev.map((wholesaler) =>
        wholesaler.id === selectedWholesaler?.id
          ? {
              ...wholesaler,
              medicines: updatedMedicines || wholesaler.medicines,
            }
          : wholesaler
      )
    );
  };

  return (
    <div className="container mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold mb-5 text-center">Stock Manager</h1>
      {!selectedWholesaler ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wholesalers.map((wholesaler) => (
            <div
              key={wholesaler.id}
              className="border p-4 rounded shadow hover:shadow-lg"
            >
              <h2 className="text-xl font-semibold mb-2">
                {wholesaler.wholesalerName}
              </h2>
              <p className="text-sm">
                Purchase Date: {wholesaler.purchaseDate}
              </p>
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
              onClick={() => setOpenDeletePurchaseDialog(true)}
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
                {[
                  "Name",
                  "Batch",
                  "Expiry",
                  "Quantity",
                  "Purchase Price",
                  "Selling Price",
                  "Actions",
                ].map((header) => (
                  <th key={header} className="border border-gray-300 px-4 py-2">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedWholesaler.medicines.map((medicine) => (
                <tr key={medicine.id}>
                  <td className="border border-gray-300 px-4 py-2">
                    {medicine.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {medicine.batchNumber}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {medicine.expiryDate}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {medicine.quantity}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {medicine.purchasePrice}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {medicine.sellingPrice}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      className="px-2 py-1 mr-2 bg-red-600 text-white rounded hover:bg-red-700"
                      onClick={() => {
                        setMedicineToRemove(medicine.id);
                        setOpenDialog(true);
                      }}
                    >
                      Remove
                    </button>
                    <button
                      className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => {
                        setMedicineToEdit(medicine);
                        setOpenEditDialog(true);
                      }}
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

      {/* Remove Medicine Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Remove Medicine</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove this medicine from the stock?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleRemoveStock} color="secondary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Medicine Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Medicine</DialogTitle>
        <DialogContent>
          <TextField
            label="Quantity"
            value={medicineToEdit?.quantity || ""}
            onChange={(e) =>
              setMedicineToEdit((prev) => ({
                ...prev!,
                quantity: Number(e.target.value),
              }))
            }
            fullWidth
            margin="normal"
            type="number"
          />
          <TextField
            label="Purchase Price"
            value={medicineToEdit?.purchasePrice || ""}
            onChange={(e) =>
              setMedicineToEdit((prev) => ({
                ...prev!,
                purchasePrice: Number(e.target.value),
              }))
            }
            fullWidth
            margin="normal"
            type="number"
          />
          <TextField
            label="Selling Price"
            value={medicineToEdit?.sellingPrice || ""}
            onChange={(e) =>
              setMedicineToEdit((prev) => ({
                ...prev!,
                sellingPrice: Number(e.target.value),
              }))
            }
            fullWidth
            margin="normal"
            type="number"
          />
          <TextField
            label="Batch Number"
            value={medicineToEdit?.batchNumber || ""}
            onChange={(e) =>
              setMedicineToEdit((prev) => ({
                ...prev!,
                batchNumber: e.target.value,
              }))
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Expiry Date"
            value={medicineToEdit?.expiryDate || ""}
            onChange={(e) =>
              setMedicineToEdit((prev) => ({
                ...prev!,
                expiryDate: e.target.value,
              }))
            }
            fullWidth
            margin="normal"
            type="date"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleEditStock} color="secondary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Purchase Dialog */}
      <Dialog
        open={openDeletePurchaseDialog}
        onClose={() => setOpenDeletePurchaseDialog(false)}
      >
        <DialogTitle>Delete Purchase</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this purchase record?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDeletePurchaseDialog(false)}
            color="primary"
          >
            Cancel
          </Button>
          <Button onClick={handleDeletePurchase} color="secondary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default StockManager;
