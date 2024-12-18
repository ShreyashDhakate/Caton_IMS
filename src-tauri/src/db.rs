// src-tauri/src/db.rs
use mongodb::{Client, Database};
use std::sync::Arc;
use dotenv::dotenv;
use std::env;



#[derive(Clone)]
pub struct DbState {
    pub db: Arc<Database>,
}

pub async fn init_db() -> Result<DbState, mongodb::error::Error> {
    dotenv().ok(); // Load environment variables from .env file

    // Get MongoDB URI from environment
    let mongo_uri = "mongodb+srv://ojasmarghade05:AfE1GlWk7gSBbPfy@cluster0.fcqjd.mongodb.net/";

    // Initialize MongoDB client
    let client = Client::with_uri_str(&mongo_uri).await?;
    let database = client.database("users_db");

    Ok(DbState {
        db: Arc::new(database),
    })
}

