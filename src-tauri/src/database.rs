
// use mongodb::{Client, Database};
// use dotenv::dotenv;
// use std::env;

// pub async fn get_user_database(user_id: &str) -> Database {
//     dotenv().ok();
//     let mongo_url = env::var("MONGODB_URL").expect("MONGODB_URL must be set in .env");
//     let client = Client::with_uri_str(mongo_url)
//         .await
//         .expect("Failed to connect to MongoDB");
    
//     // Use a separate database for each user
//     let db_name = format!("user_{}_db", user_id);
//     client.database(&db_name)
// }

// pub async fn get_user_collection<T>(db: &Database, user_id: &str) -> mongodb::Collection<T> {
//     // Use a separate collection for each user
//     let collection_name = format!("medicines_user_{}", user_id);
//     db.collection(&collection_name)
// }

// src-tauri/src/db.rs
use mongodb::{Client, Database};
use dotenv::dotenv;
use std::env;


pub async fn get_db_connection() -> Database {
    println!("3");
    dotenv().ok();
    let mongo_url = env::var("MONGODB_URL").expect("MONGODB_URL must be set in .env");
    let client = Client::with_uri_str(mongo_url)
        .await
        .expect("Failed to connect to MongoDB");
    client.database("medicines_db") 
}

// src/db.rs





