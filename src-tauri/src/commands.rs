use crate::session::SessionState;
use crate::database::get_db_connection;
use crate::utils::get_user_id;
use mongodb::bson::{doc, oid::ObjectId};
use mongodb::Collection;
use serde::{Deserialize, Serialize};
use tauri::{command, State};
use futures::TryStreamExt;

#[derive(Debug, Serialize, Deserialize)]
pub struct Medicine {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub user_id: String,
    pub name: String,
    pub batch_number: String,
    pub expiry_date: String,
    pub quantity: u32,
    pub purchase_price: f64,
    pub selling_price: f64,
    pub wholesaler_name: String,
    pub purchase_date: String,
}

#[command]
pub async fn initialize_db() -> Result<String, String> {
    let db = get_db_connection().await;
    let collection: Collection<Medicine> = db.collection("medicines");
    Ok("Medicines collection initialized successfully.".to_string())
}

#[command]
pub async fn insert_medicine(
    session: State<'_, SessionState>,
    name: String,
    batch_number: String,
    expiry_date: String,
    quantity: u32,
    purchase_price: f64,
    selling_price: f64,
    wholesaler_name: String,
    purchase_date: String,
) -> Result<String, String> {
    let user_id = get_user_id(session.user_id.clone()).await?;
    let db = get_db_connection().await;
    let collection: Collection<Medicine> = db.collection("medicines");
    println!("1");

    let new_medicine = Medicine {
        id: None,
        user_id: user_id.clone(),
        name,
        batch_number,
        expiry_date,
        quantity,
        purchase_price,
        selling_price,
        wholesaler_name,
        purchase_date,
    };

    collection.insert_one(new_medicine, None).await.map_err(|e| e.to_string())?;
    println!("2");

    Ok("Medicine inserted successfully.".to_string())
}

#[command]
pub async fn update_medicine(
    session: State<'_, SessionState>,
    medicine_id: String,
    quantity: Option<u32>,
    purchase_price: Option<f64>,
    selling_price: Option<f64>,
) -> Result<String, String> {
    let user_id = get_user_id(session.user_id.clone()).await?;
    let db = get_db_connection().await;
    let collection: Collection<Medicine> = db.collection("medicines");
    let filter = doc! {
        "_id": ObjectId::parse_str(&medicine_id).map_err(|_| "Invalid medicine ID".to_string())?,
        "user_id": user_id.clone(),
    };

    let mut update_doc = doc! {};
    if let Some(qty) = quantity {
        update_doc.insert("quantity", qty);
    }
    if let Some(pp) = purchase_price {
        update_doc.insert("purchase_price", pp);
    }
    if let Some(sp) = selling_price {
        update_doc.insert("selling_price", sp);
    }

    if update_doc.is_empty() {
        return Err("No fields to update.".to_string());
    }

    let update = doc! { "$set": update_doc };

    collection.update_one(filter, update, None).await.map_err(|e| e.to_string())?;

    Ok("Medicine updated successfully.".to_string())
}

#[command]
pub async fn delete_medicine(
    session: State<'_, SessionState>,
    medicine_id: String,
) -> Result<String, String> {
    let user_id = get_user_id(session.user_id.clone()).await?;
    let db = get_db_connection().await;
    let collection: Collection<Medicine> = db.collection("medicines");
    let filter = doc! {
        "_id": ObjectId::parse_str(&medicine_id).map_err(|_| "Invalid medicine ID".to_string())?,
        "user_id": user_id.clone(),
    };

    collection.delete_one(filter, None).await.map_err(|e| e.to_string())?;

    Ok("Medicine deleted successfully.".to_string())
}

#[command]
pub async fn get_medicine(
    session: State<'_, SessionState>,
    medicine_id: String,
) -> Result<Medicine, String> {
    let user_id = get_user_id(session.user_id.clone()).await?;
    let db = get_db_connection().await;
    let collection: Collection<Medicine> = db.collection("medicines");
    let filter = doc! {
        "_id": ObjectId::parse_str(&medicine_id).map_err(|_| "Invalid medicine ID".to_string())?,
        "user_id": user_id.clone(),
    };

    let medicine = collection.find_one(filter, None).await.map_err(|e| e.to_string())?;
    medicine.ok_or("Medicine not found.".to_string())
}

#[command]
pub async fn search_medicines(
    session: State<'_, SessionState>,
    query: String,
) -> Result<Vec<Medicine>, String> {
    let user_id = get_user_id(session.user_id.clone()).await?;
    let db = get_db_connection().await;
    let collection: Collection<Medicine> = db.collection("medicines");
    let filter = doc! {
        "user_id": user_id.clone(),
        "name": { "$regex": &query, "$options": "i" }, // Case-insensitive search
    };

    let mut cursor = collection.find(filter, None).await.map_err(|e| e.to_string())?;
    let mut medicines = Vec::new();

    while let Some(doc) = cursor.try_next().await.map_err(|e| e.to_string())? {
        medicines.push(doc);
    }

    Ok(medicines)
}
