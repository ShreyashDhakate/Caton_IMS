mod commands;
mod database;
mod session; // Import the session module
mod db;
mod cmd;
mod user;
mod model;
mod utils;

use std::env;
use crate::db::init_db;
use tauri::{Builder, generate_handler};
use tokio::sync::Mutex;
use std::sync::Arc;
use commands::{initialize_db, insert_medicine, get_medicine, update_medicine, delete_medicine, search_medicines};
use cmd::{signup, login};
use crate::session::SessionState;

fn main() {
    dotenv::dotenv().ok();

    // Initialize the database state
    let db_state = tauri::async_runtime::block_on(init_db())
        .expect("Failed to initialize MongoDB client");

    // Initialize the session state with an empty user_id
    let session_state = SessionState {
        user_id: Arc::new(Mutex::new(None)),
    };
    // Configure and run the Tauri application
    Builder::default()
        .manage(db_state) // Manage database state
        .manage(session_state) // Manage session state
        .invoke_handler(generate_handler![
            initialize_db,
            insert_medicine,
            get_medicine,
            update_medicine,
            delete_medicine,
            search_medicines,
            signup,
            login
        ])
        .run(tauri::generate_context!())
        .expect("Error while running Tauri application");
}
