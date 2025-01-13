import { useState, useEffect } from "react";
import { Location } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ui/sonner";
import debounce from "lodash.debounce";
import BillingSummary from "./BillingSummary";
import { printBill } from "../hooks/printBill";
import { fetchMedicineById, searchMedicines, syncMedicinesToMongoDB, updateMedicine } from "../lib/stockdb";
import { salesDb } from "../lib/db";
import React from "react";


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
  purchasePrice: number;
};

interface MedicineDetail {
  id: string; // Medicine ID
  quantity: number;
  name: string;
}



const Billing: React.FC<Props> = ({ location }) => {  // const location = useLocation();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MedicineInfo[]>([]);
  const [selectedMedicines, setSelectedMedicines] = useState<
    { medicine: MedicineInfo; quantity: number }[]
  >([]);
  const [paymentMode, setPaymentMode] = useState<"offline" | "online">("offline");
  const [customerName, setCustomerName] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [billingId] = useState(Math.floor(Math.random() * 100000));

  const hospitalName: string = localStorage.getItem("hospital") ?? "";
  const hospitalPhone: string = localStorage.getItem("phone") ?? "";
  const hospitalAddress: string = localStorage.getItem("address") ?? "";
  const { addToast } = useToast();
  // Store patient details if redirected from Patients page
  const [patientDetails, setPatientDetails] = useState<{
    patient_name: string;
    gender: string;
    age: number;
    investigation: string;
    diagnosis: string;
    advice: string;
    medicines: MedicineDetail[];
  } | null>(null);

  useEffect(() => {
    const appointmentId = location?.state?.appointmentId;
    console.log("Appointment ID:", appointmentId);  // const appointmentId = location.state?.appointmentId;
    console.log("outside try");
    const fetchMedicineDetails = async (medicines: MedicineDetail[]) => {
      console.log("11");
      try {
        console.log("inside try");
        const fetchedMedicines = await Promise.all(
          medicines.map(async (medicine) => {
            // Fetch the medicine details from IndexedDB
            const details = await fetchMedicineById(medicine.id);
        
            if (!details) {
              throw new Error(`Medicine with ID ${medicine.id} not found in IndexedDB`);
            }
        
            // Map OriginalMedicine to MedicineInfo
            const mappedMedicine: MedicineInfo = {
              id: details.id, // Use the ID from IndexedDB
              name: details.name,
              sellingPrice: details.selling_price,
              batchNumber: details.batch_number,
              expiryDate: details.expiry_date,
              quantity: details.quantity,
              purchasePrice: details.purchase_price,
            };
            
            console.log("mapped medicines: ",mappedMedicine);
            // Return the mapped medicine with quantity
            return {
              medicine: mappedMedicine,
              quantity: medicine.quantity, // Use the quantity from the input
            };
          })
        );
        
        console.log("fetched medicines: ",fetchedMedicines);
        

        setSelectedMedicines(fetchedMedicines);
      } catch (error) {
        console.error("Error fetching medicine details:", error);
        addToast("Failed to fetch medicine details. Redirecting...","error");
        navigate("/patients");
      }

   
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
      addToast("Patient details not found. Redirecting...","info");
      navigate("/patients");
    }
  }
}, [location.state, navigate]);

useEffect(() => {
  const syncAndSchedule = async () => {
    try {
      await syncMedicinesToMongoDB(); // Run immediately
    } catch (error) {
      console.error("Error syncing medicines:", error);
    }
    const intervalId = setInterval(async () => {
      try {
        await syncMedicinesToMongoDB();
      } catch (error) {
        console.error("Error syncing medicines:", error);
      }
    }, 600000);

    return () => clearInterval(intervalId);
  };
  syncAndSchedule();
}, []);

const handleSearchMedicine = async (query: string) => {
  try {
    const results = await searchMedicines(query);

    // Ensure sellingPrice is a number for all results
    const sanitizedResults = results.map((result) => ({
      ...result,
      sellingPrice: Number(result.sellingPrice),
    }));

    setSearchResults(sanitizedResults);
  } catch (error) {
    console.error("Error searching medicines:", error);
    addToast("Failed to search medicines locally.","error");
  }
};

  useEffect(() => {
    const debouncedSearch = debounce(() => handleSearchMedicine(query), 10);
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
      addToast("Medicine added for billing!","success");
    }
    setSearchResults([]);
    setQuery("");
  };

  const handleResetForm = () => {
    setCustomerName("");
    setPatientDetails(null);
    setSelectedMedicines([]);
    setQuery("");
    addToast("Form reset successfully!","info");
  };

  const updateMedicineQuantity = async (medicineId: string, quantityToReduce: number) => {
    try {
      // Fetch the medicine details directly from IndexedDB
      const existingMedicine = await fetchMedicineById(medicineId);
  
      if (!existingMedicine) {
        throw new Error(`Medicine with ID ${medicineId} not found in IndexedDB`);
      }
      // Calculate the new quantity
      const newQuantity = existingMedicine.quantity - quantityToReduce;
  
      if (newQuantity < 0) {
        throw new Error(`Insufficient quantity for medicine ID ${medicineId}`);
      }
  
      // Update the quantity in IndexedDB
      await updateMedicine(medicineId, { quantity: newQuantity });
      console.log(`Medicine quantity updated successfully: ${medicineId}, New Quantity: ${newQuantity}`);
    } catch (error) {
      console.error("Error updating medicine quantity:", error);
      addToast(`Failed to update medicine quantity for ID: ${medicineId}`,"error");
    }
  };
  
  const handleConfirmPurchase = () => {
    if (!customerName) {
      addToast("Customer name is required!", "info");
      return;
    }
  
    if (!billingId) {
      addToast("Billing ID is required!", "info");
      return;
    }
  
    if (!selectedMedicines || selectedMedicines.length === 0) {
      addToast("No medicines selected for purchase!", "error");
      return;
    }
  
    // Set the dialog to open without making changes to the database
    setOpenDialog(true); // Open the dialog for confirmation
    addToast("Purchase confirmed, please review and print the bill.", "success");
  };
  
  

  const handlePrintBill = async () => {
    const today = new Date();
    const billingDate = today.toLocaleDateString("en-US");
  
    try {
      // Calculate total cost of the purchase
      const totalCost = selectedMedicines.reduce(
        (sum, item) => sum + item.medicine.sellingPrice * item.quantity,
        0
      );
  
      // Add a new sale entry to the sales table, including payment mode
      const saleId = await salesDb.sales.add({
        purchase_date: new Date().toISOString(),
        customer_name: customerName,
        total_cost: totalCost,
        medicines: [],
        payment_mode: paymentMode, // Include the payment mode
      });
  
      // Map selected medicines to this sale in the saleMedicines table
      await salesDb.saleMedicines.bulkPut(
        selectedMedicines.map((item) => ({
          sale_id: saleId,
          medicine_id: item.medicine.id,
          quantity: item.quantity,
          selling_price: item.medicine.sellingPrice,
        }))
      );
  
      // Print the bill with all necessary details
      printBill(
        selectedMedicines,
        customerName,
        patientDetails?.gender || "",
        patientDetails?.age || 0,
        billingId,
        billingDate,
        patientDetails?.investigation || "",
        patientDetails?.diagnosis || "",
        patientDetails?.advice || "",
        hospitalName,
        hospitalAddress,
        hospitalPhone
      );
  
      // Update inventory by reducing batch quantities
      for (const item of selectedMedicines) {
        await updateMedicineQuantity(item.medicine.id, item.quantity);
      }

          // Delete appointment details from local storage
    const appointmentId = location?.state?.appointmentId;
    if (appointmentId) {
      const appointmentKey = `appointment_${appointmentId}`;
      localStorage.removeItem(appointmentKey);
      addToast(`Appointment ${appointmentId} removed successfully!`, "info");
    }
  
      // Clear selected medicines and customer details
      setSelectedMedicines([]);
      setCustomerName("");
      setPatientDetails(null);
  
      // Close the dialog box
      setOpenDialog(false);
  
      addToast("Bill printed and inventory updated successfully!", "info");
    } catch (error) {
      console.error("Error printing bill:", error);
      addToast("Failed to print the bill. Please try again.", "error");
    }
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
            <strong>Diagnosis:</strong> {patientDetails.diagnosis}
          </p>
          <p>
            <strong>Advice:</strong> {patientDetails.advice}
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
        <div>
  <p className="text-gray-800 font-semibold">
    <strong>{medicine.name}</strong>
  </p>
  <p className="text-gray-600 text-sm">
    Batch: {medicine.batchNumber} | Qty: {medicine.quantity} | Price: ₹
    {medicine.sellingPrice.toFixed(2)} | Exp: {medicine.expiryDate}
  </p>
</div>
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

      {/* Payment Mode Dialog */}
      {openDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded p-4">
            <h4 className="font-bold">Choose Payment Mode</h4>
            <div>
              <label>
                <input
                  type="radio"
                  value="offline"
                  checked={paymentMode === "offline"}
                  onChange={() => setPaymentMode("offline")}
                />
                Offline
              </label>
              <br />
              <label>
                <input
                  type="radio"
                  value="online"
                  checked={paymentMode === "online"}
                  onChange={() => setPaymentMode("online")}
                />
                Online
              </label>
            </div>

            <div className="flex justify-end mt-4">
              <button
                 onClick={() => setOpenDialog(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handlePrintBill}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Confirm Mode & Print Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
