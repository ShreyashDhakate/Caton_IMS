mod database;
mod db;
mod cmd;
mod user;
mod model;
mod commands;
use crate::db::init_db;
use crate::cmd::{SessionState, login, signup, logout, is_logged_in};
use commands::{initialize_db, insert_medicine, reduce_batch, update_batch, delete_batch, search_medicines,save_appointment,get_all_appointments, get_medicine_by_id};

use std::env;
use tauri::{Builder, generate_handler};

fn main() {
    dotenv::dotenv().ok();

    // Initialize session state
    let session_state = SessionState::default();

    // Initialize database state
    let db_state = tauri::async_runtime::block_on(init_db())
        .expect("Failed to initialize MongoDB client");

    Builder::default()
        .manage(db_state) // Register the database state
        .manage(session_state) // Register the session state
        .invoke_handler(generate_handler![
            initialize_db,
            insert_medicine,
            reduce_batch,
            update_batch,
            delete_batch,
            search_medicines,
            signup,
            login,
            logout,
            is_logged_in,
            save_appointment,
            get_all_appointments,
            get_medicine_by_id
        ])
        .run(tauri::generate_context!())
        .expect("Error while running Tauri application");
}
