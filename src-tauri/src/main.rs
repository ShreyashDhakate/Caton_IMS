mod database;
mod db;
mod cmd;
mod user;
mod model;
mod commands;

use crate::db::init_db;
use crate::cmd::{SessionState, login, signup, logout, is_logged_in};
use commands::{
    initialize_db, insert_medicine, reduce_batch, update_batch, delete_batch, search_medicines,
    save_appointment, get_all_appointments, get_medicine_by_id, delete_appointments_older_than_one_hour,
};
use std::env;
use tauri::{Builder, generate_handler};
use tokio::time::{interval, Duration};

#[tokio::main]
async fn main() {
    dotenv::dotenv().ok();

    // Initialize session state
    let session_state = SessionState::default();

    // Initialize database state
    let db_state = init_db()
        .await
        .expect("Failed to initialize MongoDB client");

    // Schedule the deletion task to run every hour
    tokio::spawn(async {
        let mut task_interval = interval(Duration::from_secs(60 * 60)); // 1 hour in seconds
        loop {
            task_interval.tick().await;
            match delete_appointments_older_than_one_hour().await {
                Ok(message) => println!("{}", message),
                Err(error) => eprintln!("Failed to delete old appointments: {}", error),
            }
        }
    });

    // Run the Tauri application
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
            get_medicine_by_id,
            delete_appointments_older_than_one_hour, // Add command to invoke manually if needed
        ])
        .run(tauri::generate_context!())
        .expect("Error while running Tauri application");
}
