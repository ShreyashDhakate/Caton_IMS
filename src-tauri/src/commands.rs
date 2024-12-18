use crate::database::get_db_connection;
use serde::{Deserialize, Serialize};
use tauri::command;

use futures::stream::StreamExt;
use futures::TryStreamExt;
use mongodb::options::FindOptions;
use chrono::Utc;
use mongodb::Collection;
use mongodb::bson::{doc, oid::ObjectId};
// use mongodb::bson::oid::ObjectId;



#[command]
pub async fn initialize_db() -> Result<String, String> {
    let db = get_db_connection().await;
    let _collection: Collection<Medicine> = db.collection("medicines");
    Ok("Medicines collection initialized successfully.".to_string())
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Medicine {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub local_id: String,
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
    local_id: String,
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
    // println!("1");
    let db = get_db_connection().await;
    let collection: Collection<Medicine> = db.collection("medicines");

    let new_medicine = Medicine {
        id: None,
        local_id,
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
    for  medicine in medicines {
        // Ensure id is converted to string for frontend (not modifying the medicine.id directly)
        if let Some(ref id) = medicine.id {
            // Optionally, you could convert the id to a string for display purposes:
            let _id_string = id.to_string();
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
#[tauri::command]
pub async fn reduce_batch(
    id: String,
    batch_number: String,
    quantity: u32,
) -> Result<String, String> {
    let db = get_db_connection().await;
    let collection: Collection<Medicine> = db.collection("medicines");

    // Convert the string ID to ObjectId
    let object_id = ObjectId::parse_str(&id).map_err(|_| "Invalid ID format")?;

    // Filter by ID and batch_number
    let filter = doc! {
        "_id": object_id,
        "batch_number": batch_number,
    };

    // Reduce the quantity
    let update = doc! {
        "$inc": { "quantity": -(quantity as i32) }
    };

    match collection.update_one(filter, update, None).await {
        Ok(result) => {
            if result.matched_count > 0 {
                Ok("Medicine quantity updated successfully.".to_string())
            } else {
                Err("No matching medicine found.".into())
            }
        }
        Err(e) => Err(format!("Database update error: {}", e)),
    }
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
pub async fn fetch_medicine(hospital_id: &str) -> Result<Vec<Medicine>, String> {
    let db = get_db_connection().await;
    let collection: Collection<Medicine> = db.collection("medicines");

    // Filter to match the specific hospital_id
    let filter = doc! { "user_id": hospital_id };

    // Fetch all medicines matching the filter
    let cursor = collection
        .find(filter, None)
        .await
        .map_err(|e| e.to_string())?;

    // Collect the results into a Vec<Medicine>
    let medicines: Vec<Medicine> = cursor
        .try_collect()
        .await
        .map_err(|e| e.to_string())?;

    Ok(medicines)
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
    let existing_doc = collection.find_one(filter.clone(), None).await.map_err(|e| {
        println!("Error finding document: {:?}", e);
        "Error finding document.".to_string()
    })?;
    println!("Existing Document: {:?}", existing_doc);

    if existing_doc.is_none() {
        return Err("No matching document found.".to_string());
    } else {
        println!("Found document, proceeding with update.");
    }

    // Construct the update document
    let mut update_doc = doc! {};
    if let Some(qty) = quantity {
        update_doc.insert("quantity", qty);
    }
    if let Some(pp) = purchase_price {
        update_doc.insert("purchase_price", pp);
    }
    println!("Selling price: {:?}", selling_price);  // Log selling price
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

    // Perform the update
    let update = doc! { "$set": update_doc };
    let result = collection.update_one(filter, update, None).await;

    match result {
        Ok(res) => {
            println!("Matched Count: {}", res.matched_count);
            println!("Modified Count: {}", res.modified_count);

            if res.modified_count == 0 {
                return Err("No changes were made (value may be the same).".to_string());
            }
        },
        Err(e) => {
            println!("Error during update: {:?}", e);
            return Err("Error during update.".to_string());
        }
    }

    Ok("Stock updated successfully.".to_string())
}

#[command]
pub async fn check_medicine_batch(
    name: String,
    batch_number: String,
    hospital_id: String,
) -> Result<bool, String> {
    let db = get_db_connection().await;
    let collection: Collection<Medicine> = db.collection("medicines");

    // Build filter document using name, batch_number, and hospital_id
    let filter = doc! {
        "name": name,
        "batch_number": batch_number,
        "user_id": hospital_id,
    };

    match collection.find_one(filter, None).await {
        Ok(Some(_)) => Ok(true), // Batch exists
        Ok(None) => Ok(false),  // Batch does not exist
        Err(e) => Err(e.to_string()), // Error during the query
    }
}


#[command]
pub async fn update_batch(
    local_id: String,
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
        "local_id": local_id,
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
    if let Some(expiry) = expiry_date {
        update_doc.insert("expiry_date", expiry);
    }
    if let Some(wn) = wholesaler_name {
        update_doc.insert("wholesaler_name", wn);
    }
    if let Some(pd) = purchase_date {
        update_doc.insert("purchase_date", pd);
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



// #[derive(Debug, Serialize, Deserialize)]
// pub struct MedicineDetail {
//     pub name: String,
//     pub quantity: u32,
// }
#[derive(Debug, Serialize, Deserialize)]
pub struct MedicineDetail {
    pub id: String, // Medicine ID
    pub quantity: u32,
}

#[derive(Serialize, Deserialize)]
pub struct Appointment {
    #[serde(rename = "_id")]
    pub id: ObjectId,
    pub patient_name: String,
    pub mobile: String,
    pub disease: String,
    pub precautions: String,
    pub medicines: Vec<MedicineDetail>, // Updated to store only IDs and quantities
    pub hospital_id: String,
    pub date_created: String,
}

#[command]
pub async fn save_appointment(
    patient_name: String,
    mobile: String,
    disease: String,
    precautions: String,
    medicines: Vec<MedicineDetail>, // Adjusted to accept only medicine IDs and quantities
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
        id: ObjectId::new(), // Generates a new ObjectId
        patient_name,
        mobile,
        disease,
        precautions,
        medicines, // Only medicine IDs and quantities are stored
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

async fn get_appointments_collection() -> Result<Collection<Appointment>, mongodb::error::Error> {
    let db = get_db_connection().await; // Replace with your database connection logic
    Ok(db.collection::<Appointment>("appointments"))
}

// Fetch all appointments from the database

#[derive(Serialize, Debug)]
pub struct AppointmentResponse {
    pub id: String,
    pub hospital_id: String,
    pub patient_name: String,
    pub disease: String,
    pub precautions: String,
    pub medicines: Vec<MedicineDetail>,
    pub date_created: Option<chrono::DateTime<chrono::Utc>>,
}

#[command]
pub async fn get_all_appointments(hospital_id: &str) -> Result<Vec<AppointmentResponse>, String> {
    let collection = get_appointments_collection().await.map_err(|e| e.to_string())?;

    // Create a filter to fetch only the appointments that match the given hospital_id
    let filter = doc! { "hospital_id": hospital_id };

    // Retrieve documents from the appointments collection with the filter and sort by latest (date_created)
    let find_options = FindOptions::builder().sort(doc! { "date_created": -1 }).build();
    let cursor = collection
        .find(filter, find_options)
        .await
        .map_err(|e| format!("Database query error: {}", e))?;

    // Map MongoDB's ObjectId to a String and collect into a vector
    let appointments: Vec<AppointmentResponse> = cursor
        .map(|result| {
            result.map(|appointment: Appointment| AppointmentResponse {
                id: appointment.id.to_hex(),
                hospital_id: appointment.hospital_id,
                patient_name: appointment.patient_name,
                disease: appointment.disease,
                precautions: appointment.precautions,
                medicines: appointment
                    .medicines
                    .iter()
                    .map(|m| MedicineDetail {
                        id: m.id.clone(),
                        quantity: m.quantity,
                    })
                    .collect(),
                date_created: appointment
                .date_created
                .parse::<chrono::DateTime<chrono::Utc>>()
                .ok(),
            })
        })
        .try_collect()
        .await
        .map_err(|e| format!("Error parsing appointments: {}", e))?;

    Ok(appointments)
}

#[command]
pub async fn delete_appointments_older_than_one_hour() -> Result<String, String> {
    let collection = get_appointments_collection().await.map_err(|e| e.to_string())?;

    // Calculate the timestamp for 1 hour ago
    let cutoff_date = chrono::Utc::now() - chrono::Duration::hours(1);

    // Delete appointments older than the cutoff date
    let filter = doc! {
        "date_created": {
            "$lt": cutoff_date.to_rfc3339()
        }
    };

    let delete_result = collection
        .delete_many(filter, None)
        .await
        .map_err(|e| format!("Error deleting old appointments: {}", e))?;

    Ok(format!(
        "Deleted {} appointments older than 1 hour.",
        delete_result.deleted_count
    ))
}



#[command]
pub async fn get_medicine_by_id(medicine_id: String) -> Result<Medicine, String> {
    // println!("0");
    // Step 1: Establish a database connection
    let db = get_db_connection().await;
    let collection: Collection<Medicine> = db.collection("medicines");

    // Step 2: Parse the `medicine_id` into an ObjectId
    let object_id = ObjectId::parse_str(&medicine_id).map_err(|e| e.to_string())?;

    // Step 3: Query the database for the medicine
    let filter = doc! { "_id": object_id };
    let medicine = collection
        .find_one(filter, None)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Medicine not found".to_string())?;

    // Step 4: Return the retrieved medicine
    Ok(medicine)
}

#[command]
pub async fn get_all_medicines(hospital_id: String) -> Result<Vec<Medicine>, String> {
    let db = get_db_connection().await;
    let collection: Collection<Medicine> = db.collection("medicines");

    // Query to filter medicines by the hospital's user ID
    let filter = doc! { "user_id": &hospital_id };

    // Fetch all medicines matching the filter
    let cursor = collection
        .find(filter, None)
        .await
        .map_err(|e| e.to_string())?;
    
    // Collect all medicines into a Vec
    let medicines: Vec<Medicine> = cursor
        .try_collect()
        .await
        .map_err(|e| e.to_string())?;
    
    Ok(medicines)
}
