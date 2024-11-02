// src-tauri/src/db.rs
use mongodb::{Client, Database};
use std::sync::Arc;
use dotenv::dotenv;
use std::env;
use tauri::Manager;

pub async fn connect_to_db() -> Database {
    dotenv().ok();
    let mongo_url = env::var("MONGODB_URL").expect("MONGODB_URL must be set in .env");
    let client = Client::with_uri_str(mongo_url)
        .await
        .expect("Failed to connect to MongoDB");
    client.database("users_db") // Set the name of your database here
}

// src/db.rs


#[derive(Clone)]
pub struct DbState {
    pub db: Arc<Database>,
}

pub async fn init_db() -> Result<DbState, mongodb::error::Error> {
    dotenv().ok(); // Load environment variables from .env file

    // Get MongoDB URI from environment
    let mongo_uri = env::var("MONGODB_URL").expect("MONGODB_URI must be set in .env file");

    // Initialize MongoDB client
    let client = Client::with_uri_str(&mongo_uri).await?;
    let database = client.database("users_db");

    Ok(DbState {
        db: Arc::new(database),
    })
}
