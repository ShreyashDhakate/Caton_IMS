// // src-tauri/src/user.rs
// use mongodb::bson::doc;
// use mongodb::Collection;
// use bcrypt::{hash, verify, DEFAULT_COST};
// use crate::model::User;

// pub async fn signup_user(user_collection: &Collection<User>, username: &str, password: &str, email: &str) -> Result<(), String> {
//     let password_hash = hash(password, DEFAULT_COST).map_err(|e| e.to_string())?;
//     let user = User {
//         username: username.to_string(),
//         password_hash,
//         email: email.to_string(),
//     };
    
//     user_collection.insert_one(user, None)
//         .await
//         .map_err(|e| e.to_string())?;
//     Ok(())
// }

// pub async fn login_user(user_collection: &Collection<User>, username: &str, password: &str) -> Result<(), String> {
//     let user_doc = user_collection.find_one(doc! { "username": username }, None)
//         .await
//         .map_err(|e| e.to_string())?;
    
//     if let Some(user) = user_doc {
//         if verify(password, &user.password_hash).map_err(|e| e.to_string())? {
//             return Ok(());
//         }
//     }
//     Err("Invalid username or password".to_string())
// }

use mongodb::Collection;
use bcrypt::{hash, verify, DEFAULT_COST};
use crate::model::User;
use mongodb::bson::{self, doc, oid::ObjectId, Bson};



pub async fn signup_user(
    user_collection: &Collection<User>, 
    username: &str, 
    password: &str, 
    email: &str
) -> Result<(), String> {
    let password_hash = hash(password, DEFAULT_COST).map_err(|e| format!("Hashing error: {}", e))?;
    let user = User {
        id: None, // Set the `id` field to `None` for new users
        username: username.to_lowercase(),
        password_hash,
        email: email.to_string(),
    };

    user_collection
        .insert_one(user, None)
        .await
        .map_err(|e| format!("Database error: {}", e))?;
    Ok(())
}





pub async fn login_user(
    user_collection: &Collection<User>, 
    username: &str, 
    password: &str
) -> Result<String, String> {
    // Fetch user document
    let user_doc = user_collection
        .find_one(doc! { "username": username }, None)
        .await
        .map_err(|e| e.to_string())?
        .ok_or("User not found".to_string())?;

    // Verify password
    if verify(password, &user_doc.password_hash).map_err(|e| format!("Password verification error: {}", e))? {
        // Check if the user has an `_id`
        if let Some(id) = user_doc.id {
            return Ok(id.to_hex());
        } else {
            return Err("User ID not found".to_string());
        }
    }

    Err("Invalid password".to_string())
}
