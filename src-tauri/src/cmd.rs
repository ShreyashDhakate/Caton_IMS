// src-tauri/src/cmd.rs
use tauri::State;
use mongodb::Collection;
use crate::user::{signup_user, login_user};
use crate::model::User;
use crate::db::DbState; // Import your DbState struct
use mongodb::bson::doc;
use chrono::Utc;
use std::sync::Mutex;

#[derive(Default)]
pub struct SessionState {
    pub token: Mutex<Option<String>>,
    pub expiry: Mutex<Option<i64>>,
}


#[tauri::command]
pub async fn signup(
    username: String,
    password: String,
    email: String,
    db: State<'_, DbState>,
) -> Result<(), String> {
    let user_collection: &Collection<User> = &db.db.collection("users");

    // Check if email already exists
    let existing_user = user_collection
        .find_one(doc! { "email": &email }, None)
        .await
        .map_err(|e| format!("Database error: {}", e))?;

    if existing_user.is_some() {
        // Return an error if a user with the same email already exists
        return Err("Email already in use".to_string());
    }

    // Call the signup function if email is unique
    signup_user(user_collection, &username, &password, &email).await
}
#[tauri::command]
pub async fn login(username: String, password: String, db: State<'_, DbState>) -> Result<(), String> {
    let user_collection: &Collection<User> = &db.db.collection("users");
    login_user(user_collection, &username, &password).await
}


#[tauri::command]
pub async fn is_logged_in(state: State<'_, SessionState>) -> Result<bool, String> {
    let is_logged_in = if let Some(expiry) = *state.expiry.lock().unwrap() {
        Utc::now().timestamp() < expiry
    } else {
        false
    };
    Ok(is_logged_in)
}


#[tauri::command]
pub async fn logout(state: State<'_, SessionState>) -> Result<(), String> {
    *state.token.lock().unwrap() = None;
    *state.expiry.lock().unwrap() = None;
    Ok(())
}