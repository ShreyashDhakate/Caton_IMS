import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

import { useToast } from "./ui/sonner";
import { v4 as uuidv4 } from "uuid";
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
  const { addToast } = useToast();
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([]);
  const [selectedWholesaler, setSelectedWholesaler] = useState<Wholesaler | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeletePurchaseDialog, setOpenDeletePurchaseDialog] = useState(false);

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
        wholesalers.sort((a, b) => a.wholesalerName.localeCompare(b.wholesalerName))
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
      addToast("Medicine removed successfully!","success");
      try {
        await db.medicines.delete(medicineToRemove);
        const result = await invoke("delete_medicine", {
          hospitalId,
          medicineId: medicineToRemove,
        });
        console.log(result);

        const updatedMedicines = selectedWholesaler.medicines.filter(
          (medicine) => medicine.id !== medicineToRemove
        );

        updateWholesalerMedState(updatedMedicines);

        setOpenDialog(false);
      } catch (error) {
        console.error("Error removing stock:", error);
        addToast("Error removing medicine!","error");
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
        addToast("Edited Medicine Successfully!","success");
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
        setWholesalers((prev) => prev.filter((w) => w.id !== selectedWholesaler.id));
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
                {["Name", "Batch", "Expiry", "Quantity", "Purchase Price", "Selling Price", "Actions"].map(
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
      {openDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md w-11/12 md:w-1/3">
            <h2 className="text-lg font-bold mb-4">Remove Medicine</h2>
            <p className="mb-4">Are you sure you want to remove this medicine from the stock?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setOpenDialog(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveStock}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Medicine Dialog */}
      {openEditDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md w-11/12 md:w-1/3">
            <h2 className="text-lg font-bold mb-4">Edit Medicine</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={medicineToEdit?.quantity || ""}
                  onChange={(e) =>
                    setMedicineToEdit((prev) => ({
                      ...prev!,
                      quantity: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Purchase Price</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={medicineToEdit?.purchasePrice || ""}
                  onChange={(e) =>
                    setMedicineToEdit((prev) => ({
                      ...prev!,
                      purchasePrice: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Selling Price</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={medicineToEdit?.sellingPrice || ""}
                  onChange={(e) =>
                    setMedicineToEdit((prev) => ({
                      ...prev!,
                      sellingPrice: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Batch Number</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={medicineToEdit?.batchNumber || ""}
                  onChange={(e) =>
                    setMedicineToEdit((prev) => ({
                      ...prev!,
                      batchNumber: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expiry Date</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={medicineToEdit?.expiryDate || ""}
                  onChange={(e) =>
                    setMedicineToEdit((prev) => ({
                      ...prev!,
                      expiryDate: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setOpenEditDialog(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleEditStock}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Purchase Confirmation Dialog */}
      {openDeletePurchaseDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md w-11/12 md:w-1/3">
            <h2 className="text-lg font-bold mb-4">Delete Purchase</h2>
            <p className="mb-4">
              Are you sure you want to delete this entire purchase record? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setOpenDeletePurchaseDialog(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePurchase}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManager;

