import { invoke } from '@tauri-apps/api/core';
import { MedicineInfo } from '../components/Billing';

const limit = 5; // Example limit per search results

// Function to handle search
export const searchMedicines = async (query: string): Promise<MedicineInfo[]> => {
  if (query.trim() === '') {
    return [];
  }
  try {
    const results: MedicineInfo[] = await invoke('search_medicines', {
      query,
      page: 1, // We can modify this for pagination later
      limit,
    });
    return results;
  } catch (error) {
    console.error('Failed to fetch medicines:', error);
    return [];
  }
};
