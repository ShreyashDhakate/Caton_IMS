// src/hooks/useInitializeDatabase.ts
import { invoke } from "@tauri-apps/api/core";

export function useInitializeDatabase() {
  const initializeDatabase = async () => {
    try {
      const result = await invoke("initialize_db");
      console.log(result);
    } catch (error) {
      console.error("Error initializing the database:", error);
    }
  };

  return { initializeDatabase };
}