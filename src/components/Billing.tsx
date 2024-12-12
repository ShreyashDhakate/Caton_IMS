import { useState, useEffect } from "react";
import { Location } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { invoke } from "@tauri-apps/api/core";
import debounce from "lodash.debounce";
import BillingSummary from "./BillingSummary";
import { printBill } from "../hooks/printBill";
import { Typography } from "@mui/material";
import { salesDb } from "../lib/db";

interface Props {
  location: Location & {
    state: { appointmentId?: string };
  };
}

export type MedicineInfo = {
  id: string;
  name: string;
  sellingPrice: number;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
};

interface MedicineDetail {
  id: string; // Medicine ID
  quantity: number;
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


const Billing: React.FC<Props> = ({ location }) => {  // const location = useLocation();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MedicineInfo[]>([]);
  const [selectedMedicines, setSelectedMedicines] = useState<
    { medicine: MedicineInfo; quantity: number }[]
  >([]);
  const [customerName, setCustomerName] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [billingId] = useState(Math.floor(Math.random() * 100000));

  const hospitalName: string = localStorage.getItem("hospital") ?? "";
  const hospitalPhone: string = localStorage.getItem("phone") ?? "";
  const hospitalAddress: string = localStorage.getItem("address") ?? "";

  // Store patient details if redirected from Patients page
  const [patientDetails, setPatientDetails] = useState<{
    patient_name: string;
    disease: string;
    precautions: string;
    medicines: MedicineDetail[];
  } | null>(null);

  useEffect(() => {
    const appointmentId = location?.state?.appointmentId;
    console.log("Appointment ID:", appointmentId);  // const appointmentId = location.state?.appointmentId;
    const fetchMedicineDetails = async (medicines: MedicineDetail[]) => {
      try {
        const fetchedMedicines = await Promise.all(
          medicines.map(async (medicine) => {
            // Fetch the backend medicine details
            const details: BackendMedicine = await invoke("get_medicine_by_id", {
              medicineId: medicine.id,
            });
    
            // Map BackendMedicine to MedicineInfo
            const mappedMedicine: MedicineInfo = {
              id: details._id ? details._id.$oid : "", // Extract $oid or provide a fallback
              name: details.name,
              sellingPrice: details.selling_price,
              batchNumber: details.batch_number,
              expiryDate: details.expiry_date,
              quantity: details.quantity,
            };
    
            // Return the mapped medicine with quantity
            return {
              medicine: mappedMedicine,
              quantity: medicine.quantity, // Use the quantity from the input
            };
          })
        );
        // console.log("fetched medicines: ",fetchedMedicines);
        

        setSelectedMedicines(fetchedMedicines);
      } catch (error) {
        console.error("Error fetching medicine details:", error);
        toast.error("Failed to fetch medicine details. Redirecting...");
        navigate("/patients");
      }

    // const appointmentId = location.state?.appointmentId;
    if (appointmentId) {
      const appointmentKey = `appointment_${appointmentId}`;
      const storedDetails = localStorage.getItem(appointmentKey);

      if (storedDetails) {
        const details = JSON.parse(storedDetails);
        setPatientDetails(details);

        setCustomerName(details.patient_name);
        fetchMedicineDetails(details.medicines);
      } else {
        toast.error("Patient details not found. Redirecting...");
        navigate("/patients");
      }
    }
  }}, [location.state, navigate]);

  // Search for medicines
  const handleSearchMedicine = async (query: string) => {
    try {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      const userId = localStorage.getItem("userId");
      const results: BackendMedicine[] = await invoke("search_medicines", {
        query,
        hospitalId: userId,
      });

      const mappedResults: MedicineInfo[] = results.map((medicine) => ({
        id: medicine._id ? medicine._id.$oid : "", // Extract $oid or provide a fallback
        name: medicine.name,
        sellingPrice: medicine.selling_price,
        batchNumber: medicine.batch_number,
        expiryDate: medicine.expiry_date,
        quantity: medicine.quantity,
      }));

      setSearchResults(mappedResults);
    } catch (error) {
      console.error("Error searching medicines:", error);
      toast.error("Failed to fetch search results.");
    }
  };

  useEffect(() => {
    const debouncedSearch = debounce(() => handleSearchMedicine(query), 300);
    debouncedSearch();

    return () => {
      debouncedSearch.cancel();
    };
  }, [query]);

  // Add medicine to billing
  const addMedicineToBilling = (medicine: MedicineInfo) => {
    const existing = selectedMedicines.find(
      (item) => item.medicine.id === medicine.id
    );

    if (existing) {
      existing.quantity += 1;
      setSelectedMedicines([...selectedMedicines]);
    } else {
      setSelectedMedicines([
        ...selectedMedicines,
        { medicine, quantity: 1 },
      ]);
      toast.success("Medicine added for billing!");
    }
    setSearchResults([]);
    setQuery("");
  };

  const handleResetForm = () => {
    setCustomerName("");
    setPatientDetails(null);
    setSelectedMedicines([]);
    setQuery("");
    toast.success("Form reset successfully!");
  };

  // Confirm purchase and reduce inventory
  const handleConfirmPurchase = async () => {
    if (!customerName) {
      toast.error("Customer name is required!");
      return;
    }
  
    if (!billingId) {
      toast.error("Billing ID is required!");
      return;
    }
  
    if (!selectedMedicines || selectedMedicines.length === 0) {
      toast.error("No medicines selected for purchase!");
      return;
    }
  
    try {
      // Calculate total cost of the purchase
      const totalCost = selectedMedicines.reduce(
        (sum, item) => sum + item.medicine.sellingPrice * item.quantity,
        0
      );
  
      // Add a new sale entry to the `sales` table
      const saleId = await salesDb.sales.add({
        purchase_date: new Date().toISOString(),
        customer_name: customerName,
        total_cost: totalCost,
        medicines: []
      });
  
      // Map selected medicines to this sale in the `saleMedicines` table
      await salesDb.saleMedicines.bulkPut(
        selectedMedicines.map((item) => ({
          sale_id: saleId,
          medicine_id: item.medicine.id,
          quantity: item.quantity,
          selling_price: item.medicine.sellingPrice,
        }))
      );
      toast.success("Purchase confirmed and inventory updated!");
      setOpenDialog(true);
      // Update inventory by reducing batch quantities
      for (const item of selectedMedicines) {
        await invoke("reduce_batch", {
          id: item.medicine.id,
          batchNumber: item.medicine.batchNumber,
          quantity: item.quantity,
        });
      }
  
      // // Notify the user of success
      toast.success("inventory update recovered!");
      // setOpenDialog(true);
    } catch (error) {
      console.error("Error confirming purchase:", error);
      toast.error("Failed to confirm purchase. Please try again.");
    }
  };
  

  // Print the bill
  const handlePrintBill = () => {
    const today = new Date();
    const billingDate = today.toLocaleDateString("en-US");

    console.log("selected Medicines: ", selectedMedicines);

    printBill(
      selectedMedicines,
      customerName,
      billingId,
      billingDate,
      patientDetails?.disease || "",
      patientDetails?.precautions || "",
      hospitalName,
      hospitalAddress,
      hospitalPhone
    );
    setSelectedMedicines([]);
  setCustomerName(""); // Clear customer name
  setPatientDetails(null); // Clear patient details including disease and precautions
  setOpenDialog(false); // Close the dialog
  toast.success("Bill printed successfully!");
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <div className="mx-auto p-4 border border-gray-300 rounded-lg h-full relative">
      <div className="font-bold text-2xl">{hospitalName}</div>
      <div className="text-sm text-gray-600">{hospitalAddress}</div>
      <div className="text-sm text-gray-600">{hospitalPhone}</div>

      {patientDetails && (
        <div className="mt-4">
          <h3>Patient Details</h3>
          <p>
            <strong>Name:</strong> {patientDetails.patient_name}
          </p>
          <p>
            <strong>Disease:</strong> {patientDetails.disease}
          </p>
          <p>
            <strong>Precautions:</strong> {patientDetails.precautions}
          </p>
        </div>
      )}

      <div className="mt-5 mb-4">
        <input
          type="text"
          placeholder="Search medicine..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border border-gray-300 rounded p-2 w-full text-sm"
        />
        {searchResults.length > 0 && (
  <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 shadow-lg">
    {searchResults.map((medicine, index) => (
      <li
        key={index}
        className="p-3 cursor-pointer hover:bg-gray-200 flex flex-col space-y-2"
        onClick={() => addMedicineToBilling(medicine)}
      >
        <Typography variant="body2" className="text-gray-800">
          <strong>{medicine.name}</strong>
        </Typography>
        <Typography variant="body2" className="text-gray-600">
          Batch: {medicine.batchNumber} | Qty: {medicine.quantity} | Price: ₹{medicine.sellingPrice.toFixed(2)} | Exp:{" "}
          {medicine.expiryDate}
        </Typography>
      </li>
    ))}
  </ul>
)}

      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="border border-gray-300 rounded p-2 w-full text-sm"
        />
      </div>

      <BillingSummary
        selectedMedicines={selectedMedicines}
        setSelectedMedicines={setSelectedMedicines}
      />

      <div className="flex items-center justify-center mt-4 space-x-4">
        <button
          onClick={handleConfirmPurchase}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Confirm Purchase
        </button>
        <button
          onClick={handleResetForm}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Reset
        </button>
      </div>

      {openDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded p-4">
            <h4 className="font-bold">Confirm Purchase</h4>
            <p>Are you sure you want to print the bill?</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleCloseDialog}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handlePrintBill}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Yes, Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;

