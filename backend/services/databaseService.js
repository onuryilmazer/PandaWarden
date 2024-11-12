import pg from 'pg';
import { DatabaseError } from './customErrors.js';
const { Pool } = pg;
 
const pool = new Pool();
 
const query = async (text, params, callback) => {
  try {
    return await pool.query(text, params, callback);
  }
  catch (e) {
    throw new DatabaseError("Database connection failed");
  }
};

export { query };