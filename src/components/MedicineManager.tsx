import React, { useState, useEffect } from "react";
import loader from "./animations/loader.json"
import Lottie from "lottie-react";
import { fetchAllMedicines, updateMedicine, deleteLocalMedicine, syncMedicinesToMongoDB } from "../lib/stockdb";
// Define the Medicine type to match the backend structure
type Medicine = {
  [x: string]: any;
  // _id?: { $oid: string }; // Optional, matches `Option<ObjectId>` in Rust
  id: string;
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

const MedicineManager: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]); // List of medicines
  const [medicineToEdit, setMedicineToEdit] = useState<Medicine | null>(null); // Medicine being edited
  const [medicineToRemove, setMedicineToRemove] = useState<string | null>(null); // Medicine ID to remove
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // Toggle Edit Dialog
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false); // Toggle Remove Dialog
  const [loading, setLoading] = useState(false);


  const loaderOptions = {
    loop: true,
    autoplay: true,
    animationData: loader,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };



  const hospitalId = localStorage.getItem("userId");
  console.log(hospitalId);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const medicines = await fetchAllMedicines();
      console.log(medicines);
      setMedicines(medicines);
    } catch (error) {
      console.error("Error fetching medicines from IndexedDB:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      fetchMedicines();
    }, [hospitalId]);
  // Update stock of a medicine
  const updateStock = async (updatedMedicine: Medicine) => {
    setMedicines((prev) =>
      prev.map((medicine) =>
        medicine.id === updatedMedicine.id ? updatedMedicine : medicine
      )
    );
    setIsEditDialogOpen(false);
    try {
      await updateMedicine(updatedMedicine.id, updatedMedicine);
      fetchMedicines();
    } catch (error) {
      console.error("Error updating medicine in IndexedDB:", error);
    }
  };

  // Delete a medicine
  const deleteMedicine = async (medicineId: string) => {
    setMedicines((prev) => prev.filter((medicine) => medicine.id !== medicineId));
    console.log(medicineId);
    try {
      await deleteLocalMedicine(medicineId);
      fetchMedicines();
      setIsRemoveDialogOpen(false);
    } catch (error) {
      console.error("Error deleting medicine from IndexedDB:", error);
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

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-indigo-600">Medicine Manager</h1>

      {/* Medicine Table */}
      {loading ? (
        // Render loader when loading
        <div className="flex justify-center items-center h-64">
          <Lottie
            animationData={loaderOptions.animationData}
            loop={loaderOptions.loop}
            autoplay={loaderOptions.autoplay}
            style={{ width: 150, height: 150 }}
          />

        </div>
      ) : (
        // Medicine Table
        <table className="table-auto w-full border-collapse border border-gray-300 rounded-lg shadow-md overflow-hidden">
          <thead>
            <tr className="bg-indigo-200 text-indigo-900">
              {[
                "Name",
                "Batch",
                "Expiry",
                "Quantity",
                "Purchase Price",
                "Selling Price",
                "Wholesaler",
                "Purchase Date",
                "Actions",
              ].map((header) => (
                <th key={header} className="border border-gray-300 px-4 py-2 text-left">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {medicines.map((medicine) => (
              <tr key={medicine.id} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2">{medicine.name}</td>
                <td className="border border-gray-300 px-4 py-2">{medicine.batch_number}</td>
                <td className="border border-gray-300 px-4 py-2">{medicine.expiry_date}</td>
                <td className="border border-gray-300 px-4 py-2">{medicine.quantity}</td>
                <td className="border border-gray-300 px-4 py-2">{medicine.purchase_price}</td>
                <td className="border border-gray-300 px-4 py-2">{medicine.selling_price}</td>
                <td className="border border-gray-300 px-4 py-2">{medicine.wholesaler_name}</td>
                <td className="border border-gray-300 px-4 py-2">{medicine.purchase_date}</td>
                <td className="border border-gray-300 px-4 py-2 flex space-x-2">
                  <button
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={() => {
                      setMedicineToRemove(medicine.id!);
                      setIsRemoveDialogOpen(true);
                    }}
                  >
                    Remove
                  </button>
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => {
                      setMedicineToEdit(medicine);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Edit Dialog */}
      {isEditDialogOpen && medicineToEdit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md w-1/2">
            <h2 className="text-2xl font-bold mb-4">Edit Medicine</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (medicineToEdit) updateStock(medicineToEdit);
              }}
            >
              <div className="flex flex-col mb-4">
                <label className="mb-1">Name</label>
                <input
                  type="text"
                  value={medicineToEdit?.name}
                  onChange={(e) =>
                    setMedicineToEdit({ ...medicineToEdit, name: e.target.value })
                  }
                  className="border px-2 py-1"
                />
              </div>
              <div className="flex flex-col mb-4">
                <label className="mb-1">Batch Number</label>
                <input
                  type="text"
                  value={medicineToEdit?.batch_number}
                  onChange={(e) =>
                    setMedicineToEdit({
                      ...medicineToEdit,
                      batch_number: e.target.value,
                    })
                  }
                  className="border px-2 py-1"
                />
              </div>
              <div className="flex flex-col mb-4">
                <label className="mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={medicineToEdit?.expiry_date}
                  onChange={(e) =>
                    setMedicineToEdit({
                      ...medicineToEdit,
                      expiry_date: e.target.value,
                    })
                  }
                  className="border px-2 py-1"
                />
              </div>
              <div className="flex flex-col mb-4">
                <label className="mb-1">Quantity</label>
                <input
                  type="number"
                  value={medicineToEdit?.quantity}
                  onChange={(e) =>
                    setMedicineToEdit({
                      ...medicineToEdit,
                      quantity: parseInt(e.target.value, 10),
                    })
                  }
                  className="border px-2 py-1"
                />
              </div>
              <div className="flex flex-col mb-4">
                <label className="mb-1">Purchase Price</label>
                <input
                  type="number"
                  value={medicineToEdit?.purchase_price}
                  onChange={(e) =>
                    setMedicineToEdit({
                      ...medicineToEdit,
                      purchase_price: parseFloat(e.target.value),
                    })
                  }
                  className="border px-2 py-1"
                />
              </div>
              <div className="flex flex-col mb-4">
                <label className="mb-1">Selling Price</label>
                <input
                  type="number"
                  value={medicineToEdit?.selling_price}
                  onChange={(e) =>
                    setMedicineToEdit({
                      ...medicineToEdit,
                      selling_price: parseFloat(e.target.value),
                    })
                  }
                  className="border px-2 py-1"
                />
              </div>
              <div className="flex flex-col mb-4">
                <label className="mb-1">Wholesaler Name</label>
                <input
                  type="text"
                  value={medicineToEdit?.wholesaler_name}
                  onChange={(e) =>
                    setMedicineToEdit({
                      ...medicineToEdit,
                      wholesaler_name: e.target.value,
                    })
                  }
                  className="border px-2 py-1"
                />
              </div>
              <div className="flex flex-col mb-4">
                <label className="mb-1">Purchase Date</label>
                <input
                  type="date"
                  value={medicineToEdit?.purchase_date}
                  onChange={(e) =>
                    setMedicineToEdit({
                      ...medicineToEdit,
                      purchase_date: e.target.value,
                    })
                  }
                  className="border px-2 py-1"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Remove Confirmation Dialog */}
      {isRemoveDialogOpen && medicineToRemove && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md">
            <h2 className="text-xl font-bold mb-4">Confirm Removal</h2>
            <p className="mb-4">Are you sure you want to remove this medicine?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsRemoveDialogOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMedicine(medicineToRemove)}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineManager;
