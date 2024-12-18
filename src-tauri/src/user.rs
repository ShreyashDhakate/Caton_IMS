//src-tauri/src/user.rs
use crate::model::User;
use bcrypt::{hash, verify, DEFAULT_COST};
use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use mongodb::Collection;
use serde_json::json;
use chrono::{DateTime, Utc, Duration};
use rand::Rng;
use crate::utils::send_otp_email;

pub async fn signup_user(
    user_collection: &Collection<User>,
    username: &str,
    name: &str,
    mobile: &str,
    hospital: &str,
    address: &str,
    password_doc: &str,
    password_pharma: &str,
    email: &str,
) -> Result<(), String> {
    // Hash the passwords
    let password_hash_doc = hash(password_doc, DEFAULT_COST).map_err(|e| e.to_string())?;
    let password_hash_pharma = hash(password_pharma, DEFAULT_COST).map_err(|e| e.to_string())?;

    // Check for existing username and email
    let existing_user = user_collection
        .find_one(doc! { "username": username }, None)
        .await
        .map_err(|e| format!("Database error: {}", e))?;

    if existing_user.is_some() {
        return Err("Username is already taken".to_string());
    }

    let existing_email = user_collection
        .find_one(doc! { "email": email }, None)
        .await
        .map_err(|e| format!("Database error: {}", e))?;

    if existing_email.is_some() {
        return Err("Email is already registered".to_string());
    }

    // Create the user object
    let user = User {
        id: Some(ObjectId::new()),
        username: username.to_string(),
        name: name.to_string(),
        mobile: mobile.to_string(),
        hospital: hospital.to_string(),
        address: address.to_string(),
        password_hash_doc,
        password_hash_pharma,
        email: email.to_string(),
        otp: None,
        otp_expiry: None,
    };

    // Insert the user into the database
    user_collection
        .insert_one(user, None)
        .await
        .map_err(|e| format!("Failed to create user: {}", e))?;

    Ok(())
}


pub async fn login_user(
    user_collection: &Collection<User>,
    username: &str,
    password: &str,
    role: &str,
) -> Result<String, String> {
    let user_doc = user_collection
        .find_one(doc! { "username": username }, None)
        .await
        .map_err(|e| e.to_string())?;

    if let Some(user) = user_doc {
        let password_hash = if role == "Doctor" {
            &user.password_hash_doc
        } else {
            &user.password_hash_pharma
        };

        if verify(password, password_hash).map_err(|e| e.to_string())? {
            let user_response = json!({
                "userId": user.id.unwrap_or_else(|| ObjectId::new()).to_string(),
                "hospital": user.hospital,
                "phone": user.mobile,
                "address": user.address,
            });
            
            return Ok(user_response.to_string());
        }
    }

    Err("Invalid username or password".to_string())
}

pub async fn send_otp(user_collection: &Collection<User>, email: &str) -> Result<(), String> {
    // Check if the email exists
    let user = user_collection
        .find_one(doc! { "email": email }, None)
        .await
        .map_err(|e| e.to_string())?;

    if user.is_none() {
        return Err("Email not registered".to_string());
    }

    // Generate numeric OTP
    let otp_code: String = rand::thread_rng()
        .sample_iter(rand::distributions::Uniform::from(0..10))
        .take(6)
        .map(|n| n.to_string())
        .collect();
    let otp_expiry = Utc::now() + Duration::minutes(10);

    // Update the user with OTP details
    user_collection
        .update_one(
            doc! { "email": email },
            doc! { "$set": { "otp": &otp_code, "otp_expiry": otp_expiry.to_rfc3339() } },
            None,
        )
        .await
        .map_err(|e| e.to_string())?;

    // Send OTP email
    send_otp_email(email, &otp_code)
        .await
        .map_err(|e| format!("Failed to send OTP: {}", e))?;

    Ok(())
}

pub async fn validate_otp(
    user_collection: &Collection<User>,
    email: &str,
    otp: &str,
) -> Result<(), String> {
    let user = user_collection
        .find_one(doc! { "email": email }, None)
        .await
        .map_err(|e| e.to_string())?;

    if let Some(user) = user {
        if let (Some(stored_otp), Some(expiry)) = (user.otp, user.otp_expiry) {
            let expiry_date = DateTime::parse_from_rfc3339(&expiry)
                .map_err(|e| format!("Failed to parse expiry date: {}", e))?;

            if Utc::now() < expiry_date.with_timezone(&Utc) && stored_otp == otp {
                // Clear OTP after successful validation
                user_collection
                    .update_one(
                        doc! { "email": email },
                        doc! { "$unset": { "otp": "", "otp_expiry": "" } },
                        None,
                    )
                    .await
                    .map_err(|e| e.to_string())?;

                return Ok(());
            }
        }
    }

    Err("Invalid or expired OTP".to_string())
}
