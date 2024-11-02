// src-tauri/src/cmd.rs
use tauri::State;
use mongodb::Collection;
use crate::user::{signup_user, login_user};
use crate::model::User;
use crate::db::DbState; // Import your DbState struct

#[tauri::command]
pub async fn signup(username: String, password: String, email: String, db: State<'_, DbState>) -> Result<(), String> {
    let user_collection: &Collection<User> = &db.db.collection("users");
    signup_user(user_collection, &username, &password, &email).await
}

#[tauri::command]
pub async fn login(username: String, password: String, db: State<'_, DbState>) -> Result<(), String> {
    let user_collection: &Collection<User> = &db.db.collection("users");
    login_user(user_collection, &username, &password).await
}
