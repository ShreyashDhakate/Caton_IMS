import React, { useState, useEffect } from "react";
import loader from "./animations/loader.json";
import Lottie from "lottie-react";
import {
    fetchAllMedicines,
    syncDoctorMedicinesFromMongoDB,
} from "../lib/doctorstock";

// Define the Medicine type to match the backend structure
export interface Medicine {
    id: string;
    name: string;
    batchNumber: string;
    expiryDate: string;
    quantity: number;
    purchasePrice: number;
    sellingPrice: number;
}

const MedicineViewer: React.FC = () => {
    const [medicines, setMedicines] = useState<Medicine[]>([]); // List of medicines
    const [loading, setLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSyncMedicines = async () => {
        if (isSyncing) return; // Prevent multiple clicks

        setIsSyncing(true); // Set the syncing state to true
        try {
            await syncDoctorMedicinesFromMongoDB(); // Call the imported function
            console.log("Medicines synced successfully!");
        } catch (error) {
            console.error("Error syncing medicines:", error);
        } finally {
            setIsSyncing(false); // Reset the syncing state
        }
    };

    const loaderOptions = {
        loop: true,
        autoplay: true,
        animationData: loader,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    };

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
    }, []);

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-indigo-600">Medicine Manager</h1>
        <button
          onClick={handleSyncMedicines}
          className={`${
            isSyncing ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
          } text-white px-4 py-2 rounded`}
          disabled={isSyncing} // Disable the button while syncing
        >
          {isSyncing ? "Syncing..." : "Sync Medicines"}
        </button>
      </div>
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
                            {["Name", "Batch Number", "Expiry", "Quantity", "Purchase Price", "Selling Price"].map(
                                (header) => (
                                    <th
                                        key={header}
                                        className="border border-gray-300 px-4 py-2 text-left"
                                    >
                                        {header}
                                    </th>
                                )
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {medicines.map((medicine) => (
                            <tr key={medicine.id} className="hover:bg-gray-100">
                                <td className="border border-gray-300 px-4 py-2">{medicine.name}</td>
                                <td className="border border-gray-300 px-4 py-2">{medicine.batchNumber}</td>
                                <td className="border border-gray-300 px-4 py-2">{medicine.expiryDate}</td>
                                <td className="border border-gray-300 px-4 py-2">{medicine.quantity}</td>
                                <td className="border border-gray-300 px-4 py-2">{medicine.purchasePrice}</td>
                                <td className="border border-gray-300 px-4 py-2">{medicine.sellingPrice}</td>
                                {/* <td className="border border-gray-300 px-4 py-2">{medicine.wholesaler_name}</td>
                <td className="border border-gray-300 px-4 py-2">{medicine.purchase_date}</td> */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default MedicineViewer;
