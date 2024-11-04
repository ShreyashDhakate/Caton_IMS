use crate::database::get_db_connection;
use mongodb::bson::{doc,  Document, oid::ObjectId};
use mongodb::Collection;
use serde::{Deserialize, Serialize};
use tauri::{command, State};
use crate::db::DbState;
use futures::stream::StreamExt;
use futures::TryStreamExt;
use mongodb::bson;


#[derive(Serialize, Deserialize)]
pub struct Medicine {
    #[serde(rename = "_id")]
    pub id: Option<ObjectId>, // Using ObjectId for MongoDB ID compatibility
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
pub async fn initialize_db(db: State<'_, DbState>) -> Result<String, String> {
    let _medicine_collection: Collection<Document> = db.db.collection("medicines");
    Ok("Medicines collection ready.".to_string())
}

#[command]
pub async fn get_medicine() -> Result<Vec<Medicine>, String> {
    let db = get_db_connection().await;
    let collection: Collection<Medicine> = db.collection("medicines");

    let cursor = collection.find(None, None).await.map_err(|e| e.to_string())?;
    let medicines: Vec<Medicine> = cursor.try_collect().await.map_err(|e| e.to_string())?;

    Ok(medicines)
}

#[command]
pub async fn insert_medicine(
    name: String,
    batch_number: String,
    expiry_date: String,
    quantity: u32,
    purchase_price: f64,
    selling_price: f64,
    wholesaler_name: String,
    purchase_date: String,
) -> Result<String, String> {
    let db = get_db_connection().await;
    let collection: Collection<Medicine> = db.collection("medicines");

    let new_medicine = Medicine {
        id: None,
        name,
        batch_number,
        expiry_date,
        quantity,
        purchase_price,
        selling_price,
        wholesaler_name,
        purchase_date,
    };

    collection.insert_one(new_medicine, None)
        .await
        .map_err(|e| e.to_string())?;

    Ok("Medicine inserted successfully.".to_string())
}

#[command]
pub async fn update_medicine(
    id: String,
    name: String,
    batch_number: String,
    expiry_date: String,
    quantity: u32,
    purchase_price: f64,
    selling_price: f64,
    wholesaler_name: String,
    purchase_date: String,
) -> Result<String, String> {
    let db = get_db_connection().await;
    let collection: Collection<Medicine> = db.collection("medicines");

    // Convert id to ObjectId for MongoDB filter
    let object_id = ObjectId::parse_str(&id).map_err(|e| e.to_string())?;
    let filter = doc! { "_id": object_id };

    let update = doc! {
        "$set": {
            "name": name,
            "batch_number": batch_number,
            "expiry_date": expiry_date,
            "quantity": quantity,
            "purchase_price": purchase_price,
            "selling_price": selling_price,
            "wholesaler_name": wholesaler_name,
            "purchase_date": purchase_date
        }
    };

    collection.update_one(filter, update, None)
        .await
        .map_err(|e| e.to_string())?;

    Ok("Medicine updated successfully.".to_string())
}

#[command]
pub async fn delete_medicine(id: String) -> Result<String, String> {
    let db = get_db_connection().await;
    let collection: Collection<Medicine> = db.collection("medicines");

    // Convert id to ObjectId for MongoDB filter
    let object_id = ObjectId::parse_str(&id).map_err(|e| e.to_string())?;
    collection.delete_one(doc! { "_id": object_id }, None)
        .await
        .map_err(|e| e.to_string())?;

    Ok("Medicine deleted successfully.".to_string())
}
#[derive(Serialize, Deserialize)]
pub struct MedicineInfo {
    pub name: String,
    pub selling_price: Option<f64>, // Optional in case some documents lack this field
}

#[tauri::command]
pub async fn search_medicines(
    query: String,
    page: u32,
    limit: u32,
    db: State<'_, DbState>,
) -> Result<Vec<MedicineInfo>, String> {
    let medicine_collection: Collection<Document> = db.db.collection("medicines");
    let skip = (page - 1) * limit;

    let filter = doc! { "name": { "$regex": query.clone(), "$options": "i" } };
    let options = mongodb::options::FindOptions::builder()
        .limit(limit as i64)
        .skip(skip as u64)
        .build();

    let mut cursor = medicine_collection.find(filter, options)
        .await
        .map_err(|e| format!("Database error: {}", e))?;

    let mut medicines: Vec<MedicineInfo> = Vec::new();

    // Iterate over the cursor
    while let Some(result) = cursor.next().await {
        match result {
            Ok(doc) => {
                // Clone the document for logging in case of deserialization failure
                match bson::from_document::<MedicineInfo>(doc.clone()) {
                    Ok(medicine) => medicines.push(medicine),
                    Err(_) => {
                        println!("Failed to deserialize document: {:?}", doc); // Log the document
                        return Err("Failed to deserialize medicine document.".to_string());
                    }
                }
            }
            Err(e) => {
                return Err(format!("Error retrieving medicine: {}", e));
            }
        }
    }

    Ok(medicines)
}
