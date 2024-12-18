import { toast } from 'sonner';

type MedicineInfo = {
  id: string;
  name: string;
  sellingPrice: number;
  batchNumber: string; // Added field
  expiryDate: string;  // Added field
  quantity: number;    // Available quantity in the database
  purchasePrice: number;
};

type BillingSummaryProps = {
  selectedMedicines: { medicine: MedicineInfo; quantity: number }[];
  setSelectedMedicines: React.Dispatch<
    React.SetStateAction<{ medicine: MedicineInfo; quantity: number }[]>
  >;
};

const BillingSummary = ({ selectedMedicines, setSelectedMedicines }: BillingSummaryProps) => {
  // Function to remove medicine from billing list
  const removeMedicineFromBilling = (medicineToRemove: MedicineInfo) => {
    setSelectedMedicines(
      selectedMedicines.filter((item) => item.medicine.name !== medicineToRemove.name)
    );
  };

  // Function to update the quantity of a medicine
  const updateQuantity = (medicine: MedicineInfo, quantity: number) => {
    if (quantity > medicine.quantity) {
      toast.error(`Quantity exceeds available stock. Only ${medicine.quantity} items are in stock.`);
      return;
    }

    const updatedMedicines = selectedMedicines.map((item) =>
      item.medicine.id === medicine.id ? { ...item, quantity: Math.max(quantity, 0) } : item
    );
    setSelectedMedicines(updatedMedicines);
  };

  // Function to calculate total cost
  const calculateTotal = () => {
    return selectedMedicines.reduce(
      (total, item) => total + item.medicine.sellingPrice * item.quantity,
      0
    );
  };

  return (
    <div className="border border-gray-300 min-h-[26rem] rounded mt-4 p-4 shadow-md">
      <h6 className="font-bold text-lg mb-2">Selected Medicines:</h6>
      <div id="billing-summary" className="grid grid-cols-8 gap-4">
        <div className="font-bold mb-2 text-start">S.No</div>
        <div className="font-bold mb-2 col-span-3 text-start">Medicine</div>
        <div className="font-bold mb-2 text-start">Quantity</div>
        <div className="font-bold mb-2 text-center col-span-2">Price</div>
        <div className="font-bold mb-2 text-end">Delete</div>

        {selectedMedicines.map((item, index) => (
          <div key={index} className="contents">
            <div className="text-start">{index + 1}</div>
            <div className="text-start col-span-3">
              {item.medicine.name} <span className="text-gray-500">(Batch: {item.medicine.batchNumber})</span>
            </div>
            <input
              type="number"
              value={item.quantity}
              onChange={(e) =>
                updateQuantity(item.medicine, Math.max(0, Number(e.target.value)))
              }
              min={0}
              max={item.medicine.quantity} // Limit input field to max available stock
              className="w-16 border border-gray-300 rounded p-1 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="text-center col-span-2">
              ₹{(item.medicine.sellingPrice * item.quantity).toFixed(2)}
            </div>
            <button
              onClick={() => removeMedicineFromBilling(item.medicine)}
              className="text-red-500 hover:text-red-700 transition-colors text-end"
            >
              ✖
            </button>
          </div>
        ))}
      </div>

      {/* Total Cost Display */}
      <div className="grid grid-cols-8 items-center mt-4">
        <div className="col-span-5"></div> {/* Empty space to align total under price */}
        <div className="col-span-2 text-center font-semibold text-lg">
          Total Cost: ₹{calculateTotal().toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default BillingSummary;
