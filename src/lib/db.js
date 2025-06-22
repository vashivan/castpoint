import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: "srv1509.hstgr.io",
  user: "u709554459_adminCastpoint",
  password: "Castpoint123",
  database:"u709554459_CastpointDB",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
