import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { searchMedicines } from '../hooks/searchMedicines';
import { printBill } from '../hooks/printBill';
import BillingSummary from './BillingSummary';
import debounce from 'lodash.debounce';

export type MedicineInfo = {
  name: string;
  selling_price: number;
};

interface BillingProps {
  precautions: string;
  disease: string;
}

const Billing = ({
  precautions,
  disease,
}: BillingProps) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MedicineInfo[]>([]);
  const [selectedMedicines, setSelectedMedicines] = useState<{
    medicine: MedicineInfo;
    quantity: number;
  }[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [billingId] = useState(Math.floor(Math.random() * 100000));



  const  hospitalName: string  = localStorage.getItem('hospital') ?? "";
  console.log(hospitalName);
  const  hospitalPhone: string  = localStorage.getItem('phone') ?? "";
  const  hospitalAddress: string  = localStorage.getItem('address') ?? "";
  useEffect(() => {
    const handleSearch = async () => {
      if (query) {
        const results = await searchMedicines(query);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    };

    const debouncedSearch = debounce(handleSearch, 300);
    debouncedSearch();

    return () => {
      debouncedSearch.cancel();
    };
  }, [query]);

  const addMedicineToBilling = (medicine: MedicineInfo) => {
    const existing = selectedMedicines.find(
      (item) => item.medicine.name === medicine.name
    );
    if (existing) {
      existing.quantity += 1;
      setSelectedMedicines([...selectedMedicines]);
    } else {
      setSelectedMedicines([
        ...selectedMedicines,
        { medicine, quantity: 1 },
      ]);
      toast.success('Medicine added for billing!');
    }
    setSearchResults([]);
    setQuery('');
  };

  const handleConfirmPurchase = () => {
    if (!customerName) {
      toast.error('Customer name is required!');
      return;
    }

    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handlePrintBill = () => {
    const today = new Date();
    const billingDate = today.toLocaleDateString('en-US');
    printBill(
      selectedMedicines,
      customerName,
      billingId,
      billingDate,
      disease,
      precautions,
      hospitalName,
      hospitalAddress,
      hospitalPhone
    );
    setOpenDialog(false);
  };

  return (
    <div className="mx-auto p-4 border border-gray-300 rounded-lg h-full relative">
      <div className="font-bold text-2xl">{hospitalName}</div>
      <div className="text-sm text-gray-600">{hospitalAddress}</div>
      <div className="text-sm text-gray-600">{hospitalPhone}</div>

      <div className="mb-4 mt-5">
        <input
          type="text"
          placeholder="Search medicine..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border border-gray-300 rounded p-2 w-full text-sm"
        />
        {searchResults.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1">
            {searchResults.map((medicine, index) => (
              <li
                key={index}
                className="p-2 cursor-pointer hover:bg-gray-200"
                onClick={() => addMedicineToBilling(medicine)}
              >
                <div className="font-bold">{medicine.name}</div>
                <div>₹{medicine.selling_price.toFixed(2)}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex mt-[2rem] justify-between mb-4">
        <input
          type="text"
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="border border-gray-300 rounded p-2 w-1/2 mr-2 text-sm"
        />
      </div>

      <BillingSummary
        selectedMedicines={selectedMedicines}
        setSelectedMedicines={setSelectedMedicines}
      />

      <div className="flex items-center justify-center mt-4">
        <button
          onClick={handleConfirmPurchase}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Confirm Purchase
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
