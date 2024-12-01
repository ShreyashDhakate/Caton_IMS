
use mongodb::Collection;
use bcrypt::{hash, verify, DEFAULT_COST};
use crate::model::User;
use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;

pub async fn signup_user(
    user_collection: &Collection<User>,
    username: &str,
    password_doc: &str,
    password_pharma: &str,
    email: &str,
) -> Result<(), String> {
    // Hash the password
    let password_hash_doc = hash(password_doc, DEFAULT_COST).map_err(|e| e.to_string())?;
    let password_hash_pharma = hash(password_pharma, DEFAULT_COST).map_err(|e| e.to_string())?;
    // Create the user with None for the ID (MongoDB will assign it automatically)
    let user = User {
        id: None, // No need to specify id, MongoDB will assign it
        username: username.to_string(),
        password_hash_doc,
        password_hash_pharma,
        email: email.to_string(),
    };

    // Insert the user into the database
    user_collection.insert_one(user, None)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}


pub async fn login_user(user_collection: &Collection<User>, username: &str, password: &str , role:&str) -> Result<String, String> {
    // Find the user in the collection by username
    let user_doc = user_collection.find_one(doc! { "username": username }, None)
        .await
        .map_err(|e| e.to_string())?;

    // Check if user was found and verify the password
    if let Some(user) = user_doc {
        // Verify the password hash
        if role=="Doctor"
        {
            if verify(password, &user.password_hash_doc).map_err(|e| e.to_string())? {
                // Safely handle the ObjectId by unwrapping or using `expect`
                return Ok(user.id.unwrap_or_else(|| ObjectId::new()).to_string()); // Default to new ObjectId if None
            }
        }
        else {
            if verify(password, &user.password_hash_pharma).map_err(|e| e.to_string())? {
                // Safely handle the ObjectId by unwrapping or using `expect`
                return Ok(user.id.unwrap_or_else(|| ObjectId::new()).to_string()); // Default to new ObjectId if None
            }
        }
    }

    // Return error if login fails
    Err("Invalid username or password".to_string())
}