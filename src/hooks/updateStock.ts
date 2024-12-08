// src/hooks/useMedicines.ts
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

interface Medicine {
  id: number;
  name: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
}

export function useMedicines() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [editedMedicines, setEditedMedicines] = useState<Map<number, Medicine>>(new Map());

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setIsLoading(true);
      const result: Medicine[] = await invoke("get_medicine");
      console.log("Fetched Medicines:", result);
      setMedicines(result);
    } catch (error) {
      console.error("Error fetching medicines:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addMedicine = async (
    name: string,
    batchNumber: string,
    expiryDate: string,
    quantity: number,
    purchasePrice: number,
    sellingPrice: number
  ) => {
    if (!name.trim() || quantity <= 0 || purchasePrice <= 0 || sellingPrice <= 0) {
      alert("Please enter valid medicine details!");
      return;
    }
    try {
      await invoke("insert_medicine", {
        name: name.trim(),
        batchNumber,
        expiryDate,
        quantity,
        purchasePrice,
        sellingPrice,
      });
      fetchMedicines();
    } catch (error) {
      console.error("Error adding medicine:", error);
    }
  };

  const updateMedicine = async (id: number) => {
    try {
      const medicine = medicines.find((med) => med.id === id);
      if (!medicine) return;

      const updatedMedicine = editedMedicines.get(id) ?? medicine;

      await invoke("update_medicine", {
        id,
        name: updatedMedicine.name,
        batchNumber: updatedMedicine.batchNumber,
        expiryDate: updatedMedicine.expiryDate,
        quantity: updatedMedicine.quantity,
        purchasePrice: updatedMedicine.purchasePrice,
        sellingPrice: updatedMedicine.sellingPrice,
      });

      alert("Medicine updated successfully!");
      setEditedMedicines((prev) => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
    } catch (error) {
      console.error("Error updating medicine:", error);
      alert("Failed to update medicine.");
    }
  };

  const deleteMedicine = async (id: number) => {
    try {
      await invoke("delete_medicine", { id });
      fetchMedicines();
    } catch (error) {
      console.error("Error deleting medicine:", error);
    }
  };

  const handleMedicineChange = (id: number, updatedFields: Partial<Medicine>) => {
    setEditedMedicines((prev) => new Map(prev).set(id, { ...prev.get(id)!, ...updatedFields }));
    setMedicines((prev) =>
      prev.map((med) => (med.id === id ? { ...med, ...updatedFields } : med))
    );
  };

  return {
    medicines,
    isLoading,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    handleMedicineChange,
  };
}
