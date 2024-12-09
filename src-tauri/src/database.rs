// src-tauri/src/db.rs
use mongodb::{Client, Database};
use dotenv::dotenv;
use std::env;


pub async fn get_db_connection() -> Database {
    dotenv().ok();
    let mongo_url = env::var("MONGODB_URL").expect("MONGODB_URL must be set in .env");
    let client = Client::with_uri_str(mongo_url)
        .await
        .expect("Failed to connect to MongoDB");
    client.database("medicines_db") 
}

// src/db.rs



