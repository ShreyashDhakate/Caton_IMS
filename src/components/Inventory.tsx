import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';// Tauri API to call backend Rust functions

// Define a TypeScript interface for the Medicine data type
interface Medicine {
  id: number;
  name: string;
  stock: number;
  expiryDate: string; // Date can also be handled as string for simplicity
}

const Inventory: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]); // Use the Medicine interface

  useEffect(() => {
    async function fetchData() {
      try {
        const response: Medicine[] = await invoke<Medicine[]>('get_inventory'); // Fetch inventory data from backend
        setMedicines(response);
      } catch (error) {
        console.error('Failed to fetch inventory:', error);
      }
    }
    fetchData();
  }, []);

  return (
    <div>
      <h2>Inventory Management</h2>
      <table>
        <thead>
          <tr>
            <th>Medicine Name</th>
            <th>Stock</th>
            <th>Expiry Date</th>
          </tr>
        </thead>
        <tbody>
          {medicines.map((medicine) => (
            <tr key={medicine.id}>
              <td>{medicine.name}</td>
              <td>{medicine.stock}</td>
              <td>{medicine.expiryDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Inventory;
