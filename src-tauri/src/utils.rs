// src-tauri/src/utils.rs
use lettre::{Message, SmtpTransport, Transport};
use lettre::transport::smtp::authentication::Credentials;
use dotenv::dotenv;
use std::env;

/// Send OTP Email
pub async fn send_otp_email(recipient: &str, otp: &str) -> Result<(), String> {
    // Load environment variables
    dotenv().ok();

    // Get SMTP configuration from environment variables
    let smtp_user = env::var("SMTP_USER").map_err(|_| "SMTP_USER must be set in .env".to_string())?;
    let smtp_password = env::var("SMTP_PASSWORD").map_err(|_| "SMTP_PASSWORD must be set in .env".to_string())?;
    let smtp_server = env::var("SMTP_SERVER").map_err(|_| "SMTP_SERVER must be set in .env".to_string())?;
    let smtp_port = env::var("SMTP_PORT")
        .map_err(|_| "SMTP_PORT must be set in .env".to_string())?
        .parse::<u16>()
        .map_err(|_| "SMTP_PORT must be a valid number".to_string())?;

    // Build the email message
    let email = Message::builder()
        .from(smtp_user.parse().map_err(|_| "Invalid sender email".to_string())?)
        .to(recipient.parse().map_err(|_| "Invalid recipient email".to_string())?)
        .subject("Your OTP Code")
        .body(format!("Your OTP code is: {}", otp))
        .map_err(|e| e.to_string())?;

    // Set up the mailer
    let creds = Credentials::new(smtp_user.clone(), smtp_password.clone());
    let mailer = SmtpTransport::relay(&smtp_server)
        .map_err(|_| "Failed to connect to SMTP server".to_string())?
        .port(smtp_port)
        .credentials(creds)
        .build();

    // Send the email
    mailer.send(&email).map_err(|e| format!("Failed to send email: {}", e))?;
    Ok(())
}



