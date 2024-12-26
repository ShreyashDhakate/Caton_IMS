import React, { useEffect, useState } from "react";
import { fetchExpiringMedicines } from "../lib/stockdb"; // Adjust the path as needed

// Type for Medicine
type Medicine = {
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

const ExpiringMedicines: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchExpiringMedicines();
        setMedicines(data);
      } catch (err) {
        setError("Failed to fetch expiring medicines.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (medicines.length === 0) {
    return <p>No medicines are expiring in the next 10 days.</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Expiring Medicines</h1>
      <table className="min-w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">Name</th>
            <th className="border border-gray-300 px-4 py-2">Batch Number</th>
            <th className="border border-gray-300 px-4 py-2">Expiry Date</th>
            <th className="border border-gray-300 px-4 py-2">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {medicines.map((medicine) => (
            <tr key={medicine.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">{medicine.name}</td>
              <td className="border border-gray-300 px-4 py-2">{medicine.batch_number}</td>
              <td className="border border-gray-300 px-4 py-2">
                {new Date(medicine.expiry_date).toLocaleDateString()}
              </td>
              <td className="border border-gray-300 px-4 py-2">{medicine.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpiringMedicines;
