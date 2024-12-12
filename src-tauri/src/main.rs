mod database;
mod db;
mod cmd;
mod user;
mod model;
mod commands;
mod utils;
use crate::db::init_db;
use commands::{initialize_db, insert_medicine, update_batch, delete_batch, search_medicines,save_appointment,fetch_medicine,get_all_appointments,get_stock,delete_medicine,update_stock,get_medicine_by_id};


use crate::cmd::{SessionState, login, signup, logout, is_logged_in, verify_signup, forgot_password, reset_password};
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
            update_batch,
            delete_batch,
            search_medicines,
            signup,
            login,
            logout,
            is_logged_in,
            save_appointment,
            get_all_appointments,
            get_stock,
            delete_medicine,
            update_stock,
            get_medicine_by_id,
            fetch_medicine,
            verify_signup, 
            forgot_password, 
            reset_password
        ])
        .run(tauri::generate_context!())
        .expect("Error while running Tauri application");
}
