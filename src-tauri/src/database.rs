// src-tauri/src/database.rs
use mongodb::{Client, Database};
use dotenv::dotenv;
use std::env;


pub async fn get_db_connection() -> Database {
    dotenv().ok();
    // let mongo_url = env::var("MONGODB_URL").expect("MONGODB_URL must be set in .env");
    let client = Client::with_uri_str("mongodb+srv://ankitsingh60687:jWv8LoNnlF1YCJyn@cluster0.pkkvx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        .await
        .expect("Failed to connect to MongoDB");
    client.database("medicines_db") 
}
