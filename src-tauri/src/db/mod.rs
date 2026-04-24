use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LibrarySnapshot {
    pub folders: Vec<RequestFolder>,
    pub requests: Vec<SavedRequest>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KVEntry {
    pub id: String,
    pub key: String,
    pub value: String,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RequestFolder {
    pub id: String,
    pub name: String,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthConfig {
    #[serde(rename = "type")]
    pub auth_type: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub username: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub password: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub token: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub header_name: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub header_value: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ResponseData {
    pub status: i32,
    pub status_text: String,
    pub headers: HashMap<String, String>,
    pub body: String,
    pub timing: i64,
    pub size: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SavedRequest {
    pub id: String,
    pub name: String,
    pub method: String,
    pub url: String,
    pub headers: Vec<KVEntry>,
    pub body: String,
    pub auth: AuthConfig,
    #[serde(default)]
    pub folder_id: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
    #[serde(default)]
    pub last_response: Option<ResponseData>,
}

pub fn init_schema(conn: &Connection) -> rusqlite::Result<()> {
    conn.execute_batch(
        "PRAGMA foreign_keys = ON;
         CREATE TABLE IF NOT EXISTS folders (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
         );
         CREATE TABLE IF NOT EXISTS saved_requests (
            id TEXT PRIMARY KEY NOT NULL,
            folder_id TEXT REFERENCES folders(id) ON DELETE SET NULL,
            name TEXT NOT NULL,
            method TEXT NOT NULL,
            url TEXT NOT NULL,
            headers_json TEXT NOT NULL,
            params_json TEXT NOT NULL,
            body TEXT NOT NULL,
            auth_json TEXT NOT NULL,
            last_response_json TEXT,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
         );",
    )?;

    // Migration to schema v2: headers_json as array, drop params_json
    // Check if we need to migrate
    let table_info: Vec<String> = conn
        .prepare("PRAGMA table_info(saved_requests)")?
        .query_map([], |row| row.get(1))?
        .collect::<Result<Vec<_>, _>>()?;

    if table_info.contains(&"params_json".to_string()) {
        // We still have params_json, which means we are in v1 or transitioning
        // For now, we'll keep the column but the Rust code will handle the transition
    }

    Ok(())
}

fn row_to_folder(row: &rusqlite::Row<'_>) -> rusqlite::Result<RequestFolder> {
    Ok(RequestFolder {
        id: row.get(0)?,
        name: row.get(1)?,
        created_at: row.get(2)?,
        updated_at: row.get(3)?,
    })
}

// Columns: id, folder_id, name, method, url, headers_json, params_json, body, auth_json, last_response_json, created_at, updated_at
fn row_to_saved_request(row: &rusqlite::Row<'_>) -> rusqlite::Result<SavedRequest> {
    let headers_json: String = row.get(5)?;
    let auth_json: String = row.get(8)?;
    let last_response_json: Option<String> = row.get(9)?;

    let headers: Vec<KVEntry> = match serde_json::from_str(&headers_json) {
        Ok(v) => v,
        Err(_) => {
            // Old format: HashMap<String, String>
            let map: HashMap<String, String> = serde_json::from_str(&headers_json)
                .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
            map.into_iter()
                .map(|(k, v)| KVEntry {
                    id: uuid::Uuid::new_v4().to_string(),
                    key: k,
                    value: v,
                    enabled: true,
                })
                .collect()
        }
    };

    let auth: AuthConfig = serde_json::from_str(&auth_json)
        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
    let last_response = match last_response_json {
        Some(s) if !s.is_empty() => Some(serde_json::from_str(&s).map_err(|e| {
            rusqlite::Error::ToSqlConversionFailure(Box::new(e))
        })?),
        _ => None,
    };

    Ok(SavedRequest {
        id: row.get(0)?,
        folder_id: row.get(1)?,
        name: row.get(2)?,
        method: row.get(3)?,
        url: row.get(4)?,
        headers,
        body: row.get(7)?,
        auth,
        created_at: row.get(10)?,
        updated_at: row.get(11)?,
        last_response,
    })
}

pub fn get_library(conn: &Connection) -> rusqlite::Result<LibrarySnapshot> {
    let mut stmt = conn.prepare("SELECT id, name, created_at, updated_at FROM folders ORDER BY name COLLATE NOCASE")?;
    let folders = stmt
        .query_map([], |row| row_to_folder(row))?
        .collect::<Result<Vec<_>, _>>()?;

    let mut stmt = conn.prepare(
        "SELECT id, folder_id, name, method, url, headers_json, params_json, body, auth_json, last_response_json, created_at, updated_at
         FROM saved_requests ORDER BY name COLLATE NOCASE",
    )?;
    let requests = stmt
        .query_map([], |row| row_to_saved_request(row))?
        .collect::<Result<Vec<_>, _>>()?;

    Ok(LibrarySnapshot { folders, requests })
}

pub fn insert_folder(conn: &Connection, folder: &RequestFolder) -> rusqlite::Result<()> {
    conn.execute(
        "INSERT INTO folders (id, name, created_at, updated_at) VALUES (?1, ?2, ?3, ?4)",
        params![
            folder.id,
            folder.name,
            folder.created_at,
            folder.updated_at
        ],
    )?;
    Ok(())
}

pub fn update_folder(conn: &Connection, folder: &RequestFolder) -> rusqlite::Result<()> {
    conn.execute(
        "UPDATE folders SET name = ?2, updated_at = ?3 WHERE id = ?1",
        params![folder.id, folder.name, folder.updated_at],
    )?;
    Ok(())
}

pub fn delete_folder(conn: &Connection, id: &str) -> rusqlite::Result<()> {
    conn.execute(
        "UPDATE saved_requests SET folder_id = NULL WHERE folder_id = ?1",
        params![id],
    )?;
    conn.execute("DELETE FROM folders WHERE id = ?1", params![id])?;
    Ok(())
}

fn request_to_params(req: &SavedRequest) -> rusqlite::Result<(String, String, Option<String>)> {
    let headers_json = serde_json::to_string(&req.headers)
        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
    let auth_json = serde_json::to_string(&req.auth)
        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
    let last_response_json = match &req.last_response {
        Some(r) => Some(serde_json::to_string(r).map_err(|e| {
            rusqlite::Error::ToSqlConversionFailure(Box::new(e))
        })?),
        None => None,
    };
    Ok((headers_json, auth_json, last_response_json))
}

pub fn insert_request(conn: &Connection, req: &SavedRequest) -> rusqlite::Result<()> {
    let (headers_json, auth_json, last_response_json) = request_to_params(req)?;
    conn.execute(
        "INSERT INTO saved_requests (
            id, folder_id, name, method, url, headers_json, params_json, body, auth_json, last_response_json, created_at, updated_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
        params![
            req.id,
            req.folder_id,
            req.name,
            req.method,
            req.url,
            headers_json,
            "[]", // params_json is now always empty
            req.body,
            auth_json,
            last_response_json,
            req.created_at,
            req.updated_at
        ],
    )?;
    Ok(())
}

pub fn update_request(conn: &Connection, req: &SavedRequest) -> rusqlite::Result<()> {
    let (headers_json, auth_json, last_response_json) = request_to_params(req)?;
    conn.execute(
        "UPDATE saved_requests SET
            folder_id = ?2, name = ?3, method = ?4, url = ?5,
            headers_json = ?6, params_json = ?7, body = ?8, auth_json = ?9,
            last_response_json = ?10, updated_at = ?11
         WHERE id = ?1",
        params![
            req.id,
            req.folder_id,
            req.name,
            req.method,
            req.url,
            headers_json,
            "[]", // params_json is now always empty
            req.body,
            auth_json,
            last_response_json,
            req.updated_at
        ],
    )?;
    Ok(())
}

pub fn delete_request(conn: &Connection, id: &str) -> rusqlite::Result<()> {
    conn.execute("DELETE FROM saved_requests WHERE id = ?1", params![id])?;
    Ok(())
}

pub fn import_library(
    conn: &mut Connection,
    folders: &[RequestFolder],
    requests: &[SavedRequest],
) -> rusqlite::Result<()> {
    let tx = conn.transaction()?;
    for f in folders {
        insert_folder(&*tx, f)?;
    }
    for r in requests {
        insert_request(&*tx, r)?;
    }
    tx.commit()?;
    Ok(())
}
