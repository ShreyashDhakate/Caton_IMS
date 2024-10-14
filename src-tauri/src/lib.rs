// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

async fn get_inventory() -> Vec<Medicine> {
    let conn = Connection::open("pharmacy.db").unwrap();
    let mut stmt = conn.prepare("SELECT id, name, stock, expiry_date FROM medicines").unwrap();
    let medicine_iter = stmt.query_map([], |row| {
        Ok(Medicine {
            id: row.get(0)?,
            name: row.get(1)?,
            stock: row.get(2)?,
            expiry_date: row.get(3)?,
        })
    }).unwrap();

    let medicines: Vec<Medicine> = medicine_iter.filter_map(Result::ok).collect();
    medicines
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![get_inventory])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
