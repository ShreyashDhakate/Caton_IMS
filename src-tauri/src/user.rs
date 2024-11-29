
use mongodb::Collection;
use bcrypt::{hash, verify, DEFAULT_COST};
use crate::model::User;
use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;

pub async fn signup_user(
    user_collection: &Collection<User>,
    username: &str,
    password: &str,
    email: &str,
) -> Result<(), String> {
    // Hash the password
    let password_hash = hash(password, DEFAULT_COST).map_err(|e| e.to_string())?;
    
    // Create the user with None for the ID (MongoDB will assign it automatically)
    let user = User {
        id: None, // No need to specify id, MongoDB will assign it
        username: username.to_string(),
        password_hash,
        email: email.to_string(),
    };

    // Insert the user into the database
    user_collection.insert_one(user, None)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}


pub async fn login_user(user_collection: &Collection<User>, username: &str, password: &str) -> Result<String, String> {
    // Find the user in the collection by username
    let user_doc = user_collection.find_one(doc! { "username": username }, None)
        .await
        .map_err(|e| e.to_string())?;

    // Check if user was found and verify the password
    if let Some(user) = user_doc {
        // Verify the password hash
        if verify(password, &user.password_hash).map_err(|e| e.to_string())? {
            // Safely handle the ObjectId by unwrapping or using `expect`
            return Ok(user.id.unwrap_or_else(|| ObjectId::new()).to_string()); // Default to new ObjectId if None
        }
    }

    // Return error if login fails
    Err("Invalid username or password".to_string())
}