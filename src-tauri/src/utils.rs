use tokio::sync::Mutex;
use crate::SessionState;
use std::sync::Arc;

pub async fn get_user_id(session: Arc<Mutex<Option<String>>>) -> Result<String, String> {
    let session_user_id = session.lock().await; // Lock the mutex to access the user_id
    if let Some(ref id) = *session_user_id {
        Ok(id.clone()) // Return the user_id if found
    } else {
        Err("No user_id found.".to_string()) // Return an error if not found
    }
}