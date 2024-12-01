// src-tauri/src/model.rs
use mongodb::bson::{doc, oid::ObjectId};

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,  // Add the ObjectId field
    pub username: String,
    pub password_hash_doc: String,
    pub password_hash_pharma:String,
    pub email: String,
}