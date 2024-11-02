// src-tauri/src/user.rs
use mongodb::bson::{doc, Document};
use mongodb::Collection;
use bcrypt::{hash, verify, DEFAULT_COST};
use crate::model::User;

pub async fn signup_user(user_collection: &Collection<User>, username: &str, password: &str, email: &str) -> Result<(), String> {
    let password_hash = hash(password, DEFAULT_COST).map_err(|e| e.to_string())?;
    let user = User {
        username: username.to_string(),
        password_hash,
        email: email.to_string(),
    };
    
    user_collection.insert_one(user, None)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

pub async fn login_user(user_collection: &Collection<User>, username: &str, password: &str) -> Result<(), String> {
    let user_doc = user_collection.find_one(doc! { "username": username }, None)
        .await
        .map_err(|e| e.to_string())?;
    
    if let Some(user) = user_doc {
        if verify(password, &user.password_hash).map_err(|e| e.to_string())? {
            return Ok(());
        }
    }
    Err("Invalid username or password".to_string())
}
