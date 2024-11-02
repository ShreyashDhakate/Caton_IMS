use crate::database::get_db_connection; // Assuming you have a db module for the connection
use mysql::params;
use mysql::prelude::Queryable;
use tauri::command;
use serde::Serialize;

#[derive(Serialize)]
pub struct Medicine {
    pub id: u32,
    pub name: String,
    pub batch_number: String,
    pub expiry_date: String,
    pub quantity: u32,
    pub purchase_price: f64,
    pub selling_price: f64,
}

#[command]
pub async fn initialize_db() -> Result<String, String> {
    let mut conn = get_db_connection()?; 
    conn.query_drop(
        r"CREATE TABLE IF NOT EXISTS medicines (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            batch_number VARCHAR(255),
            expiry_date DATE,
            quantity INT NOT NULL,
            purchase_price DECIMAL(10,2),
            selling_price DECIMAL(10,2)
        )",
    )
    .map_err(|e| e.to_string())?;

    Ok("Medicines table initialized successfully.".to_string())
}

#[command]
pub async fn insert_medicine(
    name: String,
    batch_number: String,
    expiry_date: String,
    quantity: u32,
    purchase_price: f64,
    selling_price: f64,
) -> Result<String, String> {
    let mut conn = get_db_connection()?; 
    conn.exec_drop(
        "INSERT INTO medicines (name, batch_number, expiry_date, quantity, purchase_price, selling_price) 
        VALUES (:name, :batch_number, :expiry_date, :quantity, :purchase_price, :selling_price)",
        params! {
            "name" => name,
            "batch_number" => batch_number,
            "expiry_date" => expiry_date,
            "quantity" => quantity,
            "purchase_price" => purchase_price,
            "selling_price" => selling_price,
        },
    )
    .map_err(|e| e.to_string())?;

    Ok("Medicine inserted successfully.".to_string())
}

#[command]
pub fn get_medicine() -> Result<Vec<Medicine>, String> {
    let mut conn = get_db_connection()?; 
    let medicines = conn
        .query_map(
            "SELECT id, name, batch_number, expiry_date, quantity, purchase_price, selling_price FROM medicines",
            |(id, name, batch_number, expiry_date, quantity, purchase_price, selling_price)| Medicine {
                id,
                name,
                batch_number,
                expiry_date,
                quantity,
                purchase_price,
                selling_price,
            },
        )
        .map_err(|e| e.to_string())?;

    Ok(medicines)
}

#[command]
pub async fn update_medicine(
    id: u32,
    name: String,
    batch_number: String,
    expiry_date: String,
    quantity: u32,
    purchase_price: f64,
    selling_price: f64,
) -> Result<String, String> {
    let mut conn = get_db_connection()?; 
    conn.exec_drop(
        "UPDATE medicines SET name = :name, batch_number = :batch_number, expiry_date = :expiry_date, 
         quantity = :quantity, purchase_price = :purchase_price, selling_price = :selling_price WHERE id = :id",
        params! {
            "id" => id,
            "name" => name,
            "batch_number" => batch_number,
            "expiry_date" => expiry_date,
            "quantity" => quantity,
            "purchase_price" => purchase_price,
            "selling_price" => selling_price,
        },
    )
    .map_err(|e| e.to_string())?;

    Ok("Medicine updated successfully.".to_string())
}

#[command]
pub async fn delete_medicine(id: u32) -> Result<String, String> {
    let mut conn = get_db_connection()?; 
    conn.exec_drop("DELETE FROM medicines WHERE id = :id", params! { "id" => id })
        .map_err(|e| e.to_string())?;

    Ok("Medicine deleted successfully.".to_string())
}

#[derive(Serialize)]
pub struct MedicineInfo {
    pub name: String,
    pub selling_price: f64,
}

#[command]
pub fn search_medicines(query: String, page: u32, limit: u32) -> Result<Vec<MedicineInfo>, String> {
    let mut conn = get_db_connection()?;
    let search_query = format!("%{}%", query);
    let offset = (page - 1) * limit;

    let medicine_info = conn
        .exec_map(
            "SELECT name, selling_price FROM medicines WHERE name LIKE :query LIMIT :limit OFFSET :offset",
            params! { "query" => &search_query, "limit" => limit, "offset" => offset },
            |(name, selling_price)| MedicineInfo { name, selling_price },
        )
        .map_err(|e| e.to_string())?;

    Ok(medicine_info)
}
