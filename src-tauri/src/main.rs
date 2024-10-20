// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}






// // Prevents additional console window on Windows in release, DO NOT REMOVE!!
// #![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// // src/main.rs

// use rusqlite::{Connection, Result};

// fn initialize_database() -> Result<()> {
//     let conn = Connection::open("pharmacy.db")?; // Open or create a new SQLite database file
//     conn.execute(
//         "CREATE TABLE IF NOT EXISTS medicines (
//             id INTEGER PRIMARY KEY AUTOINCREMENT,
//             name TEXT NOT NULL,
//             stock INTEGER NOT NULL,
//             expiry_date DATE
//         )",
//         [], // No parameters to bind
//     )?;
//     Ok(())
// }

// fn main() {
//     initialize_database().expect("Failed to initialize the database");
    
//     tauri::Builder::default()
//         .invoke_handler(tauri::generate_handler![get_inventory]) // Add other command handlers
//         .run(tauri::generate_context!())
//         .expect("error while running Tauri application");
// }
