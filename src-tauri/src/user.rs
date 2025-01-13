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
                "phone": user.mobileOne,
                // "phoneTwo": user.mobileTwo,
                "address": user.address,
                "name": user.name,
                "email":user.email
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
