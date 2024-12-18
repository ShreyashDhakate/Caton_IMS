// src-tauri/src/database.rs
use mongodb::{Client, Database};
use dotenv::dotenv;
use std::env;


pub async fn get_db_connection() -> Database {
    dotenv().ok();
    let mongo_url = "mongodb+srv://ojasmarghade05:AfE1GlWk7gSBbPfy@cluster0.fcqjd.mongodb.net/";
    let client = Client::with_uri_str(mongo_url)
        .await
        .expect("Failed to connect to MongoDB");
    client.database("medicines_db") 
}
