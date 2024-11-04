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

const Billing = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MedicineInfo[]>([]);
  const [selectedMedicines, setSelectedMedicines] = useState<
    { medicine: MedicineInfo; quantity: number }[]
  >([]);
  const [customerName, setCustomerName] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [billingId] = useState(Math.floor(Math.random() * 100000)); // Generate random billing ID

  // Effect to trigger search on query change
  useEffect(() => {
    const handleSearch = async () => {
      if (query) {
        const results = await searchMedicines(query);
        setSearchResults(results);
      } else {
        setSearchResults([]); // Clear results if query is empty
      }
    };
  
    const debouncedSearch = debounce(handleSearch, 300); // Delay of 300ms
    debouncedSearch();
  
    return () => {
      debouncedSearch.cancel(); // Cleanup the debounce on unmount
    };
  }, [query]);

  // Function to add medicine to the billing list
  const addMedicineToBilling = (medicine: MedicineInfo) => {
    const existing = selectedMedicines.find(item => item.medicine.name === medicine.name);
    if (existing) {
      existing.quantity += 1; // Increase quantity if already added
      setSelectedMedicines([...selectedMedicines]);
    } else {
      setSelectedMedicines([...selectedMedicines, { medicine, quantity: 1 }]);
      toast.success('Medicine added for billing!');
    }
    setSearchResults([]); // Clear search results after selection
    setQuery(''); // Clear the input after selection
  };

  // Function to handle confirm purchase
  const handleConfirmPurchase = () => {
    setOpenDialog(false);
    printBill(selectedMedicines, customerName, billingId); // Pass selected medicines, customer name, and billing ID
  };

  return (
    <div className="mx-auto p-4 border border-gray-300 rounded-lg h-full relative">
      <div className='font-bold text-2xl'>
        ABC Pharmacy and Hospital
      </div>
      <div className="mb-4 mt-5">
        <input
          type="text"
          placeholder="Search medicine..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border border-gray-300 rounded p-2 w-full text-sm"
        />
        {/* Suggestions List */}
        {searchResults.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1">
            {searchResults.map((medicine, index) => (
              <li
                key={index}
                className="p-2 cursor-pointer hover:bg-gray-200"
                onClick={() => addMedicineToBilling(medicine)}
              >
                <div className="font-bold">{medicine.name}</div>
                <div>${medicine.selling_price.toFixed(2)}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Customer Details Section */}
      <div className="flex mt-[2rem] justify-between mb-4">
        <input
          type="text"
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="border border-gray-300 rounded p-2 w-1/2 mr-2 text-sm"
        />
      </div>

      {/* Pass selectedMedicines to BillingSummary */}
      <BillingSummary
        selectedMedicines={selectedMedicines}
        setSelectedMedicines={setSelectedMedicines}
      />

      {/* Total Cost and Confirm Purchase Button Section */}
      <div className="flex items-center justify-center mt-4">
        <button
          onClick={() => setOpenDialog(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Confirm Purchase
        </button>
      </div>

      {/* Confirmation Dialog for Print Bill */}
      {openDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded p-4">
            <h4 className="font-bold ">Confirm Purchase</h4>
            <p>Are you sure you want to print the bill?</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setOpenDialog(false)}
                className="mr-2 bg-gray-200 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPurchase}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Print Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
