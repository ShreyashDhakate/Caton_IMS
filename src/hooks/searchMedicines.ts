import { invoke } from '@tauri-apps/api/core';

export type MedicineInfo = {
  name: string;
  selling_price: number;
};

const limit = 5; // Example limit per search results

export const searchMedicines = async (query: string): Promise<MedicineInfo[]> => {
  if (query.trim() === '') {
    return [];
  }
  try {
    const results: MedicineInfo[] = await invoke('search_medicines', {
      query,
      page: 1, // For now, single-page search
      limit,
    });
    return results;
  } catch (error) {
    console.error('Failed to fetch medicines:', error);
    return [];
  }
};
