use crate::database::get_db_connection;
use serde::{Deserialize, Serialize};
use tauri::{command, State};
use crate::db::DbState;
use futures::stream::StreamExt;
use futures::TryStreamExt;
use mongodb::bson;
use mongodb::options::FindOptions;
use regex::Regex;
use chrono::Utc;
use mongodb::error::Error;
use mongodb::{Collection, Cursor};
use mongodb::bson::{to_bson,doc, Document, Bson , oid::ObjectId};


#[command]
pub async fn initialize_db() -> Result<String, String> {
    let db = get_db_connection().await;
    let collection: Collection<Medicine> = db.collection("medicines");
    Ok("Medicines collection initialized successfully.".to_string())
}

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
pub async fn insert_medicine(
    name: String,
    batch_number: String,
    expiry_date: String,
    quantity: u32,
    purchase_price: f64,
    selling_price: f64,
    wholesaler_name: String,
    purchase_date: String,
    hospital_id: String,
) -> Result<String, String> {
    println!("1");
    let db = get_db_connection().await;
    let collection: Collection<Medicine> = db.collection("medicines");

    let new_medicine = Medicine {
        id: None,
        user_id: hospital_id,
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
    Ok("Medicine inserted successfully.".to_string())
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Wholesaler {
    pub wholesaler_id: String,
    pub wholesaler_name: String,
    pub purchase_date: String,
    pub medicines: Vec<Medicine>,
}
#[tauri::command]
pub async fn get_stock(hospital_id: &str) -> Result<Vec<Wholesaler>, String> {
    let db = get_db_connection().await;
    let collection: Collection<Medicine> = db.collection("medicines");

    // Filter documents by hospital_id (user_id)
    let filter = doc! { "user_id": hospital_id };

    // Fetch and transform the documents
    let mut cursor = collection.find(filter, None).await.map_err(|e| e.to_string())?;
    let mut medicines: Vec<Medicine> = Vec::new();

    while let Some(medicine) = cursor.try_next().await.map_err(|e| e.to_string())? {
        medicines.push(medicine);
    }

    // Group medicines by wholesaler_name and purchase_date
    let mut wholesalers_map: std::collections::HashMap<(String, String), Vec<Medicine>> = std::collections::HashMap::new();
    for mut medicine in medicines {
        // Ensure id is converted to string for frontend (not modifying the medicine.id directly)
        if let Some(ref id) = medicine.id {
            // Optionally, you could convert the id to a string for display purposes:
            let id_string = id.to_string();
            // You can now send id_string to the frontend, but keep the original ObjectId intact.
        }
        let key = (medicine.wholesaler_name.clone(), medicine.purchase_date.clone());
        wholesalers_map.entry(key).or_default().push(medicine);
    }

    // Convert grouped medicines into Wholesaler structs
    let stock: Vec<Wholesaler> = wholesalers_map
        .into_iter()
        .map(|((wholesaler_name, purchase_date), medicines)| Wholesaler {
            wholesaler_id: hospital_id.to_string(),  // Set wholesaler_id to hospital_id (user_id)
            wholesaler_name,
            purchase_date,
            medicines,
        })
        .collect();
        
    Ok(stock)
}

#[command]
pub async fn delete_medicine(medicine_id: &str, hospital_id: &str) -> Result<String, String> {
    let db = get_db_connection().await;
    let collection: Collection<Medicine> = db.collection("medicines");

    // Filter to find the specific medicine by ID and user ID
    let filter = doc! {
        "_id": ObjectId::parse_str(medicine_id).map_err(|_| "Invalid medicine ID".to_string())?,
        "user_id": hospital_id
    };

    // Delete the medicine document
    let result = collection.delete_one(filter, None).await.map_err(|e| e.to_string())?;
    if result.deleted_count > 0 {
        Ok("Medicine deleted successfully.".to_string())
    } else {
        Err("No matching medicine found.".to_string())
    }
}
#[command]
pub async fn update_stock(
    medicine_id: String,
    quantity: Option<u32>,
    purchase_price: Option<f64>,
    selling_price: Option<f64>,
    batch_number: Option<String>,
    expiry_date: Option<String>,
    hospital_id: String,
) -> Result<String, String> {
    let db = get_db_connection().await;
    let collection: Collection<Medicine> = db.collection("medicines");

    // Create filter
    let filter = doc! {
        "_id": ObjectId::parse_str(&medicine_id).map_err(|_| "Invalid medicine ID".to_string())?,
        "user_id": hospital_id,
    };
    println!("Filter: {:?}", filter);

    // Check if the document exists
    if let Ok(Some(_)) = collection.find_one(filter.clone(), None).await {
        // Document exists, proceed with the update
    } else {
        return Err("No matching document found.".to_string());
    }
    

    // Construct the update document
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
    if let Some(batch) = batch_number {
        update_doc.insert("batch_number", batch);
    }
    if let Some(expiry) = expiry_date {
        update_doc.insert("expiry_date", expiry);
    }
    println!("Update Document: {:?}", update_doc);

    if update_doc.is_empty() {
        return Err("No fields to update.".to_string());
    }

    // Perform update
    let update = doc! { "$set": update_doc };
    let result = collection.update_one(filter, update, None).await;
    println!("Update Result: {:?}", result);

    result.map_err(|e| e.to_string())?;

    Ok("Stock updated successfully.".to_string())
}


#[command]
pub async fn get_medicine_by_id(
    medicine_id: String,
    hospital_id: String,
) -> Result<Medicine, String> {
    let db = get_db_connection().await;
    let collection: Collection<Medicine> = db.collection("medicines");

    // Filter to find the medicine by ID and user ID
    let filter = doc! {
        "_id": ObjectId::parse_str(&medicine_id).map_err(|_| "Invalid medicine ID".to_string())?,
        "user_id": hospital_id,
    };

    // Fetch the medicine document
    let medicine = collection
        .find_one(filter, None)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Medicine not found.".to_string())?;

    Ok(medicine)
}


#[command]
pub async fn update_batch(
    medicine_id: String,
    batch_number: String,
    quantity: Option<u32>,
    expiry_date: Option<String>,
    purchase_price: Option<f64>,
    selling_price: Option<f64>,
    wholesaler_name: Option<String>,
    purchase_date: Option<String>,
    hospital_id: String,
) -> Result<String, String> {
    // let user_id = get_user_id(session.user_id.clone()).await?;
    let db = get_db_connection().await;
    let collection: Collection<Medicine> = db.collection("medicines");

    let filter = doc! {
        "_id": ObjectId::parse_str(&medicine_id).map_err(|_| "Invalid medicine ID".to_string())?,
        "user_id": hospital_id,
        "batch_number": batch_number.clone(),
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
    Ok("Batch updated successfully.".to_string())
}

#[command]
pub async fn delete_batch(
    medicine_id: String,
    batch_number: String, // Specify the batch to delete
    hospital_id: String,
) -> Result<String, String> {
    // let user_id = get_user_id(session.user_id.clone()).await?;
    let db = get_db_connection().await;
    let collection: Collection<Medicine> = db.collection("medicines");

    // Filter to find the medicine by ID and user ID
    let filter = doc! {
        "_id": ObjectId::parse_str(&medicine_id).map_err(|_| "Invalid medicine ID".to_string())?,
        "user_id": hospital_id,
    };

    // Update to pull the specific batch from the batches array
    let update = doc! {
        "$pull": { "batches": { "batch_number": batch_number } }
    };

    // Apply the update
    let result = collection.update_one(filter, update, None).await.map_err(|e| e.to_string())?;

    // If no batches remain, delete the entire medicine document
    if result.matched_count > 0 {
        let remaining_batches_filter = doc! {
            "_id": ObjectId::parse_str(&medicine_id).unwrap(),
            "batches": { "$size": 0 }
        };

        collection.delete_one(remaining_batches_filter, None).await.map_err(|e| e.to_string())?;
    }

    Ok("Batch deleted successfully.".to_string())
}

#[command]
pub async fn search_medicines(
    query: String,
    hospital_id: String,
) -> Result<Vec<Medicine>, String> {
    // let user_id = get_user_id(session.user_id.clone()).await?;
    let db = get_db_connection().await;
    let collection: Collection<Medicine> = db.collection("medicines");
    let filter = doc! {
        "user_id": hospital_id,
        "name": { "$regex": &query, "$options": "i" }, // Case-insensitive search
    };

    let mut cursor = collection.find(filter, None).await.map_err(|e| e.to_string())?;
    let mut medicines = Vec::new();

    while let Some(doc) = cursor.try_next().await.map_err(|e| e.to_string())? {
        println!("Fetched document: {:?}", doc); // Log the document
        medicines.push(doc);
    }
    Ok(medicines)
}


#[derive(Debug, Serialize, Deserialize)]
pub struct MedicineDetail {
    pub name: String,
    pub quantity: u32,
}

// Struct to represent an appointment.
#[derive(Debug, Serialize, Deserialize)]
pub struct Appointment {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>, // MongoDB ObjectId
    pub patient_name: String, // Patient's name
    pub mobile: String,       // Mobile number
    pub disease: String,      // Disease information
    pub precautions: String,  // Precautions prescribed
    pub medicines: Vec<MedicineDetail>, // List of medicines with quantities
    pub hospital_id: String,  // ID of the hospital
    pub date_created: String, // Timestamp of creation
}

// Tauri command to save an appointment.
#[command]
pub async fn save_appointment(
    patient_name: String,
    mobile: String,
    disease: String,
    precautions: String,
    medicines: Vec<MedicineDetail>,
    hospital_id: String,
) -> Result<String, String> {
    // Validate required fields
    if patient_name.trim().is_empty() || mobile.trim().is_empty() {
        return Err("Patient name and mobile number are required.".to_string());
    }

    // Prepare the database connection
    let db = get_db_connection().await;

    let collection: Collection<Appointment> = db.collection("appointments");

    // Create the new appointment object
    let new_appointment = Appointment {
        id: None,
        patient_name,
        mobile,
        disease,
        precautions,
        medicines,
        hospital_id,
        date_created: Utc::now().to_rfc3339(), // Generate current timestamp
    };

    // Insert the appointment into the database
    collection
        .insert_one(new_appointment, None)
        .await
        .map_err(|e| format!("Database insert error: {}", e))?;

    // Return success message
    Ok("Appointment saved successfully.".to_string())
}

async fn get_appointments_collection() -> Result<Collection<Appointment>, Error> {
    let db = get_db_connection().await; // Replace with your database connection logic
    Ok(db.collection::<Appointment>("appointments"))
}

// Fetch all appointments from the database
#[command]
pub async fn get_all_appointments(hospital_id: &str) -> Result<Vec<Appointment>, String> {
    let collection = get_appointments_collection().await.map_err(|e| e.to_string())?;

    // Create a filter to fetch only the appointments that match the given hospital_id
    let filter = doc! { "hospital_id": hospital_id };

    // Retrieve documents from the appointments collection with the filter and sort by latest (date_created)
    let find_options = FindOptions::builder().sort(doc! { "date_created": -1 }).build();
    let cursor: Cursor<Appointment> = collection
        .find(filter, find_options)
        .await
        .map_err(|e| format!("Database query error: {}", e))?;

    // Collect the documents into a vector
    let appointments: Vec<Appointment> = cursor
        .try_collect()
        .await
        .map_err(|e| format!("Error parsing appointments: {}", e))?;

    Ok(appointments)
}