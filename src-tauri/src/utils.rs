// src-tauri/src/utils.rs
use lettre::{Message, SmtpTransport, Transport};
use lettre::transport::smtp::authentication::Credentials;
use dotenv::dotenv;
use std::env;
use lettre::message::header::ContentType;
/// Send OTP Email with Enhanced UI
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

    // Create a beautiful HTML email template
    let email_html = format!(
        r#"
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }}
                .email-container {{
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }}
                .header {{
                    background-color: #057A85;
                    color: #ffffff;
                    text-align: center;
                    padding: 20px;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 24px;
                }}
                .content {{
                    padding: 20px;
                    text-align: center;
                }}
                .content p {{
                    font-size: 16px;
                    line-height: 1.6;
                    margin: 0 0 20px;
                }}
                .otp-code {{
                    display: inline-block;
                    background-color: #057A85;
                    color: #ffffff;
                    font-size: 24px;
                    padding: 10px 20px;
                    border-radius: 5px;
                    text-decoration: none;
                    margin: 20px 0;
                }}
                .footer {{
                    background-color: #f4f4f4;
                    text-align: center;
                    font-size: 12px;
                    color: #555555;
                    padding: 10px;
                }}
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <h1>Welcome to Our Service</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>Thank you for signing up! Use the OTP code below to complete your verification:</p>
                    <div class="otp-code">{otp}</div>
                    <p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
                </div>
                <div class="footer">
                    &copy; 2024 Our Service. All rights reserved.
                </div>
            </div>
        </body>
        </html>
        "#
    );

    // Build the email message
    let email = Message::builder()
        .from(smtp_user.parse().map_err(|_| "Invalid sender email".to_string())?)
        .to(recipient.parse().map_err(|_| "Invalid recipient email".to_string())?)
        .subject("Your OTP Code")
        .header(ContentType::TEXT_HTML)
        .body(email_html)
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



