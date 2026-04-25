mod db;

use db::{LibrarySnapshot, RequestFolder, SavedRequest};
use rusqlite::Connection;
use std::sync::Mutex;
use tauri::{AppHandle, Manager, State};

pub struct DbState {
    pub db: Mutex<Connection>,
}

fn open_db(app: &AppHandle) -> Result<Connection, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let db_path = dir.join("saved_requests.sqlite3");
    let conn = Connection::open(&db_path).map_err(|e| e.to_string())?;
    db::init_schema(&conn).map_err(|e| e.to_string())?;
    Ok(conn)
}

#[tauri::command]
fn get_library(state: State<DbState>) -> Result<LibrarySnapshot, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    db::get_library(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn create_folder(state: State<DbState>, folder: RequestFolder) -> Result<RequestFolder, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    db::insert_folder(&conn, &folder).map_err(|e| e.to_string())?;
    Ok(folder)
}

#[tauri::command]
fn update_folder(state: State<DbState>, folder: RequestFolder) -> Result<RequestFolder, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    db::update_folder(&conn, &folder).map_err(|e| e.to_string())?;
    Ok(folder)
}

#[tauri::command]
fn delete_folder(state: State<DbState>, id: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    db::delete_folder(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
fn create_request(state: State<DbState>, request: SavedRequest) -> Result<SavedRequest, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    db::insert_request(&conn, &request).map_err(|e| e.to_string())?;
    Ok(request)
}

#[tauri::command]
fn update_request(state: State<DbState>, request: SavedRequest) -> Result<SavedRequest, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    db::update_request(&conn, &request).map_err(|e| e.to_string())?;
    Ok(request)
}

#[tauri::command]
fn delete_request(state: State<DbState>, id: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    db::delete_request(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
fn import_library(
    state: State<DbState>,
    folders: Vec<RequestFolder>,
    requests: Vec<SavedRequest>,
) -> Result<LibrarySnapshot, String> {
    let mut conn = state.db.lock().map_err(|e| e.to_string())?;
    db::import_library(&mut conn, &folders, &requests).map_err(|e| e.to_string())?;
    db::get_library(&conn).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .setup(|app| {
            let conn = open_db(app.handle())?;
            app.manage(DbState {
                db: Mutex::new(conn),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_library,
            create_folder,
            update_folder,
            delete_folder,
            create_request,
            update_request,
            delete_request,
            import_library,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
