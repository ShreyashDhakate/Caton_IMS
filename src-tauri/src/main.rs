mod commands;
mod database;

mod db;
mod cmd;
mod user;
mod model;

use tauri::Manager;
use db::connect_to_db;
use crate::db::{init_db, DbState};
use tauri::{Builder, generate_handler};
use commands::{initialize_db, insert_medicine, get_medicine, update_medicine, delete_medicine, search_medicines};
use cmd::{signup,login};


fn main() {
    let db_state = tauri::async_runtime::block_on(init_db())
        .expect("Failed to initialize MongoDB client");

    Builder::default()
        .manage(db_state)
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





