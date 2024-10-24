mod commands;
mod database;

use tauri::{Builder, generate_handler};
use commands::{initialize_db, insert_medicine, get_medicine, update_medicine, delete_medicine, search_medicines};

fn main() {
    Builder::default()
        .invoke_handler(generate_handler![
            initialize_db,
            insert_medicine,
            get_medicine,
            update_medicine,
            delete_medicine,
            search_medicines
        ])
        .run(tauri::generate_context!())
        .expect("Error while running Tauri application");
}





