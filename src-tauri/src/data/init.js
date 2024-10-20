import Database from '@tauri-apps/plugin-sql';
// when using `"withGlobalTauri": true`, you may use
// const Database = window.__TAURI__.sql;

const db = await Database.load('mysql://user:passroot@123@host/inventory_db');
await db.execute('INSERT INTO ...');