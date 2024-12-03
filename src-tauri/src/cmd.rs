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
    name:String,
    mobile:String,
    address:String,
    password_doc: String,
    password_pharma: String,
    email: String,
    db: State<'_, DbState>,
) -> Result<(), String> {
    let user_collection: &Collection<User> = &db.db.collection("users");

    // Check if email already exists
    let existing_email = user_collection
        .find_one(doc! { "email": &email }, None)
        .await
        .map_err(|e| format!("Database error: {}", e))?;

    if existing_email.is_some() {
        return Err("Email already in use".to_string());
    }
    
    let existing_user = user_collection
        .find_one(doc! { "username": &username }, None)
        .await
        .map_err(|e| format!("Database error: {}", e))?;

    if existing_user.is_some() {
        return Err("Username is  already in taken".to_string());
    }

    // Proceed with user signup if the email is unique
    signup_user(user_collection, &username, &name, &mobile, &address, &password_doc,&password_pharma, &email).await
}

#[tauri::command]
pub async fn login(
    role:String,
    username: String,
    password: String,
    db: State<'_, DbState>,
) -> Result<String, String> {
    let user_collection: &Collection<User> = &db.db.collection("users");
    
    // Call the login function and return the result
    login_user(user_collection, &username, &password, &role).await
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
