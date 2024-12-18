import { useState, useEffect } from "react";
import { Location } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import debounce from "lodash.debounce";
import BillingSummary from "./BillingSummary";
import { printBill } from "../hooks/printBill";
import { fetchMedicineById, searchMedicines, updateMedicine } from "../lib/stockdb";


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
        toast.error("Failed to fetch medicine details. Redirecting...");
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
      toast.error("Patient details not found. Redirecting...");
      navigate("/patients");
    }
  }
}, [location.state, navigate]);


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
    toast.error("Failed to search medicines locally.");
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
      toast.error(`Failed to update medicine quantity for ID: ${medicineId}`);
    }
  };
  
  // Confirm purchase and reduce inventory
  const handleConfirmPurchase = async () => {
    if (!customerName) {
      toast.error("Customer name is required!");
      return;
    }

    try {
      for (const item of selectedMedicines) {
        await updateMedicineQuantity(item.medicine.id, item.quantity);
      }
      console.log("selected Medicines: ", selectedMedicines);

      toast.success("Purchase confirmed, and inventory updated!");
      setOpenDialog(true);
      // setSelectedMedicines([]); // Clear after successful update
    } catch (error) {
      console.error("Error updating inventory:", error);
      toast.error("Failed to update inventory. Please try again.");
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

