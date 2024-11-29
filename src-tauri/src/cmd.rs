use tauri::State;
use mongodb::Collection;
use crate::user::{signup_user, login_user};
use crate::model::User;
use crate::db::DbState; // Import your DbState struct
use mongodb::bson::doc;
use crate::session::SessionState;


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
pub async fn login(
    username: String, 
    password: String, 
    db: State<'_, DbState>,
    session: State<'_, SessionState>, // Inject the session state
) -> Result<String, String> {
    let user_collection: &Collection<User> = &db.db.collection("users");

    // Call the login_user function and propagate its result
    match login_user(user_collection, &username, &password).await {
        Ok(user_id) => {
            let mut session_user_id = session.user_id.lock().await;

            // Update the user ID inside the session
            *session_user_id = Some(user_id.clone());

        //     // Print the stored user_id for debugging
        // if let Some(ref id) = *session_user_id {
        //     println!("Stored user_id: {}", id);
        // } else {
        //     println!("No user_id stored!");
        // }

            Ok(user_id) // Return the user_id on success

            
        }
        Err(err) => Err(err),       // Return the error message on failure
    }
}
