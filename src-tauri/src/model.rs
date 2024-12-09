// src-tauri/src/model.rs
use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub id: Option<ObjectId>,
    pub username: String,
    pub name: String,
    pub mobile: String,
    pub hospital: String,
    pub address: String,
    pub password_hash_doc: String,
    pub password_hash_pharma: String,
    pub email: String,
    pub otp: Option<String>,
    pub otp_expiry: Option<String>,
}
