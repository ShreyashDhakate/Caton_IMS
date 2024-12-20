use tauri::State;
use crate::user::{signup_user, login_user, send_otp, validate_otp};
use crate::model::User;
use crate::db::DbState; // Import your DbState struct
use chrono::Utc;
use std::sync::Mutex;
use mongodb::{bson::doc, bson::oid::ObjectId, Collection};



#[derive(Default)]
pub struct SessionState {
    pub token: Mutex<Option<String>>,
    pub expiry: Mutex<Option<i64>>,
}

#[tauri::command]
pub async fn signup(
    username: String,
    name: String,
    mobile: String,
    address: String,
    hospital: String,
    password_doc: String,
    password_pharma: String,
    email: String,
    db: State<'_, DbState>,
) -> Result<(), String> {
    let user_collection: &Collection<User> = &db.db.collection("users");

    // Check if email is already registered
    let existing_email = user_collection
        .find_one(doc! { "email": &email }, None)
        .await
        .map_err(|e| format!("Database error: {}", e))?;

    if existing_email.is_some() {
        return Err("Email already in use".to_string());
    }

    

    signup_user(
        user_collection,
        &username,
        &name,
        &mobile,
        &hospital,
        &address,
        &password_doc,
        &password_pharma,
        &email,
    )
    .await
}

#[tauri::command]
pub async fn verify_signup(
    username: String,
    name: String,
    mobile: String,
    address: String,
    hospital: String,
    password_doc: String,
    password_pharma: String,
    email: String,
    otp: String,
    db: State<'_, DbState>,
) -> Result<(), String> {
    let user_collection: &Collection<User> = &db.db.collection("users");

    // Validate OTP
    validate_otp(user_collection, &email, &otp).await?;

    // Proceed with user signup
    signup_user(
        user_collection,
        &username,
        &name,
        &mobile,
        &hospital,
        &address,
        &password_doc,
        &password_pharma,
        &email,
    )
    .await
    
}


#[tauri::command]
pub async fn forgot_password(email: String, db: State<'_, DbState>) -> Result<(), String> {
    let user_collection: &Collection<User> = &db.db.collection("users");

    // Check if email exists
    let existing_email = user_collection
        .find_one(doc! { "email": &email }, None)
        .await
        .map_err(|e| format!("Database error: {}", e))?;

    if existing_email.is_none() {
        return Err("Email not found".to_string());
    }

    // Send OTP for password reset
    send_otp(user_collection, &email).await
}

#[tauri::command]
pub async fn reset_password(
    email: String,
    otp: String,
    new_password: String,
    role: String,
    db: State<'_, DbState>,
) -> Result<(), String> {
    let user_collection: &Collection<User> = &db.db.collection("users");

    // Validate OTP
    validate_otp(user_collection, &email, &otp).await?;

    // Update the user's password
    let password_hash = bcrypt::hash(&new_password, bcrypt::DEFAULT_COST).map_err(|e| e.to_string())?;

    let update_field = if role == "Doctor" {
        "password_hash_doc"
    } else {
        "password_hash_pharma"
    };

    user_collection
        .update_one(
            doc! { "email": &email },
            doc! { "$set": { update_field: password_hash } },
            None,
        )
        .await
        .map_err(|e| format!("Failed to update password: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn login(
    role: String,
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


#[tauri::command]
pub async fn update_user_details(
    email: String,
    name: Option<String>,
    hospital: Option<String>,
    mobile: Option<String>,
    address: Option<String>,
    db: State<'_, DbState>,
) -> Result<(), String> {
    let user_collection: &Collection<User> = &db.db.collection("users");

    // Check if the user exists
    let existing_user = user_collection
        .find_one(doc! { "email": &email }, None)
        .await
        .map_err(|e| format!("Database error: {}", e))?;

    if existing_user.is_none() {
        return Err("User not found".to_string());
    }

    // Build the update document dynamically
    let mut update_fields = doc! {};
    if let Some(new_name) = name {
        update_fields.insert("name", new_name);
    }
    if let Some(new_hospital) = hospital {
        update_fields.insert("hospital", new_hospital);
    }
    if let Some(new_mobile) = mobile {
        update_fields.insert("mobile", new_mobile);
    }
    if let Some(new_address) = address {
        update_fields.insert("address", new_address);
    }

    // Ensure there is something to update
    if update_fields.is_empty() {
        return Err("No fields provided for update".to_string());
    }

    // Perform the update
    user_collection
        .update_one(
            doc! { "email": &email },
            doc! { "$set": update_fields },
            None,
        )
        .await
        .map_err(|e| format!("Failed to update user details: {}", e))?;

    Ok(())
}



#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct AppliedSubscription {
    pub id: Option<ObjectId>,
    pub user_id: ObjectId,
    pub name: String,
    pub mobile: String,
    pub hospital: String,
    pub email: String,
    pub subscription_end_date: chrono::DateTime<Utc>,
    pub applied_on: chrono::DateTime<Utc>,
}

#[tauri::command]
pub async fn renew_subscription(
    user_id: String,
    name: String,
    email: String,
    subscription_end_date: String,
    db: State<'_, DbState>,
) -> Result<(), String> {
    // Parse the user ID and subscription end date
    let user_id = ObjectId::parse_str(&user_id).map_err(|e| format!("Invalid user ID: {}", e))?;
    let subscription_end_date = subscription_end_date
        .parse::<chrono::DateTime<Utc>>()
        .map_err(|e| format!("Invalid date format: {}", e))?;
    
    // Get the collections
    let user_collection: &Collection<User> = &db.db.collection("users");
    let applied_sub_collection: &Collection<AppliedSubscription> = &db.db.collection("applied_subscriptions");

    // Find the user by ID
    let user = user_collection
        .find_one(doc! { "_id": &user_id }, None)
        .await
        .map_err(|e| format!("Database error: {}", e))?
        .ok_or("User not found")?;

    // Prepare the applied subscription data
    let applied_subscription = AppliedSubscription {
        id: Some(ObjectId::new()),
        user_id: user_id.clone(),
        name: user.name.clone(),
        mobile: user.mobile.clone(),
        hospital: user.hospital.clone(),
        email: user.email.clone(),
        subscription_end_date,
        applied_on: Utc::now(),
    };

    // Insert into applied_subscriptions collection
    applied_sub_collection
        .insert_one(applied_subscription, None)
        .await
        .map_err(|e| format!("Failed to create subscription entry: {}", e))?;

    Ok(())
}



#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct NewSubscription {
    pub id: Option<ObjectId>,
    pub username: String,
    pub name: String,
    pub email: String,
    pub mobile: String,
    pub subscription_date: chrono::DateTime<Utc>,
}

#[tauri::command]
pub async fn new_subscription(
    username: String,
    name: String,
    email: String,
    mob: String,
    db: State<'_, DbState>,
) -> Result<(), String> {
    // Prepare the new subscription data
    let new_subscription = NewSubscription {
        id: Some(ObjectId::new()),
        username: username.clone(),
        name: name.clone(),
        email: email.clone(),
        mobile: mob.clone(),
        subscription_date: Utc::now(),
    };

    // Access the `new_subscriptions` collection in the `users_db` database
    let new_subscriptions_collection: &Collection<NewSubscription> = &db
        .db
        .collection("new_subscriptions");

    // Insert the new subscription document into the `new_subscriptions` collection
    new_subscriptions_collection
        .insert_one(new_subscription, None)
        .await
        .map_err(|e| format!("Failed to create subscription entry: {}", e))?;

    Ok(())
}
